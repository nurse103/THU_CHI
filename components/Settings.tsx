import React from 'react';
import { UserSettings, TransactionType, Category } from '../types';

interface Props {
  settings: UserSettings;
  onUpdate: (newSettings: Partial<UserSettings>) => void;
}

const Settings: React.FC<Props> = ({ settings, onUpdate }) => {
  const handleDependentChange = (val: number) => {
    onUpdate({ dependents: Math.max(0, val) });
  };

  const updateCategory = (type: TransactionType, value: string, updates: Partial<Category>) => {
    const group = type === TransactionType.INCOME ? 'income' : 'expense';
    const updated = settings.categories[group].map(c =>
      c.value === value ? { ...c, ...updates } : c
    );

    onUpdate({
      categories: {
        ...settings.categories,
        [group]: updated
      }
    });
  };

  const renderCategoryList = (type: TransactionType) => {
    const categories = type === TransactionType.INCOME
      ? settings.categories.income
      : settings.categories.expense;

    return (
      <div className="space-y-2 mt-3">
        {categories.map(cat => (
          <div key={cat.value} className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 border border-slate-100">
            <div className={`w-8 h-8 rounded-full ${type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'} flex items-center justify-center text-white text-xs`}>
              <i className={`fas ${cat.icon}`}></i>
            </div>
            <div className="flex-1 overflow-hidden">
              <input
                type="text"
                value={cat.label}
                onChange={(e) => updateCategory(type, cat.value, { label: e.target.value })}
                className="w-full bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 p-0"
              />
            </div>
            {type === TransactionType.INCOME && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors uppercase">Tính thuế</span>
                <input
                  type="checkbox"
                  checked={cat.taxable || false}
                  onChange={(e) => updateCategory(type, cat.value, { taxable: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
              </label>
            )}
            <i className="fas fa-pen text-[10px] text-slate-300 ml-2"></i>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <i className="fas fa-users text-sm"></i>
          </div>
          <h3 className="font-bold text-slate-800">Cấu hình Thuế</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-slate-700">Số người phụ thuộc</p>
              <p className="text-[11px] text-slate-400">Dùng để tự động tính giảm trừ gia cảnh</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                onClick={() => handleDependentChange(settings.dependents - 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
              <span className="text-lg font-bold w-8 text-center text-slate-800">{settings.dependents}</span>
              <button
                onClick={() => handleDependentChange(settings.dependents + 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600"
              >
                <i className="fas fa-plus text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <i className="fas fa-hand-holding-usd text-sm"></i>
            </div>
            <h3 className="font-bold text-slate-800">Khoản thu nhập</h3>
          </div>
          <p className="text-[11px] text-slate-400 ml-10">Bật "Tính thuế" cho các khoản có tạm trừ thuế TNCN</p>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            {renderCategoryList(TransactionType.INCOME)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <i className="fas fa-receipt text-sm"></i>
            </div>
            <h3 className="font-bold text-slate-800">Khoản chi</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            {renderCategoryList(TransactionType.EXPENSE)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
