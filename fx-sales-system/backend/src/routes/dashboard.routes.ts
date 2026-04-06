import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有仪表盘路由都需要认证
router.use(authenticate);

// 获取仪表盘数据
router.get('/', DashboardController.getDashboardData);

export default router;