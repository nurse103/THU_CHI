import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Query users table directly
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Sai tên đăng nhập hoặc mật khẩu.');
      }

      const user: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        police: data.police
      };

      onLogin(user);

    } catch (error: any) {
      console.error('Login Error:', error);
      setError(error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-indigo-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-emerald-600 rounded-full blur-[120px] opacity-10"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl shadow-lg shadow-indigo-200 mb-6 transform transition-transform hover:scale-105">
              <i className="fas fa-wallet text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">
              THU-CHI
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Quản lý tài chính cá nhân thông minh
            </p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <i className="fas fa-user-circle"></i>
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 animate-shake">
                <i className="fas fa-circle-exclamation"></i>
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all flex items-center justify-center gap-3
                ${loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 shadow-indigo-100'
                }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Đang xử lý</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Thiết kế bởi Nurse103 &copy; 2026<br />
              Hệ thống quản lý tài chính nội bộ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
