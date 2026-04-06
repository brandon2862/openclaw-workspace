import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// 所有客户路由都需要认证
router.use(authenticate);

// 获取所有客户
router.get('/', CustomerController.getAllCustomers);

// 搜索客户
router.get('/search', CustomerController.searchCustomers);

// 获取单个客户
router.get('/:id', CustomerController.getCustomer);

// 创建客户（需要管理员权限）
router.post('/', authorize('ADMIN'), CustomerController.createCustomer);

// 更新客户（需要管理员权限）
router.put('/:id', authorize('ADMIN'), CustomerController.updateCustomer);

// 删除客户（需要管理员权限）
router.delete('/:id', authorize('ADMIN'), CustomerController.deleteCustomer);

export default router;