# 常见问题解答 (FAQ)

## 安装和运行

### Q1: 如何安装和运行这个项目？
**A:** 
1. 确保已安装 Node.js 18+ 和 npm
2. 克隆项目：`git clone https://github.com/your-username/electron-vue-app.git`
3. 进入项目目录：`cd electron-vue-app`
4. 安装依赖：`npm install`
5. 启动开发服务器：`npm run dev`

### Q2: 运行 `npm install` 时出现错误怎么办？
**A:** 尝试以下解决方案：
1. 清理 npm 缓存：`npm cache clean --force`
2. 删除 node_modules：`rm -rf node_modules`
3. 重新安装：`npm install`
4. 如果使用代理，请配置 npm 代理：
   ```bash
   npm config set proxy http://proxy.example.com:8080
   npm config set https-proxy http://proxy.example.com:8080
   ```

### Q3: 开发服务器无法启动，端口被占用怎么办？
**A:** 
1. 查找占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```
2. 终止占用进程，或修改 Vite 配置中的端口号

## 构建和打包

### Q4: 如何打包为 Windows 安装包？
**A:** 
```bash
# 构建应用
npm run build

# 打包为 Windows 安装包
npm run dist:win
```

生成的安装包在 `dist/` 目录中。

### Q5: 打包时出现 "icon.ico not found" 错误怎么办？
**A:** 
1. 确保在 `resources/` 目录中有图标文件：
   - `icon.png` (512x512)
   - `icon.ico` (Windows 图标)
   - `tray-icon.png` (系统托盘图标)
2. 可以使用在线工具生成图标：
   - [ICO 转换工具](https://icoconvert.com/)
   - [Favicon 生成器](https://www.favicon-generator.org/)

### Q6: 如何为安装包添加数字签名？
**A:** 
1. 获取代码签名证书
2. 在 `build/builder-config.js` 中配置：
   ```javascript
   win: {
     certificateFile: 'path/to/certificate.pfx',
     certificatePassword: 'your-password'
   }
   ```
3. 重新打包应用

## 功能使用

### Q7: 如何切换亮色/暗色主题？
**A:** 
1. 点击右上角的主题切换按钮
2. 或在设置页面 → 通用 → 主题模式中设置
3. 主题设置会自动保存

### Q8: 待办事项数据保存在哪里？
**A:** 
1. 默认保存在应用数据目录：`%APPDATA%/Electron Vue App/todos.json`
2. 可以在设置页面 → 数据 → 数据保存路径中修改保存位置
3. 支持导入/导出功能备份数据

### Q9: 如何发送系统通知？
**A:** 
1. 确保在设置中启用了通知功能
2. 在仪表盘点击"测试通知"按钮
3. 或通过系统托盘菜单发送通知
4. 任务完成时也会自动发送通知（如果启用）

### Q10: 如何检查应用更新？
**A:** 
1. 自动更新：应用会自动检查更新（默认启用）
2. 手动检查：在设置页面 → 更新 → 点击"立即检查更新"
3. 在关于页面也可以检查更新

## 开发和调试

### Q11: 如何添加新的页面？
**A:** 
1. 在 `src/renderer/views/` 创建新的 Vue 组件
2. 在 `src/renderer/router/index.ts` 中添加路由
3. 在侧边栏菜单中添加导航项（如果需要）

### Q12: 如何添加新的系统 API？
**A:** 
1. 在 `src/main/ipcHandlers.ts` 中注册 IPC 处理器
2. 在 `src/preload/index.ts` 中暴露 API 给渲染进程
3. 在 `src/shared/types.ts` 中添加类型定义
4. 在渲染进程中使用 `window.electronAPI` 调用

### Q13: 如何调试主进程？
**A:** 
```bash
# 启动带调试的开发服务器
npm run dev -- --inspect

# 在 Chrome 中打开 chrome://inspect
# 点击 "Open dedicated DevTools for Node"
```

### Q14: 如何调试渲染进程？
**A:** 
1. 开发模式下按 F12 打开开发者工具
2. 使用 Vue DevTools 扩展调试 Vue 组件
3. 在控制台中查看日志和错误信息

## 错误和故障排除

### Q15: 应用启动后白屏怎么办？
**A:** 
1. 按 F12 打开开发者工具，查看控制台错误
2. 检查主进程日志：在终端中运行 `npm run dev`
3. 常见原因：
   - 路由配置错误
   - 组件导入错误
   - API 调用失败

### Q16: 系统托盘图标不显示怎么办？
**A:** 
1. 检查 `resources/tray-icon.png` 文件是否存在
2. 确保图标尺寸合适（16x16 或 32x32）
3. 检查系统托盘区域是否被其他应用占用
4. 重启应用或重启系统

### Q17: 文件系统访问失败怎么办？
**A:** 
1. 检查文件路径是否正确
2. 确保应用有文件访问权限
3. 检查防病毒软件是否阻止了文件访问
4. 在开发者工具控制台中查看详细错误

### Q18: 自动更新失败怎么办？
**A:** 
1. 检查网络连接
2. 检查 GitHub Token 配置（如果需要）
3. 检查版本号格式是否正确
4. 查看主进程日志中的更新错误信息

## 性能优化

### Q19: 应用启动慢怎么办？
**A:** 
1. 启用代码分割和懒加载
2. 优化首屏加载资源
3. 使用更小的图标文件
4. 减少启动时的同步操作

### Q20: 内存使用过高怎么办？
**A:** 
1. 检查是否有内存泄漏
2. 及时清理事件监听器和定时器
3. 使用虚拟滚动处理大数据列表
4. 优化图片和资源加载

### Q21: CPU 使用率过高怎么办？
**A:** 
1. 检查是否有频繁的渲染更新
2. 使用防抖和节流优化频繁操作
3. 避免在渲染循环中进行复杂计算
4. 使用 Web Worker 处理后台任务

## 安全和隐私

### Q22: 应用是否安全？
**A:** 
1. 遵循 Electron 安全最佳实践
2. 启用上下文隔离和沙箱
3. 使用预加载脚本安全暴露 API
4. 所有用户输入都经过验证

### Q23: 应用会收集用户数据吗？
**A:** 
1. 应用只存储必要的本地数据
2. 不会自动收集或上传用户数据
3. 数据导出/导入功能需要用户明确操作
4. 更新检查只获取版本信息，不发送用户数据

### Q24: 如何保护敏感数据？
**A:** 
1. 不要将敏感信息硬编码在代码中
2. 使用环境变量存储配置信息
3. 对敏感数据进行加密存储
4. 定期更新依赖包以修复安全漏洞

## 跨平台支持

### Q25: 是否支持 macOS 和 Linux？
**A:** 
1. 代码层面支持跨平台
2. 需要为不同平台配置打包
3. 部分 Windows 特定功能在其他平台可能不可用
4. 可以修改配置支持多平台打包

### Q26: 如何打包为 macOS 应用？
**A:** 
```bash
# 在 macOS 系统上运行
npm run build
npm run dist -- --mac
```

需要配置代码签名才能分发。

### Q27: 如何打包为 Linux 应用？
**A:** 
```bash
npm run build
npm run dist -- --linux
```

支持 AppImage、deb、rpm 等格式。

## 其他问题

### Q28: 如何贡献代码？
**A:** 
1. Fork 本项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
5. 参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多细节

### Q29: 如何报告问题？
**A:** 
1. 在 GitHub Issues 中搜索是否已有类似问题
2. 创建新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息
   - 错误日志

### Q30: 如何获取帮助？
**A:** 
1. 查看文档：README.md、DEVELOPMENT.md
2. 搜索 GitHub Issues 和 Discussions
3. 在 Stack Overflow 提问（使用 electron-vue-app 标签）
4. 联系开发者（如果提供了联系方式）

---

**提示：** 如果问题仍未解决，请提供以下信息以便更好地帮助您：
1. 操作系统和版本
2. Node.js 和 npm 版本
3. 错误日志和截图
4. 复现步骤

**最后更新：** 2024-01-01