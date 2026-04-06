import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有交易路由都需要认证
router.use(authenticate);

// 获取所有交易
router.get('/', TransactionController.getAllTransactions);

// 获取单个交易
router.get('/:id', TransactionController.getTransaction);

// 创建交易
router.post('/', TransactionController.createTransaction);

// 计算报价
router.post('/calculate-rates', TransactionController.calculateRates);

// 计算金额
router.post('/calculate-amount', TransactionController.calculateAmount);

// 获取今日统计
router.get('/stats/today', TransactionController.getTodayStats);

export default router;