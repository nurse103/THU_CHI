
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
  onView: (t: Transaction) => void;
  categories: Category[];
}

const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit, onView, categories }) => {
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear())));
    const currentYear = new Date().getFullYear();
    if (!uniqueYears.includes(currentYear)) {
      uniqueYears.push(currentYear);
    }
    return uniqueYears.sort((a, b) => b - a);
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchMonth = selectedMonth === 'all' || m === selectedMonth;
      const matchYear = selectedYear === 'all' || y === selectedYear;

      return matchType && matchMonth && matchYear;
    });
  }, [transactions, filterType, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filtered]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
        {/* Row 1: Type Filter */}
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] overflow-hidden shadow-inner font-black">
          <button
            onClick={() => setFilterType('ALL')}
            className={`flex-1 py-3 text-lg rounded-[1.2rem] transition-all ${filterType === 'ALL' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}
          >
            TẤT CẢ
          </button>
          <button
            onClick={() => setFilterType(TransactionType.INCOME)}
            className={`flex-1 py-3 text-lg rounded-[1.2rem] transition-all ${filterType === TransactionType.INCOME ? 'bg-white shadow-md text-emerald-600' : 'text-slate-500'}`}
          >
            THU NHẬP
          </button>
          <button
            onClick={() => setFilterType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-lg rounded-[1.2rem] transition-all ${filterType === TransactionType.EXPENSE ? 'bg-white shadow-md text-red-500' : 'text-slate-500'}`}
          >
            CHI PHÍ
          </button>
        </div>

        {/* Row 2: Month & Year Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-lg font-black text-slate-400 uppercase tracking-wider ml-3">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full text-lg bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-2xl py-3 px-4 font-black text-slate-700 shadow-sm transition-all appearance-none"
            >
              <option value="all">Tất cả</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-lg font-black text-slate-400 uppercase tracking-wider ml-3">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full text-lg bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-2xl py-3 px-4 font-black text-slate-700 shadow-sm transition-all appearance-none"
            >
              <option value="all">Tất cả</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rows 3-6: Information Summary */}
        <div className="space-y-4 pt-4">
          {/* Row 3: Result Count */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
            <span className="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Kết quả</span>
            <span className="text-lg font-black text-slate-800">{filtered.length} giao dịch</span>
          </div>

          {/* Row 4: Total Income */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
            <span className="text-lg font-black text-emerald-600/70 uppercase tracking-widest leading-none">Tổng thu nhập</span>
            <span className="text-lg font-black text-emerald-600">{formatVND(totals.income)}</span>
          </div>

          {/* Row 5: Total Expense */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100/50">
            <span className="text-lg font-black text-red-500/70 uppercase tracking-widest leading-none">Tổng chi phí</span>
            <span className="text-lg font-black text-red-500">{formatVND(totals.expense)}</span>
          </div>

          {/* Row 6: Balance (Dư) */}
          <div className={`flex items-center justify-between p-4 rounded-2xl shadow-lg transition-all
            ${totals.income - totals.expense >= 0
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white'}`}
          >
            <span className="text-lg font-black uppercase tracking-widest opacity-90">Số dư (Dư)</span>
            <span className="text-lg font-black">{formatVND(totals.income - totals.expense)}</span>
          </div>

          {/* Reset Action */}
          {(filterType !== 'ALL' || selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setFilterType('ALL');
                setSelectedMonth('all');
                setSelectedYear('all');
              }}
              className="w-full mt-2 py-3 text-lg font-black text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <i className="fas fa-rotate-left"></i>
              Xoá bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {filtered.length > 0 ? (
        <>
          {/* Mobile View (Cards) */}
          <div className="space-y-3 md:hidden">
            {filtered.map(t => {
              const cat = categories.find(c => c.id === t.category);
              return (
                <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${cat?.color || 'bg-slate-400'} flex items-center justify-center text-white text-lg shadow-sm shadow-indigo-50`}>
                      <i className={`fas ${cat?.icon || 'fa-tag'}`}></i>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                        {t.description || cat?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                          {cat?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(t.date)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{formatVND(t.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Mobile) */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => onView(t)}
                      className="text-indigo-500 hover:text-indigo-700 text-[11px] font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button
                      onClick={() => onEdit(t)}
                      className="text-amber-600 hover:text-amber-700 text-[11px] font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <i className="fas fa-pen"></i> Sửa
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i> Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Ngày</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Hạng mục</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Nội dung</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-right">Số tiền</th>
                  <th scope="col" className="px-6 py-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => {
                  const cat = categories.find(c => c.id === t.category);
                  const isLast = index === filtered.length - 1;
                  return (
                    <tr key={t.id} className={`bg-white hover:bg-slate-50 transition-colors ${!isLast ? 'border-b border-slate-50' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${cat?.color || 'bg-slate-400'} flex items-center justify-center text-white text-xs shadow-sm`}>
                            <i className={`fas ${cat?.icon || 'fa-tag'}`}></i>
                          </div>
                          <span className="font-medium text-slate-700">{cat?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={t.description}>
                        {t.description || '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{formatVND(t.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onView(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye text-xs"></i>
                            <span>Xem</span>
                          </button>
                          <button
                            onClick={() => onEdit(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-pen text-xs"></i>
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => onDelete(t.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            title="Xóa giao dịch"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-100 py-20 flex flex-col items-center justify-center text-slate-400 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-calendar-xmark text-2xl text-slate-200"></i>
          </div>
          <p className="text-sm font-medium">Không tìm thấy giao dịch nào</p>
          <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold tracking-widest">trong bộ lọc hiện tại</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;

