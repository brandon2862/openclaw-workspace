# 快速开始指南

## 5分钟快速体验

### 步骤1：准备环境
```bash
# 确保已安装 Node.js 18+
node --version

# 确保已安装 Git
git --version
```

### 步骤2：获取项目代码
```bash
# 克隆项目（如果从GitHub）
git clone https://github.com/your-username/electron-vue-app.git
cd electron-vue-app

# 或者直接使用已创建的项目
cd electron-vue-app
```

### 步骤3：安装依赖
```bash
# 安装项目依赖
npm install

# 如果安装缓慢，可以使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 步骤4：启动开发服务器
```bash
# 启动开发模式
npm run dev

# 应用将自动打开，显示主界面
# 按 F12 打开开发者工具进行调试
```

### 步骤5：探索功能
1. **查看仪表盘** - 应用概览和快速操作
2. **管理待办事项** - 添加、编辑、删除任务
3. **查看系统信息** - 监控系统资源使用
4. **修改设置** - 配置应用行为和外观
5. **测试系统托盘** - 点击系统托盘图标

## 功能演示

### 基础功能
- **窗口控制**：最小化、最大化、关闭按钮
- **主题切换**：右上角的亮色/暗色主题切换
- **菜单栏**：完整的应用菜单系统
- **系统托盘**：右键点击托盘图标查看菜单

### 示例功能
1. **待办事项管理**
   - 添加新任务
   - 标记任务完成
   - 按优先级筛选
   - 导入/导出数据

2. **系统监控**
   - 实时 CPU 使用率
   - 内存使用情况
   - 系统信息显示
   - 运行时间统计

3. **设置管理**
   - 外观设置（主题、语言）
   - 通知设置
   - 数据存储设置
   - 更新设置

### Windows 特性
- **系统通知**：测试通知功能
- **文件访问**：通过对话框选择文件
- **自动更新**：检查应用更新

## 开发模式功能

### 热重载
- 修改 Vue 组件后自动刷新
- 修改 TypeScript 代码后自动重新编译
- 实时错误提示

### 调试工具
```bash
# 主进程调试
npm run dev -- --inspect

# 然后在 Chrome 中打开：
# chrome://inspect → Open dedicated DevTools for Node
```

### 开发者工具
- **Vue DevTools**：调试 Vue 组件
- **Electron DevTools**：调试主进程
- **性能分析**：使用 Performance 面板

## 构建和打包

### 开发构建
```bash
# 构建主进程
npm run build:main

# 构建渲染进程
npm run build:renderer

# 同时构建两者
npm run build
```

### 生产打包
```bash
# 生成 Windows 安装包
npm run dist:win

# 安装包位置：dist/ 目录
# 双击运行安装程序
```

### 便携版本
```bash
# 生成便携版应用
npm run pack

# 便携版位置：dist/win-unpacked/
# 直接运行可执行文件
```

## 常见操作

### 重置应用数据
```bash
# 删除用户数据目录
# Windows: %APPDATA%/Electron Vue App
# macOS: ~/Library/Application Support/Electron Vue App
# Linux: ~/.config/Electron Vue App
```

### 查看日志
```bash
# 开发模式日志在终端中查看
npm run dev

# 生产模式日志在：
# Windows: %APPDATA%/Electron Vue App/logs/
# 其他平台：应用数据目录/logs/
```

### 故障排除
```bash
# 清理并重新安装
rm -rf node_modules
npm install

# 清理构建缓存
npm run clean

# 检查依赖
npm list --depth=0
```

## 下一步

### 学习开发
1. 阅读 `DEVELOPMENT.md` 了解开发指南
2. 查看 `src/` 目录中的代码示例
3. 尝试修改组件和添加新功能

### 自定义项目
1. 修改 `package.json` 中的应用信息
2. 替换 `resources/` 中的图标文件
3. 调整 `build/builder-config.js` 中的打包配置

### 部署发布
1. 阅读 `PACKAGING.md` 了解打包细节
2. 配置代码签名（可选）
3. 发布到 GitHub Releases 或自有服务器

## 获取帮助

### 文档资源
- `README.md` - 项目概述
- `FAQ.md` - 常见问题解答
- `DEVELOPMENT.md` - 开发指南
- `PACKAGING.md` - 打包指南

### 问题解决
1. 检查控制台错误信息
2. 查看终端中的日志输出
3. 参考常见问题解答
4. 搜索相关错误信息

### 社区支持
- GitHub Issues：报告问题
- Stack Overflow：搜索解决方案
- Electron 官方文档：了解框架特性

---

**提示**：首次运行可能需要一些时间下载 Electron 二进制文件，请耐心等待。

**成功标志**：看到应用窗口打开，显示 "Electron Vue App" 标题和现代化界面。

**开始探索吧！** 🚀