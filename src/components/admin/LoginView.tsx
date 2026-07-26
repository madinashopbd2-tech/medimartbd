import React, { useState } from 'react';
import { Lock, User, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || 'লগইন ব্যর্থ হয়েছে');
      }
    } catch (err) {
      setError('সার্ভার এরর');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-slate-900 p-6 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">এডমিন প্যানেল</h2>
          <p className="text-slate-400 text-sm mt-1">লগইন করে ড্যাশবোর্ডে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইউজারনেম</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm outline-none transition-shadow"
                placeholder="ইউজারনেম লিখুন"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm outline-none transition-shadow"
                placeholder="পাসওয়ার্ড লিখুন"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'লগইন করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
