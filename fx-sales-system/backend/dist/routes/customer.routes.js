"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 所有客户路由都需要认证
router.use(auth_middleware_1.authenticate);
// 获取所有客户
router.get('/', customer_controller_1.CustomerController.getAllCustomers);
// 搜索客户
router.get('/search', customer_controller_1.CustomerController.searchCustomers);
// 获取单个客户
router.get('/:id', customer_controller_1.CustomerController.getCustomer);
// 创建客户（需要管理员权限）
router.post('/', (0, auth_middleware_1.authorize)('ADMIN'), customer_controller_1.CustomerController.createCustomer);
// 更新客户（需要管理员权限）
router.put('/:id', (0, auth_middleware_1.authorize)('ADMIN'), customer_controller_1.CustomerController.updateCustomer);
// 删除客户（需要管理员权限）
router.delete('/:id', (0, auth_middleware_1.authorize)('ADMIN'), customer_controller_1.CustomerController.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map