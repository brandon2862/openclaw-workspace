# 🏗️ Claude Code 架构学习 → OpenClaw 能力转化

> 基于 Claude Code 泄露源码 (512K TypeScript) 分析
> 学习日期: 2026-04-06

---

## 📋 架构总览

Claude Code 不是简单的 API wrapper，而是一个**深度工程化的 AI 编码 harness**：
- 1,332 个 TypeScript 文件
- 66 个内置工具（41 种已暴露）
- 85+ 个斜杠命令
- 7 阶段启动流水线
- 5 层配置系统
- 4 种子 Agent 类型

---

## 🎯 10 大核心架构模式

### 1. 📝 CLAUDE.md 每轮注入机制

**Claude Code 做法：**
- `CLAUDE.md` 文件内容注入到每一轮对话
- 最大 40,000 字符
- 包含项目规范、架构约定、团队习惯

**转化为我们的能力：**
```
实现: 每次会话启动时，自动读取以下文件并注入系统提示:
1. ~/.openclaw/workspace/AGENTS.md (工作规则)
2. ~/.openclaw/workspace/SOUL.md (人格定义)
3. ~/.openclaw/workspace/USER.md (用户档案)
4. memory/YYYY-MM-DD.md (今日上下文)
5. 项目特定的 .claude.md 或 AGENTS.md
```

**已实现程度:** ✅ 80% (OpenClaw 已有类似机制)

---

### 2. 🔄 三种并行子 Agent 模式

**Claude Code 做法：**
| 模式 | 特点 | 适用场景 |
|------|------|---------|
| Fork | 继承父上下文，共享缓存 | 相关子任务 |
| Teammate | 独立窗口，文件 mailbox 通信 | 并行独立任务 |
| Worktree | 独立 git worktree | 隔离实验 |

**转化为我们的能力：**
```
实现 sessions_spawn 的三种模式:
1. 继承模式 (inherit): 子 agent 继承父上下文摘要
2. 隔离模式 (isolated): 完全独立会话
3. 线程模式 (thread): 持久化线程绑定

关键: 子 agent 共享 prompt 缓存 → 并行几乎零成本
```

**已实现程度:** ✅ 70% (OpenClaw 支持 isolated/session/thread)

---

### 3. 🔐 三级权限系统

**Claude Code 做法：**
| 级别 | 行为 | 风险 |
|------|------|------|
| Bypass | 无检查 | 快但危险 |
| Allow Edits | 工作目录内自动允许 | 中等 |
| Auto | LLM 分类器预测用户意图 | 最佳平衡 |

**转化为我们的能力：**
```
实现权限分级:
1. trusted_mode: 跳过确认（仅限安全操作）
2. default_mode: 询问确认（删除、外部发送等）
3. auto_mode: 用 LLM 判断是否需要确认

Auto 模式实现:
- 训练分类器判断操作风险
- 低风险: 读取、搜索 → 自动允许
- 中风险: 编辑、写入 → 询问
- 高风险: 删除、发送、支付 → 强制确认
```

**已实现程度:** ⚠️ 50% (OpenClaw 有安全边界但无 LLM 分类器)

---

### 4. 📦 五层上下文压缩

**Claude Code 做法：**
| 策略 | 触发 | 行为 |
|------|------|------|
| Micro Compact | 时间触发 | 清理旧工具输出 |
| Context Collapse | 接近上限 | 总结对话片段 |
| Session Memory | 定期 | 提取关键上下文到文件 |
| Full Compact | 手动/auto | 压缩整个历史 |
| PTL Truncation | 最后手段 | 丢弃最旧消息组 |

**转化为我们的能力：**
```python
# 三层压缩策略 (已部分实现)

# Layer 1: Micro Compact (每次工具调用后)
def micro_compact(messages):
    """清理旧的工具输出，保留最近 3 轮"""
    for msg in messages[:-6]:  # 保留最近 3 轮 (user+assistant)
        if msg.type == 'tool_result':
            msg.content = ''  # 清空内容但保留结构

# Layer 2: Auto Compact (接近上下文上限时)
def auto_compact(messages, token_limit):
    """当 tokens 超过 80% 时触发"""
    summary = call_llm(f"总结以下对话:\n{messages}")
   保留: 最近 2 轮 + 摘要 + 活跃文件

# Layer 3: Full Compact (手动触发)
def full_compact(messages):
    """压缩整个对话为摘要"""
    保留: 摘要 + MEMORY.md + 活跃计划 + 技能 schema
    预算: 50,000 tokens
```

**已实现程度:** ⚠️ 60% (有上下文压缩但无分层)

---

### 5. 🔧 66 个工具分两类

**Claude Code 做法：**
```
并发工具 (只读，可并行):
- FileReadTool, GlobTool, GrepTool
- WebFetchTool, WebSearchTool
- BashTool (只读命令)

序列工具 (写操作，一次一个):
- FileEditTool, FileWriteTool
- BashTool (写命令)
- AgentTool (启动子 agent)
```

**转化为我们的能力：**
```
工具分类:
1. 读取类 (可并行): read, web_search, web_fetch
2. 写入类 (序列化): write, edit, exec
3. Agent 类 (特殊): sessions_spawn, sessions_send

并行优化:
- 读取操作同时发起
- 写入操作排队执行
- Agent 操作独立处理
```

**已实现程度:** ✅ 80% (OpenClaw 工具系统类似)

---

### 6. 🪝 Hooks 系统 (隐藏大招)

**Claude Code 做法：**
```
5 个钩子点:
1. PreToolUse  - 工具调用前
2. PostToolUse - 工具调用后
3. UserPromptSubmit - 用户提交提示时
4. SessionStart - 会话开始
5. SessionEnd - 会话结束

返回值:
- 退出码 0 = 允许
- 退出码 2 = 阻止
- 其他 = 警告但继续
```

**转化为我们的能力：**
```python
# Hooks 系统设计
class HookSystem:
    hooks = {
        'session_start': [],   # 会话开始时执行
        'session_end': [],     # 会话结束时执行
        'pre_tool': [],        # 工具调用前
        'post_tool': [],       # 工具调用后
        'pre_message': [],     # 消息处理前
    }

    def register(event, callback, priority=0):
        """注册钩子"""
        hooks[event].append((priority, callback))
        hooks[event].sort(key=lambda x: x[0])

    async def trigger(event, context):
        """触发钩子"""
        for priority, callback in hooks[event]:
            result = await callback(context)
            if result == 'block':
                return False
        return True

# 用例:
# - pre_tool: 检查权限、记录日志
# - post_tool: 更新记忆、触发通知
# - session_start: 加载配置、初始化记忆
# - session_end: 保存状态、清理资源
```

**已实现程度:** ⚠️ 30% (OpenClaw 有 cron/heartbeat 但无完整 hooks)

---

### 7. 🧠 四种持久化记忆

**Claude Code 做法：**
| 类型 | 内容 | 持久性 |
|------|------|--------|
| User Memory | 角色、专长、工作风格 | 跨会话 |
| Feedback Memory | 纠正和确认过的方法 | 跨会话 |
| Project Memory | 截止日期、决策、团队上下文 | 跨会话 |
| Reference Memory | 外部资源指针 | 跨会话 |

**转化为我们的能力：**
```python
# 四层记忆系统
memory_system = {
    'user': {
        'path': '~/.openclaw/workspace/USER.md',
        'content': '用户偏好、工作风格、时区等',
        'auto_update': True,
    },
    'feedback': {
        'path': '~/.openclaw/workspace/memory/feedback.md',
        'content': '用户纠正过的错误、确认过的方法',
        'auto_update': True,
    },
    'project': {
        'path': '~/.openclaw/workspace/MEMORY.md',
        'content': '项目决策、截止日期、重要上下文',
        'auto_update': True,
    },
    'reference': {
        'path': '~/.openclaw/workspace/TOOLS.md',
        'content': '外部资源、API 密钥位置、服务器信息',
        'auto_update': False,  # 手动维护
    },
}
```

**已实现程度:** ✅ 75% (OpenClaw 有三层记忆)

---

### 8. 📊 五层配置优先级

**Claude Code 做法：**
```
环境变量 < ~/.claude/settings.json < .claude.json < .claude/settings.json < .claude/settings.local.json
```

**转化为我们的能力：**
```python
# 配置优先级系统
config_layers = [
    'defaults',           # 系统默认
    'env',               # 环境变量 OPENCLAW_*
    '~/.openclaw/config.yaml',  # 用户全局配置
    'workspace/config/',  # 工作空间配置
    'project/.openclaw/', # 项目配置
    'local overrides',    # 本地覆盖
]

def get_config(key):
    """从最高优先级获取配置"""
    for layer in reversed(config_layers):
        value = layer.get(key)
        if value is not None:
            return value
    return defaults[key]
```

**已实现程度:** ✅ 70% (OpenClaw 有 config 系统)

---

### 9. 🚀 七阶段启动流水线

**Claude Code 做法：**
```
1. Prefetch      - 缓存数据、项目扫描、密钥预取
2. Warnings      - 安全检查、版本警告
3. CLI Parse     - 参数解析、信任验证
4. Setup         - 工具和命令并行加载
5. Deferred Init - 插件、技能、MCP 服务器（延迟+信任门控）
6. Mode Routing  - 本地/远程/SSH/Teleport 路由
7. Query Engine  - 进入主循环
```

**转化为我们的能力：**
```python
# 启动流水线
async def bootstrap():
    # Stage 1: Prefetch
    await load_cache()
    await scan_project()
    await prefetch_api_keys()

    # Stage 2: Safety Checks
    check_version()
    check_permissions()

    # Stage 3: Parse & Trust
    parse_args()
    verify_trust()

    # Stage 4: Load Tools & Commands (并行)
    await asyncio.gather(
        load_tools(),
        load_commands(),
    )

    # Stage 5: Deferred Init (延迟加载)
    await load_plugins()
    await load_skills()
    await connect_mcp()

    # Stage 6: Route Mode
    mode = detect_mode()  # local/remote/ssh

    # Stage 7: Enter Main Loop
    return QueryEngine(config)
```

**已实现程度:** ⚠️ 50% (OpenClaw 有简单启动但无完整流水线)

---

### 10. 🤖 四种专用子 Agent

**Claude Code 做法：**
| 类型 | 职责 | 上下文 |
|------|------|--------|
| Explore Agent | 快速代码搜索和发现 | 只读 |
| Plan Agent | 设计实现方案 | 无写权限 |
| General Agent | 复杂多步任务 | 完整权限 |
| Guide Agent | 回答功能问题 | 文档上下文 |

**转化为我们的能力：**
```python
# 专用 Agent 类型
agent_types = {
    'explorer': {
        'tools': ['read', 'search', 'glob'],
        'purpose': '代码探索、文件搜索',
        'context': '只读上下文',
    },
    'planner': {
        'tools': ['read'],
        'purpose': '方案设计、任务分解',
        'context': '设计文档上下文',
    },
    'worker': {
        'tools': ['read', 'write', 'edit', 'exec'],
        'purpose': '执行具体任务',
        'context': '完整上下文',
    },
    'guide': {
        'tools': ['read'],
        'purpose': '回答问题、提供指导',
        'context': '文档和知识库',
    },
}
```

**已实现程度:** ⚠️ 40% (OpenClaw 有 subagent 但无类型分化)

---

## 🔧 待实现的增强功能

### Priority 1: Hooks 系统 ⭐⭐⭐
```yaml
文件: ~/.openclaw/workspace/config/hooks.yaml
events:
  session_start:
    - command: "echo 'Session started'"
  pre_tool:
    - check: "if tool == 'exec' and 'rm -rf' in args: block"
  post_tool:
    - log: "记录工具使用"
  session_end:
    - save: "保存会话摘要"
```

### Priority 2: 五层上下文压缩 ⭐⭐⭐
```yaml
策略:
  micro:
    trigger: "每次工具调用后"
    action: "清理旧工具输出"
  auto:
    trigger: "tokens > 80%"
    action: "总结 + 保留最近 3 轮"
  session:
    trigger: "每 10 轮"
    action: "提取关键信息到文件"
  full:
    trigger: "手动或 tokens > 95%"
    action: "压缩整个对话"
  truncate:
    trigger: "最后手段"
    action: "丢弃最旧消息"
```

### Priority 3: 专用 Agent 类型 ⭐⭐
```yaml
agents:
  explorer:
    allowed_tools: ["read", "web_search"]
    purpose: "探索和研究"
  planner:
    allowed_tools: ["read"]
    purpose: "设计方案"
  worker:
    allowed_tools: ["*"]
    purpose: "执行任务"
```

---

## 📈 实施路线图

| 阶段 | 功能 | 预计时间 | 优先级 |
|------|------|---------|--------|
| Phase 1 | Hooks 系统 | 2 小时 | ⭐⭐⭐ |
| Phase 2 | 增强压缩策略 | 1 小时 | ⭐⭐⭐ |
| Phase 3 | 专用 Agent 类型 | 1 小时 | ⭐⭐ |
| Phase 4 | 启动流水线优化 | 30 分钟 | ⭐ |
| Phase 5 | 配置优先级增强 | 30 分钟 | ⭐ |

---

## 📚 参考资料

- Claude Code 源码: `claude-code-rewrite/src/`
- 核心文件:
  - `QueryEngine.ts` - LLM 引擎核心
  - `Tool.ts` - 工具系统定义
  - `context.ts` - 上下文管理
  - `services/compact/` - 压缩系统
  - `memdir/` - 记忆系统
  - `coordinator/` - 协调者模式
  - `types/hooks.ts` - Hooks 类型定义
