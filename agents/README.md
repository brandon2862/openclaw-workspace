# 🚀 OpenClaw Agent 团队

## 团队架构

```
                    🦐 海虾 (Main Coordinator)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴────┐      ┌─────┴─────┐      ┌────┴────┐
   │  Tech   │      │  Product  │      │ Market  │
   │  Dev    │      │  Design   │      │ Research│
   └─────────┘      └───────────┘      └─────────┘
                           │
                      ┌────┴────┐
                      │  Ops    │
                      └─────────┘
```

## Agent 角色

| Agent | 角色 | 模型 | 职责 |
|-------|------|------|------|
| 🦐 **Main** | 主协调agent | mimo-v2-omni | 任务分配、团队协调、用户交互 |
| 💻 **Tech Development** | 技术开发 | mimo-v2-flash | 代码实现、技术架构、Bug修复 |
| 🎨 **Product Design** | 产品设计 | mimo-v2-flash | 产品规划、用户体验、原型设计 |
| 📊 **Market Research** | 市场研究 | deepseek-chat | 市场分析、竞品研究、用户调研 |
| ⚙️ **Operations** | 运营管理 | deepseek-chat | 项目管理、流程优化、文档管理 |

## 使用方式

### 主 Agent 调用 Sub Agent

```javascript
// 调用技术开发 agent
sessions_spawn({
  runtime: "subagent",
  agentId: "tech_development",
  task: "开发一个待办事项应用，使用 Vue 3 + Element Plus"
})

// 调用市场研究 agent
sessions_spawn({
  runtime: "subagent",
  agentId: "market_research",
  task: "分析马来西亚AI创业服务市场，包括竞品分析"
})

// 调用产品设计 agent
sessions_spawn({
  runtime: "subagent",
  agentId: "product_design",
  task: "设计一个AI诊断工具的PRD"
})

// 调用运营管理 agent
sessions_spawn({
  runtime: "subagent",
  agentId: "operations",
  task: "制定项目进度计划和里程碑"
})
```

## 工作流程

### 典型项目流程
```
1. 市场研究 → 了解市场和用户需求
2. 产品设计 → 定义产品功能和体验
3. 技术开发 → 实现产品功能
4. 运营管理 → 跟踪进度和优化流程
```

### 并行工作
- 市场研究 + 产品设计 可以并行
- 技术开发 依赖 产品设计 输出
- 运贯穿整个项目周期

## 配置文件位置

```
/home/brandonclaw/.openclaw/
├── agents/
│   ├── main/                    # 主agent配置
│   ├── tech_development/agent/  # 技术开发配置
│   ├── market_research/agent/   # 市场研究配置
│   ├── product_design/agent/    # 产品设计配置
│   └── operations/agent/        # 运营管理配置
└── workspace/
    └── agents/                  # SKILL.md文档
        ├── README.md
        ├── tech_development/
        ├── market_research/
        ├── product_design/
        └── operations/
```

## 更新日志

- **2026-04-05**: 创建 Agent 团队架构
  - Main (海虾) - 主协调
  - Tech Development - 技术开发
  - Market Research - 市场研究
  - Product Design - 产品设计
  - Operations - 运营管理

---

*OpenClaw AI Assistant Framework - Agent Team v1.0*
