'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, Calendar } from 'lucide-react';
import { DataStore } from '@/lib/store';

function BottomNavInner() {
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
  ];

  return (
    <div className="grid grid-cols-4 h-16">
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
            className={`flex flex-col items-center justify-center relative touch-target transition-colors ${
              isActive
                ? 'text-[#0E6B50] font-semibold'
                : 'text-[#5A6578] hover:text-[#1A202C]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
              {item.badge && item.badge > 0 ? (
                <span
                  aria-label={`${item.badge} chats need attention`}
                  className="absolute -top-1 -right-2 bg-[#D9480F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center"
                >
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-sm pb-safe"
    >
      <Suspense fallback={<div className="h-16" />}>
        <BottomNavInner />
      </Suspense>
    </nav>
  );
}
