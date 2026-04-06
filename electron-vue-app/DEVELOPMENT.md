# 开发文档

## 开发环境设置

### 1. 环境要求
- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- Git

### 2. 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/electron-vue-app.git
cd electron-vue-app

# 安装依赖
npm install

# 安装全局工具（可选）
npm install -g typescript eslint prettier
```

### 3. 开发脚本
```bash
# 启动开发服务器
npm run dev

# 构建应用
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npx vue-tsc --noEmit
```

## 项目架构

### 主进程 (Main Process)
主进程运行在 Node.js 环境中，负责：
- 创建和管理应用窗口
- 系统集成（菜单、托盘、通知等）
- 文件系统访问
- 自动更新

**主要文件：**
- `src/main/index.ts` - 主进程入口
- `src/main/menu.ts` - 应用菜单
- `src/main/tray.ts` - 系统托盘
- `src/main/ipcHandlers.ts` - IPC处理器
- `src/main/updater.ts` - 自动更新

### 渲染进程 (Renderer Process)
渲染进程运行在 Chromium 浏览器环境中，使用 Vue.js 3：
- 用户界面渲染
- 用户交互处理
- 前端状态管理

**主要文件：**
- `src/renderer/main.ts` - Vue应用入口
- `src/renderer/App.vue` - 根组件
- `src/renderer/views/` - 页面组件
- `src/renderer/stores/` - Pinia状态管理
- `src/renderer/router/` - 路由配置

### 预加载脚本 (Preload Script)
预加载脚本在渲染进程加载之前运行，用于安全地暴露 Node.js API：
- `src/preload/index.ts` - 预加载脚本

### 进程间通信 (IPC)
```typescript
// 主进程注册处理器
ipcMain.handle('fs:read-file', async (_, filePath) => {
  // 处理文件读取
})

// 渲染进程调用
const result = await window.electronAPI.fs.readFile(filePath)

// 预加载脚本暴露API
contextBridge.exposeInMainWorld('electronAPI', {
  fs: {
    readFile: (filePath) => ipcRenderer.invoke('fs:read-file', filePath)
  }
})
```

## 代码规范

### TypeScript 配置
- 使用严格模式 (`strict: true`)
- 目标版本: ES2020
- 模块系统: CommonJS (主进程) / ES Module (渲染进程)

### Vue 3 规范
- 使用 Composition API + `<script setup>`
- 组件使用 PascalCase 命名
- 单文件组件结构：template → script → style
- 使用 TypeScript 定义 props 和 emits

### 组件设计原则
1. **单一职责** - 每个组件只做一件事
2. **可复用性** - 设计通用的基础组件
3. **可测试性** - 组件逻辑与UI分离
4. **类型安全** - 使用 TypeScript 定义接口

### 状态管理
- 使用 Pinia 进行状态管理
- Store 按功能模块划分
- 避免在组件中直接修改 store 状态
- 使用 actions 处理业务逻辑

## 开发工作流

### 1. 功能开发
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 启动开发服务器
npm run dev

# 3. 编写代码
# - 添加新组件
# - 更新状态管理
# - 添加IPC处理器

# 4. 运行测试
npm run test

# 5. 代码检查
npm run lint
npm run type-check
```

### 2. 代码审查
```bash
# 1. 提交代码
git add .
git commit -m "feat: add your feature"

# 2. 推送到远程
git push origin feature/your-feature

# 3. 创建 Pull Request
# - 描述功能变更
# - 添加测试说明
# - 更新文档
```

### 3. 构建测试
```bash
# 1. 构建应用
npm run build

# 2. 测试打包
npm run pack

# 3. 完整打包
npm run dist

# 4. 测试安装包
# - 安装应用
# - 测试所有功能
# - 验证自动更新
```

## 调试技巧

### 主进程调试
```bash
# 启用主进程调试
npm run dev -- --inspect

# 在 Chrome 中打开 chrome://inspect
# 点击 "Open dedicated DevTools for Node"
```

### 渲染进程调试
```bash
# 开发模式下自动打开开发者工具
# 或按 F12 手动打开
```

### IPC 调试
```typescript
// 在主进程中添加日志
console.log('IPC received:', channel, args)

// 在渲染进程中添加日志
console.log('IPC sending:', channel, args)
```

### 性能分析
```bash
# 启用性能监控
npm run dev -- --trace-warnings

# 使用 Chrome DevTools Performance 面板
# 分析渲染性能
```

## 测试策略

### 单元测试
```bash
# 运行单元测试
npm run test:unit

# 测试覆盖率
npm run test:coverage
```

### 集成测试
```bash
# 运行集成测试
npm run test:integration

# 端到端测试
npm run test:e2e
```

### 手动测试清单
- [ ] 应用启动和关闭
- [ ] 窗口最小化/最大化/关闭
- [ ] 系统托盘功能
- [ ] 菜单功能
- [ ] 主题切换
- [ ] 待办事项增删改查
- [ ] 系统信息显示
- [ ] 设置保存和加载
- [ ] 文件系统访问
- [ ] 系统通知
- [ ] 自动更新

## 性能优化

### 构建优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 运行时优化
1. **懒加载路由**
```typescript
const routes = [
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue')
  }
]
```

2. **虚拟滚动** - 大数据列表使用虚拟滚动
3. **防抖节流** - 频繁操作使用防抖节流
4. **内存管理** - 及时清理事件监听器和定时器

### 资源优化
1. **图片压缩** - 使用 WebP 格式
2. **字体优化** - 使用系统字体或子集字体
3. **缓存策略** - 合理使用浏览器缓存

## 安全最佳实践

### 主进程安全
```typescript
// 启用上下文隔离
webPreferences: {
  contextIsolation: true,
  sandbox: true,
  nodeIntegration: false
}

// 使用预加载脚本暴露有限API
contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露必要的API
})
```

### 渲染进程安全
1. **输入验证** - 所有用户输入都需要验证
2. **XSS防护** - 避免使用 `v-html`
3. **CSP策略** - 启用内容安全策略

### 更新安全
1. **代码签名** - 为安装包签名
2. **HTTPS** - 使用 HTTPS 下载更新
3. **完整性校验** - 验证下载文件的完整性

## 发布流程

### 1. 版本管理
```bash
# 更新版本号
npm version patch  # 修复版本 1.0.0 → 1.0.1
npm version minor  # 小版本 1.0.0 → 1.1.0
npm version major  # 大版本 1.0.0 → 2.0.0
```

### 2. 构建发布
```bash
# 清理构建缓存
npm run clean

# 构建应用
npm run build

# 生成安装包
npm run dist

# 验证安装包
# - 安装测试
# - 功能测试
# - 更新测试
```

### 3. 发布到 GitHub
```bash
# 创建发布标签
git tag v1.0.0
git push origin v1.0.0

# 在 GitHub 创建 Release
# 上传安装包文件
```

### 4. 更新文档
- 更新 CHANGELOG.md
- 更新 README.md
- 更新 API 文档

## 故障排除

### 常见问题

**问题：应用启动失败**
```bash
# 检查错误日志
npm run dev

# 检查依赖
npm list --depth=0

# 重新安装依赖
rm -rf node_modules
npm install
```

**问题：打包失败**
```bash
# 检查构建配置
npm run build

# 清理缓存
npm run clean

# 检查资源文件
ls -la resources/
```

**问题：自动更新失败**
```bash
# 检查网络连接
# 检查 GitHub Token
# 检查版本号格式
```

**问题：性能问题**
```bash
# 使用性能分析工具
npm run dev -- --trace-warnings

# 检查内存使用
# 检查 CPU 使用率
```

### 调试工具
1. **Electron Fiddle** - 快速原型工具
2. **Spectron** - 自动化测试框架
3. **Devtron** - Electron 开发者工具
4. **Electron Debug** - 调试工具

## 学习资源

### 官方文档
- [Electron 文档](https://www.electronjs.org/docs)
- [Vue.js 3 文档](https://vuejs.org/guide/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)

### 教程和示例
- [Electron + Vue 3 教程](https://nklayman.github.io/vue-cli-plugin-electron-builder/)
- [Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security)
- [Vue 3 组合式 API](https://vuejs.org/guide/extras/composition-api-faq.html)

### 社区资源
- [Electron GitHub](https://github.com/electron/electron)
- [Vue.js GitHub](https://github.com/vuejs/vue)
- [Element Plus GitHub](https://github.com/element-plus/element-plus)

---

**提示：** 定期更新依赖包以获取安全更新和新功能：
```bash
npm outdated
npm update
```