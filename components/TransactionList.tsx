
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
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex-1 md:flex-initial">
            <button
              onClick={() => setFilterType('ALL')}
              className={`flex-1 md:px-6 py-3 text-base font-bold rounded-xl transition-all ${filterType === 'ALL' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType(TransactionType.INCOME)}
              className={`flex-1 md:px-6 py-3 text-base font-bold rounded-xl transition-all ${filterType === TransactionType.INCOME ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}
            >
              Thu nhập
            </button>
            <button
              onClick={() => setFilterType(TransactionType.EXPENSE)}
              className={`flex-1 md:px-6 py-3 text-base font-bold rounded-xl transition-all ${filterType === TransactionType.EXPENSE ? 'bg-white shadow-md text-red-500' : 'text-slate-400'}`}
            >
              Chi phí
            </button>
          </div>

          <div className="flex items-center gap-4 sm:ml-auto">
            {/* Month Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="text-lg bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 py-3 pl-4 pr-10 font-black text-slate-700 shadow-sm"
              >
                <option value="all">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-black text-slate-400 uppercase tracking-wider">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="text-lg bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 py-3 pl-4 pr-10 font-black text-slate-700 shadow-sm"
              >
                <option value="all">Tất cả</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-3 font-bold uppercase tracking-widest">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-slate-400">Kết quả: {filtered.length} giao dịch</span>
            <span className="text-emerald-600">Tổng thu: {formatVND(totals.income)}</span>
            <span className="text-red-500">Tổng chi: {formatVND(totals.expense)}</span>
            <span className={`px-2 py-0.5 rounded-full ${totals.income - totals.expense >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              Dư: {formatVND(totals.income - totals.expense)}
            </span>
          </div>
          {(filterType !== 'ALL' || selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setFilterType('ALL');
                setSelectedMonth('all');
                setSelectedYear('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 self-start sm:self-auto"
            >
              <i className="fas fa-rotate-left"></i> Đặt lại
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

