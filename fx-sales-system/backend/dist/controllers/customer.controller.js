"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const db_service_1 = __importDefault(require("../services/db.service"));
const error_middleware_1 = require("../middleware/error.middleware");
class CustomerController {
    // 获取所有客户
    static async getAllCustomers(req, res) {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            if (search) {
                where.OR = [
                    { customer_name: { contains: search } },
                    { marking: { contains: search } },
                    { recipient_name: { contains: search } },
                    { phone: { contains: search } }
                ];
            }
            const [customers, total] = await Promise.all([
                db_service_1.default.customer.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { created_at: 'desc' }
                }),
                db_service_1.default.customer.count({ where })
            ]);
            res.json({
                customers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            throw new error_middleware_1.AppError('Failed to fetch customers', 500);
        }
    }
    // 获取单个客户
    static async getCustomer(req, res) {
        try {
            const { id } = req.params;
            const customer = await db_service_1.default.customer.findUnique({
                where: { id: Number(id) }
            });
            if (!customer) {
                throw new error_middleware_1.AppError('Customer not found', 404);
            }
            res.json(customer);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to fetch customer', 500);
        }
    }
    // 创建客户
    static async createCustomer(req, res) {
        try {
            const data = req.body;
            // 验证必填字段
            if (!data.customer_name) {
                throw new error_middleware_1.AppError('Customer name is required', 400);
            }
            const customer = await db_service_1.default.customer.create({
                data: {
                    customer_name: data.customer_name,
                    marking: data.marking,
                    default_currency_pair: data.default_currency_pair || 'RMB/MYR',
                    recipient_name: data.recipient_name,
                    phone: data.phone,
                    bank_name: data.bank_name,
                    bank_account: data.bank_account,
                    remark: data.remark
                }
            });
            res.status(201).json(customer);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to create customer', 500);
        }
    }
    // 更新客户
    static async updateCustomer(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            // 检查客户是否存在
            const existingCustomer = await db_service_1.default.customer.findUnique({
                where: { id: Number(id) }
            });
            if (!existingCustomer) {
                throw new error_middleware_1.AppError('Customer not found', 404);
            }
            const customer = await db_service_1.default.customer.update({
                where: { id: Number(id) },
                data
            });
            res.json(customer);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to update customer', 500);
        }
    }
    // 删除客户
    static async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            // 检查客户是否存在
            const existingCustomer = await db_service_1.default.customer.findUnique({
                where: { id: Number(id) }
            });
            if (!existingCustomer) {
                throw new error_middleware_1.AppError('Customer not found', 404);
            }
            // 检查是否有相关交易
            const transactions = await db_service_1.default.transaction.count({
                where: { customer_id: Number(id) }
            });
            if (transactions > 0) {
                throw new error_middleware_1.AppError('Cannot delete customer with existing transactions', 400);
            }
            await db_service_1.default.customer.delete({
                where: { id: Number(id) }
            });
            res.json({ message: 'Customer deleted successfully' });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to delete customer', 500);
        }
    }
    // 搜索客户
    static async searchCustomers(req, res) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== 'string') {
                throw new error_middleware_1.AppError('Search query is required', 400);
            }
            const customers = await db_service_1.default.customer.findMany({
                where: {
                    OR: [
                        { customer_name: { contains: query } },
                        { marking: { contains: query } },
                        { recipient_name: { contains: query } },
                        { phone: { contains: query } }
                    ]
                },
                take: 10,
                orderBy: { customer_name: 'asc' }
            });
            res.json(customers);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to search customers', 500);
        }
    }
}
exports.CustomerController = CustomerController;
//# sourceMappingURL=customer.controller.js.map