"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 所有交易路由都需要认证
router.use(auth_middleware_1.authenticate);
// 获取所有交易
router.get('/', transaction_controller_1.TransactionController.getAllTransactions);
// 获取单个交易
router.get('/:id', transaction_controller_1.TransactionController.getTransaction);
// 创建交易
router.post('/', transaction_controller_1.TransactionController.createTransaction);
// 计算报价
router.post('/calculate-rates', transaction_controller_1.TransactionController.calculateRates);
// 计算金额
router.post('/calculate-amount', transaction_controller_1.TransactionController.calculateAmount);
// 获取今日统计
router.get('/stats/today', transaction_controller_1.TransactionController.getTodayStats);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map