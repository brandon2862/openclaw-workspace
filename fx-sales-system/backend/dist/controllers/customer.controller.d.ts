import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class CustomerController {
    static getAllCustomers(req: AuthRequest, res: Response): Promise<void>;
    static getCustomer(req: AuthRequest, res: Response): Promise<void>;
    static createCustomer(req: AuthRequest, res: Response): Promise<void>;
    static updateCustomer(req: AuthRequest, res: Response): Promise<void>;
    static deleteCustomer(req: AuthRequest, res: Response): Promise<void>;
    static searchCustomers(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=customer.controller.d.ts.map