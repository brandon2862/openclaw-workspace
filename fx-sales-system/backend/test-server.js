// 简单测试服务器是否能启动
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'FX Sales System Backend'
    });
});

// 模拟登录端点
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email === 'admin@example.com' && password === 'admin123') {
        res.json({
            token: 'test-jwt-token-123456',
            user: {
                id: 1,
                name: '系统管理员',
                email: 'admin@example.com',
                role: 'ADMIN'
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// 模拟客户列表
app.get('/api/customers', (req, res) => {
    const customers = [
        {
            id: 1,
            customer_name: 'ABC贸易公司',
            marking: 'ABC001',
            default_currency_pair: 'RMB/MYR',
            recipient_name: '张三',
            phone: '+6012-3456789',
            bank_name: 'Maybank',
            bank_account: '1234567890',
            remark: '长期合作客户',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
            id: 2,
            customer_name: 'XYZ有限公司',
            marking: 'XYZ002',
            default_currency_pair: 'RMB/MYR',
            recipient_name: '李四',
            phone: '+6013-9876543',
            bank_name: 'CIMB Bank',
            bank_account: '0987654321',
            remark: '新客户',
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z'
        }
    ];
    
    res.json({
        customers,
        pagination: {
            page: 1,
            limit: 20,
            total: 2,
            pages: 1
        }
    });
});

// 模拟计算报价
app.post('/api/transactions/calculate-rates', (req, res) => {
    const { agent_sx_cost } = req.body;
    
    if (!agent_sx_cost) {
        return res.status(400).json({ error: 'Agent SX cost is required' });
    }
    
    const cost = parseFloat(agent_sx_cost);
    
    res.json({
        option_1_rate: (cost - 0.05).toFixed(4),
        option_2_rate: (cost - 0.08).toFixed(4),
        option_3_rate: (cost - 0.10).toFixed(4)
    });
});

// 模拟计算金额
app.post('/api/transactions/calculate-amount', (req, res) => {
    const { source_amount, selected_rate, agent_sx_cost } = req.body;
    
    if (!source_amount || !selected_rate || !agent_sx_cost) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const amount = parseFloat(source_amount);
    const rate = parseFloat(selected_rate);
    const cost = parseFloat(agent_sx_cost);
    
    const converted_amount = (amount / rate).toFixed(2);
    const pnl = ((cost - rate) * amount).toFixed(2);
    
    res.json({
        converted_amount,
        pnl
    });
});

// 模拟仪表盘数据
app.get('/api/dashboard', (req, res) => {
    res.json({
        today: {
            transactions: 5,
            pnl: 2500.00
        },
        monthly: {
            pnl: 50000.00
        },
        customers: {
            total: 50
        },
        recent_transactions: [
            {
                id: 1,
                date: '2024-01-01T10:30:00.000Z',
                customer_name: 'ABC贸易公司',
                marking: 'ABC001',
                source_amount: 10000.00,
                pnl: 500.00,
                currency_pair: 'RMB/MYR'
            },
            {
                id: 2,
                date: '2024-01-01T11:15:00.000Z',
                customer_name: 'XYZ有限公司',
                marking: 'XYZ002',
                source_amount: 5000.00,
                pnl: 400.00,
                currency_pair: 'RMB/MYR'
            }
        ],
        top_customers: [
            {
                customer_id: 1,
                customer_name: 'ABC贸易公司',
                marking: 'ABC001',
                total_pnl: 25000.00
            },
            {
                customer_id: 2,
                customer_name: 'XYZ有限公司',
                marking: 'XYZ002',
                total_pnl: 15000.00
            }
        ],
        monthly_trends: [
            {
                month: '2023-12',
                transactions: 80,
                pnl: 40000.00
            },
            {
                month: '2024-01',
                transactions: 100,
                pnl: 50000.00
            }
        ]
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`测试服务器运行在 http://localhost:${PORT}`);
    console.log('');
    console.log('可用端点:');
    console.log('  GET  /api/health');
    console.log('  POST /api/auth/login');
    console.log('  GET  /api/customers');
    console.log('  POST /api/transactions/calculate-rates');
    console.log('  POST /api/transactions/calculate-amount');
    console.log('  GET  /api/dashboard');
    console.log('');
    console.log('测试登录:');
    console.log('  curl -X POST http://localhost:3000/api/auth/login \\');
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"email":"admin@example.com","password":"admin123"}\'');
});