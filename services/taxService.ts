
import { TAX_BRACKETS, NET_TO_TAXABLE_BRACKETS } from '../constants.tsx';
import { TaxResult, TaxConfig } from '../types';

/**
 * Tính thuế TNCN từ Gross
 */
export const calculatePIT = (grossIncome: number, dependents: number = 0, config?: TaxConfig): TaxResult => {
  const currentConfig: TaxConfig = config || {
    personalDeduction: 15500000,
    dependentDeduction: 6200000,
    insuranceRate: 0.105,
  };

  const insurance = Math.min(grossIncome * currentConfig.insuranceRate, 40000000 * 0.105); 
  const taxableIncome = grossIncome - insurance; 
  const totalDeductions = currentConfig.personalDeduction + (dependents * currentConfig.dependentDeduction);
  const taxedIncome = Math.max(0, taxableIncome - totalDeductions);

  let taxAmount = 0;
  if (taxedIncome > 0) {
    const bracket = TAX_BRACKETS.find((b, idx) => {
      const prevLimit = idx === 0 ? 0 : TAX_BRACKETS[idx - 1].limit;
      return taxedIncome > prevLimit && taxedIncome <= b.limit;
    }) || TAX_BRACKETS[TAX_BRACKETS.length - 1];
    
    taxAmount = (taxedIncome * bracket.rate) - bracket.subtraction;
  }

  return {
    grossIncome,
    insurance,
    taxableIncome,
    deductions: totalDeductions,
    taxedIncome,
    taxAmount,
    netIncome: grossIncome - insurance - taxAmount,
  };
};

/**
 * Tính ngược từ Net sang Gross (Dành cho các khoản thu đã tạm trừ thuế)
 * Công thức: Thu nhập tính thuế = (Thu nhập thực nhận - Giảm trừ - Hằng số) / (1 - Thuế suất)
 */
export const grossUpPIT = (netReceived: number, dependents: number = 0, config?: TaxConfig): TaxResult => {
  const currentConfig: TaxConfig = config || {
    personalDeduction: 15500000,
    dependentDeduction: 6200000,
    insuranceRate: 0.105,
  };

  const totalDeductions = currentConfig.personalDeduction + (dependents * currentConfig.dependentDeduction);
  
  // Thu nhập thực nhận sau khi đã loại bỏ các khoản giảm trừ (Net tính thuế)
  // Lưu ý: Giả định bảo hiểm đã được trừ hoặc không tính trong phần net thu nhập lẻ
  const netAfterDeductions = Math.max(0, netReceived - totalDeductions);
  
  let taxedIncome = 0;
  if (netAfterDeductions > 0) {
    const bracket = NET_TO_TAXABLE_BRACKETS.find((b, idx) => {
      const prevLimit = idx === 0 ? 0 : NET_TO_TAXABLE_BRACKETS[idx - 1].netLimit;
      return netAfterDeductions > prevLimit && netAfterDeductions <= b.netLimit;
    }) || NET_TO_TAXABLE_BRACKETS[NET_TO_TAXABLE_BRACKETS.length - 1];

    taxedIncome = (netAfterDeductions - bracket.sub) / (1 - bracket.rate);
  }

  const taxableIncome = taxedIncome + totalDeductions;
  // Giả định Gross = TaxableIncome / (1 - insuranceRate) nếu có đóng bảo hiểm, 
  // nhưng thường thu nhập dịch vụ/thưởng không tính bảo hiểm. Ở đây ta coi Gross = taxableIncome cho đơn giản.
  const gross = taxableIncome; 
  const tax = gross - netReceived;

  return {
    grossIncome: gross,
    insurance: 0,
    taxableIncome: gross,
    deductions: totalDeductions,
    taxedIncome: taxedIncome,
    taxAmount: tax, // Đây là số thuế đã tạm khấu trừ
    netIncome: netReceived,
    withheldTax: tax
  };
};
