import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 所有报表路由都需要认证
router.use(authenticate);

// 获取月度报表
router.get('/monthly', ReportController.getMonthlyReport);

// 导出月度报表为Excel
router.get('/monthly/export', ReportController.exportMonthlyReport);

export default router;