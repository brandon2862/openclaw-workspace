<template>
  <div class="todo-view">
    <!-- 标题和操作栏 -->
    <div class="todo-header">
      <h1 class="todo-title">待办事项管理</h1>
      <div class="todo-actions">
        <el-button
          type="primary"
          @click="showAddDialog = true"
          :icon="Plus"
        >
          新建任务
        </el-button>
        
        <el-button
          type="success"
          @click="todoStore.importTodos()"
          :icon="Upload"
        >
          导入
        </el-button>
        
        <el-button
          type="warning"
          @click="todoStore.exportTodos()"
          :icon="Download"
        >
          导出
        </el-button>
        
        <el-button
          type="danger"
          @click="handleClearCompleted"
          :icon="Delete"
          :disabled="!hasCompleted"
        >
          清空已完成
        </el-button>
      </div>
    </div>
    
    <!-- 筛选和搜索 -->
    <div class="todo-filters">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">显示已完成:</span>
            <el-switch
              v-model="todoStore.filters.showCompleted"
              @change="todoStore.saveTodos()"
            />
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">优先级筛选:</span>
            <el-select
              v-model="todoStore.filters.priority"
              placeholder="全部"
              size="small"
              @change="todoStore.saveTodos()"
            >
              <el-option label="全部" value="all" />
              <el-option label="高" value="high" />
              <el-option label="中" value="medium" />
              <el-option label="低" value="low" />
            </el-select>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="filter-item">
            <span class="filter-label">搜索:</span>
            <el-input
              v-model="todoStore.filters.searchText"
              placeholder="搜索任务标题、描述或标签"
              size="small"
              :prefix-icon="Search"
              clearable
              @input="todoStore.saveTodos()"
            />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 统计信息 -->
    <div class="todo-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="总任务数" :value="todoStats.total" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="已完成" :value="todoStats.completed">
            <template #suffix">/{{ todoStats.total }}</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="完成率" :value="todoStats.completionRate">
            <template #suffix>%</template>
          </el-statistic>
        </el-col>
        <el-col :span="6">
          <el-statistic title="高优先级" :value="todoStats.byPriority.high" />
        </el-col>
      </el-row>
    </div>
    
    <!-- 待办事项列表 -->
    <div class="todo-list">
      <el-table
        :data="filteredTodos"
        style="width: 100%"
        empty-text="暂无待办事项"
        v-loading="todoStore.isLoading"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="completed" label="状态" width="80">
          <template #default="{ row }">
            <el-checkbox
              v-model="row.completed"
              @change="todoStore.toggleTodo(row.id)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="标题" width="200">
          <template #default="{ row }">
            <div class="todo-item-title">
              <span :class="{ 'completed-text': row.completed }">{{ row.title }}</span>
              <el-tag
                v-if="row.tags && row.tags.length > 0"
                v-for="tag in row.tags.slice(0, 2)"
                :key="tag"
                size="small"
                type="info"
                class="todo-tag"
              >
                {{ tag }}
              </el-tag>
              <el-tag
                v-if="row.tags && row.tags.length > 2"
                size="small"
                type="info"
              >
                +{{ row.tags.length - 2 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag
              :type="priorityType(row.priority)"
              size="small"
              effect="dark"
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
        
        <el-table-column prop="dueDate" label="截止日期" width="120">
          <template #default="{ row }">
            <span v-if="row.dueDate" :class="{ 'overdue': isOverdue(row.dueDate) }">
              {{ formatShortDate(row.dueDate) }}
            </span>
            <span v-else class="no-due-date">未设置</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingTodo ? '编辑任务' : '新建任务'"
      width="500px"
      @closed="resetForm"
    >
      <el-form
        ref="todoFormRef"
        :model="todoForm"
        :rules="todoRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="todoForm.title"
            placeholder="请输入任务标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="todoForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="todoForm.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="todoForm.dueDate"
            type="date"
            placeholder="选择截止日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="标签">
          <el-select
            v-model="todoForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="添加标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ editingTodo ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Upload,
  Download,
  Delete,
  Search,
  Edit
} from '@element-plus/icons-vue'
import { useTodoStore } from '@/stores/todo'
import type { TodoItem } from '@/stores/todo'

const todoStore = useTodoStore()

// 响应式数据
const showAddDialog = ref(false)
const editingTodo = ref<TodoItem | null>(null)
const todoFormRef = ref<FormInstance>()

// 表单数据
const todoForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as TodoItem['priority'],
  dueDate: '',
  tags: [] as string[]
})

// 表单验证规则
const todoRules: FormRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 常用标签
const commonTags = ['工作', '学习', '个人', '紧急', '重要', '日常']

// 计算属性
const filteredTodos = computed(() => todoStore.filteredTodos())
const todoStats = computed(() => todoStore.getStats())
const hasCompleted = computed(() => todoStats.value.completed > 0)

// 方法
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

const formatShortDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const isOverdue = (dueDate: Date) => {
  const now = new Date()
  const due = new Date(dueDate)
  return due < now
}

const handleEdit = (todo: TodoItem) => {
  editingTodo.value = todo
  todoForm.title = todo.title
  todoForm.description = todo.description
  todoForm.priority = todo.priority
  todoForm.dueDate = todo.dueDate ? formatShortDate(todo.dueDate) : ''
  todoForm.tags = [...todo.tags]
  showAddDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个任务吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    todoStore.deleteTodo(id)
    ElMessage.success('任务已删除')
  } catch {
    // 用户取消删除
  }
}

const handleClearCompleted = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有已完成的任务吗？',
      '清空确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    todoStore.clearCompleted()
    ElMessage.success('已完成任务已清空')
  } catch {
    // 用户取消清空
  }
}

const resetForm = () => {
  editingTodo.value = null
  todoForm.title = ''
  todoForm.description = ''
  todoForm.priority = 'medium'
  todoForm.dueDate = ''
  todoForm.tags = []
  
  if (todoFormRef.value) {
    todoFormRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!todoFormRef.value) return
  
  try {
    await todoFormRef.value.validate()
    
    if (editingTodo.value) {
      // 更新现有任务
      const updates: Partial<TodoItem> = {
        title: todoForm.title,
        description: todoForm.description,
        priority: todoForm.priority,
        tags: todoForm.tags
      }
      
      if (todoForm.dueDate) {
        updates.dueDate = new Date(todoForm.dueDate)
      }
      
      todoStore.updateTodo(editingTodo.value.id, updates)
      ElMessage.success('任务已更新')
    } else {
      // 创建新任务
      const newTodo = todoStore.addTodo(
        todoForm.title,
        todoForm.description,
        todoForm.priority
      )
      
      // 更新标签和截止日期
      if (todoForm.tags.length > 0 || todoForm.dueDate) {
        const updates: Partial<TodoItem> = {
          tags: todoForm.tags
        }
        
        if (todoForm.dueDate) {
          updates.dueDate = new Date(todoForm.dueDate)
        }
        
        todoStore.updateTodo(newTodo.id, updates)
      }
      
      ElMessage.success('任务已创建')
    }
    
    showAddDialog.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.todo-view {
  padding: 20px;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.todo-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0;
}

.todo-actions {
  display: flex;
  gap: 10px;
}

.todo-filters {
  background-color: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  white-space: nowrap;
}

.todo-stats {
  margin-bottom: 20px;
}

.todo-list {
  margin-bottom: 20px;
}

.todo-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.completed-text {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
}

.todo-tag {
  margin-right: 4px;
}

.overdue {
  color: var(--el-color-danger);
  font-weight: bold;
}

.no-due-date {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>