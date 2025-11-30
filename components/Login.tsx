import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (isLogin) {
        // Handle Login
        const result = storageService.login(formData.handle, formData.password);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setError(result.message);
        }
      } else {
        // Handle Register
        if (!formData.name || !formData.handle || !formData.password) {
          setError('Vui lòng điền đầy đủ thông tin');
          setIsLoading(false);
          return;
        }
        
        // Auto-generate handle format if user didn't add @
        let finalHandle = formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`;
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: formData.name,
          handle: finalHandle,
          password: formData.password,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalHandle}`,
          bio: 'Thành viên mới của Gemini Social 🎉',
          coverImage: 'https://picsum.photos/seed/cover/1000/300',
          isCurrentUser: true
        };

        const result = storageService.register(newUser);
        if (result.success) {
          // Auto login after register
          storageService.login(finalHandle, formData.password);
          onLogin(newUser);
        } else {
          setError(result.message);
        }
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200 transform rotate-3">
            G
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? 'Đăng nhập để kết nối với cộng đồng' : 'Tham gia Gemini Social ngay hôm nay'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Tên hiển thị</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Minh Nam"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Username (Handle)</label>
            <input
              type="text"
              name="handle"
              value={formData.handle}
              onChange={handleChange}
              placeholder="@username"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký ngay'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', handle: '', password: '' });
              }}
              className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isLogin ? 'Tạo tài khoản mới' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;