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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', width: '300px' }}>
        <h2>Đăng nhập</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>Tên đăng nhập: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Mật khẩu: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
};

export default Login;
