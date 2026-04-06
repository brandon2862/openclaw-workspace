/**
 * Electron Builder 配置
 * 
 * 参考文档：
 * - https://www.electron.build/
 * - https://www.electron.build/configuration/configuration
 */

const icons = require('./icons')

module.exports = {
  ...icons.common,
  
  // Windows 特定配置
  win: {
    ...icons.win,
    
    // 安装程序配置
    publisherName: 'Brandon Wong',
    
    // 数字签名配置（可选）
    // certificateFile: 'path/to/certificate.pfx',
    // certificatePassword: 'password',
    
    // 请求执行级别
    requestedExecutionLevel: 'asInvoker',
    
    // NSIS 安装程序配置
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      shortcutName: 'Electron Vue App',
      installerIcon: icons.win.icon,
      uninstallerIcon: icons.win.icon,
      installerHeaderIcon: icons.win.icon,
      include: 'build/installer.nsh',
      license: 'resources/license.txt',
      deleteAppDataOnUninstall: false
    },
    
    // 便携式应用配置
    portable: {
      artifactName: '${productName}-${version}-portable-${arch}.exe',
      requestExecutionLevel: 'asInvoker'
    }
  },
  
  // macOS 特定配置
  mac: {
    ...icons.mac,
    
    // 应用类别
    category: 'public.app-category.productivity',
    
    // 目标格式
    target: ['dmg', 'zip'],
    
    // 代码签名配置（可选）
    // identity: 'Developer ID Application: Your Name (XXXXXXXXXX)',
    // hardenedRuntime: true,
    // gatekeeperAssess: false,
    // entitlements: 'build/entitlements.mac.plist',
    // entitlementsInherit: 'build/entitlements.mac.plist'
  },
  
  // Linux 特定配置
  linux: {
    ...icons.linux,
    
    // 应用类别
    category: 'Utility',
    
    // 包维护者
    maintainer: 'Brandon Wong <brandon@example.com>',
    
    // 目标格式
    target: icons.linux.target,
    
    // 桌面文件配置
    desktop: {
      Name: 'Electron Vue App',
      Comment: 'A modern Windows desktop application example',
      Categories: 'Utility;',
      StartupNotify: 'false',
      Terminal: 'false',
      Type: 'Application'
    }
  },
  
  // 发布配置（用于自动更新）
  publish: [
    {
      provider: 'github',
      owner: 'your-username',
      repo: 'electron-vue-app',
      releaseType: 'release',
      publishAutoUpdate: true
    }
  ],
  
  // 自动更新配置
  electronUpdaterCompatibility: '>=2.16',
  
  // 构建钩子
  afterPack: './build/after-pack.js',
  afterSign: './build/after-sign.js',
  
  // 构建前钩子
  beforeBuild: async (context) => {
    console.log('开始构建应用...')
    console.log(`平台: ${context.platform.name}`)
    console.log(`架构: ${context.arch}`)
    console.log(`版本: ${context.appInfo.version}`)
  },
  
  // 构建后钩子
  afterAllArtifactBuild: async (context) => {
    console.log('构建完成!')
    console.log('生成的文件:')
    context.artifactPaths.forEach((path, index) => {
      console.log(`  ${index + 1}. ${path}`)
    })
  },
  
  // 环境变量
  env: {
    NODE_ENV: 'production',
    ELECTRON_IS_DEV: '0'
  },
  
  // 额外元数据
  extraMetadata: {
    main: 'out/main/index.js',
    author: {
      name: 'Brandon Wong',
      email: 'brandon@example.com',
      url: 'https://github.com/your-username'
    },
    repository: {
      type: 'git',
      url: 'https://github.com/your-username/electron-vue-app.git'
    },
    bugs: {
      url: 'https://github.com/your-username/electron-vue-app/issues'
    },
    homepage: 'https://github.com/your-username/electron-vue-app#readme',
    keywords: [
      'electron',
      'vue',
      'typescript',
      'desktop',
      'windows',
      'app'
    ]
  }
}