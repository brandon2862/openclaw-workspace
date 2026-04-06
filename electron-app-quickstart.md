# 🚀 Electron桌面应用快速启动指南

## 📋 前置要求

在运行coding specialist创建的应用之前，请确保已安装：

### 1. Node.js环境
```bash
# 检查Node.js版本（需要16.0+）
node --version

# 检查npm版本
npm --version
```

### 2. 开发工具（推荐）
- **VS Code** - 代码编辑器
- **Git** - 版本控制
- **Windows Terminal** - 更好的命令行工具

## 🛠️ 项目结构预览

coding specialist创建的项目将包含：

```
electron-vue-app/
├── package.json          # 项目配置和依赖
├── vite.config.ts       # Vite构建配置
├── electron.vite.config.ts # Electron配置
├── src/
│   ├── main/           # Electron主进程
│   ├── renderer/       # Vue.js前端
│   └── preload/        # 安全通信层
├── resources/          # 图标和资源
└── build/             # 打包配置
```

## 🚀 快速启动步骤

### 步骤1：进入项目目录
```bash
cd electron-vue-app
```

### 步骤2：安装依赖
```bash
npm install
# 或使用yarn
yarn install
```

### 步骤3：启动开发模式
```bash
npm run dev
# 或
yarn dev
```

这将同时启动：
- **Vue.js开发服务器** (http://localhost:3000)
- **Electron应用窗口**

### 步骤4：打包应用（生成.exe文件）
```bash
# 开发环境打包
npm run build:win

# 生产环境打包（代码压缩）
npm run build:win-prod
```

生成的安装包在 `dist/` 目录中。

## 🔧 开发工作流

### 1. 修改前端代码（Vue.js）
- 文件位置：`src/renderer/`
- 支持热重载：修改后自动刷新

### 2. 修改主进程代码（Electron）
- 文件位置：`src/main/`
- 需要重启应用：`Ctrl+R` 或关闭重开

### 3. 添加新功能
```bash
# 添加UI组件
npm install element-plus

# 添加工具库
npm install lodash axios

# 添加类型定义
npm install @types/node --save-dev
```

## 🎨 应用功能预览

coding specialist创建的应用将包含：

### 1. 核心功能
- ✅ 主窗口界面
- ✅ 系统托盘图标
- ✅ 菜单栏（文件、编辑、帮助）
- ✅ 关于对话框

### 2. 示例功能
- ✅ 待办事项列表
- ✅ 系统信息显示
- ✅ 主题切换（亮色/暗色）
- ✅ 设置页面

### 3. Windows特性
- ✅ 系统通知
- ✅ 文件系统访问示例
- ✅ 自动更新检查

## 📦 打包和分发

### 生成Windows安装包
```bash
# 生成.exe安装程序
npm run build:win

# 生成便携版（无需安装）
npm run build:win-portable
```

### 安装包类型
1. **NSIS安装程序** (.exe) - 标准Windows安装程序
2. **便携版** (.exe) - 直接运行，无需安装
3. **应用商店包** (.msix) - Microsoft Store发布

## 🐛 常见问题解决

### 问题1：依赖安装失败
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules
npm install
```

### 问题2：Electron启动失败
```bash
# 检查Electron版本
npx electron --version

# 重新安装Electron
npm rebuild electron
```

### 问题3：打包失败
```bash
# 确保有足够的磁盘空间
# 关闭杀毒软件（可能误报）
# 使用管理员权限运行命令行
```

## 🔍 调试技巧

### 1. 开发者工具
- **主进程调试**：`Ctrl+Shift+I` 或 `F12`
- **渲染进程调试**：在窗口中右键 → 检查

### 2. 日志查看
```bash
# 查看Electron日志
npm run dev 2>&1 | tee electron.log

# 查看Vue.js日志
npm run dev:renderer
```

### 3. 性能分析
```bash
# 启动性能分析
npm run dev --inspect
```

## 📚 学习资源

### 官方文档
- [Electron官方文档](https://www.electronjs.org/docs)
- [Vue.js 3文档](https://vuejs.org/guide/)
- [Vite文档](https://vitejs.dev/guide/)
- [Element Plus文档](https://element-plus.org/)

### 推荐教程
1. **Electron入门**：从零开始构建第一个应用
2. **Vue 3 + TypeScript**：现代前端开发
3. **桌面应用安全**：Electron安全最佳实践
4. **应用打包和分发**：发布到Windows商店

## 🚀 下一步建议

### 1. 运行和测试
- 按照上述步骤启动应用
- 测试所有功能是否正常
- 尝试打包生成.exe文件

### 2. 定制开发
- 修改UI主题颜色
- 添加自己的功能模块
- 集成后端API

### 3. 项目扩展
- 添加数据库支持（SQLite）
- 实现多窗口管理
- 添加插件系统

---

## 💡 提示

coding specialist创建的是一个**生产就绪的模板项目**，你可以：

1. **直接使用** - 作为现有项目的基础
2. **学习参考** - 查看现代桌面应用的架构
3. **扩展开发** - 添加业务逻辑和功能

项目完成后，我会通知你并指导下一步操作！