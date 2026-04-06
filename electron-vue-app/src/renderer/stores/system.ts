import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface SystemInfo {
  platform: string
  arch: string
  version: string
  electronVersion: string
  chromeVersion: string
  nodeVersion: string
  appVersion: string
  homeDir: string
  appPath: string
  userDataPath: string
  tempPath: string
  documentsPath: string
  downloadsPath: string
  desktopPath: string
  memoryUsage: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
  cpuUsage: {
    user: number
    system: number
    percent: number
  }
  uptime: number
}

export interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  autoStart: boolean
  autoUpdate: boolean
  notifications: boolean
  savePath: string
}

export const useSystemStore = defineStore('system', () => {
  // 系统信息
  const systemInfo = reactive<Partial<SystemInfo>>({})
  
  // 应用设置
  const settings = reactive<AppSettings>({
    theme: 'light',
    language: 'zh-CN',
    autoStart: false,
    autoUpdate: true,
    notifications: true,
    savePath: ''
  })
  
  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * 获取系统信息
   */
  const fetchSystemInfo = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await window.electronAPI.system.getInfo()
      
      if (result) {
        Object.assign(systemInfo, result)
        
        // 计算CPU使用率百分比
        if (result.cpuUsage) {
          const total = result.cpuUsage.user + result.cpuUsage.system
          const percent = Math.round((total / 1000) * 100) / 100 // 转换为百分比
          systemInfo.cpuUsage = { ...result.cpuUsage, percent }
        }
      }
    } catch (err) {
      error.value = `获取系统信息失败: ${err}`
      console.error('Failed to fetch system info:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 加载应用设置
   */
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        Object.assign(settings, JSON.parse(savedSettings))
      }
      
      // 如果设置了保存路径，检查是否存在
      if (settings.savePath) {
        const existsResult = await window.electronAPI.fs.exists(settings.savePath)
        if (!existsResult.exists) {
          settings.savePath = ''
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }
  
  /**
   * 保存应用设置
   */
  const saveSettings = async () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
      
      // 应用主题
      const html = document.documentElement
      if (settings.theme === 'dark') {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
      return true
    } catch (err) {
      console.error('Failed to save settings:', err)
      return false
    }
  }
  
  /**
   * 选择保存路径
   */
  const selectSavePath = async () => {
    try {
      const result = await window.electronAPI.fs.openDialog({
        properties: ['openDirectory']
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        settings.savePath = result.filePaths[0]
        await saveSettings()
        return result.filePaths[0]
      }
    } catch (err) {
      console.error('Failed to select save path:', err)
    }
    return null
  }
  
  /**
   * 发送系统通知
   */
  const sendNotification = async (title: string, body: string) => {
    if (!settings.notifications) return
    
    try {
      await window.electronAPI.notification.show({
        title,
        body,
        silent: false
      })
    } catch (err) {
      console.error('Failed to send notification:', err)
    }
  }
  
  /**
   * 重启应用
   */
  const restartApp = () => {
    window.electronAPI.app.restart()
  }
  
  /**
   * 退出应用
   */
  const quitApp = () => {
    window.electronAPI.app.quit()
  }
  
  /**
   * 打开外部链接
   */
  const openExternal = (url: string) => {
    window.electronAPI.app.openExternal(url)
  }
  
  // 初始化时加载设置
  loadSettings()
  
  return {
    // 状态
    systemInfo,
    settings,
    isLoading,
    error,
    
    // 方法
    fetchSystemInfo,
    loadSettings,
    saveSettings,
    selectSavePath,
    sendNotification,
    restartApp,
    quitApp,
    openExternal
  }
})