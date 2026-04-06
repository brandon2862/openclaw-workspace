<template>
  <div class="about-view">
    <!-- 关于卡片 -->
    <el-card class="about-card" shadow="hover">
      <template #header>
        <div class="about-header">
          <el-icon :size="32" color="#409EFF"><Platform /></el-icon>
          <h1 class="about-title">Electron Vue App</h1>
        </div>
      </template>
      
      <div class="about-content">
        <!-- 应用信息 -->
        <div class="app-info">
          <div class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ appVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Electron 版本:</span>
            <span class="info-value">{{ electronVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Node.js 版本:</span>
            <span class="info-value">{{ nodeVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Chrome 版本:</span>
            <span class="info-value">{{ chromeVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">构建时间:</span>
            <span class="info-value">{{ buildTime }}</span>
          </div>
        </div>
        
        <!-- 应用描述 -->
        <div class="app-description">
          <h3>应用简介</h3>
          <p>
            Electron Vue App 是一个现代化的 Windows 桌面应用示例，展示了使用 Electron + Vue.js 3 + TypeScript 开发桌面应用的最佳实践。
            本应用包含了完整的桌面应用功能，如系统托盘、菜单栏、通知、文件系统访问等。
          </p>
        </div>
        
        <!-- 技术栈 -->
        <div class="tech-stack">
          <h3>技术栈</h3>
          <div class="tech-grid">
            <el-tag type="primary" size="large">Electron</el-tag>
            <el-tag type="success" size="large">Vue.js 3</el-tag>
            <el-tag type="warning" size="large">TypeScript</el-tag>
            <el-tag type="info" size="large">Element Plus</el-tag>
            <el-tag type="danger" size="large">Vite</el-tag>
            <el-tag size="large">Pinia</el-tag>
            <el-tag size="large">Vue Router</el-tag>
            <el-tag size="large">Electron Builder</el-tag>
          </div>
        </div>
        
        <!-- 功能特性 -->
        <div class="features">
          <h3>功能特性</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><Monitor /></el-icon>
                <div class="feature-text">
                  <h4>现代化界面</h4>
                  <p>基于 Element Plus 的现代化 UI 设计，支持亮色/暗色主题切换</p>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><List /></el-icon>
                <div class="feature-text">
                  <h4>待办事项管理</h4>
                  <p>完整的待办事项管理系统，支持增删改查、导入导出</p>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><Cpu /></el-icon>
                <div class="feature-text">
                  <h4>系统监控</h4>
                  <p>实时监控系统资源使用情况，包括 CPU、内存等</p>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><Bell /></el-icon>
                <div class="feature-text">
                  <h4>系统通知</h4>
                  <p>支持 Windows 系统通知，可自定义通知设置</p>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><Setting /></el-icon>
                <div class="feature-text">
                  <h4>丰富设置</h4>
                  <p>完整的应用设置系统，支持主题、通知、数据管理等</p>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="feature-item">
                <el-icon class="feature-icon" :size="24"><Upload /></el-icon>
                <div class="feature-text">
                  <h4>自动更新</h4>
                  <p>支持自动更新检查，保持应用最新版本</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 开发者信息 -->
        <div class="developer-info">
          <h3>开发者信息</h3>
          <div class="developer-card">
            <div class="developer-avatar">
              <el-avatar :size="60" :src="developer.avatar" />
            </div>
            <div class="developer-details">
              <h4>{{ developer.name }}</h4>
              <p>{{ developer.description }}</p>
              <div class="developer-links">
                <el-button
                  type="primary"
                  size="small"
                  @click="openLink(developer.github)"
                >
                  <el-icon><Link /></el-icon>
                  GitHub
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="openLink(developer.website)"
                >
                  <el-icon><Link /></el-icon>
                  个人网站
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 开源协议 -->
        <div class="license">
          <h3>开源协议</h3>
          <p>
            本项目基于 MIT 协议开源。你可以在遵守协议的前提下自由使用、修改和分发本项目的代码。
          </p>
          <el-button
            type="info"
            size="small"
            @click="openLink('https://opensource.org/licenses/MIT')"
          >
            查看 MIT 协议
          </el-button>
        </div>
        
        <!-- 项目链接 -->
        <div class="project-links">
          <h3>项目链接</h3>
          <div class="links-grid">
            <el-button
              type="primary"
              @click="openLink('https://github.com/your-username/electron-vue-app')"
            >
              <el-icon><Star /></el-icon>
              GitHub 仓库
            </el-button>
            
            <el-button
              type="success"
              @click="openLink('https://github.com/your-username/electron-vue-app/issues')"
            >
              <el-icon><Warning /></el-icon>
              报告问题
            </el-button>
            
            <el-button
              type="warning"
              @click="openLink('https://github.com/your-username/electron-vue-app/wiki')"
            >
              <el-icon><Document /></el-icon>
              使用文档
            </el-button>
            
            <el-button
              type="info"
              @click="openLink('https://electronjs.org')"
            >
              <el-icon><Link /></el-icon>
              Electron 官网
            </el-button>
            
            <el-button
              type="danger"
              @click="openLink('https://vuejs.org')"
            >
              <el-icon><Link /></el-icon>
              Vue.js 官网
            </el-button>
            
            <el-button
              @click="openLink('https://element-plus.org')"
            >
              <el-icon><Link /></el-icon>
              Element Plus 官网
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 底部操作 -->
      <template #footer>
        <div class="about-footer">
          <el-button
            type="primary"
            @click="checkForUpdates"
          >
            <el-icon><Upload /></el-icon>
            检查更新
          </el-button>
          
          <el-button
            @click="copyVersionInfo"
          >
            <el-icon><CopyDocument /></el-icon>
            复制版本信息
          </el-button>
          
          <el-button
            type="info"
            @click="openDevTools"
          >
            <el-icon><Tools /></el-icon>
            开发者工具
          </el-button>
          
          <el-button
            type="success"
            @click="restartApp"
          >
            <el-icon><RefreshRight /></el-icon>
            重启应用
          </el-button>
        </div>
      </template>
    </el-card>
    
    <!-- 系统信息卡片 -->
    <el-card class="system-card" shadow="hover">
      <template #header>
        <div class="system-header">
          <el-icon><InfoFilled /></el-icon>
          <span>系统信息</span>
        </div>
      </template>
      
      <div class="system-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="平台">{{ systemInfo.platform || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="架构">{{ systemInfo.arch || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="用户目录">{{ systemInfo.homeDir || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="应用数据">{{ systemInfo.userDataPath || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="运行时间">{{ formatUptime(systemInfo.uptime || 0) }}</el-descriptions-item>
          <el-descriptions-item label="内存使用">{{ formatMemory(systemInfo.memoryUsage?.heapUsed || 0) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Platform,
  Monitor,
  List,
  Cpu,
  Bell,
  Setting,
  Upload,
  Link,
  Star,
  Warning,
  Document,
  Tools,
  RefreshRight,
  CopyDocument,
  InfoFilled
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

// 响应式数据
const appVersion = ref('1.0.0')
const electronVersion = ref('未知')
const nodeVersion = ref('未知')
const chromeVersion = ref('未知')
const buildTime = ref('未知')

const systemInfo = ref<any>({})

const developer = ref({
  name: 'Brandon Wong',
  description: '全栈开发者，专注于现代化桌面应用开发',
  avatar: '',
  github: 'https://github.com/your-username',
  website: 'https://your-website.com'
})

// 方法
const openLink = (url: string) => {
  window.electronAPI.app.openExternal(url)
}

const checkForUpdates = () => {
  ElMessage.info('检查更新功能待实现')
}

const copyVersionInfo = async () => {
  try {
    const info = [
      `Electron Vue App v${appVersion.value}`,
      `Electron: ${electronVersion.value}`,
      `Node.js: ${nodeVersion.value}`,
      `Chrome: ${chromeVersion.value}`,
      `构建时间: ${buildTime.value}`,
      `平台: ${systemInfo.value.platform || '未知'}`,
      `架构: ${systemInfo.value.arch || '未知'}`
    ].join('\n')
    
    await navigator.clipboard.writeText(info)
    ElMessage.success('版本信息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败: ' + error)
  }
}

const openDevTools = () => {
  window.electronAPI.app.openDevTools()
  ElMessage.info('开发者工具已打开')
}

const restartApp = () => {
  systemStore.restartApp()
}

const formatUptime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

// 生命周期
onMounted(async () => {
  // 获取系统信息
  const info = await window.electronAPI.system.getInfo()
  systemInfo.value = info
  
  // 设置版本信息
  appVersion.value = info.appVersion || '1.0.0'
  electronVersion.value = info.electronVersion || '未知'
  nodeVersion.value = info.nodeVersion || '未知'
  chromeVersion.value = info.chromeVersion || '未知'
  
  // 设置构建时间（这里使用当前时间作为示例）
  buildTime.value = new Date().toLocaleString('zh-CN')
})
</script>

<style scoped>
.about-view {
  padding: 20px;
}

.about-card {
  margin-bottom: 20px;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.about-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0;
}

.about-content {
  padding: 20px 0;
}

.app-info {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--el-text-color-secondary);
  font-weight: bold;
}

.info-value {
  color: var(--el-text-color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.app-description,
.tech-stack,
.features,
.developer-info,
.license,
.project-links {
  margin-bottom: 30px;
}

.app-description h3,
.tech-stack h3,
.features h3,
.developer-info h3,
.license h3,
.project-links h3 {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--el-border-color);
}

.app-description p {
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  margin-bottom: 20px;
}

.feature-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.feature-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.developer-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
}

.developer-details h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.developer-details p {
  margin: 0 0 16px 0;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.developer-links {
  display: flex;
  gap: 10px;
}

.license p {
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.about-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.system-card {
  margin-bottom: 20px;
}

.system-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.system-content {
  padding: 10px 0;
}
</style>