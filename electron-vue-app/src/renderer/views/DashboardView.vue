<template>
  <div class="dashboard-view">
    <!-- 欢迎标题 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用 Electron Vue App</h1>
      <p class="welcome-subtitle">一个现代化的 Windows 桌面应用示例</p>
    </div>
    
    <!-- 快速操作卡片 -->
    <div class="quick-actions">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="action-card" shadow="hover" @click="handleQuickAction('new-todo')">
            <div class="action-content">
              <el-icon class="action-icon" :size="32" color="#409EFF"><DocumentAdd /></el-icon>
              <div class="action-text">
                <h3>新建任务</h3>
                <p>添加新的待办事项</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="action-card" shadow="hover" @click="handleQuickAction('system-info')">
            <div class="action-content">
              <el-icon class="action-icon" :size="32" color="#67C23A"><Monitor /></el-icon>
              <div class="action-text">
                <h3>系统信息</h3>
                <p>查看系统状态</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="action-card" shadow="hover" @click="handleQuickAction('settings')">
            <div class="action-content">
              <el-icon class="action-icon" :size="32" color="#E6A23C"><Setting /></el-icon>
              <div class="action-text">
                <h3>应用设置</h3>
                <p>配置应用选项</p>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="action-card" shadow="hover" @click="handleQuickAction('notification')">
            <div class="action-content">
              <el-icon class="action-icon" :size="32" color="#F56C6C"><Bell /></el-icon>
              <div class="action-text">
                <h3>测试通知</h3>
                <p>发送系统通知</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="stats-card">
            <template #header>
              <div class="stats-header">
                <el-icon><DataLine /></el-icon>
                <span>系统状态</span>
              </div>
            </template>
            <div class="stats-content">
              <div class="stat-item">
                <span class="stat-label">平台:</span>
                <span class="stat-value">{{ systemInfo.platform || '未知' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Electron 版本:</span>
                <span class="stat-value">{{ systemInfo.electronVersion || '未知' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Node.js 版本:</span>
                <span class="stat-value">{{ systemInfo.nodeVersion || '未知' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Chrome 版本:</span>
                <span class="stat-value">{{ systemInfo.chromeVersion || '未知' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">应用版本:</span>
                <span class="stat-value">{{ systemInfo.appVersion || '1.0.0' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="stats-card">
            <template #header>
              <div class="stats-header">
                <el-icon><PieChart /></el-icon>
                <span>待办事项统计</span>
              </div>
            </template>
            <div class="stats-content">
              <div class="stat-item">
                <span class="stat-label">总任务数:</span>
                <span class="stat-value">{{ todoStats.total || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已完成:</span>
                <span class="stat-value">{{ todoStats.completed || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">进行中:</span>
                <span class="stat-value">{{ todoStats.pending || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成率:</span>
                <span class="stat-value">{{ todoStats.completionRate || 0 }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">高优先级:</span>
                <span class="stat-value">{{ todoStats.byPriority?.high || 0 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 最近待办事项 -->
    <div class="recent-todos">
      <el-card>
        <template #header>
          <div class="todos-header">
            <el-icon><List /></el-icon>
            <span>最近待办事项</span>
            <el-button
              type="primary"
              size="small"
              @click="$router.push({ name: 'todo' })"
              class="view-all-btn"
            >
              查看全部
            </el-button>
          </div>
        </template>
        <div class="todos-content">
          <el-table
            :data="recentTodos"
            style="width: 100%"
            empty-text="暂无待办事项"
            @row-click="handleTodoClick"
          >
            <el-table-column prop="title" label="标题" width="200">
              <template #default="{ row }">
                <div class="todo-title">
                  <el-icon v-if="row.completed" color="#67C23A"><CircleCheck /></el-icon>
                  <el-icon v-else color="#E6A23C"><Clock /></el-icon>
                  <span :class="{ 'completed': row.completed }">{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="priorityType(row.priority)"
                  size="small"
                >
                  {{ priorityText(row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button
                  size="small"
                  :type="row.completed ? 'info' : 'success'"
                  @click.stop="toggleTodo(row.id)"
                >
                  {{ row.completed ? '未完成' : '完成' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
    
    <!-- 系统资源使用情况 -->
    <div class="resource-usage">
      <el-card>
        <template #header>
          <div class="resource-header">
            <el-icon><Cpu /></el-icon>
            <span>系统资源使用情况</span>
          </div>
        </template>
        <div class="resource-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="resource-item">
                <div class="resource-label">CPU 使用率</div>
                <div class="resource-value">{{ systemInfo.cpuUsage?.percent || 0 }}%</div>
                <el-progress
                  :percentage="systemInfo.cpuUsage?.percent || 0"
                  :color="getProgressColor(systemInfo.cpuUsage?.percent || 0)"
                  :show-text="false"
                />
              </div>
            </el-col>
            
            <el-col :span="12">
              <div class="resource-item">
                <div class="resource-label">内存使用</div>
                <div class="resource-value">{{ formatMemory(systemInfo.memoryUsage?.heapUsed || 0) }}</div>
                <el-progress
                  :percentage="calculateMemoryPercentage()"
                  :color="getProgressColor(calculateMemoryPercentage())"
                  :show-text="false"
                />
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import {
  DocumentAdd,
  Monitor,
  Setting,
  Bell,
  DataLine,
  PieChart,
  List,
  CircleCheck,
  Clock,
  Cpu
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'
import { useTodoStore } from '@/stores/todo'

const router = useRouter()
const systemStore = useSystemStore()
const todoStore = useTodoStore()

// 计算属性
const systemInfo = computed(() => systemStore.systemInfo)
const todoStats = computed(() => todoStore.getStats())
const recentTodos = computed(() => todoStore.todos.slice(0, 5))

// 方法
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'new-todo':
      router.push({ name: 'todo' })
      break
    case 'system-info':
      router.push({ name: 'system' })
      break
    case 'settings':
      router.push({ name: 'settings' })
      break
    case 'notification':
      systemStore.sendNotification('测试通知', '这是一个来自仪表盘的测试通知')
      ElNotification.success({
        title: '通知已发送',
        message: '系统通知已发送到操作中心'
      })
      break
  }
}

const handleTodoClick = (todo: any) => {
  router.push({ name: 'todo' })
}

const toggleTodo = (id: string) => {
  todoStore.toggleTodo(id)
}

const priorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'danger'
    case 'medium': return 'warning'
    case 'low': return 'success'
    default: return 'info'
  }
}

const priorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return priority
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const calculateMemoryPercentage = (): number => {
  const memoryUsage = systemInfo.value.memoryUsage
  if (!memoryUsage) return 0
  
  const total = memoryUsage.heapTotal
  const used = memoryUsage.heapUsed
  
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 生命周期
onMounted(() => {
  // 定期更新系统信息
  setInterval(() => {
    systemStore.fetchSystemInfo()
  }, 3000)
})
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.quick-actions {
  margin-bottom: 30px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  flex-shrink: 0;
}

.action-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.action-text p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.stats-section {
  margin-bottom: 30px;
}

.stats-card {
  height: 100%;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
}

.stats-content {
  padding: 10px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.recent-todos {
  margin-bottom: 30px;
}

.todos-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-all-btn {
  margin-left: auto;
}

.todo-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.todo-title .completed {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}

.resource-usage {
  margin-bottom: 20px;
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-content {
  padding: 20px 0;
}

.resource-item {
  padding: 10px;
}

.resource-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.resource-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}
</style>