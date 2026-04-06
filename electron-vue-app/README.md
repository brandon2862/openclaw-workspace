# Electron Vue App

一个现代化的 Windows 桌面应用示例，使用 Electron + Vue.js 3 + TypeScript + Element Plus 技术栈。

## 📋 功能特性

### 🎯 基础功能
- ✅ 主窗口界面
- ✅ 系统托盘图标
- ✅ 菜单栏（文件、编辑、帮助）
- ✅ 关于对话框
- ✅ 亮色/暗色主题切换

### 📝 示例功能
- ✅ 待办事项列表（展示数据绑定）
- ✅ 系统信息显示（展示系统API调用）
- ✅ 设置页面（展示配置管理）
- ✅ 完整的错误处理

### 🪟 Windows特性
- ✅ 系统通知
- ✅ 文件系统访问示例
- ✅ 自动更新检查
- ⏳ 注册表访问示例（可选）

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Git

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/electron-vue-app.git
cd electron-vue-app

# 安装依赖
npm install
```

### 开发模式
```bash
# 启动开发服务器
npm run dev
```

### 构建应用
```bash
# 构建主进程和渲染进程
npm run build

# 打包为Windows安装包
npm run dist:win

# 打包所有平台
npm run dist
```

## 📁 项目结构

```
electron-vue-app/
├── src/
│   ├── main/          # Electron主进程代码
│   │   ├── index.ts   # 主进程入口
│   │   ├── menu.ts    # 应用菜单
│   │   ├── tray.ts    # 系统托盘
│   │   ├── ipcHandlers.ts # IPC处理器
│   │   └── updater.ts # 自动更新
│   ├── renderer/      # Vue.js渲染进程代码
│   │   ├── main.ts    # Vue应用入口
│   │   ├── App.vue    # 根组件
│   │   ├── views/     # 页面组件
│   │   ├── stores/    # Pinia状态管理
│   │   ├── router/    # 路由配置
│   │   └── styles/    # 样式文件
│   ├── preload/       # 预加载脚本
│   └── shared/        # 共享类型和工具
├── resources/         # 图标和资源文件
├── build/            # 构建配置
└── dist/             # 打包输出
```

## 🛠️ 技术栈

- **框架**: Electron 28.2.0
- **前端**: Vue.js 3.4.21 + TypeScript 5.3.3
- **UI库**: Element Plus 2.4.4
- **状态管理**: Pinia 2.1.7
- **路由**: Vue Router 4.2.5
- **构建工具**: Vite 5.0.12
- **打包工具**: electron-builder 24.9.1
- **代码规范**: ESLint + Prettier

## 📖 开发指南

### 代码规范
```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format
```

### 添加新功能
1. 在 `src/renderer/views/` 创建新的页面组件
2. 在 `src/renderer/router/index.ts` 添加路由
3. 在 `src/renderer/stores/` 创建状态管理（如果需要）
4. 在 `src/main/ipcHandlers.ts` 添加IPC处理器（如果需要与主进程通信）

### 添加系统API
1. 在 `src/main/ipcHandlers.ts` 注册新的IPC处理器
2. 在 `src/preload/index.ts` 暴露API给渲染进程
3. 在 `src/shared/types.ts` 添加类型定义

## 🔧 配置说明

### 应用配置
- `package.json` - 项目配置和依赖
- `tsconfig.json` - TypeScript配置
- `vite.config.ts` - Vite构建配置
- `build/builder-config.js` - Electron Builder配置

### 图标配置
将图标文件放在 `resources/` 目录：
- `icon.png` (512x512) - 应用图标
- `icon.ico` - Windows图标文件
- `tray-icon.png` (16x16或32x32) - 系统托盘图标

### 环境变量
```bash
# 开发环境
NODE_ENV=development

# 生产环境
NODE_ENV=production
```

## 📦 打包发布

### Windows
```bash
# 生成NSIS安装程序
npm run dist:win

# 生成便携版
npm run pack
```

### 发布到GitHub
1. 在 `package.json` 中配置 `build.publish.provider` 为 `github`
2. 设置 GitHub Token 环境变量
3. 运行 `npm run dist`

### 自动更新
应用支持自动更新，基于 `electron-updater` 实现：
- 自动检查更新
- 下载进度显示
- 一键安装更新

## 🐛 故障排除

### 常见问题

**Q: 开发服务器无法启动**
```bash
# 检查端口占用
netstat -ano | findstr :3000

# 清理node_modules重新安装
rm -rf node_modules
npm install
```

**Q: 打包失败**
```bash
# 检查依赖
npm list --depth=0

# 清理缓存
npm cache clean --force

# 重新构建
npm run build
npm run dist
```

**Q: 应用启动后白屏**
```bash
# 检查主进程日志
npm run dev

# 检查渲染进程控制台
按 F12 打开开发者工具
```

### 调试技巧
```bash
# 启用详细日志
npm run dev -- --verbose

# 检查主进程日志
# 在终端中查看输出

# 检查渲染进程
# 按 F12 打开开发者工具
```

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持与反馈

- 报告问题: [GitHub Issues](https://github.com/your-username/electron-vue-app/issues)
- 功能请求: [GitHub Discussions](https://github.com/your-username/electron-vue-app/discussions)
- 文档: [项目Wiki](https://github.com/your-username/electron-vue-app/wiki)

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 使用 JavaScript, HTML 和 CSS 构建跨平台桌面应用
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - 基于 Vue 3 的桌面端组件库
- [Vite](https://vitejs.dev/) - 下一代前端工具

---

**Happy Coding!** 🚀