# 打包和发布指南

## 概述

本文档详细介绍了如何将 Electron Vue App 打包为可分发安装包，并发布到不同平台。

## 打包前准备

### 1. 环境检查
```bash
# 检查 Node.js 版本
node --version  # 需要 18.0.0+

# 检查 npm 版本
npm --version   # 需要 8.0.0+

# 检查 Git
git --version
```

### 2. 图标准备
在 `resources/` 目录中准备以下图标文件：

| 文件 | 尺寸 | 格式 | 用途 |
|------|------|------|------|
| `icon.png` | 512x512 | PNG | 应用图标 |
| `icon.ico` | 多种尺寸 | ICO | Windows 图标 |
| `icon.icns` | 多种尺寸 | ICNS | macOS 图标 |
| `tray-icon.png` | 16x16 或 32x32 | PNG | 系统托盘图标 |

**图标生成工具：**
- [ICO 转换工具](https://icoconvert.com/)
- [PNG 转 ICO](https://convertio.co/zh/png-ico/)
- [macOS 图标生成器](https://cloudconvert.com/png-to-icns)

### 3. 版本管理
```bash
# 更新 package.json 中的版本号
npm version patch  # 1.0.0 → 1.0.1 (修复版本)
npm version minor  # 1.0.0 → 1.1.0 (小版本)
npm version major  # 1.0.0 → 2.0.0 (大版本)

# 或手动编辑 package.json
{
  "version": "1.0.0"
}
```

## 构建配置

### 1. 基础构建
```bash
# 清理之前的构建
npm run clean

# 构建主进程和渲染进程
npm run build

# 验证构建结果
ls -la out/      # 主进程输出
ls -la dist/     # 渲染进程输出
```

### 2. 配置检查
检查 `build/builder-config.js` 中的配置：

```javascript
module.exports = {
  // 应用基本信息
  productName: 'Electron Vue App',
  appId: 'com.example.electronvueapp',
  
  // 平台配置
  win: {
    target: ['nsis', 'portable'],
    icon: 'resources/icon.ico'
  },
  
  // 发布配置（如果需要自动更新）
  publish: [{
    provider: 'github',
    owner: 'your-username',
    repo: 'electron-vue-app'
  }]
}
```

## Windows 打包

### 1. NSIS 安装程序
```bash
# 生成 NSIS 安装程序
npm run dist:win

# 或指定架构
npm run dist:win -- --x64    # 64位
npm run dist:win -- --ia32   # 32位
```

**输出文件：**
- `dist/Electron Vue App Setup 1.0.0.exe` - 安装程序
- `dist/latest.yml` - 自动更新配置

### 2. 便携版应用
```bash
# 生成便携版
npm run pack

# 输出文件
# dist/win-unpacked/ - 解压版应用
# dist/Electron Vue App-1.0.0-portable.exe - 便携版
```

### 3. Windows 代码签名（可选）
```bash
# 配置代码签名
# 在 build/builder-config.js 中添加：
win: {
  certificateFile: 'path/to/certificate.pfx',
  certificatePassword: 'your-password',
  signingHashAlgorithms: ['sha256'],
  rfc3161TimeStampServer: 'http://timestamp.digicert.com'
}
```

## macOS 打包

### 1. 环境要求
- macOS 系统
- Xcode 命令行工具
- 代码签名证书（用于分发）

### 2. 打包命令
```bash
# 构建 macOS 应用
npm run dist -- --mac

# 指定格式
npm run dist -- --mac dmg    # DMG 安装包
npm run dist -- --mac zip    # ZIP 压缩包
```

### 3. 代码签名（必需）
```javascript
// 在 build/builder-config.js 中配置
mac: {
  category: 'public.app-category.productivity',
  target: ['dmg', 'zip'],
  identity: 'Developer ID Application: Your Name (XXXXXXXXXX)',
  hardenedRuntime: true,
  gatekeeperAssess: false,
  entitlements: 'build/entitlements.mac.plist',
  entitlementsInherit: 'build/entitlements.mac.plist'
}
```

## Linux 打包

### 1. 支持的格式
- AppImage - 通用 Linux 应用格式
- deb - Debian/Ubuntu 系统
- rpm - Red Hat/Fedora 系统
- snap - 通用 Linux 包格式

### 2. 打包命令
```bash
# 构建 Linux 应用
npm run dist -- --linux

# 指定格式
npm run dist -- --linux AppImage
npm run dist -- --linux deb
npm run dist -- --linux rpm
npm run dist -- --linux snap
```

### 3. 配置示例
```javascript
linux: {
  category: 'Utility',
  target: ['AppImage', 'deb', 'rpm'],
  maintainer: 'Your Name <email@example.com>',
  desktop: {
    Name: 'Electron Vue App',
    Comment: 'A modern desktop application example',
    Categories: 'Utility;'
  }
}
```

## 多平台打包

### 1. 一次性打包所有平台
```bash
# 在当前系统支持的所有平台上打包
npm run dist

# 或指定平台
npm run dist -- --win --mac --linux
```

### 2. 跨平台构建
```bash
# 使用 Docker 进行跨平台构建
docker run --rm -ti \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR') \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v ${PWD}:/project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "cd /project && npm run dist -- --linux --win"
```

## 自动更新配置

### 1. GitHub Releases
```javascript
// package.json 中的 build 配置
"build": {
  "publish": [{
    "provider": "github",
    "owner": "your-username",
    "repo": "electron-vue-app",
    "releaseType": "release"
  }]
}
```

### 2. 环境变量
```bash
# 设置 GitHub Token
export GH_TOKEN=your_github_token

# 或使用 .env 文件
GH_TOKEN=your_github_token
```

### 3. 发布到 GitHub
```bash
# 构建并发布
npm run dist -- --publish always

# 或先构建后发布
npm run dist
npm run publish
```

## 发布流程

### 1. 测试版本
```bash
# 1. 构建测试版本
npm run dist -- --dir

# 2. 测试安装包
# - 安装测试
# - 功能测试
# - 更新测试
# - 卸载测试

# 3. 修复问题
# 根据测试结果修复问题
```

### 2. 生产版本
```bash
# 1. 更新版本号
npm version patch

# 2. 提交更改
git add .
git commit -m "release: v1.0.1"
git push

# 3. 创建标签
git tag v1.0.1
git push origin v1.0.1

# 4. 构建发布版本
npm run dist -- --publish always
```

### 3. 发布检查清单
- [ ] 版本号已更新
- [ ] 变更日志已更新
- [ ] 所有测试通过
- [ ] 安装包功能正常
- [ ] 自动更新工作正常
- [ ] 文档已更新
- [ ] GitHub Release 已创建

## 高级配置

### 1. 自定义安装程序
```javascript
// NSIS 自定义脚本
nsis: {
  include: 'build/installer.nsh',
  script: 'build/installer.nsi',
  perMachine: false,
  oneClick: false,
  allowToChangeInstallationDirectory: true,
  createDesktopShortcut: true,
  createStartMenuShortcut: true,
  shortcutName: 'Electron Vue App',
  menuCategory: 'Electron Vue App'
}
```

### 2. 多语言支持
```javascript
// 多语言安装程序
nsis: {
  installerLanguages: ['zh_CN', 'en_US'],
  language: '2052', // 中文简体
  multiLanguageInstaller: true
}
```

### 3. 资源优化
```javascript
// 排除不必要的文件
files: [
  '**/*',
  '!**/node_modules/*/{CHANGELOG.md,README.md,readme.md,readme}',
  '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
  '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}'
],

// 额外资源
extraResources: [
  {
    from: 'resources/',
    to: 'resources/',
    filter: ['**/*']
  }
]
```

## 故障排除

### 1. 常见打包错误

**错误：图标文件找不到**
```
Error: Application icon is not set
```
**解决：** 确保 `resources/icon.ico` 文件存在

**错误：代码签名失败**
```
Error: Could not code sign
```
**解决：** 检查证书配置和密码

**错误：文件权限问题**
```
Error: EACCES: permission denied
```
**解决：** 使用管理员权限运行或检查文件权限

### 2. 构建优化

**问题：构建时间过长**
```bash
# 启用缓存
npm config set cache-min 9999999

# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 并行构建
npm run build -- --parallel
```

**问题：安装包体积过大**
```javascript
// 配置压缩
compression: 'maximum',
asar: true,

// 排除开发依赖
"files": [
  "!**/node_modules/${devDependencies}"
]
```

### 3. 调试构建过程
```bash
# 启用详细日志
npm run dist -- --debug

# 查看构建配置
npm run dist -- --print-config

# 只生成配置不构建
npm run dist -- --dir --config
```

## 发布渠道

### 1. GitHub Releases
- 适合开源项目
- 支持自动更新
- 免费使用

### 2. 自有服务器
- 完全控制
- 需要服务器配置
- 支持自定义更新逻辑

### 3. 应用商店
- **Microsoft Store**: 需要注册开发者账户
- **Mac App Store**: 需要 Apple 开发者账户
- **Snap Store**: 适合 Linux 应用

## 维护和更新

### 1. 定期更新依赖
```bash
# 检查过期的依赖
npm outdated

# 更新依赖
npm update

# 更新 Electron
npm install electron@latest

# 安全更新
npm audit fix
```

### 2. 监控自动更新
- 监控更新失败率
- 收集用户反馈
- 及时修复更新问题

### 3. 版本兼容性
- 保持向后兼容
- 提供迁移指南
- 支持旧版本更新

## 资源链接

### 官方文档
- [Electron Builder 配置](https://www.electron.build/configuration/configuration)
- [自动更新配置](https://www.electron.build/auto-update)
- [代码签名指南](https://www.electron.build/code-signing)

### 工具和资源
- [Electron Fiddle](https://www.electronjs.org/fiddle) - 快速原型工具
- [Electron Forge](https://www.electronforge.io/) - 完整的构建工具链
- [Electron React Boilerplate](https://electron-react-boilerplate.js.org/) - 参考项目

### 社区支持
- [Electron 官方 Discord](https://discord.gg/electron)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/electron)
- [GitHub Discussions](https://github.com/electron/electron/discussions)

---

**最后更新：** 2024-01-01  
**文档版本：** 1.0.0