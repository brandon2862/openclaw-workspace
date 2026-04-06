import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import TodoView from '@/views/TodoView.vue'
import SystemView from '@/views/SystemView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: '仪表盘' }
    },
    {
      path: '/todo',
      name: 'todo',
      component: TodoView,
      meta: { title: '待办事项' }
    },
    {
      path: '/system',
      name: 'system',
      component: SystemView,
      meta: { title: '系统信息' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { title: '设置' }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { title: '关于' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 可以在这里添加权限检查、页面跟踪等逻辑
  console.log(`Navigating from ${from.path} to ${to.path}`)
  next()
})

export default router