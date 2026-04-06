import { ipcMain, dialog, Notification, shell, app } from 'electron'
import { readFile, writeFile, access, constants } from 'fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import { mainWindow } from './index'

/**
 * 注册所有IPC处理器
 */
export function registerIpcHandlers(): void {
  // 文件系统操作
  registerFileSystemHandlers()
  
  // 系统信息操作
  registerSystemInfoHandlers()
  
  // 窗口控制操作
  registerWindowHandlers()
  
  // 应用控制操作
  registerAppHandlers()
  
  // 通知操作
  registerNotificationHandlers()
  
  console.log('IPC handlers registered successfully')
}

/**
 * 注册文件系统相关IPC处理器
 */
function registerFileSystemHandlers(): void {
  // 读取文件
  ipcMain.handle('fs:read-file', async (_, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 写入文件
  ipcMain.handle('fs:write-file', async (_, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // 检查文件是否存在
  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    try {
      await access(filePath, constants.F_OK)
      return { success: true, exists: true }
    } catch {
      return { success: true, exists: false }
    }
  })

  // 选择文件对话框
  ipcMain.handle('fs:open-dialog', async (_, options: any) => {
    const result = await dialog.showOpenDialog(mainWindow!, options)
    return result
  })

  // 保存文件对话框
  ipcMain.handle('fs:save-dialog', async (_, options: any) => {
    const result = await dialog.showSaveDialog(mainWindow!, options)
    return result
  })
}

/**
 * 注册系统信息相关IPC处理器
 */
function registerSystemInfoHandlers(): void {
  // 获取系统信息
  ipcMain.handle('system:info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      appVersion: app.getVersion(),
      homeDir: homedir(),
      appPath: app.getAppPath(),
      userDataPath: app.getPath('userData'),
      tempPath: app.getPath('temp'),
      documentsPath: app.getPath('documents'),
      downloadsPath: app.getPath('downloads'),
      desktopPath: app.getPath('desktop'),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime()
    }
  })

  // 获取环境变量
  ipcMain.handle('system:env', () => {
    return {
      nodeEnv: process.env.NODE_ENV || 'production',
      path: process.env.PATH,
      home: process.env.HOME,
      userProfile: process.env.USERPROFILE,
      temp: process.env.TEMP
    }
  })
}

/**
 * 注册窗口控制相关IPC处理器
 */
function registerWindowHandlers(): void {
  // 最小化窗口
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  // 最大化/还原窗口
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  // 关闭窗口
  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })

  // 隐藏窗口
  ipcMain.on('window:hide', () => {
    mainWindow?.hide()
  })

  // 显示窗口
  ipcMain.on('window:show', () => {
    mainWindow?.show()
  })

  // 获取窗口状态
  ipcMain.handle('window:state', () => {
    return {
      isMaximized: mainWindow?.isMaximized() || false,
      isMinimized: mainWindow?.isMinimized() || false,
      isVisible: mainWindow?.isVisible() || false,
      isFocused: mainWindow?.isFocused() || false
    }
  })
}

/**
 * 注册应用控制相关IPC处理器
 */
function registerAppHandlers(): void {
  // 重启应用
  ipcMain.on('app:restart', () => {
    app.relaunch()
    app.exit(0)
  })

  // 退出应用
  ipcMain.on('app:quit', () => {
    app.quit()
  })

  // 打开外部链接
  ipcMain.on('app:open-external', (_, url: string) => {
    shell.openExternal(url)
  })

  // 打开文件所在位置
  ipcMain.on('app:show-item-in-folder', (_, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  // 打开开发者工具
  ipcMain.on('app:open-dev-tools', () => {
    mainWindow?.webContents.openDevTools()
  })

  // 关闭开发者工具
  ipcMain.on('app:close-dev-tools', () => {
    mainWindow?.webContents.closeDevTools()
  })
}

/**
 * 注册通知相关IPC处理器
 */
function registerNotificationHandlers(): void {
  // 显示通知
  ipcMain.handle('notification:show', (_, options: any) => {
    const notification = new Notification({
      title: options.title || '通知',
      body: options.body || '',
      icon: options.icon,
      silent: options.silent || false
    })

    notification.show()

    // 通知点击事件
    notification.on('click', () => {
      if (options.onClick) {
        mainWindow?.webContents.send('notification:clicked', options)
      }
    })

    return { success: true }
  })
}