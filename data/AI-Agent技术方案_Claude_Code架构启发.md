# AI Agent 技术方案
## 基于 Claude Code 架构启发

**创建日期:** 2026-04-07
**版本:** v1.0
**作者:** 海虾 🦐

---

## 一、架构概述

### 1.1 核心价值主张

为中小企业提供**可定制、可控制、可扩展**的AI Agent团队服务。

### 1.2 目标客户

- 马来西亚中小型企业
- 需要自动化业务流程
- 没有技术团队的创业公司
- 想用AI但不懂技术的老板

---

## 二、十大核心技术模块

### 2.1 上下文管理系统 (五层压缩)

| 层级 | 名称 | 触发条件 | 功能 |
|------|------|----------|------|
| L1 | Micro Compact | 时间触发 | 清理旧工具输出 |
| L2 | Context Collapse | >80%token | 总结对话片段 |
| L3 | Session Memory | 定期 | 提取关键上下文到文件 |
| L4 | Full Compact | 手动/触发 | 压缩整个历史 |
| L5 | PTL Truncation | 最后手段 | 丢弃最旧消息组 |

**技术实现:**
```python
# 伪代码
def compress_context(level):
    if level == 1:
        clean_old_tool_outputs()
    elif level == 2:
        summarize_conversation_chunks()
    elif level == 3:
        extract_to_file()
    elif level == 4:
        full_compress()
    else:
        truncate_oldest()
```

**优势:** 长对话成本降低 50-70%

---

### 2.2 权限分级系统 (三级)

| 级别 | 名称 | 权限范围 | 适用场景 |
|------|------|----------|----------|
| L1 | Bypass | 无检查 | 内部开发、快速测试 |
| L2 | Allow Edits | 工作目录内 | 常规任务 |
| L3 | Auto | LLM预测授权 | 生产环境 |

**LLM预测授权逻辑:**
```python
def auto_approve(action, user_history):
    # 分析用户历史授权模式
    # 预测是否会批准
    # 返回概率 > 0.8 则自动执行
    # 否则请求确认
    prediction = llm.predict_approval(action, user_history)
    return prediction.probability > 0.8
```

**安全边界:**
- 删除操作 (rm -rf, drop table)
- 系统配置修改
- 外部发送 (邮件、推文)
- 支付操作

---

### 2.3 记忆系统 (四种记忆)

| 记忆类型 | 内容 | 持久化 | 用途 |
|---------|------|--------|------|
| User Memory | 角色、专长、风格 | 长期 | 个性化服务 |
| Feedback Memory | 纠正确认 | 长期 | 方法优化 |
| Project Memory | 截止日期、决策 | 项目级 | 上下文保持 |
| Reference Memory | 外部资源指针 | 长期 | 知识链接 |

**技术架构:**
```
记忆系统
├── User Memory (用户档案)
│   ├── 个人信息
│   ├── 偏好设置
│   └── 服务历史
├── Feedback Memory (反馈记录)
│   ├── 纠正历史
│   └── 确认记录
├── Project Memory (项目记忆)
│   ├── 决策记录
│   ├── 截止日期
│   └── 中间产物
└── Reference Memory (外部链接)
    ├── 文档指针
    ├── API链接
    └── 外部知识库
```

---

### 2.4 Hooks 自动化系统

**支持的钩子:**
| 钩子 | 触发时机 | 用途 |
|------|---------|------|
| pre-tool | 工具执行前 | 参数验证、权限检查 |
| post-tool | 工具执行后 | 日志记录、自动归档 |
| prompt-submit | 提交前 | 内容过滤、格式化 |
| session-start | 会话开始 | 初始化加载 |
| session-end | 会话结束 | 自动保存、检查点 |

**配置示例:**
```yaml
hooks:
  pre-tool:
    - name: "参数验证"
      enabled: true
      action: "./scripts/validate-params.sh"
      exit_codes:
        0: "allow"
        2: "block"
        other: "warn"
  
  post-tool:
    - name: "自动归档"
      enabled: true
      action: "./scripts/archive-output.sh"
  
  session-end:
    - name: "检查点保存"
      enabled: true
      action: "./scripts/checkpoint-save.sh"
```

---

### 2.5 子Agent专业化

**专用Agent类型:**

| Agent类型 | 功能 | 并行能力 | 适用场景 |
|----------|------|---------|----------|
| Explore | 快速搜索发现 | 高 | 代码搜索、信息收集 |
| Plan | 设计方案 | 低 | 复杂任务规划 |
| Worker | 执行任务 | 中 | 编码、创作 |
| Guide | 问答引导 | 高 | 客服、FAQ |

**协作模式:**
```python
class AgentTeam:
    def __init__(self):
        self.explore = ExploreAgent()
        self.planner = PlannerAgent()
        self.workers = []
        self.coordinator = CoordinatorAgent()
    
    def execute(self, task):
        # 1. Explore 分析任务
        plan = self.explore.analyze(task)
        
        # 2. Planner 制定计划
        plan = self.planner.create_plan(plan)
        
        # 3. Workers 并行执行
        results = self.workers.execute_parallel(plan.steps)
        
        # 4. Coordinator 整合结果
        return self.coordinator.integrate(results)
```

---

### 2.6 智能提醒系统

| 提醒类型 | 触发条件 | 提醒方式 |
|----------|----------|----------|
| 截止提醒 | 24h/1h前 | 消息推送 |
| 进度提醒 | 停滞超过30min | 消息推送 |
| 异常提醒 | 连续错误>3次 | 消息推送 |
| 总结提醒 | 每日22:00 | 消息推送 |

---

### 2.7 配置分层系统

**优先级 (从高到低):**
1. 环境变量
2. ~/.config/openclaw/settings.json
3. 项目级 .openclaw/settings.json
4. .openclaw/settings.local.json
5. 默认配置

**配置覆盖逻辑:**
```python
def get_config(key):
    # 从高到低检查
    for source in [ENV, USER, PROJECT, LOCAL, DEFAULT]:
        if key in source:
            return source[key]
    return None
```

---

### 2.8 上下文注入机制

**注入内容 (每轮):**
- CLAUDE.md / AGENTS.md (行为规范)
- SOUL.md (人格定义)
- MEMORY.md (长期记忆)
- 项目级配置文件

**注入量限制:** 最大 40,000 字符/轮

---

### 2.9 工具分类系统

| 类别 | 特性 | 示例 |
|------|------|------|
| 并发工具 | 可同时执行 | 读文件、web_search |
| 序列工具 | 顺序执行 | 写文件、edit |
| 高危工具 | 需确认 | rm、exec |
| API工具 | 需密钥 | 外部服务调用 |

---

### 2.10 监控与指标

**监控指标:**
- Token消耗
- 任务成功率
- 平均响应时间
- 用户满意度
- Agent效率

**健康检查:**
- 模型可用性
- API响应时间
- 错误率

---

## 三、产品功能矩阵

### 3.1 基础版 (免费)

| 功能 | 限制 |
|------|------|
| 单会话 | 1 |
| 基本记忆 | L1 |
| 基础工具 | 20个 |
| 简单提醒 | 3个/天 |

### 3.2 专业版 (¥99/月)

| 功能 | 限制 |
|------|------|
| 多会话 | 10 |
| 四种记忆 | 完整 |
| 全部工具 | 66+ |
| 自定义Hooks | 10个 |
| 子Agent | 3个并行 |
| 高级提醒 | 无限制 |

### 3.3 企业版 (¥299/月)

| 功能 | 限制 |
|------|------|
| 无限会话 | ✓ |
| 企业记忆库 | ✓ |
| 自定义Agent | ✓ |
| API接入 | ✓ |
| 专属客服 | ✓ |
| 定制开发 | ✓ |

---

## 四、技术栈

| 层级 | 技术 |
|------|------|
| 网关 | OpenClaw |
| 语言 | Python |
| 记忆存储 | SQLite + File |
| 定时任务 | Cron |
| API | REST |
| 部署 | Docker |

---

## 五、路线图

### Phase 1 (第1-2周)
- [ ] 核心架构搭建
- [ ] 基础记忆系统
- [ ] 权限系统实现

### Phase 2 (第3-4周)
- [ ] Hooks系统完善
- [ ] 子Agent系统
- [ ] 监控面板

### Phase 3 (第5-6周)
- [ ] API开放
- [ ] 企业版功能
- [ ] 部署优化

---

## 六、竞争优势

| 竞品 | 我们的优势 |
|------|-----------|
| GPTs | 可定制工作流 |
| Agent | 中文本地化 |
| Custom | 性价比高 |
| Zapier | 更智能 |

---

## 七、风险与对策

| 风险 | 对策 |
|------|------|
| 模型成本 | 五层压缩降低token |
| 数据安全 | 本地部署+加密 |
| 竞品模仿 | 快速迭代+服务 |
| 模型依赖 | 多模型备选 |

---

*本方案基于 Claude Code 泄露源码架构分析，融合 OpenClaw 框架实现。*