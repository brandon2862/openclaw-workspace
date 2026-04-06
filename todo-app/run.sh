#!/bin/bash

# 待办事项应用运行脚本

set -e

echo "🚀 启动待办事项应用..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p backend/vendor
mkdir -p frontend/node_modules

echo "📦 构建和启动容器..."
docker-compose down 2>/dev/null || true
docker-compose up --build -d

echo "⏳ 等待服务启动..."
sleep 10

echo "✅ 服务已启动！"
echo ""
echo "📊 服务状态："
echo "  - 前端应用: http://localhost:3000"
echo "  - 后端API: http://localhost:8000"
echo "  - 数据库: localhost:3306 (用户: todo_user, 密码: todopassword)"
echo ""
echo "🔧 测试用户："
echo "  - 邮箱: test@example.com"
echo "  - 密码: password123"
echo ""
echo "📝 查看日志：docker-compose logs -f"
echo "🛑 停止应用：docker-compose down"
echo ""

# 检查服务状态
echo "🔍 检查服务状态..."
for service in mysql backend frontend; do
    if docker-compose ps | grep -q "$service.*Up"; then
        echo "  ✅ $service 运行正常"
    else
        echo "  ❌ $service 可能有问题，请查看日志"
    fi
done

echo ""
echo "🎉 应用已准备就绪！打开 http://localhost:3000 开始使用"