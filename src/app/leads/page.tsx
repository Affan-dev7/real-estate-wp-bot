'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import LeadRow from '@/components/LeadRow';
import LeadDetail from '@/components/LeadDetail';
import { DataStore } from '@/lib/store';
import { Lead, LeadLabel, LeadStatus } from '@/lib/types';
import { Search, Flame, AlertCircle, Download, ArrowLeft, RotateCcw } from 'lucide-react';

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<'all' | 'hot' | 'need_human'>('all');

  const reloadLeads = () => {
    const list = DataStore.getLeads();
    setLeads([...list]);
  };

  useEffect(() => {
    reloadLeads();

    const paramFilter = searchParams.get('filter');
    if (paramFilter === 'need_human') {
      setLabelFilter('need_human');
    } else if (paramFilter === 'hot') {
      setLabelFilter('hot');
    }

    const sel = searchParams.get('selected');
    if (sel) {
      setSelectedLeadId(sel);
    }
  }, [searchParams]);

  // Set default selected lead on desktop if none selected
  useEffect(() => {
    if (!selectedLeadId && leads.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchPhone = lead.phone.replace(/\s+/g, '').includes(q);
        const matchArea = (lead.wants_area || '').toLowerCase().includes(q);
        const matchSize = (lead.wants_size || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchArea && !matchSize) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }

      // Label / Human needed
      if (labelFilter === 'hot' && lead.label !== 'hot') {
        return false;
      }
      if (labelFilter === 'need_human' && !lead.bot_paused) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, statusFilter, labelFilter]);

  const handleExportCsv = () => {
    DataStore.downloadLeadsCsv();
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLabelFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A202C]">Leads directory</h1>
            <p className="text-xs text-[#5A6578]">
              {filteredLeads.length} of {leads.length} leads matching filters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#CBD5E1] text-[#1A202C] hover:bg-[#F8FAFC] text-xs font-semibold transition-colors touch-target"
            >
              <Download className="w-4 h-4 text-[#0E6B50]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="bg-white border border-[#E2E8F0] flex-1 flex flex-col md:flex-row min-h-[600px] overflow-hidden">
          {/* Left Panel: Search, Filters, and List */}
          <div
            className={`w-full md:w-5/12 lg:w-4/12 border-r border-[#E2E8F0] flex flex-col ${
              selectedLeadId ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Input */}
            <div className="p-3 border-b border-[#E2E8F0]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#5A6578]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone (+92), area, size..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F7FAFC] flex flex-wrap gap-1.5">
              <button
                onClick={() => setLabelFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium border touch-target ${
                  labelFilter === 'all'
                    ? 'bg-[#1A202C] text-white border-[#1A202C]'
                    : 'bg-white text-[#5A6578] border-[#CBD5E1] hover:bg-white'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setLabelFilter('hot')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border touch-target ${
                  labelFilter === 'hot'
                    ? 'bg-[#D9480F] text-white border-[#D9480F]'
                    : 'bg-white text-[#D9480F] border-[#CBD5E1] hover:bg-white'
                }`}
              >
                <Flame className="w-3 h-3 fill-current" />
                <span>Hot</span>
              </button>

              <button
                onClick={() => setLabelFilter('need_human')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border touch-target ${
                  labelFilter === 'need_human'
                    ? 'bg-[#92400E] text-white border-[#92400E]'
                    : 'bg-white text-[#92400E] border-[#CBD5E1] hover:bg-white'
                }`}
              >
                <AlertCircle className="w-3 h-3 text-current" />
                <span>Human needed</span>
              </button>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-2 py-1 bg-white border border-[#CBD5E1] text-[#1A202C] focus:outline-none focus:border-[#0E6B50] touch-target"
              >
                <option value="all">Any status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="visit_booked">Visit booked</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-[#5A6578] mb-3">
                    No leads match your active filters or search terms.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0E6B50] border border-[#0E6B50] bg-white hover:bg-[#E6F4F0] touch-target"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset filters</span>
                  </button>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadId === lead.id}
                    onClick={() => handleSelectLead(lead.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Lead Detail (Master-Detail on desktop; full screen on mobile) */}
          <div
            className={`w-full md:w-7/12 lg:w-8/12 flex-1 flex flex-col ${
              selectedLeadId ? 'flex' : 'hidden md:flex'
            }`}
          >
            {selectedLeadId ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Mobile Back Button */}
                <div className="md:hidden p-2 bg-[#F7FAFC] border-b border-[#E2E8F0] flex items-center">
                  <button
                    onClick={() => setSelectedLeadId(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E6B50] px-3 py-2 touch-target"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to lead list</span>
                  </button>
                </div>

                <LeadDetail
                  leadId={selectedLeadId}
                  onClose={() => setSelectedLeadId(null)}
                  onUpdate={reloadLeads}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-[#5A6578]">
                <p className="text-xs">
                  Select a lead from the list on the left to inspect requirements, send messages, or take over chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5A6578]">Loading leads...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
