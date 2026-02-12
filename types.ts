
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Category {
  value: string;
  label: string;
  icon: string;
  taxable?: boolean;
}

export interface CategoryGroup {
  income: Category[];
  expense: Category[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; // Changed from categoryId
  description: string; // Changed from note
  date: string;
}

export interface UserSettings {
  dependents: number;
  categories: CategoryGroup; // Changed from Category[]
}

export interface TaxConfig {
  personalDeduction: number;
  dependentDeduction: number;
  insuranceRate: number;
}

export interface TaxResult {
  grossIncome: number;
  insurance: number;
  taxableIncome: number;
  deductions: number;
  taxedIncome: number;
  taxAmount: number;
  netIncome: number;
  withheldTax?: number; // Thuế đã tạm khấu trừ
  settlementDiff?: number; // Chênh lệch quyết toán
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  police: string;
}
