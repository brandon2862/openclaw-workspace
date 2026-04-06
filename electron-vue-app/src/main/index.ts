import { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import { autoUpdater } from 'electron-updater'
import { fileURLToPath } from 'url'
import { createMenu } from './menu'
import { createTray } from './tray'
import { registerIpcHandlers } from './ipcHandlers'

// 处理 __dirname 在 ES 模块中的问题
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 保持对窗口对象的全局引用，避免被垃圾回收
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// 开发环境配置
const isDev = process.env.NODE_ENV === 'development'
const isMac = process.platform === 'darwin'

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  // 加载应用
  if (isDev) {
    // 开发环境：加载Vite开发服务器
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
    }
  })

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 处理外部链接（在新窗口中打开）
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

/**
 * 初始化应用
 */
async function initializeApp(): Promise<void> {
  try {
    // 等待应用准备就绪
    await app.whenReady()

    // 创建主窗口
    createWindow()

    // 创建应用菜单
    createMenu(mainWindow)

    // 创建系统托盘
    tray = createTray(mainWindow)

    // 注册IPC处理器
    registerIpcHandlers()

    // 检查更新（生产环境）
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify()
    }

    // macOS特殊处理
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })

    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    dialog.showErrorBox('启动错误', '应用启动失败，请检查日志获取更多信息。')
  }
}

/**
 * 清理资源
 */
function cleanup(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}

// 应用生命周期事件
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('before-quit', cleanup)

// 启动应用
initializeApp().catch((error) => {
  console.error('Unhandled error during initialization:', error)
  app.quit()
})

// 导出类型和工具函数
export { mainWindow }
export type { BrowserWindow }