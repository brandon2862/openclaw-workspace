#!/bin/bash

# 开发模式运行脚本

set -e

echo "🔧 开发模式启动..."

# 检查必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        return 1
    fi
    return 0
}

echo "📋 检查依赖..."
check_command node || exit 1
check_command npm || exit 1
check_command php || exit 1
check_command mysql || exit 1

echo "✅ 所有依赖已安装"

# 设置环境变量
export DB_HOST=localhost
export DB_NAME=todo_app
export DB_USER=root
export DB_PASSWORD=

echo "🗄️  设置数据库..."
if ! mysql -u root -e "USE todo_app" 2>/dev/null; then
    echo "创建数据库..."
    mysql -u root < database/schema.sql
    echo "✅ 数据库已创建并初始化"
else
    echo "✅ 数据库已存在"
fi

echo "🚀 启动后端服务..."
cd backend
echo "  后端运行在: http://localhost:8000"
echo "  按 Ctrl+C 停止后端"
php -S localhost:8000 -t public &
BACKEND_PID=$!

echo "🚀 启动前端服务..."
cd ../frontend
echo "  安装前端依赖..."
npm install
echo "  前端运行在: http://localhost:3000"
echo "  按 Ctrl+C 停止前端"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 开发环境已启动！"
echo "  - 前端: http://localhost:3000"
echo "  - 后端: http://localhost:8000"
echo "  - 测试用户: test@example.com / password123"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"

# 捕获Ctrl+C
trap 'echo "停止服务..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# 等待
wait