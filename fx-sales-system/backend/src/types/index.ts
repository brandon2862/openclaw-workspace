export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: number;
  customer_name: string;
  marking?: string;
  default_currency_pair: string;
  recipient_name?: string;
  phone?: string;
  bank_name?: string;
  bank_account?: string;
  remark?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  transaction_date: Date;
  customer_id: number;
  currency_pair: string;
  source_amount: number;
  source_currency: string;
  target_currency: string;
  agent_sx_cost: number;
  option_1_rate: number;
  option_2_rate: number;
  option_3_rate: number;
  manual_rate?: number;
  selected_option: number;
  selected_rate: number;
  converted_amount: number;
  pnl: number;
  remark?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
  };
}

export interface CreateCustomerRequest {
  customer_name: string;
  marking?: string;
  default_currency_pair?: string;
  recipient_name?: string;
  phone?: string;
  bank_name?: string;
  bank_account?: string;
  remark?: string;
}

export interface CreateTransactionRequest {
  customer_id: number;
  source_amount: number;
  agent_sx_cost: number;
  selected_option: number;
  manual_rate?: number;
  remark?: string;
}

export interface CalculateRatesRequest {
  agent_sx_cost: number;
}

export interface CalculateRatesResponse {
  option_1_rate: number;
  option_2_rate: number;
  option_3_rate: number;
}

export interface CalculateAmountRequest {
  source_amount: number;
  selected_rate: number;
}

export interface CalculateAmountResponse {
  converted_amount: number;
  pnl: number;
}

export interface MonthlyReportRequest {
  year: number;
  month: number;
}

export interface DashboardStats {
  today_transactions: number;
  today_pnl: number;
  monthly_pnl: number;
  recent_transactions: Transaction[];
}