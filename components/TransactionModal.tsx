import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';

interface Props {
    mode: 'add' | 'edit' | 'view';
    initialData?: Transaction;
    onClose: () => void;
    onAdd?: (t: Omit<Transaction, 'id'>) => void;
    onSave?: (id: string, updates: Partial<Transaction>) => void;
    categories: Category[];
}

const TransactionModal: React.FC<Props> = ({ mode, initialData, onClose, onAdd, onSave, categories }) => {
    const [type, setType] = useState<TransactionType>(initialData?.type || TransactionType.EXPENSE);
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [categoryId, setCategoryId] = useState(initialData?.category || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);

    // Update initial category if not set and categories change
    useEffect(() => {
        if (!categoryId && categories.length > 0) {
            const first = categories.find(c => c.type === type);
            if (first) setCategoryId(first.id);
        }
    }, [type, categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'view') return;
        if (!amount || isNaN(parseInt(amount)) || !categoryId) return;

        if (mode === 'add' && onAdd) {
            onAdd({
                amount: parseInt(amount),
                type,
                category: categoryId,
                description,
                date: new Date(date).toISOString(),
            });
        } else if (mode === 'edit' && onSave && initialData) {
            onSave(initialData.id, {
                amount: parseInt(amount),
                type,
                category: categoryId,
                description,
                date: new Date(date).toISOString(),
            });
        }
        onClose();
    };

    const filteredCategories = categories.filter(c => c.type === type);
    const isReadOnly = mode === 'view';

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-2xl lg:max-w-3xl md:rounded-3xl rounded-t-[32px] p-6 animate-in slide-in-from-bottom md:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        {mode === 'add' && 'Ghi nhận giao dịch'}
                        {mode === 'edit' && 'Chỉnh sửa giao dịch'}
                        {mode === 'view' && 'Chi tiết giao dịch'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                        {/* Left Column: Type, Amount, Date */}
                        <div className="space-y-5">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => {
                                        setType(TransactionType.EXPENSE);
                                        setCategoryId(categories.find(c => c.type === TransactionType.EXPENSE)?.id || '');
                                    }}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === TransactionType.EXPENSE ? 'bg-white shadow-sm text-red-500' : 'text-slate-400'} ${isReadOnly && type !== TransactionType.EXPENSE ? 'opacity-50' : ''}`}
                                >
                                    <i className="fas fa-minus-circle mr-2"></i>Chi phí
                                </button>
                                <button
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => {
                                        setType(TransactionType.INCOME);
                                        setCategoryId(categories.find(c => c.type === TransactionType.INCOME)?.id || '');
                                    }}
                                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === TransactionType.INCOME ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'} ${isReadOnly && type !== TransactionType.INCOME ? 'opacity-50' : ''}`}
                                >
                                    <i className="fas fa-plus-circle mr-2"></i>Thu nhập
                                </button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Số tiền giao dịch</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        disabled={isReadOnly}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full bg-slate-50 border-none rounded-xl p-4 text-3xl font-bold focus:ring-2 pr-12 transition-all ${type === TransactionType.INCOME ? 'text-emerald-600 focus:ring-emerald-500' : 'text-red-500 focus:ring-red-500'} ${isReadOnly ? 'opacity-100' : ''}`}
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">đ</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Ngày thực hiện</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        disabled={isReadOnly}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <i className="fas fa-calendar-alt absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Category, Note */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 pl-1">Hạng mục</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {filteredCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            disabled={isReadOnly}
                                            onClick={() => setCategoryId(cat.id)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all border-2 ${categoryId === cat.id ? 'border-indigo-500 bg-indigo-50 shadow-inner' : 'border-transparent bg-slate-50 hover:bg-slate-100'} ${isReadOnly && categoryId !== cat.id ? 'opacity-30' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full ${cat.color} flex items-center justify-center text-white shadow-md transition-transform ${categoryId === cat.id ? 'scale-110' : ''}`}>
                                                <i className={`fas ${cat.icon} text-sm`}></i>
                                            </div>
                                            <span className={`text-[10px] font-bold text-center leading-tight ${categoryId === cat.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                {cat.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 pl-1">Ghi chú</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        disabled={isReadOnly}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 pl-10"
                                        placeholder="VD: Mua thực phẩm..."
                                    />
                                    <i className="fas fa-pen absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isReadOnly && (
                        <div className="pt-4 md:pt-2">
                            <button
                                type="submit"
                                className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-lg ${type === TransactionType.INCOME ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
                            >
                                <i className="fas fa-check-circle mr-2"></i>
                                {mode === 'add' ? 'Lưu giao dịch' : 'Cập nhật giao dịch'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
