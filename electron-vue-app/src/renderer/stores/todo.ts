import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

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

export const useTodoStore = defineStore('todo', () => {
  // 待办事项列表
  const todos = ref<TodoItem[]>([])
  
  // 加载状态
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 筛选条件
  const filters = reactive({
    showCompleted: true,
    priority: 'all' as 'all' | 'low' | 'medium' | 'high',
    searchText: ''
  })
  
  /**
   * 生成唯一ID
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  /**
   * 添加待办事项
   */
  const addTodo = (title: string, description: string = '', priority: TodoItem['priority'] = 'medium') => {
    const now = new Date()
    const newTodo: TodoItem = {
      id: generateId(),
      title,
      description,
      completed: false,
      createdAt: now,
      updatedAt: now,
      priority,
      tags: []
    }
    
    todos.value.unshift(newTodo)
    saveTodos()
    
    return newTodo
  }
  
  /**
   * 更新待办事项
   */
  const updateTodo = (id: string, updates: Partial<TodoItem>) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      todos.value[index] = {
        ...todos.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveTodos()
    }
  }
  
  /**
   * 删除待办事项
   */
  const deleteTodo = (id: string) => {
    const index = todos.value.findIndex(todo => todo.id === id)
    if (index !== -1) {
      todos.value.splice(index, 1)
      saveTodos()
    }
  }
  
  /**
   * 切换完成状态
   */
  const toggleTodo = (id: string) => {
    const todo = todos.value.find(todo => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      todo.updatedAt = new Date()
      saveTodos()
    }
  }
  
  /**
   * 清空已完成事项
   */
  const clearCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.completed)
    saveTodos()
  }
  
  /**
   * 保存待办事项到文件
   */
  const saveTodos = async () => {
    try {
      const data = JSON.stringify(todos.value, null, 2)
      const savePath = localStorage.getItem('todoSavePath') || 'todos.json'
      
      const result = await window.electronAPI.fs.writeFile(savePath, data)
      if (!result.success) {
        console.error('Failed to save todos:', result.error)
      }
    } catch (err) {
      console.error('Failed to save todos:', err)
    }
  }
  
  /**
   * 从文件加载待办事项
   */
  const loadTodos = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const savePath = localStorage.getItem('todoSavePath') || 'todos.json'
      const existsResult = await window.electronAPI.fs.exists(savePath)
      
      if (existsResult.exists) {
        const result = await window.electronAPI.fs.readFile(savePath)
        if (result.success && result.content) {
          const loadedTodos = JSON.parse(result.content)
          
          // 转换日期字符串为Date对象
          todos.value = loadedTodos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
          }))
        }
      }
    } catch (err) {
      error.value = `加载待办事项失败: ${err}`
      console.error('Failed to load todos:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 导出待办事项
   */
  const exportTodos = async () => {
    try {
      const data = JSON.stringify(todos.value, null, 2)
      const result = await window.electronAPI.fs.saveDialog({
        defaultPath: 'todos_export.json',
        filters: [{ name: 'JSON文件', extensions: ['json'] }]
      })
      
      if (!result.canceled && result.filePath) {
        const writeResult = await window.electronAPI.fs.writeFile(result.filePath, data)
        return writeResult.success
      }
    } catch (err) {
      console.error('Failed to export todos:', err)
    }
    return false
  }
  
  /**
   * 导入待办事项
   */
  const importTodos = async () => {
    try {
      const result = await window.electronAPI.fs.openDialog({
        filters: [{ name: 'JSON文件', extensions: ['json'] }],
        properties: ['openFile']
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        const readResult = await window.electronAPI.fs.readFile(filePath)
        
        if (readResult.success && readResult.content) {
          const importedTodos = JSON.parse(readResult.content)
          
          // 转换日期字符串为Date对象
          todos.value = importedTodos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
          }))
          
          await saveTodos()
          return true
        }
      }
    } catch (err) {
      console.error('Failed to import todos:', err)
    }
    return false
  }
  
  /**
   * 获取筛选后的待办事项
   */
  const filteredTodos = () => {
    return todos.value.filter(todo => {
      // 筛选完成状态
      if (!filters.showCompleted && todo.completed) {
        return false
      }
      
      // 筛选优先级
      if (filters.priority !== 'all' && todo.priority !== filters.priority) {
        return false
      }
      
      // 搜索文本
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        return (
          todo.title.toLowerCase().includes(searchLower) ||
          todo.description.toLowerCase().includes(searchLower) ||
          todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      }
      
      return true
    })
  }
  
  /**
   * 获取统计信息
   */
  const getStats = () => {
    const total = todos.value.length
    const completed = todos.value.filter(todo => todo.completed).length
    const pending = total - completed
    
    const byPriority = {
      low: todos.value.filter(todo => todo.priority === 'low').length,
      medium: todos.value.filter(todo => todo.priority === 'medium').length,
      high: todos.value.filter(todo => todo.priority === 'high').length
    }
    
    return {
      total,
      completed,
      pending,
      byPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
  
  // 初始化时加载待办事项
  loadTodos()
  
  return {
    // 状态
    todos,
    filteredTodos,
    filters,
    isLoading,
    error,
    
    // 方法
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    saveTodos,
    loadTodos,
    exportTodos,
    importTodos,
    getStats
  }
})