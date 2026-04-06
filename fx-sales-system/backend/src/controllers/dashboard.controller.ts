import { Request, Response } from 'express';
import prisma from '../services/db.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  // 获取仪表盘数据
  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      // 并行获取所有数据
      const [
        todayStats,
        monthlyStats,
        recentTransactions,
        customerCount,
        topCustomers
      ] = await Promise.all([
        // 今日统计
        prisma.transaction.aggregate({
          where: {
            transaction_date: {
              gte: today,
              lt: tomorrow
            }
          },
          _count: { id: true },
          _sum: { pnl: true }
        }),
        
        // 本月统计
        prisma.transaction.aggregate({
          where: {
            transaction_date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          _sum: { pnl: true }
        }),
        
        // 最近交易
        prisma.transaction.findMany({
          take: 10,
          include: {
            customer: {
              select: {
                customer_name: true,
                marking: true
              }
            }
          },
          orderBy: { transaction_date: 'desc' }
        }),
        
        // 客户总数
        prisma.customer.count(),
        
        // 利润最高的客户（本月）
        prisma.transaction.groupBy({
          by: ['customer_id'],
          where: {
            transaction_date: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth
            }
          },
          _sum: {
            pnl: true
          },
          orderBy: {
            _sum: {
              pnl: 'desc'
            }
          },
          take: 5
        })
      ]);
      
      // 获取客户详情
      const topCustomerDetails = await Promise.all(
        topCustomers.map(async (customer) => {
          const customerInfo = await prisma.customer.findUnique({
            where: { id: customer.customer_id },
            select: { customer_name: true, marking: true }
          });
          
          return {
            customer_id: customer.customer_id,
            customer_name: customerInfo?.customer_name || 'Unknown',
            marking: customerInfo?.marking || '',
            total_pnl: customer._sum.pnl || 0
          };
        })
      );
      
      // 月度趋势数据（最近6个月）
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        const monthStats = await prisma.transaction.aggregate({
          where: {
            transaction_date: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _count: { id: true },
          _sum: { pnl: true }
        });
        
        monthlyTrends.push({
          month: monthDate.toLocaleDateString('zh-CN', { month: 'short', year: 'numeric' }),
          transactions: monthStats._count.id,
          pnl: monthStats._sum.pnl || 0
        });
      }
      
      res.json({
        today: {
          transactions: todayStats._count.id,
          pnl: todayStats._sum.pnl || 0
        },
        monthly: {
          pnl: monthlyStats._sum.pnl || 0
        },
        customers: {
          total: customerCount
        },
        recent_transactions: recentTransactions.map(t => ({
          id: t.id,
          date: t.transaction_date,
          customer_name: t.customer.customer_name,
          marking: t.customer.marking,
          source_amount: t.source_amount,
          pnl: t.pnl,
          currency_pair: t.currency_pair
        })),
        top_customers: topCustomerDetails,
        monthly_trends: monthlyTrends
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  }
}