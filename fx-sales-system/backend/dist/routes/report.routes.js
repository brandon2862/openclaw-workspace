"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 所有报表路由都需要认证
router.use(auth_middleware_1.authenticate);
// 获取月度报表
router.get('/monthly', report_controller_1.ReportController.getMonthlyReport);
// 导出月度报表为Excel
router.get('/monthly/export', report_controller_1.ReportController.exportMonthlyReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map