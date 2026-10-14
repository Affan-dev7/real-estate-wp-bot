'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import { DataStore } from '@/lib/store';
import { Visit, VisitStatus } from '@/lib/types';
import {
  formatKarachiDateTime,
  formatPhone,
  formatPkr,
  getTelUrl,
  getWhatsAppUrl,
} from '@/lib/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Building2,
  User,
  List,
} from 'lucide-react';

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const reloadVisits = () => {
    const list = DataStore.getVisits();
    setVisits([...list]);
  };

  useEffect(() => {
    reloadVisits();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: VisitStatus) => {
    DataStore.updateVisitStatus(id, newStatus);
    reloadVisits();
  };

  const filteredVisits = visits.filter((v) => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A202C]">Property visits & inspections</h1>
            <p className="text-xs text-[#5A6578]">
              Manage site walkthroughs booked by WhatsApp bot and agents
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex border border-[#CBD5E1] bg-white p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors touch-target ${
                  viewMode === 'list'
                    ? 'bg-[#0E6B50] text-white'
                    : 'text-[#5A6578] hover:text-[#1A202C]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List agenda</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors touch-target ${
                  viewMode === 'calendar'
                    ? 'bg-[#0E6B50] text-white'
                    : 'text-[#5A6578] hover:text-[#1A202C]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Simple calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'requested', 'confirmed', 'done', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium border touch-target capitalize whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#1A202C] text-white border-[#1A202C]'
                  : 'bg-white text-[#5A6578] border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              {st === 'all' ? 'All visits' : st}
            </button>
          ))}
        </div>

        {/* Content: List Agenda View */}
        {viewMode === 'list' && (
          <div className="bg-white border border-[#E2E8F0]">
            {filteredVisits.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5A6578]">
                No visits found matching this filter.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {filteredVisits.map((visit) => {
                  const lead = visit.lead;
                  const listing = visit.listing;

                  return (
                    <div
                      key={visit.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7FAFC] transition-colors"
                    >
                      {/* Left: Timing & Status */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="bg-[#F1F5F9] border border-[#CBD5E1] p-2.5 text-center shrink-0 min-w-[76px]">
                          <Clock className="w-4 h-4 text-[#0E6B50] mx-auto mb-1" />
                          <span className="text-[11px] font-bold text-[#1A202C] block">
                            {new Date(visit.scheduled_at).toLocaleDateString('en-PK', {
                              timeZone: 'Asia/Karachi',
                              weekday: 'short',
                            })}
                          </span>
                          <span className="text-[10px] text-[#5A6578] block">
                            {new Date(visit.scheduled_at).toLocaleDateString('en-PK', {
                              timeZone: 'Asia/Karachi',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-[#1A202C]">
                              {formatKarachiDateTime(visit.scheduled_at)}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                visit.status === 'confirmed'
                                  ? 'bg-[#E6F4F0] text-[#0E6B50]'
                                  : visit.status === 'requested'
                                  ? 'bg-[#FEF3C7] text-[#92400E]'
                                  : visit.status === 'done'
                                  ? 'bg-blue-50 text-blue-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {visit.status}
                            </span>
                          </div>

                          {/* Lead info */}
                          <div className="flex items-center gap-2 text-xs text-[#1A202C] mb-1">
                            <User className="w-3.5 h-3.5 text-[#5A6578]" />
                            <span className="font-semibold">{lead?.name || 'Customer'}</span>
                            <span className="text-[#5A6578] font-mono">
                              {formatPhone(lead?.phone || '')}
                            </span>
                          </div>

                          {/* Listing info */}
                          <div className="flex items-center gap-2 text-xs text-[#5A6578]">
                            <Building2 className="w-3.5 h-3.5 text-[#0E6B50]" />
                            <span className="font-medium text-[#1A202C] truncate">
                              {listing?.title || 'Property'}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-[#0E6B50] tabular-nums">
                              {formatPkr(listing?.price_pkr)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                        {lead && (
                          <>
                            <a
                              href={getTelUrl(lead.phone)}
                              className="p-2 border border-[#CBD5E1] text-[#0E6B50] hover:bg-[#E6F4F0] touch-target"
                              title="Call customer"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={getWhatsAppUrl(
                                lead.phone,
                                `Assalam o alaikum ${lead.name}, confirming your scheduled property visit at ${formatKarachiDateTime(visit.scheduled_at)}.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 border border-[#CBD5E1] text-[#25D366] hover:bg-emerald-50 touch-target"
                              title="Open WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </>
                        )}

                        {visit.status === 'requested' && (
                          <button
                            onClick={() => handleUpdateStatus(visit.id, 'confirmed')}
                            className="px-3 py-2 bg-[#0E6B50] text-white text-xs font-semibold hover:bg-[#0A4D3A] transition-colors touch-target"
                          >
                            Confirm visit
                          </button>
                        )}

                        {visit.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(visit.id, 'done')}
                            className="px-3 py-2 bg-[#1A202C] text-white text-xs font-semibold hover:bg-black transition-colors touch-target"
                          >
                            Mark as done
                          </button>
                        )}

                        {visit.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(visit.id, 'cancelled')}
                            className="px-2.5 py-2 border border-[#CBD5E1] text-[#D9480F] text-xs font-medium hover:bg-[#FDF2E9] transition-colors touch-target"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content: Simple Calendar / Day-by-Day Agenda */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] p-4 text-xs text-[#5A6578]">
              Showing upcoming agenda grouped by day in <span className="font-semibold text-[#1A202C]">Asia/Karachi</span> timezone.
            </div>

            {filteredVisits.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] p-8 text-center text-xs text-[#5A6578]">
                No visits scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="bg-white border border-[#E2E8F0] p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-2 mb-2">
                        <span className="text-xs font-bold text-[#1A202C]">
                          {formatKarachiDateTime(visit.scheduled_at)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            visit.status === 'confirmed'
                              ? 'bg-[#E6F4F0] text-[#0E6B50]'
                              : visit.status === 'requested'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {visit.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#1A202C]">
                        {visit.lead?.name}
                      </p>
                      <p className="text-[11px] text-[#5A6578] font-mono mb-2">
                        {formatPhone(visit.lead?.phone || '')}
                      </p>

                      <div className="bg-[#F8FAFC] p-2 border border-[#E2E8F0] text-[11px]">
                        <p className="font-medium text-[#1A202C] line-clamp-1">
                          {visit.listing?.title}
                        </p>
                        <p className="text-[#0E6B50] font-bold mt-0.5">
                          {formatPkr(visit.listing?.price_pkr)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-[#EDF2F7]">
                      {visit.status === 'requested' && (
                        <button
                          onClick={() => handleUpdateStatus(visit.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-[#0E6B50] text-white text-[11px] font-semibold"
                        >
                          Confirm
                        </button>
                      )}
                      {visit.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(visit.id, 'cancelled')}
                          className="px-2 py-1.5 border border-[#CBD5E1] text-[#D9480F] text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
