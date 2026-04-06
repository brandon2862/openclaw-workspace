"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// 用户注册
router.post('/register', auth_controller_1.AuthController.register);
// 用户登录
router.post('/login', auth_controller_1.AuthController.login);
// 获取当前用户信息（需要认证）
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map