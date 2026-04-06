#!/bin/bash

# 汇率销售管理系统 - 一键启动脚本

echo "========================================="
echo "  汇率销售管理系统启动脚本"
echo "========================================="
echo ""

# 检查必要工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "错误: 未找到 $1，请先安装 $1"
        exit 1
    fi
}

echo "检查系统依赖..."
check_command node
check_command npm
check_command mysql

echo "✅ 系统依赖检查通过"
echo ""

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 主菜单
show_menu() {
    echo ""
    echo "请选择操作:"
    echo "1. 启动完整系统（后端 + 前端）"
    echo "2. 仅启动后端API服务器"
    echo "3. 仅启动前端界面"
    echo "4. 运行系统测试"
    echo "5. 初始化数据库"
    echo "6. 查看系统状态"
    echo "7. 停止所有服务"
    echo "8. 退出"
    echo ""
    read -p "请输入选项 (1-8): " choice
}

# 启动后端服务器
start_backend() {
    print_info "启动后端API服务器..."
    
    cd backend
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_warning "未找到node_modules，正在安装依赖..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "依赖安装失败"
            return 1
        fi
    fi
    
    # 检查环境变量
    if [ ! -f ".env" ]; then
        print_warning "未找到.env文件，正在创建..."
        cp .env.example .env
        print_info "请编辑 backend/.env 文件配置数据库连接"
    fi
    
    # 启动开发服务器
    print_info "启动开发服务器..."
    npm run dev &
    BACKEND_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否运行
    if curl -s http://localhost:3000/api/health > /dev/null; then
        print_success "后端API服务器启动成功！"
        echo "  访问地址: http://localhost:3000"
        echo "  API文档: http://localhost:3000/api/health"
    else
        print_error "后端API服务器启动失败"
        return 1
    fi
    
    cd ..
}

# 启动前端界面
start_frontend() {
    print_info "启动前端界面..."
    
    cd frontend
    
    # 检查是否安装了http-server
    if ! command -v http-server &> /dev/null; then
        print_warning "未找到http-server，正在安装..."
        npm install -g http-server
    fi
    
    # 启动静态文件服务器
    print_info "启动前端服务器..."
    http-server -p 5173 --cors &
    FRONTEND_PID=$!
    
    sleep 2
    
    # 检查前端是否运行
    if curl -s http://localhost:5173 > /dev/null; then
        print_success "前端界面启动成功！"
        echo "  访问地址: http://localhost:5173"
        echo "  默认账号: admin@example.com / admin123"
    else
        print_error "前端界面启动失败"
        return 1
    fi
    
    cd ..
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    
    # 检查数据库连接
    read -p "请输入MySQL root密码: " -s db_password
    echo ""
    
    # 创建数据库
    print_info "创建数据库..."
    mysql -u root -p$db_password -e "CREATE DATABASE IF NOT EXISTS fx_sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "数据库创建成功"
    else
        print_error "数据库创建失败，请检查MySQL服务"
        return 1
    fi
    
    # 导入数据
    print_info "导入初始数据..."
    mysql -u root -p$db_password fx_sales_db < database/init.sql 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "数据导入成功"
        echo ""
        echo "默认用户:"
        echo "  管理员: admin@example.com / admin123"
        echo "  员工: staff@example.com / admin123"
        echo ""
        echo "示例客户:"
        echo "  ABC贸易公司 (Marking: ABC001)"
        echo "  XYZ有限公司 (Marking: XYZ002)"
        echo "  DEF进出口公司 (Marking: DEF003)"
    else
        print_error "数据导入失败"
        return 1
    fi
}

# 运行系统测试
run_tests() {
    print_info "运行系统测试..."
    
    cd backend
    
    # 检查测试脚本
    if [ ! -f "test-api.sh" ]; then
        print_error "未找到测试脚本"
        cd ..
        return 1
    fi
    
    # 运行测试
    chmod +x test-api.sh
    ./test-api.sh
    
    cd ..
}

# 查看系统状态
check_status() {
    print_info "检查系统状态..."
    
    echo ""
    echo "=== 后端API服务器 ==="
    if curl -s http://localhost:3000/api/health > /dev/null; then
        print_success "运行中 - http://localhost:3000"
        curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
    else
        print_error "未运行"
    fi
    
    echo ""
    echo "=== 前端界面 ==="
    if curl -s http://localhost:5173 > /dev/null; then
        print_success "运行中 - http://localhost:5173"
    else
        print_error "未运行"
    fi
    
    echo ""
    echo "=== 数据库 ==="
    if command -v mysql &> /dev/null; then
        if mysql -u root -e "SELECT 1" 2>/dev/null; then
            print_success "MySQL服务运行中"
            
            # 检查数据库是否存在
            if mysql -u root -e "USE fx_sales_db" 2>/dev/null; then
                # 统计数据
                user_count=$(mysql -u root -D fx_sales_db -s -N -e "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
                customer_count=$(mysql -u root -D fx_sales_db -s -N -e "SELECT COUNT(*) FROM customers" 2>/dev/null || echo "0")
                transaction_count=$(mysql -u root -D fx_sales_db -s -N -e "SELECT COUNT(*) FROM transactions" 2>/dev/null || echo "0")
                
                echo "  数据库: fx_sales_db"
                echo "  用户数: $user_count"
                echo "  客户数: $customer_count"
                echo "  交易数: $transaction_count"
            else
                print_warning "数据库 fx_sales_db 不存在"
            fi
        else
            print_error "MySQL服务未运行或无法连接"
        fi
    else
        print_error "MySQL未安装"
    fi
}

# 停止所有服务
stop_services() {
    print_info "停止所有服务..."
    
    # 停止后端
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        print_success "后端服务器已停止"
    fi
    
    # 停止前端
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        print_success "前端服务器已停止"
    fi
    
    # 查找并停止其他相关进程
    pkill -f "node.*backend" 2>/dev/null && print_success "停止其他后端进程"
    pkill -f "http-server.*5173" 2>/dev/null && print_success "停止其他前端进程"
}

# 清理函数
cleanup() {
    echo ""
    print_info "正在清理..."
    stop_services
    exit 0
}

# 设置退出时的清理
trap cleanup SIGINT SIGTERM

# 主循环
while true; do
    show_menu
    
    case $choice in
        1)
            echo ""
            echo "启动完整系统..."
            start_backend
            if [ $? -eq 0 ]; then
                start_frontend
                if [ $? -eq 0 ]; then
                    echo ""
                    print_success "系统启动完成！"
                    echo "  前端: http://localhost:5173"
                    echo "  后端: http://localhost:3000"
                    echo "  默认账号: admin@example.com / admin123"
                    echo ""
                    echo "按 Ctrl+C 停止所有服务"
                    
                    # 等待用户中断
                    wait
                fi
            fi
            ;;
        2)
            start_backend
            if [ $? -eq 0 ]; then
                echo ""
                echo "后端API服务器运行中..."
                echo "按 Ctrl+C 停止服务器"
                wait $BACKEND_PID
            fi
            ;;
        3)
            start_frontend
            if [ $? -eq 0 ]; then
                echo ""
                echo "前端界面运行中..."
                echo "按 Ctrl+C 停止服务器"
                wait $FRONTEND_PID
            fi
            ;;
        4)
            run_tests
            ;;
        5)
            init_database
            ;;
        6)
            check_status
            ;;
        7)
            stop_services
            ;;
        8)
            print_info "退出系统"
            cleanup
            ;;
        *)
            print_error "无效选项，请重新选择"
            ;;
    esac
    
    # 按任意键继续
    if [ -n "$choice" ] && [ "$choice" != "1" ] && [ "$choice" != "2" ] && [ "$choice" != "3" ] && [ "$choice" != "4" ] && [ "$choice" != "5" ] && [ "$choice" != "6" ] && [ "$choice" != "7" ] && [ "$choice" != "8" ]; then
        echo ""
        read -p "按回车键继续..."
    fi
done