# 汇率销售管理系统 - API文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **响应格式**: JSON

## 认证

### 用户注册
- **URL**: `/auth/register`
- **方法**: `POST`
- **认证**: 不需要
- **请求体**:
```json
{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123",
  "role": "STAFF" // 可选，默认STAFF，可选值：ADMIN, STAFF
}
```
- **响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "用户名",
    "email": "user@example.com",
    "role": "STAFF"
  }
}
```

### 用户登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **认证**: 不需要
- **请求体**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **响应**: 同注册响应

### 获取当前用户信息
- **URL**: `/auth/me`
- **方法**: `GET`
- **认证**: 需要
- **响应**:
```json
{
  "id": 1,
  "name": "用户名",
  "email": "user@example.com",
  "role": "STAFF",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## 客户管理

### 获取所有客户
- **URL**: `/customers`
- **方法**: `GET`
- **认证**: 需要
- **查询参数**:
  - `search`: 搜索关键词（客户名、marking、recipient、电话）
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
- **响应**:
```json
{
  "customers": [
    {
      "id": 1,
      "customer_name": "ABC贸易公司",
      "marking": "ABC001",
      "default_currency_pair": "RMB/MYR",
      "recipient_name": "张三",
      "phone": "+6012-3456789",
      "bank_name": "Maybank",
      "bank_account": "1234567890",
      "remark": "长期合作客户",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 搜索客户
- **URL**: `/customers/search`
- **方法**: `GET`
- **认证**: 需要
- **查询参数**:
  - `query`: 搜索关键词
- **响应**: 客户数组（最多10条）

### 获取单个客户
- **URL**: `/customers/:id`
- **方法**: `GET`
- **认证**: 需要
- **响应**: 单个客户对象

### 创建客户
- **URL**: `/customers`
- **方法**: `POST`
- **认证**: 需要（仅管理员）
- **请求体**:
```json
{
  "customer_name": "新客户",
  "marking": "NEW001",
  "default_currency_pair": "RMB/MYR",
  "recipient_name": "接收人",
  "phone": "+6012-3456789",
  "bank_name": "银行名称",
  "bank_account": "银行账号",
  "remark": "备注信息"
}
```
- **响应**: 创建的客户对象

### 更新客户
- **URL**: `/customers/:id`
- **方法**: `PUT`
- **认证**: 需要（仅管理员）
- **请求体**: 同创建客户（部分字段）
- **响应**: 更新后的客户对象

### 删除客户
- **URL**: `/customers/:id`
- **方法**: `DELETE`
- **认证**: 需要（仅管理员）
- **响应**:
```json
{
  "message": "Customer deleted successfully"
}
```

## 交易管理

### 获取所有交易
- **URL**: `/transactions`
- **方法**: `GET`
- **认证**: 需要
- **查询参数**:
  - `customer_id`: 客户ID筛选
  - `start_date`: 开始日期（YYYY-MM-DD）
  - `end_date`: 结束日期（YYYY-MM-DD）
  - `currency_pair`: 货币对筛选
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认20）
- **响应**:
```json
{
  "transactions": [
    {
      "id": 1,
      "transaction_date": "2024-01-01T10:30:00.000Z",
      "customer_id": 1,
      "currency_pair": "RMB/MYR",
      "source_amount": 10000.00,
      "source_currency": "RMB",
      "target_currency": "MYR",
      "agent_sx_cost": 1.5000,
      "option_1_rate": 1.4500,
      "option_2_rate": 1.4200,
      "option_3_rate": 1.4000,
      "manual_rate": null,
      "selected_option": 1,
      "selected_rate": 1.4500,
      "converted_amount": 6896.55,
      "pnl": 500.00,
      "remark": "测试交易",
      "created_at": "2024-01-01T10:30:00.000Z",
      "updated_at": "2024-01-01T10:30:00.000Z",
      "customer": {
        "id": 1,
        "customer_name": "ABC贸易公司",
        "marking": "ABC001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 获取单个交易
- **URL**: `/transactions/:id`
- **方法**: `GET`
- **认证**: 需要
- **响应**: 单个交易对象（包含客户详情）

### 创建交易
- **URL**: `/transactions`
- **方法**: `POST`
- **认证**: 需要
- **请求体**:
```json
{
  "customer_id": 1,
  "source_amount": 10000.00,
  "agent_sx_cost": 1.5000,
  "selected_option": 1,
  "manual_rate": null, // 仅当selected_option=4时需要
  "remark": "交易备注"
}
```
- **响应**: 创建的交易对象

### 计算报价
- **URL**: `/transactions/calculate-rates`
- **方法**: `POST`
- **认证**: 需要
- **请求体**:
```json
{
  "agent_sx_cost": 1.5000
}
```
- **响应**:
```json
{
  "option_1_rate": 1.4500,
  "option_2_rate": 1.4200,
  "option_3_rate": 1.4000
}
```

### 计算金额
- **URL**: `/transactions/calculate-amount`
- **方法**: `POST`
- **认证**: 需要
- **请求体**:
```json
{
  "source_amount": 10000.00,
  "selected_rate": 1.4500,
  "agent_sx_cost": 1.5000
}
```
- **响应**:
```json
{
  "converted_amount": 6896.55,
  "pnl": 500.00
}
```

### 获取今日统计
- **URL**: `/transactions/stats/today`
- **方法**: `GET`
- **认证**: 需要
- **响应**:
```json
{
  "today_transactions": 5,
  "today_pnl": 2500.00
}
```

## 报表管理

### 获取月度报表
- **URL**: `/reports/monthly`
- **方法**: `GET`
- **认证**: 需要
- **查询参数**:
  - `year`: 年份（如2024）
  - `month`: 月份（1-12）
- **响应**:
```json
{
  "period": {
    "year": 2024,
    "month": 1,
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.999Z"
  },
  "summary": {
    "total_transactions": 100,
    "total_pnl": 50000.00,
    "total_amount": 1000000.00
  },
  "by_customer": [
    {
      "customer_name": "ABC贸易公司",
      "marking": "ABC001",
      "transaction_count": 50,
      "total_pnl": 25000.00,
      "total_amount": 500000.00
    }
  ],
  "by_currency": [
    {
      "currency_pair": "RMB/MYR",
      "transaction_count": 100,
      "total_pnl": 50000.00,
      "total_amount": 1000000.00
    }
  ],
  "transactions": [...]
}
```

### 导出月度报表为Excel
- **URL**: `/reports/monthly/export`
- **方法**: `GET`
- **认证**: 需要
- **查询参数**:
  - `year`: 年份
  - `month`: 月份
- **响应**: Excel文件下载

## 仪表盘

### 获取仪表盘数据
- **URL**: `/dashboard`
- **方法**: `GET`
- **认证**: 需要
- **响应**:
```json
{
  "today": {
    "transactions": 5,
    "pnl": 2500.00
  },
  "monthly": {
    "pnl": 50000.00
  },
  "customers": {
    "total": 50
  },
  "recent_transactions": [
    {
      "id": 1,
      "date": "2024-01-01T10:30:00.000Z",
      "customer_name": "ABC贸易公司",
      "marking": "ABC001",
      "source_amount": 10000.00,
      "pnl": 500.00,
      "currency_pair": "RMB/MYR"
    }
  ],
  "top_customers": [
    {
      "customer_id": 1,
      "customer_name": "ABC贸易公司",
      "marking": "ABC001",
      "total_pnl": 25000.00
    }
  ],
  "monthly_trends": [
    {
      "month": "2023-12",
      "transactions": 80,
      "pnl": 40000.00
    }
  ]
}
```

## 健康检查

### 服务健康状态
- **URL**: `/health`
- **方法**: `GET`
- **认证**: 不需要
- **响应**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误处理

### 错误响应格式
```json
{
  "error": "错误描述",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 数据格式

### 日期时间
- 所有日期时间字段使用ISO 8601格式：`YYYY-MM-DDTHH:mm:ss.sssZ`

### 金额
- 所有金额字段使用两位小数
- 汇率使用四位小数

### 货币代码
- 源货币：RMB
- 目标货币：MYR
- 货币对格式：源货币/目标货币（如：RMB/MYR）

## 计算规则

### 报价规则
- Option 1 = Agent SX Cost - 0.05
- Option 2 = Agent SX Cost - 0.08
- Option 3 = Agent SX Cost - 0.10
- Option 4 = 手动输入

### 金额计算
- **汇率换算**: MYR = RMB / Sell Rate
- **P&L计算**: P&L = (Agent SX Cost - Sell Rate) × Source Amount

## 权限说明

### 角色权限
- **ADMIN**: 所有操作权限
- **STAFF**: 
  - 可以查看客户、交易、报表
  - 可以创建交易
  - 不能管理客户（创建、更新、删除）
  - 不能管理用户

### 接口权限矩阵
| 接口 | ADMIN | STAFF |
|------|-------|-------|
| 客户管理（增删改） | ✓ | ✗ |
| 客户查询 | ✓ | ✓ |
| 交易管理 | ✓ | ✓ |
| 报表查看 | ✓ | ✓ |
| 报表导出 | ✓ | ✓ |
| 仪表盘 | ✓ | ✓ |

## 使用示例

### 1. 登录获取Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 2. 使用Token访问API
```bash
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 创建交易
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "source_amount": 10000,
    "agent_sx_cost": 1.5000,
    "selected_option": 1,
    "remark": "测试交易"
  }'
```

### 4. 获取月度报表
```bash
curl -X GET "http://localhost:3000/api/reports/monthly?year=2024&month=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 注意事项

1. 所有API请求都需要在Header中添加 `Authorization: Bearer <token>`
2. 金额和汇率使用精确小数计算，避免浮点数误差
3. 日期筛选时，结束日期包含当天
4. 分页查询时，页码从1开始
5. 导出报表时，浏览器会自动下载Excel文件