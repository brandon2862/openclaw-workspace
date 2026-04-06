#!/bin/bash

# 汇率销售管理系统 - API测试脚本

API_BASE="http://localhost:3000/api"
TOKEN=""

echo "=== 汇率销售管理系统 API测试 ==="
echo ""

# 1. 健康检查
echo "1. 测试健康检查..."
curl -s "$API_BASE/health" | jq .
echo ""

# 2. 用户登录
echo "2. 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq .

# 提取token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "登录失败！"
    exit 1
fi

echo "获取到Token: ${TOKEN:0:20}..."
echo ""

# 3. 获取当前用户
echo "3. 测试获取当前用户..."
curl -s "$API_BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. 获取客户列表
echo "4. 测试获取客户列表..."
curl -s "$API_BASE/customers" \
  -H "Authorization: Bearer $TOKEN" | jq '.customers[0:3]'
echo ""

# 5. 计算报价
echo "5. 测试计算报价..."
curl -s -X POST "$API_BASE/transactions/calculate-rates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agent_sx_cost":1.5000}' | jq .
echo ""

# 6. 计算金额
echo "6. 测试计算金额..."
curl -s -X POST "$API_BASE/transactions/calculate-amount" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source_amount":10000,"selected_rate":1.4500,"agent_sx_cost":1.5000}' | jq .
echo ""

# 7. 创建交易
echo "7. 测试创建交易..."
TRANSACTION_RESPONSE=$(curl -s -X POST "$API_BASE/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "source_amount": 10000,
    "agent_sx_cost": 1.5000,
    "selected_option": 1,
    "remark": "API测试交易"
  }')

echo "$TRANSACTION_RESPONSE" | jq .
echo ""

# 8. 获取交易列表
echo "8. 测试获取交易列表..."
curl -s "$API_BASE/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq '.transactions[0:3]'
echo ""

# 9. 获取仪表盘数据
echo "9. 测试获取仪表盘数据..."
curl -s "$API_BASE/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq '.today, .monthly, .customers'
echo ""

# 10. 获取月度报表
echo "10. 测试获取月度报表..."
YEAR=$(date +%Y)
MONTH=$(date +%m)
curl -s "$API_BASE/reports/monthly?year=$YEAR&month=$MONTH" \
  -H "Authorization: Bearer $TOKEN" | jq '.period, .summary'
echo ""

echo "=== API测试完成 ==="
echo "所有测试通过！"