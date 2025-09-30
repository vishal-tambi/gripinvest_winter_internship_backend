import axios from 'axios';
import type {
  User,
  InvestmentProduct,
  Investment,
  TransactionLog,
  LoginCredentials,
  SignupData,
  AuthResponse,
  PortfolioSummary,
  APIResponse,
} from '@/types';

// Base API configuration
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<APIResponse<AuthResponse>> =>
    api.post('/auth/login', credentials),
  
  signup: (data: SignupData): Promise<APIResponse<AuthResponse>> =>
    api.post('/auth/signup', data),
  
  forgotPassword: (email: string): Promise<APIResponse<{ message: string }>> =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string): Promise<APIResponse<{ message: string }>> =>
    api.post('/auth/reset-password', { token, password }),
};

// Investment Products API
export const productsAPI = {
  getAll: (): Promise<APIResponse<InvestmentProduct[]>> =>
    api.get('/products'),
  
  getById: (id: string): Promise<APIResponse<InvestmentProduct>> =>
    api.get(`/products/${id}`),
  
  create: (data: Omit<InvestmentProduct, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<InvestmentProduct>> =>
    api.post('/products', data),
  
  update: (id: string, data: Partial<InvestmentProduct>): Promise<APIResponse<InvestmentProduct>> =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string): Promise<APIResponse<{ message: string }>> =>
    api.delete(`/products/${id}`),
};

// Investments API
export const investmentsAPI = {
  getPortfolio: (): Promise<APIResponse<Investment[]>> =>
    api.get('/investments/portfolio'),
  
  getPortfolioSummary: (): Promise<APIResponse<PortfolioSummary>> =>
    api.get('/investments/portfolio/summary'),
  
  create: (data: { product_id: string; amount: number }): Promise<APIResponse<Investment>> =>
    api.post('/investments', data),
  
  getById: (id: string): Promise<APIResponse<Investment>> =>
    api.get(`/investments/${id}`),
  
  cancel: (id: string): Promise<APIResponse<Investment>> =>
    api.put(`/investments/${id}/cancel`),
};

// Transaction Logs API
export const logsAPI = {
  getUserLogs: (userId?: string): Promise<APIResponse<TransactionLog[]>> =>
    api.get('/logs', { params: { userId } }),
  
  getErrorSummary: (): Promise<APIResponse<{ summary: string }>> =>
    api.get('/logs/error-summary'),
};

// User Profile API
export const userAPI = {
  getProfile: (): Promise<APIResponse<User>> =>
    api.get('/user/profile'),
  
  updateProfile: (data: Partial<User>): Promise<APIResponse<User>> =>
    api.put('/user/profile', data),
  
  updateRiskAppetite: (risk_appetite: 'low' | 'moderate' | 'high'): Promise<APIResponse<User>> =>
    api.put('/user/risk-appetite', { risk_appetite }),
};

// Health Check API
export const healthAPI = {
  check: (): Promise<APIResponse<{ status: string; database: string }>> =>
    api.get('/health'),
};

export default api;