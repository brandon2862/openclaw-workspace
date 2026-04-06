# 汇率销售管理系统 - 部署指南

## 系统要求

- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

## 1. 环境准备

### 1.1 安装Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS
brew install node@18
```

### 1.2 安装MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS
brew install mysql
```

## 2. 数据库配置

### 2.1 启动MySQL服务
```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl enable mysql

# macOS
brew services start mysql
```

### 2.2 创建数据库和用户
```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE fx_sales_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'fx_user'@'localhost' IDENTIFIED BY 'your_password';

-- 授权
GRANT ALL PRIVILEGES ON fx_sales_db.* TO 'fx_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 2.3 初始化数据库
```bash
# 导入初始数据
mysql -u fx_user -p fx_sales_db < database/init.sql
```

## 3. 后端部署

### 3.1 安装依赖
```bash
cd backend
npm install
```

### 3.2 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# Database
DATABASE_URL="mysql://fx_user:your_password@localhost:3306/fx_sales_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# CORS
CORS_ORIGIN="http://your-frontend-domain.com"
```

### 3.3 生成Prisma客户端
```bash
npm run prisma:generate
```

### 3.4 运行数据库迁移
```bash
npm run prisma:migrate
```

### 3.5 构建项目
```bash
npm run build
```

### 3.6 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 4. 前端部署

### 4.1 安装依赖
```bash
cd frontend
npm install
```

### 4.2 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4.3 构建项目
```bash
npm run build
```

### 4.4 部署静态文件
将 `dist` 目录下的文件部署到Web服务器（如Nginx、Apache）。

## 5. Nginx配置（可选）

### 5.1 安装Nginx
```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 5.2 配置反向代理
创建 `/etc/nginx/sites-available/fx-sales-system`：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/fx-sales-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. 使用PM2管理进程（生产环境推荐）

### 6.1 安装PM2
```bash
npm install -g pm2
```

### 6.2 启动后端服务
```bash
cd backend
pm2 start dist/app.js --name "fx-backend"
```

### 6.3 设置开机自启
```bash
pm2 startup
pm2 save
```

### 6.4 常用命令
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs fx-backend

# 重启服务
pm2 restart fx-backend

# 停止服务
pm2 stop fx-backend
```

## 7. SSL证书配置（HTTPS）

### 7.1 使用Let's Encrypt
```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 7.2 自动续期
```bash
# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期定时任务
sudo crontab -e
# 添加以下行（每月1号和15号凌晨3点续期）
0 3 1,15 * * certbot renew --quiet
```

## 8. 监控和维护

### 8.1 日志管理
```bash
# 查看后端日志
pm2 logs fx-backend

# 查看Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

### 8.2 备份数据库
```bash
# 创建备份脚本
cat > /usr/local/bin/backup-fx-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/fx-sales"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u fx_user -p'your_password' fx_sales_db > $BACKUP_DIR/fx_sales_db_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-fx-db.sh

# 设置每日备份定时任务
sudo crontab -e
# 添加以下行（每天凌晨2点备份）
0 2 * * * /usr/local/bin/backup-fx-db.sh
```

## 9. 故障排除

### 9.1 端口占用
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000

# 杀死占用进程
sudo kill -9 <PID>
```

### 9.2 数据库连接问题
```bash
# 测试数据库连接
mysql -u fx_user -p -h localhost fx_sales_db

# 检查MySQL服务状态
sudo systemctl status mysql
```

### 9.3 权限问题
```bash
# 检查文件权限
ls -la backend/

# 修复权限
chmod 755 backend/
chown -R www-data:www-data backend/  # Ubuntu
```

## 10. 更新部署

### 10.1 更新后端
```bash
cd backend
git pull origin main
npm install
npm run build
pm2 restart fx-backend
```

### 10.2 更新前端
```bash
cd frontend
git pull origin main
npm install
npm run build
# 复制dist文件到Web服务器目录
```

## 默认账号

- **管理员**: admin@example.com / admin123
- **员工**: staff@example.com / admin123

**注意**: 首次登录后请立即修改密码！

---

如有问题，请查看日志文件或联系系统管理员。