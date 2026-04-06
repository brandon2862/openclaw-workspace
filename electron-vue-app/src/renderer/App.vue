<template>
  <div id="app">
    <!-- 应用布局 -->
    <el-container class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">
          <el-icon size="24"><Platform /></el-icon>
          <span>Electron Vue App</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <el-menu-item index="todo">
            <el-icon><List /></el-icon>
            <span>待办事项</span>
          </el-menu-item>
          
          <el-menu-item index="system">
            <el-icon><Monitor /></el-icon>
            <span>系统信息</span>
          </el-menu-item>
          
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
          
          <el-menu-item index="about">
            <el-icon><InfoFilled /></el-icon>
            <span>关于</span>
          </el-menu-item>
        </el-menu>
        
        <div class="system-info">
          <div class="info-item">
            <el-icon><Cpu /></el-icon>
            <span>CPU: {{ systemInfo.cpuUsage?.percent || 0 }}%</span>
          </div>
          <div class="info-item">
            <el-icon><Memory /></el-icon>
            <span>内存: {{ formatMemory(systemInfo.memoryUsage?.heapUsed || 0) }}</span>
          </div>
        </div>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-button
              type="text"
              @click="toggleSidebar"
              class="sidebar-toggle"
            >
              <el-icon :size="20">
                <Fold v-if="sidebarCollapsed" />
                <Expand v-else />
              </el-icon>
            </el-button>
            
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 主题切换 -->
            <el-switch
              v-model="darkMode"
              :active-icon="Moon"
              :inactive-icon="Sunny"
              @change="toggleTheme"
              class="theme-switch"
            />
            
            <!-- 窗口控制按钮 -->
            <div class="window-controls">
              <el-button
                type="text"
                @click="minimizeWindow"
                class="window-btn"
                title="最小化"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
              
              <el-button
                type="text"
                @click="maximizeWindow"
                class="window-btn"
                title="最大化/还原"
              >
                <el-icon>
                  <FullScreen v-if="!windowState.isMaximized" />
                  <CopyDocument v-else />
                </el-icon>
              </el-button>
              
              <el-button
                type="text"
                @click="closeWindow"
                class="window-btn close-btn"
                title="关闭"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </el-header>
        
        <!-- 页面内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
        
        <!-- 底部状态栏 -->
        <el-footer class="footer" height="30px">
          <div class="status-bar">
            <span class="status-item">
              <el-icon><Connection /></el-icon>
              已连接
            </span>
            <span class="status-item">
              <el-icon><Clock /></el-icon>
              运行时间: {{ formatUptime(systemInfo.uptime || 0) }}
            </span>
            <span class="status-item">
              <el-icon><User /></el-icon>
              {{ systemInfo.userDataPath || '用户数据' }}
            </span>
            <span class="status-item version">
              v{{ systemInfo.appVersion || '1.0.0' }}
            </span>
          </div>
        </el-footer>
      </el-container>
    </el-container>
    
    <!-- 全局通知 -->
    <el-notification-group :placement="'top-right'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Platform,
  House,
  List,
  Monitor,
  Setting,
  InfoFilled,
  Cpu,
  Memory,
  Fold,
  Expand,
  Moon,
  Sunny,
  Minus,
  FullScreen,
  CopyDocument,
  Close,
  Connection,
  Clock,
  User
} from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { useSystemStore } from '@/stores/system'
import { useTodoStore } from '@/stores/todo'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const todoStore = useTodoStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const darkMode = ref(false)
const windowState = ref({
  isMaximized: false,
  isMinimized: false,
  isVisible: true,
  isFocused: true
})

// 计算属性
const activeMenu = computed(() => {
  return route.name?.toString() || 'dashboard'
})

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: '仪表盘',
    todo: '待办事项',
    system: '系统信息',
    settings: '设置',
    about: '关于'
  }
  return titles[route.name?.toString() || 'dashboard']
})

const systemInfo = computed(() => systemStore.systemInfo)

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleTheme = (value: boolean) => {
  const html = document.documentElement
  if (value) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

const handleMenuSelect = (index: string) => {
  router.push({ name: index })
}

const minimizeWindow = () => {
  window.electronAPI.window.minimize()
}

const maximizeWindow = () => {
  window.electronAPI.window.maximize()
}

const closeWindow = () => {
  window.electronAPI.window.close()
}

const formatMemory = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const formatUptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(async () => {
  // 初始化系统信息
  await systemStore.fetchSystemInfo()
  
  // 获取窗口状态
  const state = await window.electronAPI.window.getState()
  windowState.value = state
  
  // 加载主题设置
  const savedTheme = localStorage.getItem('theme')
  darkMode.value = savedTheme === 'dark'
  toggleTheme(darkMode.value)
  
  // 监听菜单事件
  const removeMenuListener = window.electronAPI.onMenuAction((action, ...args) => {
    switch (action) {
      case 'new':
        todoStore.addTodo('新任务', '从菜单创建的新任务')
        ElNotification.success({
          title: '新任务',
          message: '已创建新任务'
        })
        break
      case 'about':
        router.push({ name: 'about' })
        break
      case 'open':
        ElNotification.info({
          title: '打开文件',
          message: `打开文件: ${args[0]}`
        })
        break
      case 'save':
        ElNotification.success({
          title: '保存',
          message: '文件已保存'
        })
        break
    }
  })
  
  // 监听托盘事件
  const removeTrayListener = window.electronAPI.onTrayAction((action) => {
    switch (action) {
      case 'new-task':
        todoStore.addTodo('托盘任务', '从系统托盘创建的任务')
        ElNotification.success({
          title: '新任务',
          message: '已从托盘创建新任务'
        })
        break
      case 'show-notification':
        window.electronAPI.notification.show({
          title: '系统通知',
          body: '这是一个来自系统托盘的通知示例',
          onClick: true
        })
        break
      case 'open-settings':
        router.push({ name: 'settings' })
        break
    }
  })
  
  // 监听窗口状态变化
  const updateWindowState = async () => {
    const state = await window.electronAPI.window.getState()
    windowState.value = state
  }
  
  // 定期更新系统信息
  const intervalId = setInterval(async () => {
    await systemStore.fetchSystemInfo()
    await updateWindowState()
  }, 5000)
  
  // 清理函数
  onUnmounted(() => {
    removeMenuListener()
    removeTrayListener()
    clearInterval(intervalId)
  })
  
  // 显示欢迎通知
  ElNotification.success({
    title: '应用启动成功',
    message: 'Electron Vue App 已启动',
    duration: 3000
  })
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 16px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.system-info {
  padding: 16px;
  border-top: 1px solid var(--el-border-color);
  font-size: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-secondary);
}

.info-item:last-child {
  margin-bottom: 0;
}

.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  padding: 8px;
}

.breadcrumb {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-switch {
  margin-right: 8px;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.window-btn {
  padding: 8px;
  border-radius: 4px;
}

.window-btn:hover {
  background-color: var(--el-fill-color-light);
}

.close-btn:hover {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.main-content {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow-y: auto;
}

.footer {
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.version {
  font-weight: bold;
  color: var(--el-color-primary);
}
</style>