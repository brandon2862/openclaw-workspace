# CRM Workflow Guide
## KV Premium Reno — CRM 工作流配置建议

**版本：** v1.0  
**创建日期：** 2026-04-06  
**覆盖工具：** HubSpot、GoHighLevel、Google Sheets

---

## 📋 目录

1. [CRM 选型建议](#1-crm-选型建议)
2. [HubSpot 配置方案](#2-hubspot-配置方案)
3. [GoHighLevel 配置方案](#3-gohighlevel-配置方案)
4. [Google Sheets 简单版](#4-google-sheets-简单版)
5. [Lead Scoring 模型](#5-lead-scoring-模型)
6. [自动化工作流](#6-自动化工作流)

---

## 1. CRM 选型建议

### 对比矩阵

| 维度 | HubSpot | GoHighLevel | Google Sheets |
|------|---------|-------------|---------------|
| **价格** | 免费版可用 / Pro RM 200+/月 | RM 150-300/月 | 免费 |
| **适合阶段** | 品牌化运营、团队协作 | 快速启动、营销自动化 | 初期验证、个人使用 |
| **Lead 管理** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **自动化** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐（需 Apps Script） |
| **WhatsApp 集成** | 需第三方 | 原生支持 | ❌ |
| **学习曲线** | 中等 | 中等 | 低 |
| **移动端** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### 推荐方案

| 阶段 | 推荐工具 | 理由 |
|------|----------|------|
| **起步期（0-10 Leads/周）** | Google Sheets | 零成本、快速上手、够用 |
| **成长期（10-50 Leads/周）** | GoHighLevel | WhatsApp 集成好、自动化强、性价比高 |
| **规模期（50+ Leads/周）** | HubSpot Pro | 企业级功能、报表强大、品牌信任度 |

---

## 2. HubSpot 配置方案

### 2.1 账号设置

**免费版即可起步**，包含：
- 联系人管理（最多 100万）
- 表单和落地页
- 邮件跟踪
- 基础报告

**推荐升级到 Starter（~RM 50/月/seat）** 以获得：
- 简单自动化
- 去除 HubSpot 品牌
- 更多表单和落地页

### 2.2 Contact Properties（联系人属性）

创建以下自定义属性：

| 属性名称 | 类型 | 选项 | 用途 |
|----------|------|------|------|
| `Lead Source` | Dropdown | WhatsApp, Facebook, Instagram, Google, Referral, Website, Phone | 跟踪来源 |
| `Property Type` | Dropdown | Condo, Terrace, Semi-D, Bungalow, Commercial | 物业类型 |
| `Property Location` | Text | - | 区域（Mont Kiara, Bangsar 等） |
| `Property Size (sqft)` | Number | - | 面积 |
| `Budget Range` | Dropdown | <RM100K, RM100-200K, RM200-500K, RM500K-1M, >RM1M | 预算范围 |
| `Timeline` | Dropdown | Immediate (1-3 months), Short-term (3-6 months), Medium-term (6-12 months), Long-term (12+ months) | 时间线 |
| `Design Style` | Multi-select | Modern Minimalist, Light Luxury, New Chinese, Modern Classic, Japandi, Islamic Modern, Scandinavian | 设计偏好 |
| `Lead Score` | Number | 0-100 | 客户评分 |
| `Lead Status` | Dropdown | New, Contacted, Qualified, Proposal Sent, Negotiating, Won, Lost, Nurture | 跟进状态 |
| `Language Preference` | Dropdown | Chinese, BM, English | 语言偏好 |
| `Decision Maker` | Text | - | 决策人信息 |
| `Next Follow-up Date` | Date | - | 下次跟进日期 |
| `Notes` | Text area | - | 备注 |

### 2.3 Deal Pipeline（交易管道）

**阶段设置：**

| 阶段 | 描述 | 转换率参考 | 停留时间参考 |
|------|------|------------|--------------|
| 1. New Lead | 新线索进入 | - | 0-1 天 |
| 2. Contacted | 已联系 | 80% | 1-3 天 |
| 3. Qualified | 需求确认（已量房/已明确需求） | 60% | 3-7 天 |
| 4. Proposal Sent | 已发送报价 | 50% | 5-14 天 |
| 5. Negotiating | 价格/方案协商中 | 40% | 7-21 天 |
| 6. Won | 签约成功 | - | - |
| 7. Lost | 流失 | - | - |

**Lost 原因跟踪（自定义属性）：**
- Price too expensive
- Chose competitor
- Timeline mismatch
- No response
- Changed mind
- Other

### 2.4 HubSpot 自动化工作流

#### 工作流 1：新 Lead 自动分配

```
触发器：Contact Created
条件：Lead Source = 任何
动作：
  1. 发送内部通知给销售团队
  2. 根据 Lead Source 分配 Owner：
     - WhatsApp → Sales Rep 1
     - Facebook/Instagram → Sales Rep 2
     - Google/Website → Sales Rep 3
     - Referral → Sales Manager
  3. 发送自动回复（通过集成工具）
  4. 设置 Task：24h 内首次跟进
```

#### 工作流 2：Nurturing 序列

```
触发器：Lead Status = New
条件：未在 24h 内联系
动作：
  Day 1: 发送欢迎邮件/WhatsApp（公司介绍）
  Day 2: 发送案例分享
  Day 3: 发送装修知识
  Day 5: 发送限时优惠
  Day 7: 发送温和跟进
  条件分支：如有回复 → 转人工；如无 → 继续序列
```

#### 工作流 3：报价后跟进

```
触发器：Deal Stage = Proposal Sent
动作：
  Day 1: 发送跟进消息（确认收到报价）
  Day 3: 发送补充信息（FAQ/案例）
  Day 5: 发送限时提醒
  Day 7: 电话跟进
  Day 14: 最终跟进 + 标记为 Lost（如无回复）
```

### 2.5 HubSpot 报表设置

**推荐仪表板：**

| 报告 | 类型 | 频率 | 关键指标 |
|------|------|------|----------|
| Lead 漏斗 | Funnel | 每日 | 各阶段数量和转化率 |
| Lead 来源分析 | Bar chart | 每周 | 各渠道 Lead 数量和成本 |
| 销售团队绩效 | Table | 每周 | 每人 Lead 数/转化率/签约额 |
| 报价响应时间 | Bar chart | 每周 | 从 Lead 到报价的平均天数 |
| 流失原因分析 | Pie chart | 每月 | 各流失原因占比 |
| 月度收入预测 | Forecast | 每月 | Pipeline 金额 × 阶段概率 |

---

## 3. GoHighLevel 配置方案

### 3.1 为什么选 GoHighLevel

GoHighLevel 特别适合 KV Premium Reno 的原因：
- ✅ **原生 WhatsApp 集成** — 这是我们的主要沟通渠道
- ✅ **内置自动化** — 无需 Zapier，直接在平台内设置
- ✅ **管道管理** — 可视化 Deal Pipeline
- ✅ **短信/WhatsApp 批量发送** — 适合促销活动
- ✅ **表单/落地页构建器** — 快速创建 Lead Capture 页面
- ✅ **白标功能** — 可以品牌化为自己的系统

### 3.2 账号设置

**推荐计划：** Starter（~USD 97/月 ≈ RM 450/月）

**初始设置清单：**
1. [ ] 连接 WhatsApp Business API
2. [ ] 连接 Facebook Messenger
3. [ ] 创建自定义字段
4. [ ] 设置 Pipeline 阶段
5. [ ] 创建自动化工作流
6. [ ] 设计 Lead Capture 表单
7. [ ] 设置 Google Calendar 集成（预约用）

### 3.3 自定义字段设置

| 字段名 | 类型 | 字段组 |
|--------|------|--------|
| Lead Source | Dropdown | Lead Info |
| Property Type | Dropdown | Project Details |
| Property Location | Text | Project Details |
| Property Size | Number | Project Details |
| Budget Range | Dropdown | Project Details |
| Timeline | Dropdown | Project Details |
| Design Style | Multi-select | Project Details |
| Language Preference | Dropdown | Lead Info |
| Lead Temperature | Dropdown | Lead Scoring |
| Next Action | Text | Follow-up |
| Next Action Date | Date | Follow-up |

### 3.4 GoHighLevel Pipeline

**Pipeline 名称：** KV Premium Reno Sales

| Stage | Color | Description |
|-------|-------|-------------|
| New Lead | 🔵 蓝色 | 新线索 |
| Attempting Contact | 🟡 黄色 | 尝试联系中 |
| Contacted | 🟠 橙色 | 已联系 |
| Qualified | 🟢 绿色 | 已确认需求 |
| Booked Site Visit | 🟣 紫色 | 已预约量房 |
| Proposal Sent | 🔵 蓝色 | 已发送报价 |
| Negotiating | 🟠 橙色 | 协商中 |
| Won | 🟢 绿色 | 签约成功 |
| Lost | 🔴 红色 | 流失 |

### 3.5 GoHighLevel 自动化（Workflows）

#### Workflow 1：新 Lead 自动回复 + 分配

```
触发器：Form Submission / WhatsApp Message / Facebook Message

动作序列：
1. 创建/更新 Contact
2. 发送 WhatsApp 自动回复（根据语言偏好选择模板）
3. 发送内部通知（SMS/Email 给销售负责人）
4. 等待 2 小时
5. 条件判断：是否有回复？
   - 是 → 标记为 "Contacted"，创建 Task
   - 否 → 发送第二条消息
6. 等待 24 小时
7. 条件判断：是否有回复？
   - 是 → 标记为 "Contacted"
   - 否 → 移入 Nurture 序列
```

#### Workflow 2：7 天 Nurturing Sequence

```
触发器：Lead 进入 "New Lead" 状态超过 24h 无回复

动作序列：
Day 1: WhatsApp - 欢迎 + 公司介绍
Day 2: WhatsApp - 案例分享
Day 3: WhatsApp - 装修知识
Day 5: WhatsApp - 限时优惠
Day 7: WhatsApp - 温和跟进
Day 10: SMS - 最终提醒
Day 14: 移入 Cold Lead，暂停序列

中断条件：任何回复 → 停止序列，通知销售
```

#### Workflow 3：报价后跟进

```
触发器：Deal 移入 "Proposal Sent"

动作序列：
Day 1: WhatsApp - "报价已发送，请查收"
Day 3: WhatsApp - 补充 FAQ/案例
Day 5: WhatsApp - 限时提醒
Day 7: 创建 Task - 电话跟进
Day 14: WhatsApp - 最终跟进
Day 21: 移入 "Lost"（如仍无回复）
```

#### Workflow 4：签约后自动化

```
触发器：Deal 移入 "Won"

动作序列：
1. 发送签约确认 WhatsApp
2. 发送欢迎邮件（含合同文件）
3. 创建 Task - 安排开工会议
4. 发送内部通知给项目经理
5. 更新 Contact 标签为 "客户"
6. 30天后 - 发送满意度调查
```

### 3.6 GoHighLevel 表单模板

**Lead Capture 表单字段：**

| 字段 | 类型 | 必填 | 占位符 |
|------|------|------|--------|
| 姓名 | Text | ✅ | 您的姓名 |
| 电话号码 | Phone | ✅ | 01X-XXXX XXXX |
| WhatsApp 号码 | Phone | | 同上可留空 |
| 电子邮件 | Email | | your@email.com |
| 物业位置 | Text | | 例如：Mont Kiara |
| 物业类型 | Dropdown | ✅ | Condo / 排屋 / Semi-D / Bungalow |
| 面积 (sqft) | Number | | 例如：1500 |
| 预算范围 | Dropdown | | <RM100K / RM100-200K / RM200-500K / >RM500K |
| 时间线 | Dropdown | | 1-3个月 / 3-6个月 / 6-12个月 |
| 感兴趣的风格 | Multi-select | | 现代简约 / 轻奢 / 新中式 / ... |
| 其他备注 | Text area | | 任何想告诉我们的信息 |

---

## 4. Google Sheets 简单版

### 4.1 模板结构

**Sheet 1: Lead Database（客户数据库）**

| 列 | 标题 | 格式 | 说明 |
|----|------|------|------|
| A | Lead ID | Text | 格式：KV-20260406-001 |
| B | Date Added | Date | 自动填充 |
| C | Name | Text | 客户姓名 |
| D | Phone | Text | 电话号码 |
| E | WhatsApp | Text | WhatsApp 号码 |
| F | Email | Text | 邮箱 |
| G | Source | Dropdown | WhatsApp/FB/IG/Google/Referral/Phone |
| H | Property Type | Dropdown | Condo/Terrace/Semi-D/Bungalow |
| I | Location | Text | 区域 |
| J | Size (sqft) | Number | 面积 |
| K | Budget | Dropdown | <100K/100-200K/200-500K/500K-1M/>1M |
| L | Timeline | Dropdown | Immediate/Short/Medium/Long |
| M | Design Style | Text | 设计风格偏好 |
| N | Lead Score | Number | 0-100 |
| O | Status | Dropdown | New/Contacted/Qualified/Proposal/Negotiating/Won/Lost |
| P | Owner | Text | 负责销售 |
| Q | Next Follow-up | Date | 下次跟进日期 |
| R | Last Contact | Date | 最后联系日期 |
| S | Notes | Text | 备注 |
| T | Language | Dropdown | CN/BM/EN |

**Sheet 2: Pipeline Dashboard（管道仪表板）**

```
使用 COUNTIF 公式统计各阶段数量：

=COUNTIF('Lead Database'!O:O, "New")        → 新线索
=COUNTIF('Lead Database'!O:O, "Contacted")   → 已联系
=COUNTIF('Lead Database'!O:O, "Qualified")    → 已确认
=COUNTIF('Lead Database'!O:O, "Proposal")     → 已报价
=COUNTIF('Lead Database'!O:O, "Won")          → 签约
=COUNTIF('Lead Database'!O:O, "Lost")         → 流失

转化率公式：
=Won / (Won + Lost) × 100
```

**Sheet 3: Follow-up Tracker（跟进跟踪）**

| 列 | 标题 | 说明 |
|----|------|------|
| A | Lead ID | 关联 Lead Database |
| B | Date | 跟进日期 |
| C | Type | WhatsApp/Phone/Email/Meeting |
| D | Summary | 跟进摘要 |
| E | Next Action | 下一步行动 |
| F | Next Date | 下一步日期 |
| G | Status | Done/Pending/Overdue |

### 4.2 Google Sheets 自动化（Apps Script）

**自动发送提醒邮件（每天早上 9 点）：**

```javascript
function sendFollowUpReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lead Database');
  const data = sheet.getDataRange().getValues();
  const today = new Date();
  
  let reminders = [];
  
  for (let i = 1; i < data.length; i++) {
    const nextFollowUp = new Date(data[i][16]); // Column Q
    const status = data[i][14]; // Column O
    const name = data[i][2]; // Column C
    const owner = data[i][15]; // Column P
    
    if (nextFollowUp <= today && status !== 'Won' && status !== 'Lost') {
      reminders.push(`${name} - Status: ${status} - Owner: ${owner}`);
    }
  }
  
  if (reminders.length > 0) {
    MailApp.sendEmail({
      to: 'sales@kvpremiumreno.com',
      subject: `🔔 今日待跟进 Lead（${reminders.length} 个）`,
      body: '以下 Lead 需要今天跟进：\n\n' + reminders.join('\n')
    });
  }
}
```

**自动 Lead 评分（基于规则）：**

```javascript
function calculateLeadScore() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lead Database');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    let score = 0;
    
    // Budget scoring
    const budget = data[i][10];
    if (budget === '>1M') score += 30;
    else if (budget === '500K-1M') score += 25;
    else if (budget === '200-500K') score += 20;
    else if (budget === '100-200K') score += 10;
    else score += 5;
    
    // Timeline scoring
    const timeline = data[i][11];
    if (timeline === 'Immediate') score += 25;
    else if (timeline === 'Short') score += 20;
    else if (timeline === 'Medium') score += 10;
    else score += 5;
    
    // Source scoring
    const source = data[i][6];
    if (source === 'WhatsApp' || source === 'Phone') score += 20;
    else if (source === 'Referral') score += 25;
    else if (source === 'Website') score += 15;
    else score += 10;
    
    // Has size info
    if (data[i][9]) score += 10;
    
    // Has design style preference
    if (data[i][12]) score += 5;
    
    // Write score
    sheet.getRange(i + 1, 14).setValue(score); // Column N
  }
}
```

### 4.3 条件格式设置

| 条件 | 颜色 | 含义 |
|------|------|------|
| Lead Score ≥ 70 | 🟢 绿色背景 | Hot Lead |
| Lead Score 40-69 | 🟡 黄色背景 | Warm Lead |
| Lead Score < 40 | 🔵 蓝色背景 | Cold Lead |
| Next Follow-up = Today | 🔴 红色字体 | 今日需跟进 |
| Next Follow-up < Today | 🔴 红色背景 | 逾期未跟进 |
| Status = Won | 🟢 绿色全行 | 已签约 |
| Status = Lost | ⚪ 灰色全行 | 已流失 |

---

## 5. Lead Scoring 模型

### 5.1 评分维度与权重

| 维度 | 权重 | 评分标准 |
|------|------|----------|
| **预算 (Budget)** | 30% | >RM1M=30, RM500K-1M=25, RM200-500K=20, RM100-200K=10, <RM100K=5 |
| **时间线 (Timeline)** | 25% | 立即=25, 1-3个月=20, 3-6个月=10, 6-12个月=5, 未确定=2 |
| **来源 (Source)** | 20% | 推荐=25, WhatsApp/电话=20, 网站表单=15, 社媒=10, 广告点击=5 |
| **信息完整度** | 15% | 有面积+风格+位置=15, 有两项=10, 有一项=5, 无=0 |
| **互动度 (Engagement)** | 10% | 多次联系=10, 回复消息=7, 已读未回=3, 无互动=0 |

### 5.2 评分计算公式

```
Lead Score = (Budget Score × 0.30) + (Timeline Score × 0.25) + 
             (Source Score × 0.20) + (Completeness Score × 0.15) + 
             (Engagement Score × 0.10)

最终得分范围：0-100
```

### 5.3 评分示例

**示例 A：Hot Lead（得分 85）**
- 预算 RM 500K-1M → 25 × 0.30 = 7.5
- 时间线：立即 → 25 × 0.25 = 6.25
- 来源：朋友推荐 → 25 × 0.20 = 5.0
- 信息完整：有面积+风格+位置 → 15 × 0.15 = 2.25
- 互动：多次联系 → 10 × 0.10 = 1.0
- **总分：22 / 26 = 85（满分100换算）**

**示例 B：Warm Lead（得分 55）**
- 预算 RM 200-500K → 20 × 0.30 = 6.0
- 时间线：3-6个月 → 10 × 0.25 = 2.5
- 来源：FB 广告 → 5 × 0.20 = 1.0
- 信息完整：有面积+位置 → 10 × 0.15 = 1.5
- 互动：回复过一次 → 7 × 0.10 = 0.7
- **总分：11.7 / 26 ≈ 45**

**示例 C：Cold Lead（得分 25）**
- 预算：未确定 → 2 × 0.30 = 0.6
- 时间线：未确定 → 2 × 0.25 = 0.5
- 来源：广告点击 → 5 × 0.20 = 1.0
- 信息完整：无 → 0 × 0.15 = 0
- 互动：无 → 0 × 0.10 = 0
- **总分：2.1 / 26 ≈ 8**

---

## 6. 自动化工作流

### 6.1 全渠道自动化流程图

```
[Lead 进入]
     ↓
[自动回复] ← 5分钟内
     ↓
[Lead Scoring] ← 自动计算
     ↓
[分类 & 分配]
     ↓
┌─────────────────────────────────────┐
│  🔥 Score ≥ 70 (Hot)               │
│  → 立即通知销售负责人               │
│  → 2h 内人工联系                    │
│  → 优先跟进                        │
├─────────────────────────────────────┤
│  🟡 Score 40-69 (Warm)             │
│  → 分配给销售团队                   │
│  → 24h 内人工联系                   │
│  → 进入 7 天 Nurturing              │
├─────────────────────────────────────┤
│  🔵 Score < 40 (Cold)              │
│  → 进入自动 Nurturing 序列          │
│  → 长期培育                         │
│  → 每月一次温和跟进                  │
└─────────────────────────────────────┘
     ↓
[持续跟进 & 状态更新]
     ↓
[转化 / 流失]
```

### 6.2 关键自动化节点

| 节点 | 触发条件 | 自动动作 | 人工介入 |
|------|----------|----------|----------|
| 新 Lead 进入 | 任何渠道收到咨询 | 自动回复 + 评分 + 分配 | 无 |
| 首次联系 | 分配后 2h | 发送跟进提醒 | ✅ 人工联系 |
| 无回复（24h） | 首次联系后 24h 无回复 | 发送第二条消息 | 无 |
| 无回复（7天） | 7天无互动 | 进入长线 Nurture | 无 |
| 预约量房 | 客户同意量房 | 发送确认 + 日历邀请 | ✅ 设计师参与 |
| 报价发送 | 报价发出 | 启动报价跟进序列 | 无 |
| 报价过期 | 报价 14 天无回复 | 发送过期提醒 | ✅ 电话跟进 |
| 签约成功 | Deal Won | 发送欢迎消息 + 通知 PM | ✅ 签约流程 |
| 流失 | Deal Lost | 记录原因 + 6个月后重新激活 | 无 |

### 6.3 数据同步与备份

| 数据 | 同步频率 | 备份方式 |
|------|----------|----------|
| Lead 数据 | 实时 | CRM 自动备份 |
| 通话记录 | 实时 | 集成工具同步 |
| WhatsApp 记录 | 实时 | CRM 存档 |
| 报价文件 | 手动上传 | Google Drive 备份 |
| 合同文件 | 手动上传 | Google Drive + 本地备份 |

---

## 📎 快速开始清单

### 第一周设置

- [ ] 选择 CRM 工具（推荐 GoHighLevel 或 Google Sheets 起步）
- [ ] 创建账号和基础设置
- [ ] 配置自定义字段和 Pipeline
- [ ] 设置 WhatsApp Business 自动回复
- [ ] 创建 Lead Capture 表单/落地页
- [ ] 设置自动化工作流（至少：自动回复 + Nurture 序列）
- [ ] 导入现有 Lead（如有）
- [ ] 培训团队使用系统

### 第一个月优化

- [ ] 收集团队反馈，调整字段和流程
- [ ] 分析 Lead 来源数据，优化广告投放
- [ ] 跟踪转化率，识别瓶颈环节
- [ ] 优化 Lead Scoring 模型权重
- [ ] 设置定期报告（周报/月报）

---

*本指南应根据实际使用的 CRM 工具和业务发展情况持续更新。*
