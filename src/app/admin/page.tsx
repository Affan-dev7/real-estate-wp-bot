'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import { DataStore } from '@/lib/store';
import { ShieldAlert, Building2, UserPlus, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';

interface AgencyStat {
  id: string;
  name: string;
  phone: string;
  city: string;
  activeListings: number;
  totalLeads: number;
  monthlyMessages: { month: string; count: number }[];
}

const SAMPLE_AGENCIES: AgencyStat[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Al-Raziq Estate & Builders',
    phone: '+92 300 8251940',
    city: 'Karachi & Lahore',
    activeListings: 10,
    totalLeads: 15,
    monthlyMessages: [
      { month: 'Oct 2026', count: 124 },
      { month: 'Sep 2026', count: 98 },
      { month: 'Aug 2026', count: 82 },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Zamindar Associates Islamabad',
    phone: '+92 321 5558899',
    city: 'Islamabad F-7 & F-10',
    activeListings: 18,
    totalLeads: 32,
    monthlyMessages: [
      { month: 'Oct 2026', count: 210 },
      { month: 'Sep 2026', count: 185 },
      { month: 'Aug 2026', count: 140 },
    ],
  },
];

export default function AdminPage() {
  const [agencies, setAgencies] = useState<AgencyStat[]>(SAMPLE_AGENCIES);
  const [selectedAgencyId, setSelectedAgencyId] = useState(SAMPLE_AGENCIES[0].id);

  // New User Form State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'owner' | 'admin'>('admin');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userPassword) {
      setFormError('Both email and password are required to provision an agency user.');
      return;
    }

    if (userPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const agency = agencies.find((a) => a.id === selectedAgencyId);

    setFormSuccess(
      `Agency user ${userEmail} created successfully with role "${userRole}" for ${agency?.name}.`
    );
    setFormError(null);
    setUserEmail('');
    setUserPassword('');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D9480F] mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Master administrator console</span>
          </div>
          <h1 className="text-xl font-bold text-[#1A202C]">Agencies & tenant management</h1>
          <p className="text-xs text-[#5A6578]">
            Multi-tenant control, monthly WhatsApp message volume, and agency user provisioning
          </p>
        </div>

        {/* Agencies List & Monthly Message Counts */}
        <div className="bg-white border border-[#E2E8F0]">
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <h2 className="text-xs font-bold text-[#1A202C]">
              Registered agencies & monthly message throughput
            </h2>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {agencies.map((agency) => (
              <div key={agency.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0E6B50]" />
                    <span className="font-bold text-sm text-[#1A202C]">{agency.name}</span>
                    <span className="text-xs font-mono text-[#5A6578]">{agency.phone}</span>
                  </div>
                  <p className="text-xs text-[#5A6578] mt-1">
                    Coverage: {agency.city} • {agency.activeListings} active listings • {agency.totalLeads} total leads
                  </p>
                </div>

                {/* Monthly Message Counts */}
                <div className="flex items-center gap-3">
                  {agency.monthlyMessages.map((m) => (
                    <div
                      key={m.month}
                      className="bg-[#F7FAFC] border border-[#CBD5E1] px-3 py-1.5 text-center min-w-[70px]"
                    >
                      <span className="text-[10px] text-[#5A6578] block">{m.month}</span>
                      <span className="text-xs font-bold text-[#1A202C] tabular-nums">
                        {m.count} msgs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Agency User Form */}
        <div className="bg-white border border-[#E2E8F0] p-4 sm:p-6 max-w-2xl">
          <div className="border-b border-[#E2E8F0] pb-2 mb-4">
            <h2 className="text-sm font-bold text-[#1A202C] flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#0E6B50]" />
              <span>Create agency user</span>
            </h2>
            <p className="text-xs text-[#5A6578]">
              Provision credentials for an agent or broker. They will only see their assigned agency data.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-4 bg-[#E6F4F0] border-l-4 border-[#0E6B50] p-3 text-xs text-[#0A4D3A] flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 bg-[#FDF2E9] border-l-4 border-[#D9480F] p-3 text-xs text-[#9C3608] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label htmlFor="agency-select" className="block text-xs font-medium text-[#1A202C] mb-1">
                Assign to agency *
              </label>
              <select
                id="agency-select"
                value={selectedAgencyId}
                onChange={(e) => setSelectedAgencyId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-[#CBD5E1] bg-white rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
              >
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user-email-input" className="block text-xs font-medium text-[#1A202C] mb-1">
                Agent email *
              </label>
              <input
                id="user-email-input"
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="agent@agency.pk"
                className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
              />
            </div>

            <div>
              <label htmlFor="user-password-input" className="block text-xs font-medium text-[#1A202C] mb-1">
                Temporary password *
              </label>
              <input
                id="user-password-input"
                type="password"
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
              />
            </div>

            <div>
              <label htmlFor="user-role-select" className="block text-xs font-medium text-[#1A202C] mb-1">
                Agency role *
              </label>
              <select
                id="user-role-select"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'owner' | 'admin')}
                className="w-full text-xs px-3 py-2 border border-[#CBD5E1] bg-white rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
              >
                <option value="admin">Admin (Manage leads, listings, visits)</option>
                <option value="owner">Owner (Full agency control)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0E6B50] hover:bg-[#0A4D3A] text-white text-xs font-bold rounded-none transition-colors touch-target shadow-sm"
              >
                Create agency user
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
