import { Request, Response } from 'express';
import prisma from '../services/db.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateCustomerRequest } from '../types';

export class CustomerController {
  // 获取所有客户
  static async getAllCustomers(req: AuthRequest, res: Response) {
    try {
      const { search, page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { customer_name: { contains: search as string } },
          { marking: { contains: search as string } },
          { recipient_name: { contains: search as string } },
          { phone: { contains: search as string } }
        ];
      }
      
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { created_at: 'desc' }
        }),
        prisma.customer.count({ where })
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
    } catch (error) {
      throw new AppError('Failed to fetch customers', 500);
    }
  }
  
  // 获取单个客户
  static async getCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const customer = await prisma.customer.findUnique({
        where: { id: Number(id) }
      });
      
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch customer', 500);
    }
  }
  
  // 创建客户
  static async createCustomer(req: AuthRequest, res: Response) {
    try {
      const data: CreateCustomerRequest = req.body;
      
      // 验证必填字段
      if (!data.customer_name) {
        throw new AppError('Customer name is required', 400);
      }
      
      const customer = await prisma.customer.create({
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create customer', 500);
    }
  }
  
  // 更新客户
  static async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data: Partial<CreateCustomerRequest> = req.body;
      
      // 检查客户是否存在
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) }
      });
      
      if (!existingCustomer) {
        throw new AppError('Customer not found', 404);
      }
      
      const customer = await prisma.customer.update({
        where: { id: Number(id) },
        data
      });
      
      res.json(customer);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update customer', 500);
    }
  }
  
  // 删除客户
  static async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // 检查客户是否存在
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: Number(id) }
      });
      
      if (!existingCustomer) {
        throw new AppError('Customer not found', 404);
      }
      
      // 检查是否有相关交易
      const transactions = await prisma.transaction.count({
        where: { customer_id: Number(id) }
      });
      
      if (transactions > 0) {
        throw new AppError('Cannot delete customer with existing transactions', 400);
      }
      
      await prisma.customer.delete({
        where: { id: Number(id) }
      });
      
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete customer', 500);
    }
  }
  
  // 搜索客户
  static async searchCustomers(req: AuthRequest, res: Response) {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        throw new AppError('Search query is required', 400);
      }
      
      const customers = await prisma.customer.findMany({
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to search customers', 500);
    }
  }
}