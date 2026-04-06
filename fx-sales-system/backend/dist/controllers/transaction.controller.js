"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const db_service_1 = __importDefault(require("../services/db.service"));
const error_middleware_1 = require("../middleware/error.middleware");
const calculation_utils_1 = require("../utils/calculation.utils");
class TransactionController {
    // 获取所有交易
    static async getAllTransactions(req, res) {
        try {
            const { customer_id, start_date, end_date, currency_pair, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            if (customer_id) {
                where.customer_id = Number(customer_id);
            }
            if (currency_pair) {
                where.currency_pair = currency_pair;
            }
            if (start_date || end_date) {
                where.transaction_date = {};
                if (start_date) {
                    where.transaction_date.gte = new Date(start_date);
                }
                if (end_date) {
                    where.transaction_date.lte = new Date(end_date);
                }
            }
            const [transactions, total] = await Promise.all([
                db_service_1.default.transaction.findMany({
                    where,
                    include: {
                        customer: {
                            select: {
                                id: true,
                                customer_name: true,
                                marking: true
                            }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { transaction_date: 'desc' }
                }),
                db_service_1.default.transaction.count({ where })
            ]);
            res.json({
                transactions,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            throw new error_middleware_1.AppError('Failed to fetch transactions', 500);
        }
    }
    // 获取单个交易
    static async getTransaction(req, res) {
        try {
            const { id } = req.params;
            const transaction = await db_service_1.default.transaction.findUnique({
                where: { id: Number(id) },
                include: {
                    customer: true
                }
            });
            if (!transaction) {
                throw new error_middleware_1.AppError('Transaction not found', 404);
            }
            res.json(transaction);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to fetch transaction', 500);
        }
    }
    // 创建交易
    static async createTransaction(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.id;
            // 验证必填字段
            if (!data.customer_id || !data.source_amount || !data.agent_sx_cost || !data.selected_option) {
                throw new error_middleware_1.AppError('Customer ID, source amount, agent SX cost and selected option are required', 400);
            }
            // 检查客户是否存在
            const customer = await db_service_1.default.customer.findUnique({
                where: { id: data.customer_id }
            });
            if (!customer) {
                throw new error_middleware_1.AppError('Customer not found', 404);
            }
            // 计算汇率
            const rates = (0, calculation_utils_1.calculateRates)(data.agent_sx_cost);
            // 获取选择的汇率
            const selectedRate = (0, calculation_utils_1.getSelectedRate)(data.agent_sx_cost, data.selected_option, data.manual_rate);
            // 计算转换金额和利润
            const { convertedAmount, pnl } = (0, calculation_utils_1.calculateAmountAndPnl)(data.source_amount, selectedRate, data.agent_sx_cost);
            // 创建交易
            const transaction = await db_service_1.default.transaction.create({
                data: {
                    customer_id: data.customer_id,
                    currency_pair: customer.default_currency_pair || 'RMB/MYR',
                    source_amount: data.source_amount,
                    source_currency: 'RMB',
                    target_currency: 'MYR',
                    agent_sx_cost: data.agent_sx_cost,
                    option_1_rate: rates.option1,
                    option_2_rate: rates.option2,
                    option_3_rate: rates.option3,
                    manual_rate: data.manual_rate,
                    selected_option: data.selected_option,
                    selected_rate: selectedRate,
                    converted_amount: convertedAmount,
                    pnl: pnl,
                    remark: data.remark
                },
                include: {
                    customer: true
                }
            });
            res.status(201).json(transaction);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to create transaction', 500);
        }
    }
    // 计算报价
    static async calculateRates(req, res) {
        try {
            const { agent_sx_cost } = req.body;
            if (!agent_sx_cost || isNaN(Number(agent_sx_cost))) {
                throw new error_middleware_1.AppError('Valid agent SX cost is required', 400);
            }
            const rates = (0, calculation_utils_1.calculateRates)(Number(agent_sx_cost));
            res.json({
                option_1_rate: rates.option1,
                option_2_rate: rates.option2,
                option_3_rate: rates.option3
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to calculate rates', 500);
        }
    }
    // 计算金额
    static async calculateAmount(req, res) {
        try {
            const { source_amount, selected_rate, agent_sx_cost } = req.body;
            if (!source_amount || !selected_rate || !agent_sx_cost) {
                throw new error_middleware_1.AppError('Source amount, selected rate and agent SX cost are required', 400);
            }
            const { convertedAmount, pnl } = (0, calculation_utils_1.calculateAmountAndPnl)(Number(source_amount), Number(selected_rate), Number(agent_sx_cost));
            res.json({
                converted_amount: convertedAmount,
                pnl: pnl
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                throw error;
            }
            throw new error_middleware_1.AppError('Failed to calculate amount', 500);
        }
    }
    // 获取今日交易统计
    static async getTodayStats(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [transactions, pnlResult] = await Promise.all([
                db_service_1.default.transaction.count({
                    where: {
                        transaction_date: {
                            gte: today,
                            lt: tomorrow
                        }
                    }
                }),
                db_service_1.default.transaction.aggregate({
                    where: {
                        transaction_date: {
                            gte: today,
                            lt: tomorrow
                        }
                    },
                    _sum: {
                        pnl: true
                    }
                })
            ]);
            res.json({
                today_transactions: transactions,
                today_pnl: pnlResult._sum.pnl || 0
            });
        }
        catch (error) {
            throw new error_middleware_1.AppError('Failed to get today stats', 500);
        }
    }
}
exports.TransactionController = TransactionController;
//# sourceMappingURL=transaction.controller.js.map