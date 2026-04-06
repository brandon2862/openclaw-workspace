# 性能优化建议

## 概述

本文档提供了 Electron Vue App 的性能优化建议，涵盖应用启动、运行时性能、内存使用和打包优化等方面。

## 应用启动优化

### 1. 减少启动时间

**问题：** 应用启动缓慢，用户等待时间长

**解决方案：**
```typescript
// 1. 延迟加载非关键模块
const lazyModule = () => import('./HeavyModule.vue')

// 2. 优化主进程初始化
app.whenReady().then(() => {
  // 先创建窗口，再加载内容
  createWindow()
  
  // 延迟加载非关键功能
  setTimeout(() => {
    initializeNonCriticalFeatures()
  }, 1000)
})

// 3. 使用应用就绪事件
mainWindow.once('ready-to-show', () => {
  mainWindow.show()
})
```

**优化效果：** 启动时间减少 30-50%

### 2. 预加载优化

**问题：** 预加载脚本执行时间过长

**解决方案：**
```typescript
// 1. 按需暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露必要的 API
  essential: {
    // 启动时必需的 API
  },
  
  // 延迟暴露非必需 API
  lazy: {
    get() {
      return {
        // 非必需的 API
      }
    }
  }
})

// 2. 压缩预加载脚本
// 使用 terser 或 esbuild 压缩
```

## 运行时性能优化

### 1. 渲染性能

**问题：** 界面卡顿，响应缓慢

**解决方案：**

#### Vue 组件优化
```vue
<template>
  <!-- 1. 使用 v-once 静态内容 -->
  <div v-once>{{ staticContent }}</div>
  
  <!-- 2. 使用 computed 缓存计算 -->
  <div>{{ computedValue }}</div>
  
  <!-- 3. 避免在模板中使用复杂表达式 -->
  <!-- 不好 -->
  <div>{{ data.filter(x => x.active).map(x => x.name).join(', ') }}</div>
  
  <!-- 好 -->
  <div>{{ activeNames }}</div>
</template>

<script setup>
import { computed } from 'vue'

// 缓存计算结果
const activeNames = computed(() => {
  return data.value
    .filter(x => x.active)
    .map(x => x.name)
    .join(', ')
})
</script>
```

#### 列表渲染优化
```vue
<template>
  <!-- 1. 使用 key 属性 -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- 2. 大数据列表使用虚拟滚动 -->
  <VirtualList :items="largeList" />
  
  <!-- 3. 分页加载 -->
  <Pagination :total="totalItems" @change="loadPage" />
</template>
```

#### 事件处理优化
```vue
<script setup>
import { debounce, throttle } from 'lodash-es'

// 1. 防抖处理频繁事件
const handleSearch = debounce((query) => {
  searchItems(query)
}, 300)

// 2. 节流处理滚动等事件
const handleScroll = throttle(() => {
  updateScrollPosition()
}, 100)

// 3. 及时清理事件监听器
onUnmounted(() => {
  handleSearch.cancel()
  handleScroll.cancel()
})
</script>
```

### 2. 内存管理

**问题：** 内存使用持续增长，可能导致崩溃

**解决方案：**

#### 内存泄漏检测
```typescript
// 1. 监控内存使用
setInterval(() => {
  const memory = process.memoryUsage()
  console.log('内存使用:', {
    rss: formatBytes(memory.rss),
    heapTotal: formatBytes(memory.heapTotal),
    heapUsed: formatBytes(memory.heapUsed)
  })
}, 30000)

// 2. 使用 Chrome DevTools Memory 面板
// - 拍摄堆快照
// - 比较快照查找泄漏
// - 查看对象分配时间线
```

#### 资源清理
```typescript
// 1. 清理事件监听器
const cleanup = () => {
  ipcRenderer.removeAllListeners('event-name')
  window.removeEventListener('resize', handleResize)
  clearInterval(timerId)
}

// 2. 清理 DOM 引用
const elements = new WeakMap()

// 3. 清理缓存数据
const cache = new Map()
const MAX_CACHE_SIZE = 100

function addToCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    // 移除最旧的条目
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
  }
  cache.set(key, value)
}
```

#### 图片和资源优化
```typescript
// 1. 图片懒加载
<img v-lazy="imageUrl" />

// 2. 使用 WebP 格式（如果支持）
const supportsWebP = await checkWebPSupport()
const imageFormat = supportsWebP ? 'webp' : 'png'

// 3. 图片压缩
// 使用 sharp 或 imagemin 压缩图片
```

### 3. CPU 使用优化

**问题：** CPU 使用率过高，导致系统卡顿

**解决方案：**

#### 计算任务优化
```typescript
// 1. 使用 Web Worker 处理复杂计算
const worker = new Worker('worker.js')
worker.postMessage({ data: largeDataSet })
worker.onmessage = (event) => {
  // 处理结果
}

// 2. 批量更新
const batchUpdate = (updates) => {
  // 合并多个更新为一次
  nextTick(() => {
    applyUpdates(updates)
  })
}

// 3. 避免频繁的布局重排
// 使用 transform 和 opacity 进行动画
.element {
  transform: translateX(100px);
  opacity: 0.5;
  /* 而不是 */
  /* left: 100px; */
}
```

#### 动画优化
```css
/* 使用 GPU 加速 */
.animated {
  transform: translateZ(0);
  will-change: transform;
}

/* 使用 requestAnimationFrame */
function animate() {
  // 更新动画
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)
```

## 打包优化

### 1. 构建优化

**问题：** 打包文件过大，加载缓慢

**解决方案：**

#### Webpack/Vite 配置优化
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    // 1. 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          charts: ['echarts']
        }
      }
    },
    
    // 2. 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 3. 资源内联阈值
    assetsInlineLimit: 4096, // 4KB 以下内联
    
    // 4. 启用 gzip 压缩
    reportCompressedSize: true
  }
})
```

#### 依赖优化
```bash
# 1. 分析包大小
npx vite-bundle-analyzer

# 2. 移除未使用的依赖
npm depcheck

# 3. 使用按需导入
import { ElButton } from 'element-plus'
```

#### 树摇优化
```typescript
// 1. 确保 package.json 有 sideEffects 配置
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}

// 2. 使用 ES 模块语法
import { specificFunction } from 'large-library'
// 而不是
import * as LargeLibrary from 'large-library'
```

### 2. 资源优化

**问题：** 资源文件过大，影响下载和加载速度

**解决方案：**

#### 图片优化
```bash
# 1. 使用图片压缩工具
npm install -D imagemin imagemin-webp

# 2. 生成多种尺寸
# - 原图: 1920x1080
# - 大图: 1280x720
# - 中图: 640x360
# - 小图: 320x180
```

#### 字体优化
```css
/* 1. 使用系统字体 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 2. 字体子集化 */
/* 只包含使用的字符 */

/* 3. 字体显示策略 */
@font-face {
  font-display: swap;
}
```

#### 代码分割
```typescript
// 1. 路由懒加载
const routes = [
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue')
  }
]

// 2. 组件懒加载
const LazyComponent = defineAsyncComponent(() =>
  import('@/components/LazyComponent.vue')
)

// 3. 动态导入
const loadFeature = async () => {
  const { feature } = await import('@/features/advanced')
  return feature
}
```

## 监控和分析

### 1. 性能监控

**实现方案：**
```typescript
// 性能监控工具
class PerformanceMonitor {
  private metrics = new Map()
  
  startMeasure(name: string) {
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    })
  }
  
  endMeasure(name: string) {
    const metric = this.metrics.get(name)
    if (metric) {
      metric.end = performance.now()
      metric.duration = metric.end - metric.start
      
      // 报告性能数据
      this.reportMetric(name, metric)
    }
  }
  
  private reportMetric(name: string, metric: any) {
    // 发送到监控服务或记录到文件
    console.log(`[Performance] ${name}: ${metric.duration.toFixed(2)}ms`)
  }
}

// 使用示例
const monitor = new PerformanceMonitor()
monitor.startMeasure('app-startup')
// ... 初始化代码
monitor.endMeasure('app-startup')
```

### 2. 错误监控

**实现方案：**
```typescript
// 错误监控
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.error?.message,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  }
  
  // 发送错误报告
  sendErrorReport(errorInfo)
})

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
})
```

### 3. 用户行为分析

**实现方案：**
```typescript
// 用户行为跟踪
class UserAnalytics {
  trackEvent(eventName: string, properties = {}) {
    const eventData = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    }
    
    // 发送到分析服务
    this.sendAnalytics(eventData)
  }
  
  trackPageView(pageName: string) {
    this.trackEvent('page_view', { page: pageName })
  }
  
  trackPerformance(metricName: string, value: number) {
    this.trackEvent('performance', {
      metric: metricName,
      value: value
    })
  }
}
```

## 最佳实践总结

### 1. 开发阶段
- ✅ 使用性能分析工具定期检查
- ✅ 监控内存使用和泄漏
- ✅ 优化图片和资源加载
- ✅ 使用懒加载和代码分割

### 2. 构建阶段
- ✅ 启用代码压缩和优化
- ✅ 使用 Tree Shaking
- ✅ 生成 sourcemap 用于调试
- ✅ 分析包大小并优化

### 3. 运行时
- ✅ 监控关键性能指标
- ✅ 及时清理资源
- ✅ 优化用户交互响应
- ✅ 处理边缘情况和错误

### 4. 持续优化
- ✅ 收集用户反馈
- ✅ 分析性能数据
- ✅ 定期更新依赖
- ✅ 优化算法和数据结构

## 工具推荐

### 性能分析工具
1. **Chrome DevTools**
   - Performance 面板
   - Memory 面板
   - Lighthouse 审计

2. **Electron 特定工具**
   - [Electron Fiddle](https://www.electronjs.org/fiddle)
   - [Electron DevTools Extension](https://github.com/MarshallOfSound/electron-devtools-installer)

3. **Node.js 工具**
   - `node --inspect` 调试
   - Clinic.js 性能分析
   - 0x 火焰图生成

### 监控服务
1. **应用性能监控 (APM)**
   - Sentry
   - Datadog
   - New Relic

2. **错误监控**
   - Bugsnag
   - Rollbar
   - Airbrake

3. **用户分析**
   - Google Analytics
   - Mixpanel
   - Amplitude

## 性能指标目标

### 关键性能指标 (KPIs)
1. **启动时间**
   - 冷启动: < 3秒
   - 热启动: < 1秒

2. **内存使用**
   - 初始内存: < 200MB
   - 峰值内存: < 500MB
   - 内存泄漏: 无

3. **CPU 使用**
   - 空闲时: < 1%
   - 活动时: < 30%
   - 峰值: < 70%

4. **响应时间**
   - 用户交互: < 100ms
   - 数据加载: < 1秒
   - 页面切换: < 500ms

### 监控频率
- 实时监控: 关键指标
- 每日检查: 性能趋势
- 每周分析: 优化机会
- 每月报告: 性能总结

## 优化检查清单

### 启动优化
- [ ] 延迟加载非关键模块
- [ ] 优化预加载脚本
- [ ] 减少同步初始化
- [ ] 使用 ready-to-show 事件

### 运行时优化
- [ ] 实现虚拟滚动
- [ ] 使用防抖和节流
- [ ] 优化图片加载
- [ ] 清理事件监听器

### 内存优化
- [ ] 监控内存使用
- [ ] 实现资源清理
- [ ] 使用 WeakMap/WeakSet
- [ ] 优化缓存策略

### 构建优化
- [ ] 启用代码分割
- [ ] 使用 Tree Shaking
- [ ] 压缩资源文件
- [ ] 分析包大小

### 监控优化
- [ ] 实现性能监控
- [ ] 设置错误监控
- [ ] 收集用户反馈
- [ ] 定期性能审计

---

**最后更新：** 2024-01-01  
**文档版本：** 1.0.0