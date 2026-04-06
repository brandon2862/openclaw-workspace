/**
 * 应用图标配置
 * 
 * 图标文件应该放在 resources/ 目录下：
 * - icon.png (512x512) - 应用图标
 * - icon.ico (Windows图标)
 * - tray-icon.png (16x16或32x32) - 系统托盘图标
 * 
 * 可以使用在线工具生成图标：
 * - https://icoconvert.com/ (生成.ico文件)
 * - https://www.favicon-generator.org/ (生成各种尺寸图标)
 */

const path = require('path')

module.exports = {
  // Windows图标配置
  win: {
    icon: path.join(__dirname, '../resources/icon.ico'),
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64', 'ia32']
      }
    ]
  },
  
  // macOS图标配置
  mac: {
    icon: path.join(__dirname, '../resources/icon.icns')
  },
  
  // Linux图标配置
  linux: {
    icon: path.join(__dirname, '../resources/icon.png'),
    target: ['AppImage', 'deb', 'rpm']
  },
  
  // 通用图标配置
  common: {
    // 应用名称
    productName: 'Electron Vue App',
    
    // 应用ID（用于自动更新）
    appId: 'com.example.electronvueapp',
    
    // 版权信息
    copyright: 'Copyright © 2024 Brandon Wong',
    
    // 构建目录
    directories: {
      output: 'dist',
      buildResources: 'resources'
    },
    
    // 文件包含规则
    files: [
      'out/**/*',
      'dist/**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
      '!.editorconfig',
      '!**/._*',
      '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
      '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
      '!**/{appveyor.yml,.travis.yml,circle.yml}',
      '!**/{npm-debug.log,yarn.lock,.yarn-integrity}'
    ],
    
    // 额外资源
    extraResources: [
      {
        from: 'resources/',
        to: 'resources/',
        filter: ['**/*']
      }
    ],
    
    // 压缩选项
    compression: 'maximum',
    
    // 是否生成asar归档
    asar: true,
    
    // asar解压选项
    asarUnpack: [
      '**/*.node',
      '**/resources/**'
    ]
  }
}