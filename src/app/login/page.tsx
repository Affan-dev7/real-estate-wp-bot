'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataStore } from '@/lib/store';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await DataStore.login(email, password);

    if (result.success) {
      router.push('/');
    } else {
      setErrorMsg(result.error || 'Invalid email or password. Please verify your credentials or contact your agency admin.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    await DataStore.login('agent@alraziqestate.pk', 'demo123456');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#0E6B50] flex items-center justify-center text-white">
            <Building2 className="w-7 h-7" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-xl font-bold tracking-tight text-[#1A202C]">
          Property Desk
        </h1>
        <p className="mt-1 text-center text-xs text-[#5A6578]">
          CRM for real estate agencies in Pakistan • Al-Raziq Estate
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E2E8F0] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div
                role="alert"
                className="bg-[#FDF2E9] border-l-4 border-[#D9480F] p-3 text-xs text-[#9C3608] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Sign in failed</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#1A202C]">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A6578]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@agency.pk"
                  className="block w-full text-xs pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#1A202C]">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A6578]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full text-xs pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-xs font-bold text-white bg-[#0E6B50] hover:bg-[#0A4D3A] focus:outline-none transition-colors touch-target shadow-sm"
              >
                {loading ? 'Verifying credentials...' : 'Sign in to agency account'}
              </button>
            </div>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 text-xs text-[#5A6578]">
              <div className="flex items-center gap-1.5 font-semibold text-[#1A202C] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#0E6B50]" />
                <span>Admin created account mode</span>
              </div>
              <p className="text-[11px] mb-3">
                No public sign-up. Accounts are provisioned by agency administrators only.
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] hover:border-[#0E6B50] text-[#0E6B50] font-semibold text-xs transition-colors touch-target"
              >
                <span>Try Demo Agency Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
