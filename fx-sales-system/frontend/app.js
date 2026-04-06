// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 创建Vue应用
const app = Vue.createApp({
    data() {
        return {
            // 用户信息
            user: {
                id: null,
                username: '',
                role: ''
            },
            isAuthenticated: false,
            
            // 当前页面
            currentPage: 'dashboard',
            
            // 仪表板数据
            dashboard: {
                todayTransactions: 0,
                todayProfit: 0,
                totalCustomers: 0,
                activeCustomers: 0
            },
            recentTransactions: [],
            
            // 客户管理
            customers: [],
            allCustomers: [],
            customerSearch: '',
            customerPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            showAddCustomer: false,
            customerForm: {
                id: null,
                customer_name: '',
                marking: '',
                default_currency_pair: 'RMB/MYR',
                recipient_name: '',
                phone: '',
                bank_name: '',
                bank_account: ''
            },
            
            // 交易管理
            transactionForm: {
                customer_id: '',
                agent_sx_cost: '',
                selected_option: 1,
                manual_rate: '',
                source_amount: '',
                remark: ''
            },
            selectedCustomer: null,
            calculatedRates: {
                option1: 0,
                option2: 0,
                option3: 0
            },
            selectedRate: 0,
            calculatedAmount: {
                converted_amount: 0,
                pnl: 0
            },
            
            // 交易记录
            transactions: [],
            transactionFilter: {
                customer_id: '',
                start_date: '',
                end_date: '',
                currency_pair: ''
            },
            transactionPagination: {
                page: 1,
                pages: 1,
                total: 0,
                limit: 10
            },
            
            // 月度报表
            reportYear: new Date().getFullYear(),
            reportMonth: new Date().getMonth() + 1,
            monthlyReport: null,
            exportingReport: false,
            
            // 系统管理
            users: [],
            systemSettings: {
                default_currency_pair: 'RMB/MYR',
                default_option: '1',
                report_retention_months: 12,
                backup_frequency_days: 7
            },
            
            // 加载状态
            loading: false,
            error: null
        };
    },
    
    computed: {
        // 是否可以保存交易
        canSaveTransaction() {
            return this.transactionForm.customer_id && 
                   this.transactionForm.agent_sx_cost && 
                   this.transactionForm.source_amount && 
                   this.selectedRate > 0;
        },
        
        // 当前用户
        currentUser() {
            return this.user;
        }
    },
    
    mounted() {
        this.checkAuth();
        this.loadAllCustomers();
    },
    
    methods: {
        // 检查认证状态
        async checkAuth() {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.user = data;
                    this.isAuthenticated = true;
                    this.loadDashboard();
                } else {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                }
            } catch (error) {
                console.error('认证检查失败:', error);
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        },
        
        // 加载仪表板数据
        async loadDashboard() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.dashboard = data.dashboard;
                    this.recentTransactions = data.recentTransactions || [];
                }
            } catch (error) {
                console.error('加载仪表板失败:', error);
                this.showError('加载仪表板数据失败');
            }
        },
        
        // 加载所有客户
        async loadAllCustomers() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/customers?limit=1000`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.allCustomers = data.customers || [];
                }
            } catch (error) {
                console.error('加载客户列表失败:', error);
            }
        },
        
        // 搜索客户
        async searchCustomers() {
            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams({
                    page: this.customerPagination.page,
                    limit: this.customerPagination.limit,
                    search: this.customerSearch
                });
                
                const response = await fetch(`${API_BASE_URL}/customers?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.customers = data.customers || [];
                    this.customerPagination = data.pagination || this.customerPagination;
                }
            } catch (error) {
                console.error('搜索客户失败:', error);
                this.showError('搜索客户失败');
            }
        },
        
        // 加载客户信息
        async loadCustomerInfo() {
            const customerId = this.transactionForm.customer_id;
            if (!customerId) {
                this.selectedCustomer = null;
                return;
            }
            
            this.selectedCustomer = this.allCustomers.find(c => c.id == customerId);
        },
        
        // 计算汇率
        calculateRates() {
            const agentSxCost = parseFloat(this.transactionForm.agent_sx_cost);
            if (isNaN(agentSxCost)) {
                this.calculatedRates = { option1: 0, option2: 0, option3: 0 };
                return;
            }
            
            this.calculatedRates = {
                option1: (agentSxCost - 0.05).toFixed(4),
                option2: (agentSxCost - 0.08).toFixed(4),
                option3: (agentSxCost - 0.10).toFixed(4)
            };
            
            // 如果当前选择的是1-3选项，更新选中汇率
            if (this.transactionForm.selected_option >= 1 && this.transactionForm.selected_option <= 3) {
                this.selectedRate = this.calculatedRates[`option${this.transactionForm.selected_option}`];
                this.calculateAmount();
            }
        },
        
        // 选择选项
        selectOption(option) {
            this.transactionForm.selected_option = option;
            
            if (option >= 1 && option <= 3) {
                this.selectedRate = this.calculatedRates[`option${option}`];
                this.transactionForm.manual_rate = '';
            } else if (option === 4) {
                this.selectedRate = this.transactionForm.manual_rate || 0;
            }
            
            this.calculateAmount();
        },
        
        // 更新手动汇率
        updateManualRate() {
            if (this.transactionForm.selected_option === 4) {
                this.selectedRate = this.transactionForm.manual_rate || 0;
                this.calculateAmount();
            }
        },
        
        // 计算金额
        calculateAmount() {
            const sourceAmount = parseFloat(this.transactionForm.source_amount);
            const rate = parseFloat(this.selectedRate);
            
            if (isNaN(sourceAmount) || isNaN(rate) || rate <= 0) {
                this.calculatedAmount = { converted_amount: 0, pnl: 0 };
                return;
            }
            
            const convertedAmount = sourceAmount * rate;
            const agentSxCost = parseFloat(this.transactionForm.agent_sx_cost) || 0;
            const pnl = sourceAmount * (agentSxCost - rate);
            
            this.calculatedAmount = {
                converted_amount: convertedAmount.toFixed(2),
                pnl: pnl.toFixed(2)
            };
        },
        
        // 保存交易
        async saveTransaction() {
            if (!this.canSaveTransaction) {
                this.showError('请填写完整的交易信息');
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/transactions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.transactionForm,
                        selected_rate: this.selectedRate,
                        converted_amount: this.calculatedAmount.converted_amount,
                        pnl: this.calculatedAmount.pnl
                    })
                });
                
                if (response.ok) {
                    this.showSuccess('交易保存成功');
                    this.resetTransactionForm();
                    this.loadDashboard();
                } else {
                    const error = await response.json();
                    this.showError(error.message || '保存交易失败');
                }
            } catch (error) {
                console.error('保存交易失败:', error);
                this.showError('保存交易失败');
            }
        },
        
        // 重置交易表单
        resetTransactionForm() {
            this.transactionForm = {
                customer_id: '',
                agent_sx_cost: '',
                selected_option: 1,
                manual_rate: '',
                source_amount: '',
                remark: ''
            };
            this.selectedCustomer = null;
            this.calculatedRates = { option1: 0, option2: 0, option3: 0 };
            this.selectedRate = 0;
            this.calculatedAmount = { converted_amount: 0, pnl: 0 };
        },
        
        // 加载交易记录
        async loadTransactions() {
            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams({
                    page: this.transactionPagination.page,
                    limit: this.transactionPagination.limit,
                    ...this.transactionFilter
                });
                
                const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.transactions = data.transactions || [];
                    this.transactionPagination = data.pagination || this.transactionPagination;
                }
            } catch (error) {
                console.error('加载交易记录失败:', error);
                this.showError('加载交易记录失败');
            }
        },
        
        // 重置交易筛选
        resetTransactionFilter() {
            this.transactionFilter = {
                customer_id: '',
                start_date: '',
                end_date: '',
                currency_pair: ''
            };
            this.loadTransactions();
        },
        
        // 加载月度报表
        async loadMonthlyReport() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/reports/monthly?year=${this.reportYear}&month=${this.reportMonth}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.monthlyReport = data;
                    this.renderChart();
                } else {
                    this.monthlyReport = null;
                }
            } catch (error) {
                console.error('加载月度报表失败:', error);
                this.showError('加载月度报表失败');
                this.monthlyReport = null;
            }
        },
        
        // 渲染图表
        renderChart() {
            // 这里可以集成图表库，如Chart.js
            const container = document.getElementById('chart-container');
            if (container && this.monthlyReport) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p>图表功能需要集成Chart.js等图表库</p>
                        <p>当前数据：${this.reportYear}年${this.reportMonth}月</p>
                    </div>
                `;
            }
        },
        
        // 导出月度报表
        async exportMonthlyReport() {
            this.exportingReport = true;
            
            try {
                const token = localStorage.getItem('token');
                const url = `${API_BASE_URL}/reports/monthly/export?year=${this.reportYear}&month=${this.reportMonth}`;
                
                // 使用fetch下载文件
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('导出失败');
                }
                
                // 获取blob并创建下载链接
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `FX_Sales_Report_${this.reportYear}_${this.reportMonth}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
                
            } catch (error) {
                alert(error.message || '导出报表失败');
            } finally {
                this.exportingReport = false;
            }
        },
        
        // 格式化货币
        formatCurrency(amount, currency = 'MYR') {
            if (amount === null || amount === undefined) return '0.00';
            const num = parseFloat(amount);
            if (isNaN(num)) return '0.00';
            
            return `${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currency}`;
        },
        
        // 格式化日期
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-CN');
        },
        
        // 格式化时间
        formatTime(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        },
        
        // 显示成功消息
        showSuccess(message) {
            this.showNotification(message, 'success');
        },
        
        // 显示错误消息
        showError(message) {
            this.showNotification(message, 'error');
        },
        
        // 显示通知
        showNotification(message, type = 'info') {
            // 创建通知元素
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                background-color: ${type === 'success' ? 'var(--success-color)' : 
                                 type === 'error' ? 'var(--danger-color)' : 
                                 'var(--info-color)'};
            `;
            notification.textContent = message;
            
            // 添加到页面
            document.body.appendChild(notification);
            
            // 3秒后移除
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
            
            // 添加动画样式
            if (!document.querySelector('#notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOut {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        },
        
        // 退出登录
        logout() {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        },
        
        // 分页方法
        prevCustomerPage() {
            if (this.customerPagination.page > 1) {
                this.customerPagination.page--;
                this.searchCustomers();
            }
        },
        
        nextCustomerPage() {
            if (this.customerPagination.page < this.customerPagination.pages) {
                this.customerPagination.page++;
                this.searchCustomers();
            }
        },
        
        prevTransactionPage() {
            if (this.transactionPagination.page > 1) {
                this.transactionPagination.page--;
                this.loadTransactions();
            }
        },
        
        nextTransactionPage() {
            if (this.transactionPagination.page < this.transactionPagination.pages) {
                this.transactionPagination.page++;
                this.loadTransactions();
            }
        },
        
        // 查看交易详情
        viewTransactionDetail(transaction) {
            alert(`交易详情：
客户: ${transaction.customer.customer_name}
日期: ${this.formatDate(transaction.transaction_date)}
金额: ${this.formatCurrency(transaction.source_amount, 'RMB')}
汇率: ${transaction.selected_rate.toFixed(4)}
转换金额: ${this.formatCurrency(transaction.converted_amount)}
利润: ${this.formatCurrency(transaction.pnl)}
备注: ${transaction.remark || '无'}`);
        },
        
        // 编辑客户
        editCustomer(customer) {
            this.customerForm = { ...customer };
            this.showAddCustomer = true;
        },
        
        // 删除客户
        async deleteCustomer(customerId) {
            if (!confirm('确定要删除这个客户吗？此操作不可撤销。')) {
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    this.showSuccess('客户删除成功');
                    this.searchCustomers();
                    this.loadAllCustomers();
                } else {
                    const error = await response.json();
                    this.showError(error.message || '删除客户失败');
                }
            } catch (error) {
                console.error('删除客户失败:', error);
                this.showError('删除客户失败');
            }
        },
        
        // 保存客户
        async saveCustomer() {
            if (!this.customerForm.customer_name) {
                this.showError('请输入客户名称');
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                const method = this.customerForm.id ? 'PUT' : 'POST';
                const url = this.customerForm.id ? 
                    `${API_BASE_URL}/customers/${this.customerForm.id}` : 
                    `${API_BASE_URL}/customers`;
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.customerForm)
                });
                
                if (response.ok) {
                    this.showSuccess(this.customerForm.id ? '客户更新成功' : '客户添加成功');
                    this.showAddCustomer = false;
                    this.customerForm = {
                        id: null,
                        customer_name: '',
                        marking: '',
                        default_currency_pair: 'RMB/MYR',
                        recipient_name: '',
                        phone: '',
                        bank_name: '',
                        bank_account: ''
                    };
                    this.searchCustomers();
                    this.loadAllCustomers();
                } else {
                    const error = await response.json();
                    this.showError(error.message || '保存客户失败');
                }
            } catch (error) {
                console.error('保存客户失败:', error);
                this.showError('保存客户失败');
            }
        },
        
        // 加载用户列表
        async loadUsers() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/admin/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.users = data.users || [];
                }
            } catch (error) {
                console.error('加载用户列表失败:', error);
            }
        },
        
        // 编辑用户
        editUser(user) {
            // 实现用户编辑逻辑
            alert(`编辑用户: ${user.username}`);
        },
        
        // 删除用户
        async deleteUser(userId) {
            if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) {
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    this.showSuccess('用户删除成功');
                    this.loadUsers();
                } else {
                    const error = await response.json();
                    this.showError(error.message || '删除用户失败');
                }
            } catch (error) {
                console.error('删除用户失败:', error);
                this.showError('删除用户失败');
            }
        },
        
        // 保存系统设置
        async saveSystemSettings() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.systemSettings)
                });
                
                if (response.ok) {
                    this.showSuccess('系统设置保存成功');
                } else {
                    const error = await response.json();
                    this.showError(error.message || '保存设置失败');
                }
            } catch (error) {
                console.error('保存系统设置失败:', error);
                this.showError('保存系统设置失败');
            }
        },
        
        // 页面切换时加载数据
        watch: {
            currentPage(newPage) {
                if (newPage === 'customers') {
                    this.searchCustomers();
                } else if (newPage === 'transactions') {
                    this.loadTransactions();
                } else if (newPage === 'reports') {
                    this.loadMonthlyReport();
                } else if (newPage === 'admin') {
                    this.loadUsers();
                }
            }
        }
    }
});

// 挂载应用
app.mount('#app');

// 添加页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 页面重新可见时刷新数据
        const appInstance = app._instance;
        if (appInstance && appInstance.isAuthenticated) {
            appInstance.loadDashboard();
        }
    }
});

// 添加离线检测
window.addEventListener('online', function() {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = '网络连接已恢复';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
});

window.addEventListener('offline', function() {
    const notification = document.createElement('div');
    notification.className = 'notification warning';
    notification.textContent = '网络连接已断开，部分功能可能无法使用';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
});

// 添加复制功能
document.addEventListener('copy', function(event) {
    const selection = window.getSelection();
    if (selection.toString().includes('MYR') || selection.toString().includes('RMB')) {
        // 可以在这里添加货币格式处理
    }
});

// 初始化工具提示
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-text';
            tooltip.textContent = this.getAttribute('data-tooltip');
            this.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip-text');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initTooltips();
    
    // 添加加载动画
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.style.display = 'none';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);
    
    // 全局加载状态管理
    const originalApiRequest = app._instance.apiRequest;
    app._instance.apiRequest = async function(...args) {
        loadingOverlay.style.display = 'flex';
        try {
            return await originalApiRequest.call(this, ...args);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    };
});