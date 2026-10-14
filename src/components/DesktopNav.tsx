'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, Calendar, ShieldAlert } from 'lucide-react';
import { DataStore } from '@/lib/store';

function DesktopNavInner() {
  const pathname = usePathname();
  const [needHumanCount, setNeedHumanCount] = useState(0);

  useEffect(() => {
    const stats = DataStore.getDashboardStats('today');
    setNeedHumanCount(stats.chatsNeedHuman);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Leads', href: '/leads', icon: Users, badge: needHumanCount },
    { label: 'Listings', href: '/listings', icon: Building2 },
    { label: 'Visits', href: '/visits', icon: Calendar },
    { label: 'Admin', href: '/admin', icon: ShieldAlert },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
      <nav aria-label="Desktop navigation" className="flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-[#0E6B50] text-[#0E6B50] font-semibold bg-[#F7FAFC]'
                  : 'border-transparent text-[#5A6578] hover:text-[#1A202C] hover:bg-[#F7FAFC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-1 bg-[#D9480F] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="text-xs text-[#5A6578]">
        Timezone: <span className="font-mono text-[#1A202C]">PKT (UTC+5)</span>
      </div>
    </div>
  );
}

export default function DesktopNav() {
  return (
    <div className="hidden md:block bg-white border-b border-[#E2E8F0]">
      <Suspense fallback={<div className="h-12 max-w-7xl mx-auto px-4" />}>
        <DesktopNavInner />
      </Suspense>
    </div>
  );
}
