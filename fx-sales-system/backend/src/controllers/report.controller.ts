import { Request, Response } from 'express';
import prisma from '../services/db.service';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import ExcelJS from 'exceljs';

export class ReportController {
  // 获取月度报表
  static async getMonthlyReport(req: AuthRequest, res: Response) {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        throw new AppError('Year and month are required', 400);
      }
      
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      endDate.setHours(23, 59, 59, 999);
      
      // 获取交易数据
      const transactions = await prisma.transaction.findMany({
        where: {
          transaction_date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: {
            select: {
              customer_name: true,
              marking: true
            }
          }
        },
        orderBy: { transaction_date: 'asc' }
      });
      
      // 按客户分组统计
      const customerStats = new Map();
      let totalPnl = 0;
      
      transactions.forEach(transaction => {
        totalPnl += Number(transaction.pnl);
        
        const customerId = transaction.customer_id;
        if (!customerStats.has(customerId)) {
          customerStats.set(customerId, {
            customer_name: transaction.customer.customer_name,
            marking: transaction.customer.marking,
            transaction_count: 0,
            total_pnl: 0,
            total_amount: 0
          });
        }
        
        const stats = customerStats.get(customerId);
        stats.transaction_count += 1;
        stats.total_pnl += Number(transaction.pnl);
        stats.total_amount += Number(transaction.source_amount);
      });
      
      // 按货币对分组统计
      const currencyStats = new Map();
      
      transactions.forEach(transaction => {
        const currencyPair = transaction.currency_pair;
        if (!currencyStats.has(currencyPair)) {
          currencyStats.set(currencyPair, {
            transaction_count: 0,
            total_pnl: 0,
            total_amount: 0
          });
        }
        
        const stats = currencyStats.get(currencyPair);
        stats.transaction_count += 1;
        stats.total_pnl += Number(transaction.pnl);
        stats.total_amount += Number(transaction.source_amount);
      });
      
      res.json({
        period: {
          year: Number(year),
          month: Number(month),
          start_date: startDate,
          end_date: endDate
        },
        summary: {
          total_transactions: transactions.length,
          total_pnl: totalPnl,
          total_amount: transactions.reduce((sum, t) => sum + Number(t.source_amount), 0)
        },
        by_customer: Array.from(customerStats.values()),
        by_currency: Array.from(currencyStats.values()),
        transactions: transactions.slice(0, 100) // 限制返回的交易数量
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to generate monthly report', 500);
    }
  }
  
  // 导出月度报表为Excel
  static async exportMonthlyReport(req: AuthRequest, res: Response) {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        throw new AppError('Year and month are required', 400);
      }
      
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      endDate.setHours(23, 59, 59, 999);
      
      // 获取交易数据
      const transactions = await prisma.transaction.findMany({
        where: {
          transaction_date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          customer: {
            select: {
              customer_name: true,
              marking: true
            }
          }
        },
        orderBy: { transaction_date: 'asc' }
      });
      
      // 创建Excel工作簿
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FX Sales System';
      workbook.created = new Date();
      
      // 添加交易明细工作表
      const transactionsSheet = workbook.addWorksheet('交易明细');
      transactionsSheet.columns = [
        { header: '交易日期', key: 'date', width: 15 },
        { header: '客户名称', key: 'customer', width: 20 },
        { header: 'Marking', key: 'marking', width: 15 },
        { header: '货币对', key: 'currency_pair', width: 12 },
        { header: '源金额 (RMB)', key: 'source_amount', width: 15 },
        { header: 'Agent SX Cost', key: 'agent_sx_cost', width: 15 },
        { header: '选择汇率', key: 'selected_rate', width: 12 },
        { header: '转换金额 (MYR)', key: 'converted_amount', width: 15 },
        { header: '利润 (P&L)', key: 'pnl', width: 15 },
        { header: '备注', key: 'remark', width: 30 }
      ];
      
      transactions.forEach(transaction => {
        transactionsSheet.addRow({
          date: transaction.transaction_date.toLocaleDateString('zh-CN'),
          customer: transaction.customer.customer_name,
          marking: transaction.customer.marking || '',
          currency_pair: transaction.currency_pair,
          source_amount: Number(transaction.source_amount).toFixed(2),
          agent_sx_cost: Number(transaction.agent_sx_cost).toFixed(4),
          selected_rate: Number(transaction.selected_rate).toFixed(4),
          converted_amount: Number(transaction.converted_amount).toFixed(2),
          pnl: Number(transaction.pnl).toFixed(2),
          remark: transaction.remark || ''
        });
      });
      
      // 添加汇总工作表
      const summarySheet = workbook.addWorksheet('汇总统计');
      summarySheet.columns = [
        { header: '项目', key: 'item', width: 25 },
        { header: '数值', key: 'value', width: 20 }
      ];
      
      const totalPnl = transactions.reduce((sum, t) => sum + Number(t.pnl), 0);
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.source_amount), 0);
      
      summarySheet.addRow({ item: '总交易笔数', value: transactions.length });
      summarySheet.addRow({ item: '总源金额 (RMB)', value: totalAmount.toFixed(2) });
      summarySheet.addRow({ item: '总利润 (P&L)', value: totalPnl.toFixed(2) });
      summarySheet.addRow({ item: '平均每笔利润', value: (totalPnl / transactions.length || 0).toFixed(2) });
      summarySheet.addRow({ item: '报表期间', value: `${year}年${month}月` });
      summarySheet.addRow({ item: '生成时间', value: new Date().toLocaleString('zh-CN') });
      
      // 设置响应头
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=FX_Sales_Report_${year}_${month}.xlsx`
      );
      
      // 写入响应
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to export report', 500);
    }
  }
}