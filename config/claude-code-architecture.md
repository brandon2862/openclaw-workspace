# 🏗️ Claude Code 架构深度分析

> 基于多个GitHub仓库的Claude Code泄露源码分析
> 最后更新: 2026-04-08

---

## 📚 参考资料

| 仓库 | ⭐ Stars | 描述 | License |
|------|---------|------|---------|
| [soongenwong/claudecode](https://github.com/soongenwong/claudecode) | 857 | Rust重写版，声称可运行 | N/A |
| [Ahmad-progr/claude-leaked-files](https://github.com/Ahmad-progr/claude-leaked-files) | 245 | 源码镜像（教育用途） | N/A |
| [waiterxiaoyy/Deep-Dive-Claude-Code](https://github.com/waiterxiaoyy/Deep-Dive-Claude-Code) | 178 | 13章深度架构分析 | MIT |
| [noya21th/claude-source-leaked](https://github.com/noya21th/claude-source-leaked) | 108 | 87个隐藏功能flag分析 | N/A |
| [fattail4477/claw-decode](https://github.com/fattail4477/claw-decode) | 47 | 10大隐藏秘密+架构模式 | MIT |
| [xcanwin/open-claude-code](https://github.com/xcanwin/open-claude-code) | 33 | 全球首个可运行的Agent | N/A |
| [ComeOnOliver/claude-code-analysis](https://github.com/ComeOnOliver/claude-code-analysis) | 112 | 17章完整架构文档 | MIT |

---

## 📊 源码概况

- **泄露时间**: 2026年3月31日
- **泄露原因**: npm包中遗漏了`.npmignore`，导致512K行TypeScript源码通过`.map`文件暴露
- **代码规模**: 1,884个TypeScript文件，约512K行
- **核心文件数**: 37个子目录，18个顶级文件

---

## 🔧 技术栈

| 层 | 技术 |
|---|------|
| 语言 | TypeScript (.ts / .tsx) |
| 运行时 | Bun (bundler + feature flags via bun:bundle) |
| UI框架 | React + Ink (终端React渲染器) |
| API客户端 | @anthropic-ai/sdk (Anthropic SDK) |
| MCP | @modelcontextprotocol/sdk |
| CLI框架 | @commander-js/extra-typings |
| 验证 | Zod v4 |
| 样式 | Chalk (终端颜色) |
| 状态管理 | Zustand-style store + React Context |

---

## 🧠 10大隐藏秘密

### 1. 🐾 虚拟宠物系统
Complete Tamagotchi-like companion system with 18 species (ducks, capybaras, ghosts, axolotls). ASCII art animations with multiple frames. Rarity tiers from Common to Legendary.

### 2. 💤 梦境模式（Dream Mode）
When idle, Claude Code spawns a background agent that reviews past sessions and consolidates memories. Four phases: **Orient → Gather → Consolidate → Prune**. Maintains knowledge index under 25KB.

### 3. 🕵️ 卧底模式（Undercover Mode）
When contributing to public repos, strips internal model codenames (Capybara, Tengu) from commits. Source says: **"Do not blow your cover."** Cannot be forced OFF.

### 4. 📏 内部版本25字限制
Internal build says: **"≤25 words between tool calls. ≤100 words for final responses."** The source code literally counts words.

### 5. 🤖 KAIROS: 主动助手模式
Autonomous assistant that **initiates** messages. Monitors work, sends problem alerts, runs scheduled tasks. Receives periodic wake-up ticks.

### 6. 👥 多Agent集群
Built-in orchestration for agent teams. Spawn read-only researchers alongside full-capability coders. Coordinate via shared task lists. Communicate across machines via Unix domain sockets.

### 7. 🔧 43个工具（不是10个）
Every capability is a discrete, permission-gated tool: REPL, Worktrees, Cron, Remote triggers, LSP, Notebook, MCP auth, Sleep tool.

### 8. 🧠 记忆=Markdown文件（无RAG）
Entire memory system is just markdown files in a directory with an index. No Pinecone. No embeddings. The sophistication is in the maintenance loop (Dream Mode).

### 9. 🎭 10+未发布功能
Behind build-time feature flags: `BUDDY`, `KAIROS`, `VERIFICATION_AGENT`, `TOKEN_BUDGET`, `UDS_INBOX`, `EXPERIMENTAL_SKILL_SEARCH`, `CACHED_MICROCOMPACT`.

### 10. 🔐 安全团队有Kill Switch
Hardcoded safety instruction **cannot be modified without named team review**. Defines exact boundaries: yes to pentesting and CTFs, no to DoS and supply chain attacks.

---

## 🏗️ 核心架构模式

### 1. Query Engine（核心引擎）

The heart of the application (~46KB, `QueryEngine.ts`). Manages the conversation loop:
- **消息管理** — 维护user/assistant/system/tool消息历史
- **Streaming** — 实时token流式传输 + 工具使用执行
- **Auto-compaction** — 接近上下文窗口上限时自动压缩
- **Prompt caching** — 通过cache-aware策略优化重复上下文
- **Retry逻辑** — 处理API错误、速率限制和过载，使用退避策略
- **Usage追踪** — 统计tokens (input/output/cache read/write)和成本
- **Tool编排** — 分发工具调用、收集结果、管理权限

### 2. 系统提示5层优先级

```
Priority 0: Override (loop mode, testing)        ← 最高
Priority 1: Coordinator (多worker编排)
Priority 2: Agent (子agent定义)
Priority 3: Custom (--system-prompt flag)
Priority 4: Default (标准Claude Code)           ← 最低
         + appendSystemPrompt (始终追加除非override)
```

### 3. CLAUDE.md 自动注入

Every query auto-discovers and merges CLAUDE.md files:
- 项目根目录的 CLAUDE.md
- 用户级 ~/.claude/CLAUDE.md
- 子目录中的 CLAUDE.md（递归发现）
- 最大40,000字符限制

### 4. 静态/动态提示分离

System prompt split by `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__`:
- **Before boundary (静态)**: 全局缓存，重复调用节省tokens
- **After boundary (动态)**: 用户/会话特定，每次重新计算

---

## 🛠️ 工具系统（43个工具）

### 权限等级

| Level | 自动允许 | 示例 |
|-------|---------|------|
| 0 | Always | Read, Glob, Grep, LSP, TaskGet, ToolSearch |
| 1 | First-time confirm | Write, Edit, WebFetch, WebSearch, Bash (safe) |
| 2 | Every-time confirm | Bash (dangerous: rm, git push, chmod) |
| 3 | Block + warn | rm -rf /, git push --force origin main, DROP TABLE |

### 核心工具类别

**文件操作**: FileRead, FileWrite, FileEdit, Glob, Grep
**代码执行**: Bash, PowerShell, REPL, NotebookEdit
**Web & 搜索**: WebFetch, WebSearch, ToolSearch
**Agent & Task**: Agent, TaskCreate, TaskGet, TaskUpdate, TaskList, TaskStop, SendMessage
**Plan & Workflow**: EnterPlanMode, ExitPlanMode, EnterWorktree, ExitWorktree
**MCP**: MCPTool, McpAuth, ListMcpResources, ReadMcpResource
**配置 & 系统**: Config, Skill, AskUserQuestion, Brief, TodoWrite, Sleep
**Team & Remote**: TeamCreate, TeamDelete, RemoteTrigger, ScheduleCron, LSP

---

## 📜 101个斜杠命令

### Git & 版本控制
`commit`, `commit-push-pr`, `diff`, `branch`, `review`, `autofix-pr`, `pr_comments`, `teleport`, `rewind`, `tag`

### 会话 & 历史
`session`, `resume`, `clear`, `compact`, `export`, `share`, `summary`, `context`

### 配置 & 设置
`config`, `permissions`, `privacy-settings`, `theme`, `color`, `keybindings`, `vim`, `output-style`, `statusline`, `env`

### Agent & Task管理
`agents`, `tasks`, `brief`

### 文件 & 代码操作
`files`, `add-dir`, `diff`, `debug-tool-call`, `copy`

### 开发 & 调试
`doctor`, `heapdump`, `perf-issue`, `stats`, `bughunter`, `ctx_viz`, `ant-trace`

### 认证
`login`, `logout`, `oauth-refresh`

### 扩展 & 插件
`mcp`, `plugin`, `reload-plugins`, `skills`

### 工作空间
`plan`, `sandbox-toggle`, `init`

### 信息 & 帮助
`help`, `version`, `cost`, `usage`, `extra-usage`, `release-notes`, `status`, `insights`

### 平台集成
`desktop`, `mobile`, `chrome`, `ide`, `install`, `install-github-app`, `install-slack-app`

### 记忆 & 知识
`memory`, `good-claude`

### 模型 & 性能
`model`, `effort`, `fast`, `thinkback`, `thinkback-play`, `advisor`

### 特殊操作
`bridge`, `voice`, `remote-setup`, `remote-env`, `stickers`, `feedback`, `onboarding`, `passes`, `ultraplan`, `rename`, `exit`

---

## 🔒 安全 & 权限模型

### 四种权限模式

```
Default (ask) → Plan (read-only) → Auto (smart judge) → Bypass (allow all)
```

### 安全指令（不可修改）

Hardcoded safety boundaries:
- ✅ 渗透测试和CTF
- ✅ 安全研究
- ❌ DoS攻击
- ❌ 供应链攻击
- ❌ 数据盗窃

---

## 🧠 记忆系统

### 四种持久化记忆

| 类型 | 内容 | 持久性 |
|------|------|--------|
| User Memory | 用户偏好、工作风格、专长 | 跨会话 |
| Feedback Memory | 纠正和确认过的方法 | 跨会话 |
| Project Memory | 截止日期、决策、团队上下文 | 跨会话 |
| Reference Memory | 外部资源指针 | 跨会话 |

### Dream Mode（记忆整理）

四阶段处理：
1. **Orient** — 定位当前状态
2. **Gather** — 收集相关信息
3. **Consolidate** — 整合消除矛盾
4. **Prune** — 清理过期信息

Index保持在25KB以下。

---

## ⚡ 成本优化（10个技巧）

| # | 技巧 | 来源 |
|---|------|------|
| 1 | Output reservation是8K(非32K) - 满了自动升级到64K | context.ts |
| 2 | CLAUDE.md保持500字以内 - 每次请求都发送 | context.ts |
| 3 | 主动用`/compact` - 手动compact只用3K vs 自动的13K | autoCompact.ts |
| 4 | 不要中途切换模型 - 18维度的cache失效 | promptCacheBreakDetection.ts |
| 5 | Fast mode = 6倍成本 - 长任务关掉 | modelCost.ts |
| 6 | API Key用户默认用Sonnet(更便宜) | model.ts |
| 7 | 子agent设成haiku - 5倍便宜 | agent.ts |
| 8 | 后台任务不会重试429/529错误 | withRetry.ts |
| 9 | Compact后文件恢复有预算限制：5文件max, 5K tokens/file | compact.ts |
| 10 | Cache读取打9折 - 保持系统提示稳定最大化cache命中 | modelCost.ts |

---

## 🎯 5个可复用的架构模式

### 1. Memory as Markdown
No RAG needed. Files + index + consolidation loop.
→ 简单、可靠、不需要向量数据库

### 2. Tool = Name + Prompt + Permission + Execute
The prompt is where the magic is.
→ 每个工具都是自包含的模块

### 3. Multi-Agent via Task Lists
Agents share a task board, not direct calls.
→ 解耦的多Agent协作

### 4. Reversibility × Blast Radius
Classify every action before executing.
→ 三层安全等级

### 5. Static/Dynamic Prompt Split
Cache the static half, save 50% on API costs.
→ 系统提示的缓存优化

---

## 📁 文件统计

| 类别 | 数量 |
|------|------|
| TypeScript文件总计 | 1,884 |
| 命令模块 | 101 |
| 工具实现 | 41-43 |
| UI组件 | 130+ |
| 工具函数文件 | 300+ |
| 服务模块 | 35+ |
| 顶级源文件 | 18 |
| 入口点 | 6 |
| src/子目录 | 37 |

---

*分析来源: GitHub多个Claude Code泄露源码分析仓库*
*免责声明: 这是独立分析，所有商标归Anthropic所有*