
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
  onView: (t: Transaction) => void;
}

const Dashboard: React.FC<Props> = ({ transactions, categories, onDelete, onEdit, onView }) => {
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const matchMonth = selectedMonth === 'all' || m === selectedMonth;
      const matchYear = selectedYear === 'all' || y === selectedYear;
      return matchMonth && matchYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseData = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: any[], t) => {
      const cat = categories.find(c => c.id === t.category);
      const name = cat?.name || 'Khác';
      const existing = acc.find(item => item.name === name);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name, value: t.amount, color: cat?.color || 'bg-slate-400' });
      }
      return acc;
    }, []);

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
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 -mt-10 relative z-40">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Tháng:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 py-1.5 px-3 font-medium text-slate-700"
          >
            <option value="all">Tất cả</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Năm:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 py-1.5 px-3 font-medium text-slate-700"
          >
            <option value="all">Tất cả</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-xs text-slate-400 font-medium italic">
          Đang hiển thị {filteredTransactions.length} giao dịch
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Số dư khả dụng</p>
          <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
            {formatVND(balance)}
          </p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
            <div className="flex-1">
              <p className="text-[10px] uppercase text-slate-400 font-bold">Tổng Thu</p>
              <p className="text-emerald-600 font-semibold">{formatVND(totalIncome)}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase text-slate-400 font-bold">Tổng Chi</p>
              <p className="text-red-500 font-semibold">{formatVND(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <i className="fas fa-chart-pie text-indigo-500"></i>
          Phân bổ chi tiêu
        </h3>
        <div className="bg-white p-4 rounded-2xl shadow-sm h-64 border border-slate-100">
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getColorHex(entry.color)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatVND(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
              Chưa có dữ liệu chi tiêu trong khoảng thời gian này
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Hoạt động gần đây</h3>
        </div>
        <div className="space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.slice(0, 5).map(t => {
              const cat = categories.find(c => c.id === t.category);
              return (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-50 flex flex-col md:flex-row md:items-center gap-4 group">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className={`w-10 h-10 rounded-full ${cat?.color || 'bg-slate-400'} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <i className={`fas ${cat?.icon || 'fa-tag'} text-xs`}></i>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-slate-800 truncate">{t.description || cat?.name}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(t.date)}</p>
                    </div>
                    <p className={`text-sm font-bold shrink-0 ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'}{formatVND(t.amount)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-50 shrink-0">
                    <button
                      onClick={() => onView(t)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <i className="fas fa-eye"></i><span>Xem</span>
                    </button>
                    <button
                      onClick={() => onEdit(t)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <i className="fas fa-pen"></i><span>Sửa</span>
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i><span>Xóa</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 text-sm">Không tìm thấy giao dịch nào</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const getColorHex = (tailwindClass: string) => {
  const map: any = {
    'bg-green-500': '#22c55e',
    'bg-emerald-500': '#10b981',
    'bg-cyan-500': '#06b6d4',
    'bg-blue-500': '#3b82f6',
    'bg-amber-500': '#f59e0b',
    'bg-amber-600': '#d97706',
    'bg-orange-500': '#f97316',
    'bg-indigo-500': '#6366f1',
    'bg-pink-500': '#ec4899',
    'bg-purple-500': '#a855f7',
    'bg-rose-500': '#f43f5e',
    'bg-slate-400': '#94a3b8',
  };
  return map[tailwindClass] || '#6366f1';
};

export default Dashboard;
