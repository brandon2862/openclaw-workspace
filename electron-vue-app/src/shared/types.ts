/**
 * 共享类型定义
 */

// 应用配置
export interface AppConfig {
  name: string
  version: string
  author: string
  description: string
  repository: string
  license: string
}

// 系统信息
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
  memoryUsage: MemoryUsage
  cpuUsage: CpuUsage
  uptime: number
  env?: Record<string, string>
}

export interface MemoryUsage {
  rss: number
  heapTotal: number
  heapUsed: number
  external: number
  arrayBuffers: number
}

export interface CpuUsage {
  user: number
  system: number
  percent: number
}

// 文件系统
export interface FileInfo {
  name: string
  path: string
  size: number
  type: string
  modified: Date
  created: Date
}

export interface DirectoryInfo {
  path: string
  files: FileInfo[]
  directories: string[]
  totalSize: number
}

// 待办事项
export interface TodoItem {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  byPriority: {
    low: number
    medium: number
    high: number
  }
  completionRate: number
}

// 应用设置
export interface AppSettings {
  // 通用设置
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoStart: boolean
  startMinimized: boolean
  
  // 通知设置
  notifications: boolean
  notificationSound: boolean
  taskCompleteNotification: boolean
  systemStatusNotification: boolean
  
  // 数据设置
  savePath: string
  autoBackup: boolean
  backupInterval: 'daily' | 'weekly' | 'monthly'
  
  // 更新设置
  autoUpdate: boolean
  updateCheckFrequency: 'daily' | 'weekly' | 'startup' | 'manual'
  prereleaseUpdates: boolean
  
  // 高级设置
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  performanceMonitoring: boolean
  proxy: string
  connectionTimeout: number
}

// 更新信息
export interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes: string
  downloadUrl: string
  size: number
}

export interface UpdateProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}

// 通知
export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  silent?: boolean
  onClick?: () => void
}

// 窗口状态
export interface WindowState {
  isMaximized: boolean
  isMinimized: boolean
  isVisible: boolean
  isFocused: boolean
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

// IPC 通信
export interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 事件类型
export type MenuAction = 
  | 'new'
  | 'open'
  | 'save'
  | 'save-as'
  | 'about'
  | 'quit'

export type TrayAction =
  | 'new-task'
  | 'show-notification'
  | 'open-settings'
  | 'toggle-window'

// 工具函数类型
export type Formatter = (value: any) => string

// 验证器类型
export type Validator = (value: any) => boolean | string

// 工具函数
export const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const formatRelativeTime = (date: Date | string | number): string => {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  
  if (diffSec < 60) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  
  return formatDate(d)
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 验证器
export const validators = {
  required: (value: any): boolean | string => {
    if (value === undefined || value === null || value === '') {
      return '此字段为必填项'
    }
    return true
  },
  
  email: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return '请输入有效的电子邮件地址'
    }
    return true
  },
  
  url: (value: string): boolean | string => {
    try {
      new URL(value)
      return true
    } catch {
      return '请输入有效的 URL'
    }
  },
  
  minLength: (min: number) => (value: string): boolean | string => {
    if (value.length < min) {
      return `长度不能少于 ${min} 个字符`
    }
    return true
  },
  
  maxLength: (max: number) => (value: string): boolean | string => {
    if (value.length > max) {
      return `长度不能超过 ${max} 个字符`
    }
    return true
  },
  
  number: (value: any): boolean | string => {
    if (isNaN(Number(value))) {
      return '请输入有效的数字'
    }
    return true
  },
  
  min: (min: number) => (value: number): boolean | string => {
    if (value < min) {
      return `值不能小于 ${min}`
    }
    return true
  },
  
  max: (max: number) => (value: number): boolean | string => {
    if (value > max) {
      return `值不能大于 ${max}`
    }
    return true
  }
}