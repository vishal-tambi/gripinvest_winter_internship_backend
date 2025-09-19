// Investment Platform Types

export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  risk_appetite: 'low' | 'moderate' | 'high';
  created_at: string;
  updated_at: string;
}

export interface InvestmentProduct {
  id: string;
  name: string;
  investment_type: 'bond' | 'fd' | 'mf' | 'etf' | 'other';
  tenure_months: number;
  annual_yield: number;
  risk_level: 'low' | 'moderate' | 'high';
  min_investment: number;
  max_investment?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  invested_at: string;
  status: 'active' | 'matured' | 'cancelled';
  expected_return?: number;
  maturity_date?: string;
  product?: InvestmentProduct;
}

export interface TransactionLog {
  id: number;
  user_id?: string;
  email?: string;
  endpoint: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status_code: number;
  error_message?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  risk_appetite?: 'low' | 'moderate' | 'high';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PortfolioSummary {
  total_investment: number;
  total_expected_return: number;
  investment_count: number;
  risk_distribution: {
    low: number;
    moderate: number;
    high: number;
  };
  type_distribution: {
    bond: number;
    fd: number;
    mf: number;
    etf: number;
    other: number;
  };
}

export interface AIInsight {
  type: 'portfolio' | 'recommendation' | 'risk' | 'performance';
  title: string;
  content: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}