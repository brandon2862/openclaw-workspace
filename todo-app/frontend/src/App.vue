<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-600">
            <i class="fas fa-tasks mr-2"></i>待办事项应用
          </h1>
          <div v-if="currentUser" class="flex items-center space-x-4">
            <span class="text-gray-700">欢迎，{{ currentUser.name }}</span>
            <button @click="logout" class="btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="container mx-auto px-4 py-8">
      <!-- 登录/注册表单 -->
      <div v-if="!currentUser" class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-6 text-center">{{ isLoginMode ? '登录' : '注册' }}</h2>
          
          <form @submit.prevent="handleAuth" class="space-y-4">
            <div v-if="!isLoginMode">
              <label class="block text-gray-700 mb-2">姓名</label>
              <input v-model="authForm.name" type="text" class="form-input" placeholder="请输入姓名" required>
            </div>
            
            <div>
              <label class="block text-gray-700 mb-2">邮箱</label>
              <input v-model="authForm.email" type="email" class="form-input" placeholder="请输入邮箱" required>
            </div>
            
            <div>
              <label class="block text-gray-700 mb-2">密码</label>
              <input v-model="authForm.password" type="password" class="form-input" placeholder="请输入密码" required>
            </div>
            
            <button type="submit" class="btn w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              {{ isLoginMode ? '登录' : '注册' }}
            </button>
          </form>
          
          <p class="mt-4 text-center text-gray-600">
            {{ isLoginMode ? '还没有账号？' : '已有账号？' }}
            <button @click="toggleAuthMode" class="text-blue-500 hover:underline">
              {{ isLoginMode ? '立即注册' : '立即登录' }}
            </button>
          </p>
        </div>
      </div>

      <!-- 待办事项列表 -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- 添加新待办 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">添加新待办</h2>
          <form @submit.prevent="addTodo" class="flex gap-4">
            <input v-model="newTodo" type="text" class="form-input flex-1" placeholder="请输入待办事项..." required>
            <select v-model="newPriority" class="form-input w-32">
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
            <button type="submit" class="btn bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
              添加
            </button>
          </form>
        </div>

        <!-- 筛选和统计 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">我的待办</h2>
            <div class="flex gap-4">
              <select v-model="filter" class="form-input">
                <option value="all">全部</option>
                <option value="pending">未完成</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          
          <!-- 统计 -->
          <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-blue-600">{{ todos.length }}</div>
              <div class="text-gray-600">总待办</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
              <div class="text-gray-600">已完成</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ pendingCount }}</div>
              <div class="text-gray-600">进行中</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-red-600">{{ highPriorityCount }}</div>
              <div class="text-gray-600">高优先级</div>
            </div>
          </div>

          <!-- 待办列表 -->
          <div class="space-y-3">
            <div v-for="todo in filteredTodos" :key="todo.id" 
                 class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                 :class="{ 'line-through opacity-50': todo.completed }">
              <input type="checkbox" v-model="todo.completed" @change="toggleTodo(todo)" 
                     class="w-5 h-5 text-blue-600 rounded">
              <div class="flex-1">
                <div class="font-medium" :class="{ 'line-through text-gray-400': todo.completed }">
                  {{ todo.title }}
                </div>
                <div class="text-sm text-gray-500">
                  创建于：{{ formatDate(todo.created_at) }}
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-sm"
                    :class="{
                      'bg-red-100 text-red-700': todo.priority === 'high',
                      'bg-yellow-100 text-yellow-700': todo.priority === 'medium',
                      'bg-green-100 text-green-700': todo.priority === 'low'
                    }">
                {{ getPriorityText(todo.priority) }}
              </span>
              <button @click="deleteTodo(todo.id)" class="btn text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            
            <div v-if="filteredTodos.length === 0" class="text-center py-8 text-gray-500">
              暂无待办事项
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const currentUser = ref(null)
    const isLoginMode = ref(true)
    const authForm = ref({
      name: '',
      email: '',
      password: ''
    })
    const todos = ref([])
    const newTodo = ref('')
    const newPriority = ref('medium')
    const filter = ref('all')

    // 加载用户和待办
    onMounted(() => {
      const user = localStorage.getItem('user')
      if (user) {
        currentUser.value = JSON.parse(user)
        loadTodos()
      }
    })

    const loadTodos = () => {
      const stored = localStorage.getItem('todos_' + currentUser.value.email)
      todos.value = stored ? JSON.parse(stored) : []
    }

    const saveTodos = () => {
      localStorage.setItem('todos_' + currentUser.value.email, JSON.stringify(todos.value))
    }

    const handleAuth = () => {
      if (!authForm.value.email || !authForm.value.password) {
        alert('请填写完整信息')
        return
      }
      
      if (!isLoginMode.value && !authForm.value.name) {
        alert('请填写姓名')
        return
      }
      
      // 简单模拟登录/注册
      const user = {
        id: Date.now(),
        name: authForm.value.name || authForm.value.email.split('@')[0],
        email: authForm.value.email
      }
      localStorage.setItem('user', JSON.stringify(user))
      currentUser.value = user
      
      loadTodos()
    }

    const logout = () => {
      localStorage.removeItem('user')
      currentUser.value = null
    }

    const toggleAuthMode = () => {
      isLoginMode.value = !isLoginMode.value
    }

    const addTodo = () => {
      if (!newTodo.value.trim()) return
      
      todos.value.unshift({
        id: Date.now(),
        title: newTodo.value,
        priority: newPriority.value,
        completed: false,
        created_at: new Date().toISOString()
      })
      
      saveTodos()
      newTodo.value = ''
      newPriority.value = 'medium'
    }

    const toggleTodo = (todo) => {
      saveTodos()
    }

    const deleteTodo = (id) => {
      if (confirm('确定删除这条待办吗？')) {
        todos.value = todos.value.filter(t => t.id !== id)
        saveTodos()
      }
    }

    const filteredTodos = computed(() => {
      if (filter.value === 'all') return todos.value
      if (filter.value === 'pending') return todos.value.filter(t => !t.completed)
      if (filter.value === 'completed') return todos.value.filter(t => t.completed)
      return todos.value
    })

    const completedCount = computed(() => todos.value.filter(t => t.completed).length)
    const pendingCount = computed(() => todos.value.filter(t => !t.completed).length)
    const highPriorityCount = computed(() => todos.value.filter(t => t.priority === 'high' && !t.completed).length)

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN')
    }

    const getPriorityText = (priority) => {
      const map = { high: '高', medium: '中', low: '低' }
      return map[priority] || priority
    }

    return {
      currentUser,
      isLoginMode,
      authForm,
      handleAuth,
      logout,
      toggleAuthMode,
      todos,
      newTodo,
      newPriority,
      filter,
      addTodo,
      toggleTodo,
      deleteTodo,
      filteredTodos,
      completedCount,
      pendingCount,
      highPriorityCount,
      formatDate,
      getPriorityText
    }
  }
}
</script>