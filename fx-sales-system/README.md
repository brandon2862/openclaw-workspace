# 汇率销售管理系统 (Foreign Exchange Sales Management System)

## 项目概述

一个内部使用的汇率销售管理系统，用于管理汇率报价、客户资料、交易记录和利润报表。

## 功能特性

### Phase 1 - 核心功能 ✅
1. **用户认证与权限管理**
   - 用户登录/注册
   - 角色权限：Admin / Staff
   - JWT token认证

2. **客户资料库管理**
   - 新增/编辑/删除客户
   - 客户字段：Customer Name, Marking, Default Currency Pair, Recipient资料等
   - 搜索和筛选功能

3. **汇率交易管理**
   - 新增交易页面
   - 自动报价功能（Option 1-4）
   - 实时计算：Sell Rate, Converted Amount, P&L
   - 保存交易记录

4. **交易记录查询**
   - 交易列表展示
   - 按日期、客户、货币类型筛选
   - 交易详情格式化展示

5. **月度利润报表**
   - 自动汇总每月P&L
   - 按客户/货币类型分组
   - 导出Excel功能

6. **仪表盘**
   - 今日交易统计
   - 本月P&L汇总
   - 最近交易记录

## 技术栈

### 后端
- **Node.js + Express** - 快速开发API
- **TypeScript** - 类型安全
- **Prisma ORM** - 数据库操作
- **MySQL** - 数据库

### 前端
- **Vue.js 3** - 现代化前端
- **纯JavaScript** - 简单易用
- **Element Plus样式** - UI组件库
- **原生Fetch API** - 数据请求

### 其他
- **JWT** - 用户认证
- **ExcelJS** - Excel导出功能
- **Chart.js** - 数据可视化（预留）

## 快速开始

### 1. 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 2. 克隆项目
```bash
git clone <repository-url>
cd fx-sales-system
```

### 3. 数据库设置
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE fx_sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入初始数据
mysql -u root -p fx_sales_db < database/init.sql
```

### 4. 后端设置
```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库连接等信息

# 启动开发服务器
npm run dev
```

### 5. 前端设置
```bash
cd frontend

# 前端是纯HTML/JS，无需构建
# 直接使用浏览器打开 index.html
# 或使用任何静态文件服务器
python3 -m http.server 5173
```

### 6. 访问系统
- 前端：http://localhost:5173
- 后端API：http://localhost:3000
- 默认账号：
  - 管理员：admin@example.com / admin123
  - 员工：staff@example.com / admin123

## 项目结构

```
fx-sales-system/
├── backend/                    # Node.js后端
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── middleware/        # 中间件
│   │   ├── routes/           # 路由
│   │   ├── services/         # 服务
│   │   ├── utils/            # 工具函数
│   │   ├── types/            # 类型定义
│   │   └── app.ts            # 应用入口
│   ├── prisma/               # Prisma配置
│   ├── .env.example          # 环境变量示例
│   ├── package.json          # 依赖配置
│   └── tsconfig.json         # TypeScript配置
├── frontend/                  # Vue.js前端
│   ├── index.html            # 主页面
│   ├── app.js                # Vue应用
│   └── package.json          # 前端配置
├── database/                  # 数据库脚本
│   └── init.sql              # 初始化SQL
├── docs/                     # 文档
│   ├── DEPLOYMENT.md         # 部署指南
│   ├── API_DOCUMENTATION.md  # API文档
│   └── USER_MANUAL.md        # 用户手册
└── README.md                 # 项目说明
```

## API文档

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

### 主要接口
1. **认证**
   - `POST /auth/login` - 用户登录
   - `POST /auth/register` - 用户注册
   - `GET /auth/me` - 获取当前用户

2. **客户管理**
   - `GET /customers` - 获取客户列表
   - `POST /customers` - 创建客户（Admin）
   - `PUT /customers/:id` - 更新客户（Admin）
   - `DELETE /customers/:id` - 删除客户（Admin）

3. **交易管理**
   - `GET /transactions` - 获取交易列表
   - `POST /transactions` - 创建交易
   - `POST /transactions/calculate-rates` - 计算报价
   - `POST /transactions/calculate-amount` - 计算金额

4. **报表管理**
   - `GET /reports/monthly` - 获取月度报表
   - `GET /reports/monthly/export` - 导出Excel报表

5. **仪表盘**
   - `GET /dashboard` - 获取仪表盘数据

详细API文档请查看 [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## 业务规则

### 1. 自动报价规则
- Option 1 = Agent SX Cost - 0.05
- Option 2 = Agent SX Cost - 0.08  
- Option 3 = Agent SX Cost - 0.10
- Option 4 = Manual（用户输入）

### 2. 计算规则
- **汇率换算**: MYR = RMB / Sell Rate
- **P&L计算**: P&L = (Agent SX Cost - Sell Rate) × Source Amount

### 3. 数据带出规则
选择客户时自动带出：Marking, Recipient资料, Bank资料, Default Currency Pair

## 数据库设计

### Customers 表
- id, customer_name, marking, default_currency_pair
- recipient_name, phone, bank_name, bank_account
- remark, created_at, updated_at

### Transactions 表
- id, transaction_date, customer_id, currency_pair
- source_amount, source_currency, target_currency
- agent_sx_cost, option_1_rate, option_2_rate, option_3_rate
- manual_rate, selected_option, selected_rate
- converted_amount, pnl, remark
- created_at, updated_at

### Users 表
- id, name, email, password_hash, role
- created_at, updated_at

## 开发规范

### 代码规范
- 使用TypeScript确保类型安全
- 遵循ESLint + Prettier代码规范
- 组件和函数命名清晰

### API设计
- RESTful API设计
- 统一的响应格式
- 详细的错误处理

### 错误处理
- 统一的错误处理中间件
- 用户友好的错误提示
- 详细的日志记录

## 部署指南

详细部署步骤请查看 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### 生产环境部署
1. 配置生产环境变量
2. 构建后端项目：`npm run build`
3. 使用PM2管理进程
4. 配置Nginx反向代理
5. 设置SSL证书（HTTPS）
6. 配置数据库备份

## 用户手册

详细使用说明请查看 [docs/USER_MANUAL.md](docs/USER_MANUAL.md)

### 主要功能说明
1. **登录系统** - 使用默认账号登录
2. **仪表盘** - 查看关键指标
3. **客户管理** - 管理客户资料
4. **新增交易** - 创建汇率交易
5. **交易记录** - 查看历史交易
6. **月度报表** - 生成和导出报表

## 测试数据

系统包含以下测试数据：

### 用户
1. 管理员：admin@example.com / admin123
2. 员工：staff@example.com / admin123

### 客户
1. ABC贸易公司 (Marking: ABC001)
2. XYZ有限公司 (Marking: XYZ002)
3. DEF进出口公司 (Marking: DEF003)

### 交易
- 3条示例交易记录

## 开发计划

### Phase 1（已完成）✅
1. 项目搭建和基础架构
2. 用户认证和权限管理
3. 客户资料库管理
4. 汇率交易功能
5. 交易记录查询
6. 月度报表基础功能

### Phase 2（计划中）
1. Excel/PDF导出增强
2. 高级报表筛选
3. 操作日志
4. Dashboard图表化

### Phase 3（规划中）
1. 自动汇率接口
2. 通知功能
3. 多币种扩展

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者：Brandon Wong
- 邮箱：brandon@example.com
- 问题反馈：[GitHub Issues](https://github.com/yourusername/fx-sales-system/issues)

## 更新日志

### v1.0.0 (2024-01)
- 初始版本发布
- 实现Phase 1所有核心功能
- 完整的API文档和用户手册
- 生产环境部署指南

---

**最后更新**: 2024年1月  
**版本**: 1.0.0