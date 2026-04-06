import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class TransactionController {
    static getAllTransactions(req: AuthRequest, res: Response): Promise<void>;
    static getTransaction(req: AuthRequest, res: Response): Promise<void>;
    static createTransaction(req: AuthRequest, res: Response): Promise<void>;
    static calculateRates(req: AuthRequest, res: Response): Promise<void>;
    static calculateAmount(req: AuthRequest, res: Response): Promise<void>;
    static getTodayStats(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=transaction.controller.d.ts.map