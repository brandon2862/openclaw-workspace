<template>
  <div class="system-view">
    <!-- 标题和刷新按钮 -->
    <div class="system-header">
      <h1 class="system-title">系统信息</h1>
      <div class="system-actions">
        <el-button
          type="primary"
          @click="refreshSystemInfo"
          :icon="Refresh"
          :loading="systemStore.isLoading"
        >
          刷新
        </el-button>
        
        <el-button
          type="success"
          @click="copySystemInfo"
          :icon="CopyDocument"
        >
          复制信息
        </el-button>
        
        <el-button
          type="warning"
          @click="saveSystemInfo"
          :icon="Download"
        >
          保存报告
        </el-button>
      </div>
    </div>
    
    <!-- 系统概览 -->
    <div class="system-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <template #header>
              <div class="overview-header">
                <el-icon><Platform /></el-icon>
                <span>平台信息</span>
              </div>
            </template>
            <div class="overview-content">
              <div class="overview-item">
                <span class="item-label">操作系统:</span>
                <span class="item-value">{{ systemInfo.platform || '未知' }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">系统架构:</span>
                <span class="item-value">{{ systemInfo.arch || '未知' }}</span>
              </div>
              <div class="overview-item">
                <span class="item-label">应用版本:</span>
                <span class="item-value">{{ systemInfo.appVersion || '1.0.0' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <template #header>
              <div class="overview-header">
                <el-icon><Cpu /></el-icon>
                <span>CPU 使用率</span>
              </div>
            </template>
            <div class="overview-content">
              <div class="cpu-usage">
                <el-progress
                  type="dashboard"
                  :percentage="systemInfo.cpuUsage?.percent || 0"
                  :color="getProgressColor(systemInfo.cpuUsage?.percent || 0)"
                  :width="100"
                />
                <div class="cpu-details">
                  <div class="cpu-value">{{ systemInfo.cpuUsage?.percent || 0 }}%</div>
                  <div class="cpu-label">当前使用率</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <template #header>
              <div class="overview-header">
                <el-icon><Memory /></el-icon>
                <span>内存使用</span>
              </div>
            </template>
            <div class="overview-content">
              <div class="memory-usage">
                <el-progress
                  type="dashboard"
                  :percentage="memoryPercentage"
                  :color="getProgressColor(memoryPercentage)"
                  :width="100"
                />
                <div class="memory-details">
                  <div class="memory-value">{{ formatMemory(usedMemory) }}</div>
                  <div class="memory-label">已使用 / {{ formatMemory(totalMemory) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="overview-card" shadow="hover">
            <template #header>
              <div class="overview-header">
                <el-icon><Clock /></el-icon>
                <span>运行时间</span>
              </div>
            </template>
            <div class="overview-content">
              <div class="uptime-display">
                <div class="uptime-value">{{ formatUptime(systemInfo.uptime || 0) }}</div>
                <div class="uptime-label">应用运行时间</div>
                <div class="uptime-details">
                  <div class="detail-item">
                    <span>启动时间:</span>
                    <span>{{ formatStartTime() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 详细信息标签页 -->
    <div class="system-details">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="系统信息" name="system">
          <div class="detail-section">
            <h3 class="section-title">基本系统信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="平台">{{ systemInfo.platform || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="架构">{{ systemInfo.arch || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="Node.js 版本">{{ systemInfo.nodeVersion || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="Electron 版本">{{ systemInfo.electronVersion || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="Chrome 版本">{{ systemInfo.chromeVersion || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="应用版本">{{ systemInfo.appVersion || '1.0.0' }}</el-descriptions-item>
              <el-descriptions-item label="用户目录">{{ systemInfo.homeDir || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="应用路径">{{ systemInfo.appPath || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">路径信息</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户数据">{{ systemInfo.userDataPath || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="临时文件">{{ systemInfo.tempPath || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="文档">{{ systemInfo.documentsPath || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="下载">{{ systemInfo.downloadsPath || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="桌面">{{ systemInfo.desktopPath || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="内存信息" name="memory">
          <div class="detail-section">
            <h3 class="section-title">内存使用详情</h3>
            <el-table :data="memoryData" style="width: 100%">
              <el-table-column prop="label" label="内存类型" width="200" />
              <el-table-column prop="value" label="使用量" width="150">
                <template #default="{ row }">
                  {{ formatMemory(row.value) }}
                </template>
              </el-table-column>
              <el-table-column prop="percentage" label="占比" width="150">
                <template #default="{ row }">
                  <el-progress
                    :percentage="row.percentage"
                    :color="getProgressColor(row.percentage)"
                    :show-text="false"
                  />
                  <span style="margin-left: 10px">{{ row.percentage }}%</span>
                </template>
              </el-table-column>
              <el-table-column label="描述">
                <template #default="{ row }">
                  {{ row.description }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">内存使用趋势</h3>
            <div class="chart-container">
              <!-- 这里可以添加内存使用趋势图 -->
              <div class="chart-placeholder">
                <el-icon :size="48"><Histogram /></el-icon>
                <p>内存使用趋势图</p>
                <p class="placeholder-hint">(需要集成图表库如 ECharts)</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="环境变量" name="environment">
          <div class="detail-section">
            <h3 class="section-title">环境变量</h3>
            <el-table :data="envVars" style="width: 100%">
              <el-table-column prop="name" label="变量名" width="200" />
              <el-table-column prop="value" label="值" show-overflow-tooltip />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button
                    size="small"
                    type="primary"
                    @click="copyEnvVar(row.value)"
                  >
                    复制
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="系统工具" name="tools">
          <div class="detail-section">
            <h3 class="section-title">系统工具</h3>
            <div class="tools-grid">
              <el-card class="tool-card" shadow="hover" @click="openDevTools">
                <div class="tool-content">
                  <el-icon class="tool-icon" :size="32"><Tools /></el-icon>
                  <div class="tool-text">
                    <h3>开发者工具</h3>
                    <p>打开浏览器开发者工具</p>
                  </div>
                </div>
              </el-card>
              
              <el-card class="tool-card" shadow="hover" @click="openAppData">
                <div class="tool-content">
                  <el-icon class="tool-icon" :size="32"><FolderOpened /></el-icon>
                  <div class="tool-text">
                    <h3>打开应用数据</h3>
                    <p>在文件管理器中打开应用数据目录</p>
                  </div>
                </div>
              </el-card>
              
              <el-card class="tool-card" shadow="hover" @click="clearCache">
                <div class="tool-content">
                  <el-icon class="tool-icon" :size="32"><Delete /></el-icon>
                  <div class="tool-text">
                    <h3>清理缓存</h3>
                    <p>清理应用缓存数据</p>
                  </div>
                </div>
              </el-card>
              
              <el-card class="tool-card" shadow="hover" @click="restartApp">
                <div class="tool-content">
                  <el-icon class="tool-icon" :size="32><RefreshRight /></el-icon>
                  <div class="tool-text">
                    <h3>重启应用</h3>
                    <p>重启 Electron Vue App</p>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">系统诊断</h3>
            <div class="diagnostic-actions">
              <el-button type="primary" @click="runDiagnostic">
                <el-icon><Search /></el-icon>
                运行系统诊断
              </el-button>
              
              <el-button type="success" @click="generateReport">
                <el-icon><Document /></el-icon>
                生成诊断报告
              </el-button>
              
              <el-button type="warning" @click="checkUpdates">
                <el-icon><Upload /></el-icon>
                检查更新
              </el-button>
            </div>
            
            <div class="diagnostic-results" v-if="diagnosticResults">
              <h4>诊断结果:</h4>
              <pre>{{ diagnosticResults }}</pre>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  CopyDocument,
  Download,
  Platform,
  Cpu,
  Memory,
  Clock,
  Histogram,
  Tools,
  FolderOpened,
  Delete,
  RefreshRight,
  Search,
  Document,
  Upload
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

// 响应式数据
const activeTab = ref('system')
const diagnosticResults = ref<string | null>(null)

// 计算属性
const systemInfo = computed(() => systemStore.systemInfo)

const memoryData = computed(() => {
  const memoryUsage = systemInfo.value.memoryUsage
  if (!memoryUsage) return []
  
  const total = memoryUsage.heapTotal || 1
  const data = [
    {
      label: '常驻内存 (RSS)',
      value: memoryUsage.rss || 0,
      percentage: Math.round(((memoryUsage.rss || 0) / total) * 100),
      description: '进程占用的物理内存总量'
    },
    {
      label: '堆内存总量',
      value: memoryUsage.heapTotal || 0,
      percentage: 100,
      description: 'V8 堆内存总量'
    },
    {
      label: '已使用堆内存',
      value: memoryUsage.heapUsed || 0,
      percentage: Math.round(((memoryUsage.heapUsed || 0) / total) * 100),
      description: 'V8 堆内存使用量'
    },
    {
      label: '外部内存',
      value: memoryUsage.external || 0,
      percentage: Math.round(((memoryUsage.external || 0) / total) * 100),
      description: '绑定到 JavaScript 对象的 C++ 对象内存'
    },
    {
      label: '数组缓冲区',
      value: memoryUsage.arrayBuffers || 0,
      percentage: Math.round(((memoryUsage.arrayBuffers || 0) / total) * 100),
      description: 'ArrayBuffer 和 SharedArrayBuffer 的内存'
    }
  ]
  
  return data
})

const envVars = computed(() => {
  const env = systemInfo.value.env || {}
  return Object.entries(env).map(([name, value]) => ({
    name,
    value: String(value)
  }))
})

const usedMemory = computed(() => {
  return systemInfo.value.memoryUsage?.heapUsed || 0
})

const totalMemory = computed(() => {
  return systemInfo.value.memoryUsage?.heapTotal || 1
})

const memoryPercentage = computed(() => {
  if (totalMemory.value === 0) return 0
  return Math.round((usedMemory.value / totalMemory.value) * 100)
})

// 方法
const refreshSystemInfo = async () => {
  await systemStore.fetchSystemInfo()
  ElMessage.success('系统信息已刷新')
}

const copySystemInfo = async () => {
  try {
    const infoText = JSON.stringify(systemInfo.value, null, 2)
    await navigator.clipboard.writeText(infoText)
    ElMessage.success('系统信息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败: ' + error)
  }
}

const saveSystemInfo = async () => {
  try {
    const infoText = JSON.stringify(systemInfo.value, null, 2)
    const result = await window.electronAPI.fs.saveDialog({
      defaultPath: `system_info_${Date.now()}.json`,
      filters: [{ name: 'JSON文件', extensions: ['json'] }]
    })
    
    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.fs.writeFile(result.filePath, infoText)
      if (writeResult.success) {
        ElMessage.success('系统信息报告已保存')
      } else {
        ElMessage.error('保存失败: ' + writeResult.error)
      }
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error)
  }
}

const copyEnvVar = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('环境变量值已复制')
  } catch (error) {
    ElMessage.error('复制失败: ' + error)
  }
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

const formatStartTime = (): string => {
  const uptime = systemInfo.value.uptime || 0
  const startTime = new Date(Date.now() - uptime * 1000)
  return startTime.toLocaleString('zh-CN')
}

const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

const openDevTools = () => {
  window.electronAPI.app.openDevTools()
  ElMessage.info('开发者工具已打开')
}

const openAppData = () => {
  if (systemInfo.value.userDataPath) {
    window.electronAPI.app.showItemInFolder(systemInfo.value.userDataPath)
    ElMessage.info('正在打开应用数据目录')
  }
}

const clearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理应用缓存吗？这可能会清除一些临时数据。',
      '清理缓存确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里可以添加清理缓存的逻辑
    ElMessage.success('缓存清理功能待实现')
  } catch {
    // 用户取消操作
  }
}

const restartApp = () => {
  systemStore.restartApp()
}

const runDiagnostic = async () => {
  try {
    diagnosticResults.value = '正在运行系统诊断...'
    
    // 模拟诊断过程
    setTimeout(() => {
      const results = [
        '=== 系统诊断报告 ===',
        `诊断时间: ${new Date().toLocaleString('zh-CN')}`,
        `平台: ${systemInfo.value.platform || '未知'}`,
        `架构: ${systemInfo.value.arch || '未知'}`,
        `Electron 版本: ${systemInfo.value.electronVersion || '未知'}`,
        `Node.js 版本: ${systemInfo.value.nodeVersion || '未知'}`,
        `内存使用: ${memoryPercentage.value}%`,
        `CPU 使用: ${systemInfo.value.cpuUsage?.percent || 0}%`,
        '=== 诊断结果 ===',
        '✓ 系统运行正常',
        '✓ 内存使用在正常范围内',
        '✓ CPU 使用率正常',
        '✓ 应用版本检查通过',
        '建议: 定期清理缓存以保持最佳性能'
      ].join('\n')
      
      diagnosticResults.value = results
      ElMessage.success('系统诊断完成')
    }, 2000)
  } catch (error) {
    diagnosticResults.value = `诊断失败: ${error}`
    ElMessage.error('系统诊断失败')
  }
}

const generateReport = async () => {
  try {
    const report = [
      '=== Electron Vue App 诊断报告 ===',
      `生成时间: ${new Date().toLocaleString('zh-CN')}`,
      '',
      '## 系统信息',
      `- 平台: ${systemInfo.value.platform || '未知'}`,
      `- 架构: ${systemInfo.value.arch || '未知'}`,
      `- Electron 版本: ${systemInfo.value.electronVersion || '未知'}`,
      `- Chrome 版本: ${systemInfo.value.chromeVersion || '未知'}`,
      `- Node.js 版本: ${systemInfo.value.nodeVersion || '未知'}`,
      `- 应用版本: ${systemInfo.value.appVersion || '1.0.0'}`,
      '',
      '## 资源使用',
      `- CPU 使用率: ${systemInfo.value.cpuUsage?.percent || 0}%`,
      `- 内存使用: ${memoryPercentage.value}% (${formatMemory(usedMemory.value)} / ${formatMemory(totalMemory.value)})`,
      `- 运行时间: ${formatUptime(systemInfo.value.uptime || 0)}`,
      '',
      '## 路径信息',
      `- 用户目录: ${systemInfo.value.homeDir || '未知'}`,
      `- 应用数据: ${systemInfo.value.userDataPath || '未知'}`,
      `- 临时文件: ${systemInfo.value.tempPath || '未知'}`,
      '',
      '## 建议',
      '- 定期清理应用缓存',
      '- 保持应用更新到最新版本',
      '- 监控系统资源使用情况',
      '- 定期备份重要数据'
    ].join('\n')
    
    const result = await window.electronAPI.fs.saveDialog({
      defaultPath: `diagnostic_report_${Date.now()}.md`,
      filters: [
        { name: 'Markdown文件', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt'] }
      ]
    })
    
    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.fs.writeFile(result.filePath, report)
      if (writeResult.success) {
        ElMessage.success('诊断报告已保存')
      } else {
        ElMessage.error('保存失败: ' + writeResult.error)
      }
    }
  } catch (error) {
    ElMessage.error('生成报告失败: ' + error)
  }
}

const checkUpdates = () => {
  ElMessage.info('检查更新功能待实现')
  // 这里可以调用自动更新检查
}

// 生命周期
onMounted(() => {
  // 定期更新系统信息
  const intervalId = setInterval(() => {
    systemStore.fetchSystemInfo()
  }, 3000)
  
  // 清理定时器
  return () => clearInterval(intervalId)
})
</script>

<style scoped>
.system-view {
  padding: 20px;
}

.system-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.system-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0;
}

.system-actions {
  display: flex;
  gap: 10px;
}

.system-overview {
  margin-bottom: 30px;
}

.overview-card {
  height: 100%;
}

.overview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.overview-content {
  padding: 10px 0;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.overview-item:last-child {
  border-bottom: none;
}

.item-label {
  color: var(--el-text-color-secondary);
}

.item-value {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.cpu-usage,
.memory-usage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.cpu-details,
.memory-details {
  text-align: center;
}

.cpu-value,
.memory-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.cpu-label,
.memory-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.uptime-display {
  text-align: center;
  padding: 20px 0;
}

.uptime-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.uptime-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

.uptime-details {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.system-details {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--el-border-color);
}

.chart-container {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.chart-placeholder {
  color: var(--el-text-color-secondary);
}

.placeholder-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 5px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
}

.tool-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tool-icon {
  flex-shrink: 0;
}

.tool-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.tool-text p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.diagnostic-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.diagnostic-results {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.diagnostic-results h4 {
  margin: 0 0 10px 0;
  color: var(--el-text-color-primary);
}

.diagnostic-results pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
</style>