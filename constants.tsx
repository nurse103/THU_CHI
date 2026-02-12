
import { CategoryGroup, TransactionType } from './types';

export const CATEGORIES: CategoryGroup = {
  income: [
    { value: 'Lương', label: 'Lương', icon: 'fa-wallet', taxable: true },
    { value: 'Dịch vụ', label: 'Dịch vụ', icon: 'fa-user-md', taxable: true },
    { value: 'PTTT', label: 'PTTT', icon: 'fa-hand-holding-medical', taxable: true },
    { value: 'Buồng VIP', label: 'Buồng VIP', icon: 'fa-bed', taxable: true },
    { value: 'Khen thưởng', label: 'Khen thưởng', icon: 'fa-award', taxable: true },
    { value: 'Khác', label: 'Khác', icon: 'fa-plus-circle', taxable: false },
  ],
  expense: [
    { value: 'Ăn uống', label: 'Ăn uống', icon: 'fa-utensils' },
    { value: 'Điện, nước, internet', label: 'Điện, nước, internet', icon: 'fa-bolt' },
    { value: 'Điện thoại', label: 'Điện thoại', icon: 'fa-mobile-alt' },
    { value: 'Xăng', label: 'Xăng', icon: 'fa-gas-pump' },
    { value: 'Mua sắm', label: 'Mua sắm', icon: 'fa-shopping-bag' },
    { value: 'Khác', label: 'Khác', icon: 'fa-ellipsis-h' },
  ]
};

export const TAX_BRACKETS = [
  { limit: 10000000, rate: 0.05, subtraction: 0 },
  { limit: 30000000, rate: 0.10, subtraction: 500000 },
  { limit: 60000000, rate: 0.20, subtraction: 3500000 },
  { limit: 100000000, rate: 0.30, subtraction: 9500000 },
  { limit: Infinity, rate: 0.35, subtraction: 14500000 },
];

// Biểu tính ngược từ Net sang Thu nhập tính thuế (Dành cho quyết toán)
export const NET_TO_TAXABLE_BRACKETS = [
  { netLimit: 9500000, rate: 0.05, sub: 0 },
  { netLimit: 27500000, rate: 0.10, sub: 500000 },
  { netLimit: 51500000, rate: 0.20, sub: 3500000 },
  { netLimit: 79500000, rate: 0.30, sub: 9500000 },
  { netLimit: Infinity, rate: 0.35, sub: 14500000 },
];
