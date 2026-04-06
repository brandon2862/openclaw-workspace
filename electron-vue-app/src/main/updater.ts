import { autoUpdater, UpdateInfo } from 'electron-updater'
import { dialog, BrowserWindow } from 'electron'

/**
 * 初始化自动更新
 */
export function initializeAutoUpdater(mainWindow: BrowserWindow | null): void {
  // 设置自动更新的日志输出
  autoUpdater.logger = require('electron-log')
  autoUpdater.logger.transports.file.level = 'info'

  // 检查更新可用
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info)
    }
    
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: `发现新版本 ${info.version}，是否现在下载更新？`,
      buttons: ['是', '否'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })

  // 更新下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressObj)
    }
  })

  // 更新下载完成
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info)
    }
    
    dialog.showMessageBox({
      type: 'info',
      title: '更新下载完成',
      message: `版本 ${info.version} 已下载完成，是否立即安装并重启应用？`,
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        setImmediate(() => autoUpdater.quitAndInstall())
      }
    })
  })

  // 检查更新错误
  autoUpdater.on('error', (error: Error) => {
    console.error('更新检查失败:', error)
    if (mainWindow) {
      mainWindow.webContents.send('update-error', error.message)
    }
  })

  // 没有可用更新
  autoUpdater.on('update-not-available', () => {
    if (mainWindow) {
      mainWindow.webContents.send('update-not-available')
    }
  })

  console.log('Auto updater initialized')
}

/**
 * 手动检查更新
 * @param mainWindow 主窗口引用
 */
export function checkForUpdates(mainWindow: BrowserWindow | null): void {
  if (process.env.NODE_ENV === 'development') {
    dialog.showMessageBox({
      type: 'info',
      title: '开发模式',
      message: '在开发模式下无法检查更新。',
      buttons: ['确定']
    })
    return
  }

  dialog.showMessageBox({
    type: 'info',
    title: '检查更新',
    message: '正在检查更新...',
    buttons: ['确定']
  })

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('检查更新失败:', error)
    dialog.showErrorBox('检查更新失败', error.message)
  })
}