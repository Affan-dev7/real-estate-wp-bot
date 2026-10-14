'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataStore, UserSession } from '@/lib/store';
import { Agency } from '@/lib/types';
import { LogOut, Phone } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setAgency(DataStore.getAgency());
    setSession(DataStore.getSession());
  }, []);

  const handleLogout = async () => {
    await DataStore.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex flex-col">
            <span className="text-base font-semibold text-[#1A202C] tracking-tight">
              {agency ? agency.name : 'Al-Raziq Estate & Builders'}
            </span>
            <div className="flex items-center gap-2 text-xs text-[#5A6578]">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-[#0E6B50]" />
                {agency?.agent_phone || '+92 300 8251940'}
              </span>
              <span>•</span>
              <span className="text-[#0E6B50] font-medium">Karachi / Lahore / Islamabad</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {session?.isDemo && (
            <span className="hidden sm:inline-block text-xs bg-[#E6F4F0] text-[#0E6B50] font-medium px-2 py-1 rounded">
              Demo mode
            </span>
          )}

          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="flex items-center gap-1.5 text-sm text-[#5A6578] hover:text-[#1A202C] px-3 py-2 border border-[#E2E8F0] rounded bg-white hover:bg-[#F7FAFC] transition-colors touch-target"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
