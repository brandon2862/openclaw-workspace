# 汇率销售管理系统 - 快速开始指南

## 5分钟快速部署

### 第一步：准备环境
```bash
# 1. 确保已安装Node.js和MySQL
node --version  # 需要 Node.js 18+
mysql --version # 需要 MySQL 8.0+

# 2. 启动MySQL服务
sudo systemctl start mysql  # Linux
# 或
brew services start mysql   # macOS
```

### 第二步：一键启动
```bash
# 进入项目目录
cd fx-sales-system

# 运行启动脚本
./start.sh
```

### 第三步：选择操作
在启动脚本菜单中选择：
1. **初始化数据库**（首次运行必选）
2. **启动完整系统**

### 第四步：访问系统
- 前端界面：http://localhost:5173
- 默认账号：admin@example.com / admin123
- 后端API：http://localhost:3000

## 手动部署步骤

### 1. 数据库设置
```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE fx_sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入数据
USE fx_sales_db;
SOURCE database/init.sql;

# 退出
EXIT;
```

### 2. 后端设置
```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库连接

# 启动服务器
npm run dev
```

### 3. 前端设置
```bash
cd frontend

# 使用任意静态文件服务器
# 方法1：Python
python3 -m http.server 5173

# 方法2：Node.js
npx http-server -p 5173 --cors

# 方法3：直接打开
# 在浏览器中打开 index.html
```

## 系统功能速览

### 1. 登录系统
- 管理员：admin@example.com / admin123
- 员工：staff@example.com / admin123

### 2. 仪表盘
- 今日交易统计
- 本月利润汇总
- 最近交易记录
- 客户利润排行

### 3. 客户管理
- 查看客户列表
- 搜索客户信息
- 新增/编辑客户（管理员）
- 删除客户（管理员）

### 4. 新增交易
1. **选择客户** → 自动带出客户资料
2. **输入Agent SX Cost** → 自动计算3个报价
3. **选择报价选项**（1-4）
4. **输入金额** → 自动计算利润
5. **保存交易**

### 5. 交易记录
- 查看所有交易
- 按客户、日期筛选
- 查看交易详情
- 今日交易统计

### 6. 月度报表
- 选择年份月份
- 查看汇总统计
- 按客户分组显示
- 导出Excel报表

## 业务规则

### 报价计算
```
Option 1 = Agent SX Cost - 0.05
Option 2 = Agent SX Cost - 0.08  
Option 3 = Agent SX Cost - 0.10
Option 4 = 手动输入汇率
```

### 金额计算
```
转换金额：MYR = RMB / Sell Rate
利润计算：P&L = (Agent SX Cost - Sell Rate) × Source Amount
```

## 快捷键

### 全局快捷键
- `Ctrl + S`：保存当前表单
- `Esc`：取消/关闭
- `F5`：刷新页面

### 交易页面
- `数字键1-4`：快速选择报价选项
- `Tab`：在表单字段间切换
- `Enter`：确认选择

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查MySQL服务
sudo systemctl status mysql

# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES;"

# 检查用户权限
mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
```

#### 2. 后端启动失败
```bash
# 检查端口占用
sudo lsof -i :3000

# 检查依赖
cd backend
npm list

# 查看日志
npm run dev 2>&1 | tail -50
```

#### 3. 前端无法访问
```bash
# 检查端口
curl -I http://localhost:5173

# 检查CORS
# 确保后端CORS配置正确
```

#### 4. 登录失败
- 检查默认账号密码
- 检查数据库用户数据
- 查看后端日志中的错误信息

### 日志查看
```bash
# 后端日志
cd backend
tail -f npm-debug.log  # 或查看控制台输出

# 数据库日志
sudo tail -f /var/log/mysql/error.log
```

## 测试数据

系统已包含以下测试数据：

### 用户
- **管理员**：admin@example.com / admin123
- **员工**：staff@example.com / admin123

### 客户
1. ABC贸易公司 (Marking: ABC001)
2. XYZ有限公司 (Marking: XYZ002)  
3. DEF进出口公司 (Marking: DEF003)

### 交易
- 3条示例交易记录
- 包含不同客户和金额
- 演示计算功能

## 下一步操作

### 生产环境部署
1. 配置生产环境变量
2. 使用PM2管理进程
3. 配置Nginx反向代理
4. 设置SSL证书
5. 配置数据库备份

### 功能扩展
1. 查看完整API文档：`docs/API_DOCUMENTATION.md`
2. 查看部署指南：`docs/DEPLOYMENT.md`
3. 查看用户手册：`docs/USER_MANUAL.md`

## 获取帮助

### 文档位置
- `README.md` - 项目总览
- `PROJECT_SUMMARY.md` - 项目总结
- `docs/` - 完整文档目录

### 测试系统
```bash
cd backend
./test-api.sh
```

### 查看状态
```bash
./start.sh
# 选择6. 查看系统状态
```

---

**提示**：首次使用建议运行 `./start.sh` 选择初始化数据库，然后启动完整系统。

系统已准备就绪，可以立即开始使用！