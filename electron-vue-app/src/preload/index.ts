import { contextBridge, ipcRenderer } from 'electron'

/**
 * 安全地暴露Electron API给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件系统API
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:write-file', filePath, content),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    openDialog: (options: any) => ipcRenderer.invoke('fs:open-dialog', options),
    saveDialog: (options: any) => ipcRenderer.invoke('fs:save-dialog', options)
  },

  // 系统信息API
  system: {
    getInfo: () => ipcRenderer.invoke('system:info'),
    getEnv: () => ipcRenderer.invoke('system:env')
  },

  // 窗口控制API
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    hide: () => ipcRenderer.send('window:hide'),
    show: () => ipcRenderer.send('window:show'),
    getState: () => ipcRenderer.invoke('window:state')
  },

  // 应用控制API
  app: {
    restart: () => ipcRenderer.send('app:restart'),
    quit: () => ipcRenderer.send('app:quit'),
    openExternal: (url: string) => ipcRenderer.send('app:open-external', url),
    showItemInFolder: (filePath: string) => ipcRenderer.send('app:show-item-in-folder', filePath),
    openDevTools: () => ipcRenderer.send('app:open-dev-tools'),
    closeDevTools: () => ipcRenderer.send('app:close-dev-tools')
  },

  // 通知API
  notification: {
    show: (options: any) => ipcRenderer.invoke('notification:show', options)
  },

  // 菜单和托盘事件监听
  onMenuAction: (callback: (action: string, ...args: any[]) => void) => {
    ipcRenderer.on('menu-action', (_, action, ...args) => callback(action, ...args))
    return () => ipcRenderer.removeAllListeners('menu-action')
  },

  onTrayAction: (callback: (action: string, ...args: any[]) => void) => {
    ipcRenderer.on('tray-action', (_, action, ...args) => callback(action, ...args))
    return () => ipcRenderer.removeAllListeners('tray-action')
  },

  // 更新事件监听
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info))
    return () => ipcRenderer.removeAllListeners('update-available')
  },

  onDownloadProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('download-progress', (_, progress) => callback(progress))
    return () => ipcRenderer.removeAllListeners('download-progress')
  },

  onUpdateDownloaded: (callback: (info: any) => void) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info))
    return () => ipcRenderer.removeAllListeners('update-downloaded')
  },

  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error))
    return () => ipcRenderer.removeAllListeners('update-error')
  },

  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on('update-not-available', () => callback())
    return () => ipcRenderer.removeAllListeners('update-not-available')
  },

  // 移除所有监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      fs: {
        readFile: (filePath: string) => Promise<any>
        writeFile: (filePath: string, content: string) => Promise<any>
        exists: (filePath: string) => Promise<any>
        openDialog: (options: any) => Promise<any>
        saveDialog: (options: any) => Promise<any>
      }
      system: {
        getInfo: () => Promise<any>
        getEnv: () => Promise<any>
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        hide: () => void
        show: () => void
        getState: () => Promise<any>
      }
      app: {
        restart: () => void
        quit: () => void
        openExternal: (url: string) => void
        showItemInFolder: (filePath: string) => void
        openDevTools: () => void
        closeDevTools: () => void
      }
      notification: {
        show: (options: any) => Promise<any>
      }
      onMenuAction: (callback: (action: string, ...args: any[]) => void) => () => void
      onTrayAction: (callback: (action: string, ...args: any[]) => void) => () => void
      onUpdateAvailable: (callback: (info: any) => void) => () => void
      onDownloadProgress: (callback: (progress: any) => void) => () => void
      onUpdateDownloaded: (callback: (info: any) => void) => () => void
      onUpdateError: (callback: (error: string) => void) => () => void
      onUpdateNotAvailable: (callback: () => void) => () => void
      removeAllListeners: (channel: string) => void
    }
  }
}