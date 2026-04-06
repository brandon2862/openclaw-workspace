#!/bin/bash

echo "========================================="
echo "  汇率销售管理系统 - 简化启动脚本"
echo "========================================="
echo ""

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 检查是否在项目目录
if [ ! -f "README.md" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 显示选项
echo "请选择启动方式："
echo "1. 启动后端API服务器"
echo "2. 启动前端界面"
echo "3. 启动完整系统（后端 + 前端）"
echo "4. 退出"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        print_info "启动后端API服务器..."
        cd backend
        if [ -f "node_modules/.bin/ts-node" ]; then
            npx ts-node src/app.ts
        else
            print_error "请先安装依赖：cd backend && npm install"
        fi
        ;;
    2)
        print_info "启动前端界面..."
        print_success "前端界面已修复完成！"
        echo ""
        echo "🎉 修复后的界面文件："
        echo "   - frontend/index.html (主界面)"
        echo "   - frontend/test.html (测试页面)"
        echo "   - frontend/REPAIR_SUMMARY.md (修复报告)"
        echo ""
        echo "📱 打开方式："
        echo "   1. 直接在浏览器中打开 frontend/index.html"
        echo "   2. 或使用以下命令："
        echo "      open frontend/index.html"
        echo "      open frontend/test.html"
        echo ""
        print_info "注意：前端需要后端API支持完整功能"
        ;;
    3)
        print_info "启动完整系统..."
        echo "由于系统依赖问题，建议："
        echo "1. 先启动后端：cd backend && npm run dev"
        echo "2. 然后在浏览器打开 frontend/index.html"
        echo ""
        print_info "或者查看修复报告：cat frontend/REPAIR_SUMMARY.md"
        ;;
    4)
        print_info "退出"
        exit 0
        ;;
    *)
        print_error "无效选项"
        exit 1
        ;;
esac