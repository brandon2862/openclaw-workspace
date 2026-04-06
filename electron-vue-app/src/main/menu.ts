import { Menu, BrowserWindow, dialog } from 'electron'
import { checkForUpdates } from './updater'

/**
 * 创建应用菜单
 * @param mainWindow 主窗口引用
 */
export function createMenu(mainWindow: BrowserWindow | null): void {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'new')
          }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [{ name: '所有文件', extensions: ['*'] }]
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow?.webContents.send('menu-action', 'open', result.filePaths[0])
            }
          }
        },
        { type: 'separator' },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'save')
          }
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow!, {
              filters: [{ name: '所有文件', extensions: ['*'] }]
            })
            if (!result.canceled && result.filePath) {
              mainWindow?.webContents.send('menu-action', 'save-as', result.filePath)
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit'
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'CmdOrCtrl+Shift+Z',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload()
          }
        },
        {
          label: '强制重新加载',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache()
          }
        },
        { type: 'separator' },
        {
          label: '切换开发者工具',
          accelerator: isDev() ? 'CmdOrCtrl+Shift+I' : 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools()
          }
        },
        { type: 'separator' },
        {
          label: '重置缩放',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow?.webContents.setZoomLevel(0)
          }
        },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            const currentZoom = mainWindow?.webContents.getZoomLevel() || 0
            mainWindow?.webContents.setZoomLevel(currentZoom + 1)
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow?.webContents.getZoomLevel() || 0
            mainWindow?.webContents.setZoomLevel(currentZoom - 1)
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '最大化',
          accelerator: 'F11',
          click: () => {
            if (mainWindow?.isMaximized()) {
              mainWindow.unmaximize()
            } else {
              mainWindow?.maximize()
            }
          }
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '检查更新',
          click: () => {
            checkForUpdates(mainWindow)
          }
        },
        {
          label: '关于',
          click: () => {
            mainWindow?.webContents.send('menu-action', 'about')
          }
        },
        {
          label: '查看文档',
          click: () => {
            require('electron').shell.openExternal('https://electronjs.org/docs')
          }
        },
        {
          label: '报告问题',
          click: () => {
            require('electron').shell.openExternal('https://github.com/your-username/electron-vue-app/issues')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)
}

/**
 * 检查是否为开发环境
 */
function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}