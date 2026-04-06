"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 所有仪表盘路由都需要认证
router.use(auth_middleware_1.authenticate);
// 获取仪表盘数据
router.get('/', dashboard_controller_1.DashboardController.getDashboardData);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map