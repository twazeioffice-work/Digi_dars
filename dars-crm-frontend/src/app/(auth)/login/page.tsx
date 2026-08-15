"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, token, role } = response.data;
      const jwtToken = access_token || token;

      // Set cookies (Valid for 7 days across entire domain)
      Cookies.set('dars_auth_token', jwtToken, { expires: 7, path: '/' });
      Cookies.set('user_role', role, { expires: 7, path: '/' });

      toast.success('Alhamdulillah, Login successful!');

      // Route based on role
      const upperRole = (role || '').toUpperCase();
      if (upperRole === 'SUPER_ADMIN') router.push('/super-admin');
      else if (upperRole === 'NAZIM' || upperRole === 'CENTER_ADMIN') router.push('/nazim');
      else if (upperRole === 'USTAD') router.push('/ustad');
      else router.push('/nazim');

    } catch (error: any) {
      console.error(error);
      const detail = error.response?.data?.detail || error.response?.data?.message || error.message;
      const errorMsg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : 'Invalid credentials');
      toast.error(errorMsg || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digi Dars</h1>
          <p className="text-xs text-slate-500 mt-1">Academic & Tarbiyyah Management Platform</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="ustad@masjid.org" 
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold p-3 rounded-lg text-sm transition-all duration-150 mt-2 shadow-sm"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          Enforcing Multi-Tenant Row-Level Security & Audit Ledger
        </div>
      </div>
    </div>
  );
}
