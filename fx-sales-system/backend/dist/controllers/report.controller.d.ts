import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class ReportController {
    static getMonthlyReport(req: AuthRequest, res: Response): Promise<void>;
    static exportMonthlyReport(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=report.controller.d.ts.map