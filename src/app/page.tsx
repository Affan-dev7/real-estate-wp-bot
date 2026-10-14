'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import StatBarChart from '@/components/StatBarChart';
import { DataStore } from '@/lib/store';
import { DateRange, DashboardStats, Lead } from '@/lib/types';
import { formatPhone, timeAgo, getRequirementSummary } from '@/lib/formatters';
import {
  MessageSquare,
  Bot,
  UserPlus,
  Flame,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function HomePage() {
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [needHumanLeads, setNeedHumanLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const s = DataStore.getDashboardStats(dateRange);
    setStats(s);

    const allLeads = DataStore.getLeads();
    const humanLeads = allLeads.filter((l) => l.bot_paused).slice(0, 4);
    setNeedHumanLeads(humanLeads);
  }, [dateRange]);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Controls: Date range filter & Quick Add Listing */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A202C]">Agency overview</h1>
            <p className="text-xs text-[#5A6578]">
              Live metrics across Karachi, Lahore & Islamabad
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Date range picker */}
            <div className="inline-flex border border-[#CBD5E1] bg-white p-0.5">
              {(['today', '7days', '30days'] as DateRange[]).map((range) => {
                const labelMap = {
                  today: 'Today',
                  '7days': '7 days',
                  '30days': '30 days',
                };
                const active = dateRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors touch-target ${
                      active
                        ? 'bg-[#0E6B50] text-white'
                        : 'text-[#5A6578] hover:text-[#1A202C]'
                    }`}
                  >
                    {labelMap[range]}
                  </button>
                );
              })}
            </div>

            <Link
              href="/listings/new"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0E6B50] hover:bg-[#0A4D3A] text-white text-xs font-semibold transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Add listing</span>
            </Link>
          </div>
        </div>

        {/* Human Attention Alert Banner */}
        {stats.chatsNeedHuman > 0 && (
          <div className="bg-[#FEF3C7] border-l-4 border-[#D9480F] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D9480F] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#92400E]">
                  {stats.chatsNeedHuman} chats need a human
                </p>
                <p className="text-xs text-[#78350F] mt-0.5">
                  Customer asked for a real person or automated bot is paused.
                </p>
              </div>
            </div>

            <Link
              href="/leads?filter=need_human"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#D9480F] hover:bg-[#B43403] px-3.5 py-2 transition-colors touch-target"
            >
              <span>Review leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Messages received */}
          <div className="bg-white border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between text-xs text-[#5A6578]">
              <span>Messages received</span>
              <MessageSquare className="w-4 h-4 text-[#0E6B50]" />
            </div>
            <p className="text-2xl font-bold text-[#1A202C] tabular-nums mt-2">
              {stats.messagesReceived}
            </p>
            <p className="text-[11px] text-[#5A6578] mt-1">Inbound inquiries</p>
          </div>

          {/* Messages sent by bot */}
          <div className="bg-white border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between text-xs text-[#5A6578]">
              <span>Sent by bot</span>
              <Bot className="w-4 h-4 text-[#0E6B50]" />
            </div>
            <p className="text-2xl font-bold text-[#1A202C] tabular-nums mt-2">
              {stats.messagesSentByBot}
            </p>
            <p className="text-[11px] text-[#5A6578] mt-1">Automated replies</p>
          </div>

          {/* New leads */}
          <div className="bg-white border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between text-xs text-[#5A6578]">
              <span>New leads</span>
              <UserPlus className="w-4 h-4 text-[#0E6B50]" />
            </div>
            <p className="text-2xl font-bold text-[#0E6B50] tabular-nums mt-2">
              {stats.newLeads}
            </p>
            <p className="text-[11px] text-[#5A6578] mt-1">In selected range</p>
          </div>

          {/* Hot leads */}
          <div className="bg-white border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between text-xs text-[#5A6578]">
              <span>Hot leads</span>
              <Flame className="w-4 h-4 text-[#D9480F] fill-[#D9480F]" />
            </div>
            <p className="text-2xl font-bold text-[#D9480F] tabular-nums mt-2">
              {stats.hotLeads}
            </p>
            <p className="text-[11px] text-[#5A6578] mt-1">Ready cash buyers</p>
          </div>

          {/* Visits booked */}
          <div className="col-span-2 lg:col-span-1 bg-white border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between text-xs text-[#5A6578]">
              <span>Visits booked</span>
              <Calendar className="w-4 h-4 text-[#0E6B50]" />
            </div>
            <p className="text-2xl font-bold text-[#1A202C] tabular-nums mt-2">
              {stats.visitsBooked}
            </p>
            <p className="text-[11px] text-[#5A6578] mt-1">Scheduled inspections</p>
          </div>
        </div>

        {/* Bar Chart Section */}
        <StatBarChart data={stats.leadsPerDay} title="New leads per day" />

        {/* Priority Action Rows: Human Needed or Hot Leads */}
        {needHumanLeads.length > 0 && (
          <div className="bg-white border border-[#E2E8F0]">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#1A202C]">
                Chats waiting for agent action
              </h2>
              <Link
                href="/leads?filter=need_human"
                className="text-xs text-[#0E6B50] font-semibold hover:underline"
              >
                View all ({stats.chatsNeedHuman})
              </Link>
            </div>

            <div>
              {needHumanLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads?selected=${lead.id}`}
                  className="flex items-center justify-between px-4 py-3.5 border-b border-[#E2E8F0] hover:bg-[#F7FAFC] transition-colors touch-target"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1A202C]">
                        {lead.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#5A6578]">
                        {formatPhone(lead.phone)}
                      </span>
                      <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-1.5 py-0.5 rounded">
                        Bot paused
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6578] truncate mt-0.5">
                      {getRequirementSummary(lead)}
                    </p>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <span className="text-[11px] text-[#5A6578] tabular-nums block">
                      {timeAgo(lead.last_message_at)}
                    </span>
                    <span className="text-xs text-[#0E6B50] font-semibold mt-0.5 inline-flex items-center gap-0.5">
                      <span>Take over</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
