<template>
  <div class="settings-view">
    <!-- 标题 -->
    <div class="settings-header">
      <h1 class="settings-title">应用设置</h1>
      <p class="settings-subtitle">配置应用行为和外观</p>
    </div>
    
    <!-- 设置内容 -->
    <div class="settings-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 通用设置 -->
        <el-tab-pane label="通用" name="general">
          <div class="settings-section">
            <h3 class="section-title">外观</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">主题模式</div>
                <div class="setting-control">
                  <el-radio-group v-model="settings.theme" @change="saveSettings">
                    <el-radio label="light">浅色模式</el-radio>
                    <el-radio label="dark">深色模式</el-radio>
                    <el-radio label="auto">跟随系统</el-radio>
                  </el-radio-group>
                </div>
                <div class="setting-description">
                  选择应用的主题颜色方案
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">语言</div>
                <div class="setting-control">
                  <el-select v-model="settings.language" @change="saveSettings">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </div>
                <div class="setting-description">
                  选择应用界面语言
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">启动设置</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">开机自启动</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.autoStart"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  系统启动时自动运行此应用
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">启动时最小化到托盘</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.startMinimized"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  应用启动时自动最小化到系统托盘
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 通知设置 -->
        <el-tab-pane label="通知" name="notifications">
          <div class="settings-section">
            <h3 class="section-title">通知设置</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">启用通知</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.notifications"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  允许应用发送系统通知
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">通知声音</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.notificationSound"
                    @change="saveSettings"
                    :disabled="!settings.notifications"
                  />
                </div>
                <div class="setting-description">
                  播放通知声音
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">任务完成通知</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.taskCompleteNotification"
                    @change="saveSettings"
                    :disabled="!settings.notifications"
                  />
                </div>
                <div class="setting-description">
                  任务完成时发送通知
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">系统状态通知</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.systemStatusNotification"
                    @change="saveSettings"
                    :disabled="!settings.notifications"
                  />
                </div>
                <div class="setting-description">
                  系统资源异常时发送通知
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">测试通知</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">发送测试通知</div>
                <div class="setting-control">
                  <el-button
                    type="primary"
                    @click="sendTestNotification"
                    :disabled="!settings.notifications"
                  >
                    发送测试通知
                  </el-button>
                </div>
                <div class="setting-description">
                  测试通知功能是否正常工作
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 数据设置 -->
        <el-tab-pane label="数据" name="data">
          <div class="settings-section">
            <h3 class="section-title">数据存储</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">数据保存路径</div>
                <div class="setting-control">
                  <el-input
                    v-model="settings.savePath"
                    placeholder="选择数据保存路径"
                    readonly
                    style="margin-right: 10px;"
                  />
                  <el-button @click="selectSavePath">
                    选择路径
                  </el-button>
                </div>
                <div class="setting-description">
                  应用数据的保存位置，默认为用户数据目录
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">自动备份</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.autoBackup"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  自动备份应用数据
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">备份间隔</div>
                <div class="setting-control">
                  <el-select
                    v-model="settings.backupInterval"
                    @change="saveSettings"
                    :disabled="!settings.autoBackup"
                  >
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </div>
                <div class="setting-description">
                  自动备份的时间间隔
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">数据管理</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">导出所有数据</div>
                <div class="setting-control">
                  <el-button type="success" @click="exportAllData">
                    <el-icon><Download /></el-icon>
                    导出数据
                  </el-button>
                </div>
                <div class="setting-description">
                  导出应用的所有数据到文件
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">导入数据</div>
                <div class="setting-control">
                  <el-button type="warning" @click="importData">
                    <el-icon><Upload /></el-icon>
                    导入数据
                  </el-button>
                </div>
                <div class="setting-description">
                  从文件导入应用数据
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">重置应用数据</div>
                <div class="setting-control">
                  <el-button type="danger" @click="resetData">
                    <el-icon><Delete /></el-icon>
                    重置数据
                  </el-button>
                </div>
                <div class="setting-description">
                  清除所有应用数据并恢复默认设置
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 更新设置 -->
        <el-tab-pane label="更新" name="updates">
          <div class="settings-section">
            <h3 class="section-title">自动更新</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">启用自动更新</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.autoUpdate"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  自动检查并下载应用更新
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">更新检查频率</div>
                <div class="setting-control">
                  <el-select
                    v-model="settings.updateCheckFrequency"
                    @change="saveSettings"
                    :disabled="!settings.autoUpdate"
                  >
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="启动时" value="startup" />
                    <el-option label="手动" value="manual" />
                  </el-select>
                </div>
                <div class="setting-description">
                  检查应用更新的频率
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">预发布版本</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.prereleaseUpdates"
                    @change="saveSettings"
                    :disabled="!settings.autoUpdate"
                  />
                </div>
                <div class="setting-description">
                  接收预发布版本更新（可能不稳定）
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">更新操作</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">检查更新</div>
                <div class="setting-control">
                  <el-button type="primary" @click="checkForUpdates">
                    <el-icon><Refresh /></el-icon>
                    立即检查更新
                  </el-button>
                </div>
                <div class="setting-description">
                  手动检查应用更新
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">当前版本</div>
                <div class="setting-control">
                  <el-tag type="info">{{ currentVersion }}</el-tag>
                </div>
                <div class="setting-description">
                  当前安装的应用版本
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">最后检查时间</div>
                <div class="setting-control">
                  <span class="last-check-time">{{ lastUpdateCheck || '从未检查' }}</span>
                </div>
                <div class="setting-description">
                  上次检查更新的时间
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 高级设置 -->
        <el-tab-pane label="高级" name="advanced">
          <div class="settings-section">
            <h3 class="section-title">开发者选项</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">开发者工具</div>
                <div class="setting-control">
                  <el-button type="primary" @click="openDevTools">
                    <el-icon><Tools /></el-icon>
                    打开开发者工具
                  </el-button>
                </div>
                <div class="setting-description">
                  打开浏览器开发者工具进行调试
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">日志级别</div>
                <div class="setting-control">
                  <el-select v-model="settings.logLevel" @change="saveSettings">
                    <el-option label="错误" value="error" />
                    <el-option label="警告" value="warn" />
                    <el-option label="信息" value="info" />
                    <el-option label="调试" value="debug" />
                  </el-select>
                </div>
                <div class="setting-description">
                  控制应用日志的详细程度
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">性能监控</div>
                <div class="setting-control">
                  <el-switch
                    v-model="settings.performanceMonitoring"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  启用性能监控和报告
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">网络设置</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">代理设置</div>
                <div class="setting-control">
                  <el-input
                    v-model="settings.proxy"
                    placeholder="例如: http://proxy.example.com:8080"
                    @change="saveSettings"
                  />
                </div>
                <div class="setting-description">
                  设置网络代理服务器
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">连接超时</div>
                <div class="setting-control">
                  <el-input-number
                    v-model="settings.connectionTimeout"
                    :min="1"
                    :max="60"
                    @change="saveSettings"
                  />
                  <span style="margin-left: 10px;">秒</span>
                </div>
                <div class="setting-description">
                  网络连接超时时间
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-section">
            <h3 class="section-title">应用维护</h3>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-label">清理缓存</div>
                <div class="setting-control">
                  <el-button type="warning" @click="clearCache">
                    <el-icon><Delete /></el-icon>
                    清理应用缓存
                  </el-button>
                </div>
                <div class="setting-description">
                  清理临时文件和缓存数据
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">重启应用</div>
                <div class="setting-control">
                  <el-button type="info" @click="restartApp">
                    <el-icon><RefreshRight /></el-icon>
                    重启应用
                  </el-button>
                </div>
                <div class="setting-description">
                  重启应用以应用所有设置更改
                </div>
              </div>
              
              <div class="setting-item">
                <div class="setting-label">重置所有设置</div>
                <div class="setting-control">
                  <el-button type="danger" @click="resetAllSettings">
                    <el-icon><Warning /></el-icon>
                    重置所有设置
                  </el-button>
                </div>
                <div class="setting-description">
                  恢复所有设置为默认值
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 底部操作栏 -->
    <div class="settings-footer">
      <el-button type="primary" @click="saveAllSettings">
        <el-icon><Check /></el-icon>
        保存所有设置
      </el-button>
      
      <el-button @click="cancelChanges">
        <el-icon><Close /></el-icon>
        取消
      </el-button>
      
      <el-button type="info" @click="resetToDefaults">
        <el-icon><Refresh /></el-icon>
        恢复默认设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Upload,
  Delete,
  Refresh,
  Tools,
  RefreshRight,
  Warning,
  Check,
  Close
} from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()

// 响应式数据
const activeTab = ref('general')

// 设置数据
const settings = reactive({
  // 通用设置
  theme: 'light',
  language: 'zh-CN',
  autoStart: false,
  startMinimized: false,
  
  // 通知设置
  notifications: true,
  notificationSound: true,
  taskCompleteNotification: true,
  systemStatusNotification: true,
  
  // 数据设置
  savePath: '',
  autoBackup: false,
  backupInterval: 'daily',
  
  // 更新设置
  autoUpdate: true,
  updateCheckFrequency: 'daily',
  prereleaseUpdates: false,
  
  // 高级设置
  logLevel: 'info',
  performanceMonitoring: false,
  proxy: '',
  connectionTimeout: 30
})

// 其他数据
const currentVersion = ref('1.0.0')
const lastUpdateCheck = ref<string | null>(null)
const originalSettings = ref({})

// 方法
const saveSettings = async () => {
  try {
    await systemStore.saveSettings()
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败: ' + error)
  }
}

const saveAllSettings = async () => {
  try {
    await systemStore.saveSettings()
    ElMessage.success('所有设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败: ' + error)
  }
}

const cancelChanges = () => {
  // 恢复原始设置
  Object.assign(settings, originalSettings.value)
  ElMessage.info('已取消更改')
}

const resetToDefaults = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要恢复所有设置为默认值吗？这将会丢失所有自定义设置。',
      '恢复默认设置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 恢复默认设置
    const defaults = {
      theme: 'light',
      language: 'zh-CN',
      autoStart: false,
      startMinimized: false,
      notifications: true,
      notificationSound: true,
      taskCompleteNotification: true,
      systemStatusNotification: true,
      savePath: '',
      autoBackup: false,
      backupInterval: 'daily',
      autoUpdate: true,
      updateCheckFrequency: 'daily',
      prereleaseUpdates: false,
      logLevel: 'info',
      performanceMonitoring: false,
      proxy: '',
      connectionTimeout: 30
    }
    
    Object.assign(settings, defaults)
    await systemStore.saveSettings()
    ElMessage.success('已恢复默认设置')
  } catch {
    // 用户取消操作
  }
}

const selectSavePath = async () => {
  const path = await systemStore.selectSavePath()
  if (path) {
    settings.savePath = path
    await saveSettings()
  }
}

const sendTestNotification = async () => {
  try {
    await systemStore.sendNotification(
      '测试通知',
      '这是一个测试通知，用于验证通知功能是否正常工作。'
    )
    ElMessage.success('测试通知已发送')
  } catch (error) {
    ElMessage.error('发送测试通知失败: ' + error)
  }
}

const exportAllData = async () => {
  try {
    const data = {
      settings: settings,
      exportTime: new Date().toISOString(),
      version: currentVersion.value
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const result = await window.electronAPI.fs.saveDialog({
      defaultPath: `electron_vue_app_backup_${Date.now()}.json`,
      filters: [{ name: 'JSON文件', extensions: ['json'] }]
    })
    
    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.fs.writeFile(result.filePath, dataStr)
      if (writeResult.success) {
        ElMessage.success('数据导出成功')
      } else {
        ElMessage.error('导出失败: ' + writeResult.error)
      }
    }
  } catch (error) {
    ElMessage.error('导出数据失败: ' + error)
  }
}

const importData = async () => {
  try {
    const result = await window.electronAPI.fs.openDialog({
      filters: [{ name: 'JSON文件', extensions: ['json'] }],
      properties: ['openFile']
    })
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0]
      const readResult = await window.electronAPI.fs.readFile(filePath)
      
      if (readResult.success && readResult.content) {
        const importedData = JSON.parse(readResult.content)
        
        // 验证导入的数据
        if (importedData.settings) {
          await ElMessageBox.confirm(
            '确定要导入数据吗？这将会覆盖当前设置。',
            '导入数据确认',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          
          Object.assign(settings, importedData.settings)
          await saveSettings()
          ElMessage.success('数据导入成功')
        } else {
          ElMessage.error('导入的文件格式不正确')
        }
      }
    }
  } catch (error) {
    ElMessage.error('导入数据失败: ' + error)
  }
}

const resetData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有应用数据吗？这将会清除所有待办事项和设置，操作不可恢复。',
      '重置数据确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 这里可以添加重置数据的逻辑
    ElMessage.success('数据重置功能待实现')
  } catch {
    // 用户取消操作
  }
}

const checkForUpdates = () => {
  ElMessage.info('检查更新功能待实现')
  lastUpdateCheck.value = new Date().toLocaleString('zh-CN')
}

const openDevTools = () => {
  window.electronAPI.app.openDevTools()
  ElMessage.info('开发者工具已打开')
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

const resetAllSettings = async () => {
  await resetToDefaults()
}

// 生命周期
onMounted(async () => {
  // 加载当前设置
  await systemStore.loadSettings()
  Object.assign(settings, systemStore.settings)
  
  // 保存原始设置用于取消操作
  originalSettings.value = { ...settings }
  
  // 获取当前版本
  const systemInfo = await window.electronAPI.system.getInfo()
  currentVersion.value = systemInfo.appVersion || '1.0.0'
})
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.settings-header {
  margin-bottom: 30px;
}

.settings-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0 0 10px 0;
}

.settings-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.settings-content {
  margin-bottom: 30px;
}

.settings-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--el-border-color);
}

.settings-group {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
}

.setting-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-label {
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.setting-control {
  margin-bottom: 8px;
}

.setting-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.last-check-time {
  color: var(--el-text-color-primary);
  font-weight: bold;
}

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
}
</style>