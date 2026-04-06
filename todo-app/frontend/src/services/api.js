import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
api.interceptors.request.use(
    config => {
        // 这里可以添加token等认证信息
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response) {
            console.error('API Error:', error.response.data)
            return Promise.reject(error.response.data)
        } else if (error.request) {
            console.error('Network Error:', error.request)
            return Promise.reject({ error: '网络连接失败' })
        } else {
            console.error('Request Error:', error.message)
            return Promise.reject({ error: error.message })
        }
    }
)

// 认证相关API
export const authAPI = {
    register: (userData) => api.post('/register', userData),
    login: (credentials) => api.post('/login', credentials)
}

// 待办事项相关API
export const todoAPI = {
    getAll: (userId, status = 'all') => api.get(`/todos?user_id=${userId}&status=${status}`),
    getById: (userId, id) => api.get(`/todos/${id}?user_id=${userId}`),
    create: (userId, todo) => api.post(`/todos?user_id=${userId}`, todo),
    update: (userId, id, todo) => api.put(`/todos/${id}?user_id=${userId}`, todo),
    delete: (userId, id) => api.delete(`/todos/${id}?user_id=${userId}`)
}

export default api