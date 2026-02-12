import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Transaction, UserSettings, TransactionType, User } from './types';
import { CATEGORIES as DEFAULT_CATEGORIES } from './constants.tsx';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TaxTool from './components/TaxTool';
import TransactionModal from './components/TransactionModal';
import Settings from './components/Settings';
import Login from './components/Login';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'tax' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<UserSettings>({
    dependents: 0,
    categories: DEFAULT_CATEGORIES
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('thuchi_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('thuchi_user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchSettings();
    }
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('thuchi_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); // Just in case, though we rely on local state mainly
    setUser(null);
    localStorage.removeItem('thuchi_user');
    setTransactions([]);
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('thu_chi')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });

    console.log('Fetching transactions result:', { data, error });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else if (data) {
      const fetchedTransactions: Transaction[] = data.map((t: any) => ({
        id: t.id.toString(),
        type: t.transaction_type === 'Thu' ? TransactionType.INCOME : TransactionType.EXPENSE,
        amount: t.amount,
        category: t.category,
        date: t.transaction_date,
        description: t.notes || ''
      }));
      setTransactions(fetchedTransactions);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cai_dat')
      .select('so_nguoi_phu_thuoc, cau_hinh_thu_nhap')
      .eq('user_id', user.id)
      .single();

    if (data) {
      // Deep copy to avoid mutating DEFAULT_CATEGORIES
      const newCategories = {
        income: DEFAULT_CATEGORIES.income.map(c => ({ ...c })),
        expense: DEFAULT_CATEGORIES.expense.map(c => ({ ...c }))
      };

      if (data.cau_hinh_thu_nhap) {
        Object.keys(data.cau_hinh_thu_nhap).forEach(key => {
          const categoryToUpdate = newCategories.income.find(c => c.value === key);
          if (categoryToUpdate) {
            categoryToUpdate.taxable = data.cau_hinh_thu_nhap[key];
          }
        });
      }
      setSettings({
        dependents: data.so_nguoi_phu_thuoc || 0,
        categories: newCategories
      });
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
    }
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('thu_chi')
      .insert({
        transaction_type: t.type === TransactionType.INCOME ? 'Thu' : 'Chi',
        amount: t.amount,
        category: t.category,
        transaction_date: t.date,
        notes: t.description,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
    } else if (data) {
      const newT: Transaction = {
        id: data.id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description
      };
      setTransactions(prev => [newT, ...prev]);
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('thu_chi')
      .delete()
      .match({ id: id });

    if (error) {
      console.error('Error deleting transaction:', error);
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    const dbUpdates: any = {};
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.type !== undefined) dbUpdates.transaction_type = updates.type === TransactionType.INCOME ? 'Thu' : 'Chi';
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.transaction_date = updates.date;
    if (updates.description !== undefined) dbUpdates.notes = updates.description;

    const { error } = await supabase
      .from('thu_chi')
      .update(dbUpdates)
      .eq('id', parseInt(id))
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating transaction:', error);
    } else {
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ));
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (t: Transaction) => {
    setModalMode('view');
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Transaction) => {
    setModalMode('edit');
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    const cau_hinh_thu_nhap: { [key: string]: boolean } = {};
    updatedSettings.categories.income.forEach(cat => {
      cau_hinh_thu_nhap[cat.value] = cat.taxable ?? false;
    });

    const { error } = await supabase
      .from('cai_dat')
      .upsert({
        user_id: user.id,
        so_nguoi_phu_thuoc: updatedSettings.dependents,
        cau_hinh_thu_nhap: cau_hinh_thu_nhap,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Flatten categories for components that expect an array
  const incomeCats = settings.categories.income.map(c => ({
    ...c,
    id: c.value,
    name: c.label,
    type: TransactionType.INCOME,
    color: 'bg-emerald-500' // Default color for income
  }));
  const expenseCats = settings.categories.expense.map(c => ({
    ...c,
    id: c.value,
    name: c.label,
    type: TransactionType.EXPENSE,
    color: 'bg-rose-500' // Default color for expense
  }));
  const flatCategories = [...incomeCats, ...expenseCats];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            transactions={transactions}
            categories={flatCategories}
            onDelete={deleteTransaction}
            onEdit={handleOpenEditModal}
            onView={handleOpenViewModal}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            onEdit={handleOpenEditModal}
            onView={handleOpenViewModal}
            categories={flatCategories}
          />
        );
      case 'tax':
        return (
          <TaxTool
            defaultDependents={settings.dependents}
            onUpdateDependents={(val) => updateSettings({ dependents: val })}
            transactions={transactions}
            categories={flatCategories}
          />
        );
      case 'settings':
        return <Settings settings={settings} onUpdate={updateSettings} />;
      default:
        return <Dashboard transactions={transactions} categories={flatCategories} />;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar - Desktop & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Header - Mobile Only for Menu Toggle logic, Desktop mostly for info */}
        <header className="bg-white shadow-sm z-30 flex items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-indigo-600 focus:outline-none"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Title (Mobile mostly, desktop has it in sidebar) */}
            <h1 className="text-xl font-bold text-slate-800 md:hidden flex items-center gap-2">
              <i className="fas fa-wallet text-indigo-600"></i>
              THU-CHI
            </h1>

            {/* Current Tab Title (Desktop) */}
            <h2 className="hidden md:block text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'Tổng quan tài chính'}
              {activeTab === 'transactions' && 'Danh sách giao dịch'}
              {activeTab === 'tax' && 'Tính thuế TNCN'}
              {activeTab === 'settings' && 'Cài đặt hệ thống'}
            </h2>
          </div>

          {/* User Profile (Right side) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{user.full_name || 'Người dùng'}</p>
              <p className="text-xs text-slate-500">@{user.username}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
              <i className="fas fa-user text-lg"></i>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Floating Action Button (FAB) for Add Transaction - Only shown in Transactions tab */}
        {activeTab === 'transactions' && (
          <button
            onClick={handleOpenAddModal}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all z-40"
            title="Thêm giao dịch mới"
          >
            <i className="fas fa-plus text-2xl"></i>
          </button>
        )}

        {/* Modal */}
        {isModalOpen && (
          <TransactionModal
            mode={modalMode}
            initialData={selectedTransaction}
            onClose={() => setIsModalOpen(false)}
            onAdd={addTransaction}
            onSave={updateTransaction}
            categories={flatCategories}
          />
        )}
      </div>
    </div>
  );
};

export default App;
