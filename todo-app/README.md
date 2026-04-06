# 待办事项应用 (Todo App)

一个简单的全栈待办事项应用，使用现代技术栈构建。

## 技术栈

- **后端**: PHP (自定义MVC框架)
- **前端**: Vue.js 3 + Composition API
- **数据库**: MySQL
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **容器化**: Docker + Docker Compose

## 功能特性

- ✅ 用户认证（注册/登录）
- ✅ 创建、读取、更新、删除待办事项
- ✅ 标记待办事项为完成/未完成
- ✅ 按状态筛选（全部/进行中/已完成）
- ✅ 响应式设计，支持移动端
- ✅ 简洁美观的用户界面
- ✅ RESTful API 通信

## 项目结构

```
todo-app/
├── backend/          # PHP后端API
│   ├── src/         # 源代码
│   │   ├── Config/  # 配置文件
│   │   ├── Controllers/ # 控制器
│   │   └── Models/  # 数据模型
│   ├── public/      # 公共入口
│   └── vendor/      # 依赖
├── frontend/        # Vue.js前端
│   ├── src/         # 源代码
│   │   ├── services/# API服务
│   │   └── App.vue  # 主组件
│   └── public/      # 静态资源
├── database/        # 数据库文件
│   └── schema.sql   # 数据库schema
└── docker-compose.yml # Docker编排
```

## 快速开始

### 使用Docker（推荐）

1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录运行：

```bash
./run.sh
```

3. 打开浏览器访问：http://localhost:3000

### 开发模式

1. 安装依赖：
   - PHP 8.1+
   - MySQL
   - Node.js 18+
   - npm

2. 启动开发环境：

```bash
./run-dev.sh
```

3. 访问：
   - 前端：http://localhost:3000
   - 后端API：http://localhost:8000

## API文档

### 认证

**注册用户**
```http
POST /api/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

**用户登录**
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 待办事项

**获取待办事项列表**
```http
GET /api/todos?user_id=1&status=all
```

**创建待办事项**
```http
POST /api/todos?user_id=1
Content-Type: application/json

{
  "title": "待办事项标题",
  "description": "可选描述"
}
```

**更新待办事项**
```http
PUT /api/todos/{id}?user_id=1
Content-Type: application/json

{
  "title": "新标题",
  "description": "新描述",
  "completed": true
}
```

**删除待办事项**
```http
DELETE /api/todos/{id}?user_id=1
```

## 测试用户

应用包含一个测试用户：
- 邮箱：test@example.com
- 密码：password123

## 开发指南

### 后端开发

1. 进入backend目录
2. 修改代码后，后端会自动重启（开发模式）
3. API端点定义在 `public/index.php`

### 前端开发

1. 进入frontend目录
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 代码热重载已启用

### 数据库管理

**使用Docker时：**
```bash
docker-compose exec mysql mysql -u todo_user -ptodopassword todo_app
```

**开发模式：**
```bash
mysql -u root todo_app
```

## 部署

### 生产环境部署

1. 构建生产版本：
```bash
cd frontend && npm run build
```

2. 配置生产环境变量：
```bash
cp backend/.env.example backend/.env
# 编辑 .env 文件设置生产环境配置
```

3. 使用Docker Compose部署：
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 环境变量

后端需要以下环境变量：

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_NAME | 数据库名 | todo_app |
| DB_USER | 数据库用户 | root |
| DB_PASSWORD | 数据库密码 | 空 |
| APP_DEBUG | 调试模式 | true |

## 故障排除

### 常见问题

1. **端口冲突**
   - 修改 `docker-compose.yml` 中的端口映射
   - 或停止占用端口的服务

2. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证数据库凭据
   - 检查网络连接

3. **前端无法连接后端**
   - 检查后端服务是否运行
   - 查看浏览器控制台错误
   - 验证CORS配置

### 查看日志

```bash
# Docker环境
docker-compose logs -f

# 特定服务
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

## 许可证

MIT License