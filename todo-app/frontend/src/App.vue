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

      <!-- 待办事项管理 -->
      <div v-else>
        <!-- 添加待办事项 -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 class="text-xl font-bold mb-4">添加新待办事项</h2>
          <form @submit.prevent="addTodo" class="space-y-4">
            <div>
              <input v-model="newTodo.title" type="text" class="form-input" placeholder="请输入待办事项标题" required>
            </div>
            <div>
              <textarea v-model="newTodo.description" class="form-input" rows="3" placeholder="请输入描述（可选）"></textarea>
            </div>
            <button type="submit" class="btn bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              添加
            </button>
          </form>
        </div>

        <!-- 筛选和统计 -->
        <div class="flex flex-wrap justify-between items-center mb-6">
          <div class="flex space-x-2 mb-4 md:mb-0">
            <button @click="filter = 'all'" :class="['btn px-4 py-2 rounded-lg', filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700']">
              全部 ({{ todos.length }})
            </button>
            <button @click="filter = 'active'" :class="['btn px-4 py-2 rounded-lg', filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700']">
              进行中 ({{ activeTodos.length }})
            </button>
            <button @click="filter = 'completed'" :class="['btn px-4 py-2 rounded-lg', filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700']">
              已完成 ({{ completedTodos.length }})
            </button>
          </div>
          
          <div v-if="loading" class="loading-spinner"></div>
        </div>

        <!-- 待办事项列表 -->
        <div class="space-y-4">
          <div v-if="filteredTodos.length === 0" class="text-center py-8 text-gray-500">
            <i class="fas fa-clipboard-list text-4xl mb-4"></i>
            <p>暂无待办事项</p>
          </div>
          
          <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item bg-white rounded-lg shadow p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <input type="checkbox" :checked="todo.completed" @change="toggleTodo(todo)" class="mr-3 h-5 w-5">
                  <h3 :class="['text-lg font-medium', todo.completed ? 'completed' : 'text-gray-800']">
                    {{ todo.title }}
                  </h3>
                </div>
                <p v-if="todo.description" class="mt-2 text-gray-600">{{ todo.description }}</p>
                <p class="mt-2 text-sm text-gray-500">
                  <i class="far fa-clock mr-1"></i>
                  创建于：{{ formatDate(todo.created_at) }}
                </p>
              </div>
              
              <div class="todo-actions flex space-x-2 ml-4">
                <button @click="editTodo(todo)" class="btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTodo(todo.id)" class="btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑模态框 -->
    <div v-if="editingTodo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">编辑待办事项</h2>
        <form @submit.prevent="updateTodo">
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 mb-2">标题</label>
              <input v-model="editingTodo.title" type="text" class="form-input" required>
            </div>
            <div>
              <label class="block text-gray-700 mb-2">描述</label>
              <textarea v-model="editingTodo.description" class="form-input" rows="3"></textarea>
            </div>
            <div class="flex items-center">
              <input v-model="editingTodo.completed" type="checkbox" id="completed" class="mr-2">
              <label for="completed" class="text-gray-700">已完成</label>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="editingTodo = null" class="btn bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">
              取消
            </button>
            <button type="submit" class="btn bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { authAPI, todoAPI } from './services/api'

// 响应式数据
const currentUser = ref(null)
const isLoginMode = ref(true)
const authForm = ref({ name: '', email: '', password: '' })
const todos = ref([])
const newTodo = ref({ title: '', description: '' })
const filter = ref('all')
const loading = ref(false)
const editingTodo = ref(null)

// 计算属性
const activeTodos = computed(() => todos.value.filter(todo => !todo.completed))
const completedTodos = computed(() => todos.value.filter(todo => todo.completed))
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'active': return activeTodos.value
    case 'completed': return completedTodos.value
    default: return todos.value
  }
})

// 方法
const toggleAuthMode = () => {
  isLoginMode.value = !isLoginMode.value
  authForm.value = { name: '', email: '', password: '' }
}

const handleAuth = async () => {
  try {
    loading.value = true
    const apiMethod = isLoginMode.value ? authAPI.login : authAPI.register
    const response = await apiMethod(authForm.value)
    
    if (response.user) {
      currentUser.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
      loadTodos()
    }
    
    alert(response.message)
  } catch (error) {
    alert(error.error || '操作失败')
  } finally {
    loading.value = false
  }
}

const logout = () => {
  currentUser.value = null
  localStorage.removeItem('user')
  todos.value = []
}

const loadTodos = async () => {
  if (!currentUser.value) return
  
  try {
    loading.value = true
    const response = await todoAPI.getAll(currentUser.value.id, filter.value)
    todos.value = response.todos || []
  } catch (error) {
    console.error('加载待办事项失败:', error)
  } finally {
    loading.value = false
  }
}

const addTodo = async () => {
  if (!newTodo.value.title.trim()) return
  
  try {
    const response = await todoAPI.create(currentUser.value.id, newTodo.value)
    alert(response.message)
    newTodo.value = { title: '', description: '' }
    loadTodos()
  } catch (error) {
    alert(error.error || '添加失败')
  }
}

const toggleTodo = async (todo) => {
  try {
    await todoAPI.update(currentUser.value.id, todo.id, {
      completed: !todo.completed
    })
    loadTodos()
  } catch (error) {
    alert(error.error || '更新失败')
  }
}

const editTodo = (todo) => {
  editingTodo.value = { ...todo }
}

const updateTodo = async () => {
  if (!editingTodo.value) return
  
  try {
    await todoAPI.update(currentUser.value.id, editingTodo.value.id, editingTodo.value)
    editingTodo.value = null
    loadTodos()
  } catch (error) {
    alert(error.error || '更新失败')
  }
}

const deleteTodo = async (id) => {
  if (!confirm('确定要删除这个待办事项吗？')) return
  
  try {
    await todoAPI.delete(currentUser.value.id, id)
    loadTodos()
  } catch (error) {
    alert(error.error || '删除失败')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 生命周期钩子
onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
    loadTodos()
  }
})

// 监听筛选变化
watch(filter, loadTodos)
</script>