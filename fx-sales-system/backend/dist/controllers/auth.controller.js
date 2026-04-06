"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_service_1 = __importDefault(require("../services/db.service"));
const error_middleware_1 = require("../middleware/error.middleware");
class AuthController {
    // 用户注册
    static async register(req, res) {
        try {
            const { name, email, password, role = 'STAFF' } = req.body;
            // 验证输入
            if (!name || !email || !password) {
                throw new error_middleware_1.AppError('Name, email and password are required', 400);
            }
            // 检查用户是否已存在
            const existingUser = await db_service_1.default.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                throw new error_middleware_1.AppError('User already exists', 400);
            }
            // 哈希密码
            const passwordHash = await bcryptjs_1.default.hash(password, 10);
            // 创建用户
            const user = await db_service_1.default.user.create({
                data: {
                    name,
                    email,
                    password_hash: passwordHash,
                    role: role
                }
            });
            // 生成JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            const response = {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
            res.status(201).json(response);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Registration failed', 500);
        }
    }
    // 用户登录
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // 验证输入
            if (!email || !password) {
                throw new error_middleware_1.AppError('Email and password are required', 400);
            }
            // 查找用户
            const user = await db_service_1.default.user.findUnique({
                where: { email }
            });
            if (!user) {
                throw new error_middleware_1.AppError('Invalid credentials', 401);
            }
            // 验证密码
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new error_middleware_1.AppError('Invalid credentials', 401);
            }
            // 生成JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
            const response = {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
            res.json(response);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Login failed', 500);
        }
    }
    // 获取当前用户信息
    static async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('User not authenticated', 401);
            }
            const user = await db_service_1.default.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    updated_at: true
                }
            });
            if (!user) {
                throw new error_middleware_1.AppError('User not found', 404);
            }
            res.json(user);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to get user', 500);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map