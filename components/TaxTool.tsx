
import React, { useState, useMemo } from 'react';
import { calculatePIT, grossUpPIT } from '../services/taxService';
import { Transaction, TransactionType, Category } from '../types';

interface Props {
  defaultDependents: number;
  onUpdateDependents: (val: number) => void;
  transactions?: Transaction[];
  categories?: Category[];
}

const TaxTool: React.FC<Props> = ({ defaultDependents, onUpdateDependents, transactions = [], categories = [] }) => {
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualGross, setManualGross] = useState('30000000');

  // Logic tính toán dựa trên dữ liệu thực tế
  const settlementData = useMemo(() => {
    // Lấy các giao dịch thu nhập thuộc hạng mục có tính thuế
    const taxableIncomeTransactions = transactions.filter(t => {
      if (t.type !== TransactionType.INCOME) return false;
      const cat = categories.find(c => c.id === t.category);
      return cat?.taxable;
    });

    const totalNetTaxable = taxableIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Giả định số tiền nhập vào là Net (đã tạm trừ thuế), tính ngược ra Gross và số thuế đã tạm nộp
    const grossResult = grossUpPIT(totalNetTaxable, defaultDependents);

    // Tính lại thuế thực tế phải nộp dựa trên tổng Gross (quyết toán cuối năm/tháng)
    const finalResult = calculatePIT(grossResult.grossIncome, defaultDependents);

    return {
      totalNet: totalNetTaxable,
      totalGross: grossResult.grossIncome,
      withheldTax: grossResult.withheldTax || 0,
      calculatedTax: finalResult.taxAmount,
      diff: (grossResult.withheldTax || 0) - finalResult.taxAmount,
      deductions: finalResult.deductions,
      taxedIncome: finalResult.taxedIncome
    };
  }, [transactions, categories, defaultDependents]);

  const manualResult = useMemo(() => calculatePIT(parseInt(manualGross) || 0, defaultDependents), [manualGross, defaultDependents]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-slate-200 rounded-xl">
        <button
          onClick={() => setMode('AUTO')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'AUTO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          Quyết toán thực tế
        </button>
        <button
          onClick={() => setMode('MANUAL')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'MANUAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          Dự toán thủ công
        </button>
      </div>

      {mode === 'AUTO' ? (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <i className="fas fa-file-invoice text-indigo-500"></i>
              Quyết toán Thuế TNCN
            </h3>
            <p className="text-[11px] text-amber-600 mb-4 font-medium italic">
              * Lưu ý: Hệ thống chỉ tính các khoản thu nhập được đánh dấu là "Tính thuế" trong Cài đặt.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Số tiền được giảm trừ:</span>
                <span className="text-sm font-bold text-slate-700">{formatVND(settlementData.deductions)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Tổng thu nhập (Gross):</span>
                <span className="text-sm font-bold text-slate-700">{formatVND(settlementData.totalGross)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Thu nhập chịu thuế:</span>
                <span className="text-sm font-bold text-slate-700">{formatVND(settlementData.taxedIncome)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-medium">Tiền thuế phải nộp:</span>
                <span className="text-sm font-bold text-rose-600">{formatVND(settlementData.calculatedTax)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500 font-medium">Tiền thuế đã tạm thu:</span>
                <span className="text-sm font-bold text-emerald-600">{formatVND(settlementData.withheldTax)}</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl shadow-lg text-white relative overflow-hidden ${settlementData.diff >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            <p className="text-[10px] uppercase font-bold opacity-80 tracking-widest mb-1">
              Kết quả quyết toán
            </p>
            <p className="text-xl font-bold mb-2">
              {settlementData.diff > 0
                ? `Bạn được hoàn thuế TNCN số tiền là:`
                : settlementData.diff < 0
                  ? `Bạn phải nộp thêm thuế TNCN là:`
                  : `Quyết toán cân bằng:`}
            </p>
            <p className="text-3xl font-bold">{formatVND(Math.abs(settlementData.diff))}</p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2">
            <p className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
              <i className="fas fa-info-circle"></i> Giải thích cơ chế (Luật 109/2025):
            </p>
            <p className="text-[10px] text-indigo-700 leading-relaxed">
              Dựa trên <b>Tổng thu nhập thực tế</b> và <b>Số người phụ thuộc ({defaultDependents})</b>, hệ thống tính toán số thuế thực tế bạn phải đóng (biểu thuế 5 bậc).
              Số tiền chênh lệch được tính bằng cách so sánh với số thuế đã tạm khấu trừ khi bạn nhận tiền.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Dự toán Thuế TNCN (Thủ công)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tổng thu nhập Gross dự kiến</label>
                <input
                  type="number"
                  value={manualGross}
                  onChange={(e) => setManualGross(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mức giảm trừ</p>
                  <p className="text-sm font-bold text-slate-700">{formatVND(manualResult.deductions)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Thu nhập chịu thuế</p>
                  <p className="text-sm font-bold text-slate-700">{formatVND(manualResult.taxedIncome)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-700 text-white p-6 rounded-2xl shadow-lg">
            <p className="text-xs font-bold opacity-70 mb-1">Thực nhận sau thuế (Net)</p>
            <p className="text-3xl font-bold mb-6">{formatVND(manualResult.netIncome)}</p>
            <div className="space-y-3 pt-4 border-t border-indigo-600/50 text-sm">
              <div className="flex justify-between">
                <span>Thuế TNCN phải nộp:</span>
                <span className="font-bold text-orange-300">{formatVND(manualResult.taxAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxTool;
