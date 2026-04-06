import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 创建系统托盘
 * @param mainWindow 主窗口引用
 * @returns 托盘实例
 */
export function createTray(mainWindow: BrowserWindow | null): Tray {
  // 创建托盘图标
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath)
  
  // 如果图标文件不存在，使用默认图标
  const trayImage = trayIcon.isEmpty() 
    ? nativeImage.createFromPath(path.join(__dirname, '../../resources/icon.png'))
    : trayIcon

  // 创建托盘
  const tray = new Tray(trayImage.resize({ width: 16, height: 16 }))

  // 托盘上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示应用',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '隐藏应用',
      click: () => {
        mainWindow?.hide()
      }
    },
    { type: 'separator' },
    {
      label: '新建任务',
      click: () => {
        mainWindow?.webContents.send('tray-action', 'new-task')
      }
    },
    {
      label: '显示通知',
      click: () => {
        mainWindow?.webContents.send('tray-action', 'show-notification')
      }
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => {
        mainWindow?.webContents.send('tray-action', 'open-settings')
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  // 设置托盘工具提示
  tray.setToolTip('Electron Vue App')

  // 设置托盘上下文菜单
  tray.setContextMenu(contextMenu)

  // 托盘点击事件
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  // 托盘双击事件
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })

  return tray
}