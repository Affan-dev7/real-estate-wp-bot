'use client';

import { useState, useEffect } from 'react';
import { Lead, Message, Listing, LeadStatus } from '@/lib/types';
import { DataStore } from '@/lib/store';
import {
  formatPhone,
  formatPkr,
  getWhatsAppUrl,
  getTelUrl,
  formatKarachiDateTime,
  getRequirementSummary,
} from '@/lib/formatters';
import {
  Phone,
  MessageSquare,
  Flame,
  UserCheck,
  Send,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface LeadDetailProps {
  leadId: string;
  onClose?: () => void;
  onUpdate?: () => void;
}

export default function LeadDetail({ leadId, onClose, onUpdate }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentListings, setSentListings] = useState<Listing[]>([]);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [agentInput, setAgentInput] = useState('');

  const reloadData = async () => {
    const l = DataStore.getLeadById(leadId);
    if (l) {
      setLead({ ...l });
      setNotes(l.notes || '');

      // Load cached messages first
      const msgs = DataStore.getMessages(leadId);
      setMessages(msgs);

      // Fetch live messages from Supabase
      const liveMsgs = await DataStore.syncMessagesFromSupabase(leadId);
      setMessages(liveMsgs);

      // Collect sent listings
      const listingIds = Array.from(
        new Set(liveMsgs.map((m) => m.listing_id).filter((id): id is string => Boolean(id)))
      );
      const listings = listingIds
        .map((id) => DataStore.getListingById(id))
        .filter((item): item is Listing => Boolean(item));
      setSentListings(listings);
    }
  };

  useEffect(() => {
    reloadData();
  }, [leadId]);

  if (!lead) {
    return (
      <div className="p-8 text-center text-[#5A6578]">
        Select a lead to view details and chat transcript.
      </div>
    );
  }

  const handleStatusChange = (newStatus: LeadStatus) => {
    DataStore.updateLeadStatus(lead.id, newStatus);
    reloadData();
    onUpdate?.();
  };

  const handleToggleBotPaused = () => {
    const newPaused = !lead.bot_paused;
    DataStore.toggleBotPaused(lead.id, newPaused);
    reloadData();
    onUpdate?.();
  };

  const handleSaveNotes = () => {
    DataStore.updateLeadNotes(lead.id, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
    onUpdate?.();
  };

  const handleSendAgentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    DataStore.addMessage({
      agency_id: lead.agency_id,
      lead_id: lead.id,
      direction: 'out',
      sender: 'agent',
      body: agentInput.trim(),
      media_type: 'text',
      listing_id: null,
      delivery_status: 'delivered',
    });

    setAgentInput('');
    reloadData();
    onUpdate?.();
  };

  return (
    <div className="bg-white flex flex-col h-full overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-[#E2E8F0] sticky top-0 bg-white z-20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A202C]">{lead.name}</h2>
              {lead.label === 'hot' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9480F] bg-[#FDF2E9] px-2 py-0.5 rounded">
                  <Flame className="w-3.5 h-3.5 fill-[#D9480F]" />
                  Hot lead
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A6578] mt-0.5">
              Requirement: <span className="text-[#1A202C] font-medium">{getRequirementSummary(lead)}</span>
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-xs px-2.5 py-1.5 border border-[#E2E8F0] rounded text-[#5A6578] touch-target"
            >
              Close
            </button>
          )}
        </div>

        {/* Action Buttons: Call & WhatsApp */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <a
            href={getTelUrl(lead.phone)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E6B50] text-white text-xs font-medium rounded hover:bg-[#0A4D3A] transition-colors touch-target"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {formatPhone(lead.phone)}</span>
          </a>

          <a
            href={getWhatsAppUrl(lead.phone, `Assalam o alaikum ${lead.name}, I am contacting you regarding your property requirement.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-xs font-medium rounded hover:bg-[#1EBE5D] transition-colors touch-target"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </a>

          {/* Take over chat toggle button */}
          <button
            onClick={handleToggleBotPaused}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded border transition-colors touch-target ${
              lead.bot_paused
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                : 'bg-white text-[#1A202C] border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lead.bot_paused ? 'Bot paused (Resume bot)' : 'Take over chat'}</span>
          </button>
        </div>

        {/* Status Dropdown Bar */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#EDF2F7]">
          <label htmlFor="lead-status-select" className="text-xs font-medium text-[#5A6578]">
            Status:
          </label>
          <select
            id="lead-status-select"
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className="text-xs font-medium text-[#1A202C] bg-[#F7FAFC] border border-[#CBD5E1] rounded px-3 py-1.5 focus:outline-none focus:border-[#0E6B50] touch-target"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="visit_booked">Visit booked</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>

          {lead.bot_paused && (
            <span className="flex items-center gap-1 text-xs text-[#D9480F] font-medium ml-auto">
              <AlertTriangle className="w-3.5 h-3.5" />
              Bot is paused for this customer
            </span>
          )}
        </div>
      </div>

      {/* Detail Content */}
      <div className="p-4 space-y-6 flex-1">
        {/* Requirements Grid */}
        <div className="bg-[#F7FAFC] border border-[#E2E8F0] p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[#5A6578] block">Property type</span>
            <span className="font-semibold text-[#1A202C] capitalize">
              {lead.wants_type || 'Any type'}
            </span>
          </div>
          <div>
            <span className="text-[#5A6578] block">Target area</span>
            <span className="font-semibold text-[#1A202C]">
              {lead.wants_area || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-[#5A6578] block">Size</span>
            <span className="font-semibold text-[#1A202C]">
              {lead.wants_size || 'Flexible'}
            </span>
          </div>
          <div>
            <span className="text-[#5A6578] block">Max budget</span>
            <span className="font-semibold text-[#1A202C] tabular-nums">
              {formatPkr(lead.budget_max_pkr)}
            </span>
          </div>
        </div>

        {/* Listings Bot Sent */}
        {sentListings.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#1A202C] tracking-wide mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#0E6B50]" />
              Listings sent by bot ({sentListings.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="border border-[#E2E8F0] p-2 bg-white flex items-center gap-3"
                >
                  {listing.photo_urls[0] && (
                    <img
                      src={listing.photo_urls[0]}
                      alt={listing.title}
                      className="w-14 h-14 object-cover border border-[#E2E8F0] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#1A202C] line-clamp-1">
                      {listing.title}
                    </p>
                    <p className="text-xs font-bold text-[#0E6B50] tabular-nums mt-0.5">
                      {formatPkr(listing.price_pkr)}
                    </p>
                    <p className="text-[11px] text-[#5A6578]">
                      {listing.city} • {listing.size_value} {listing.size_unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Transcript */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#1A202C] tracking-wide flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#0E6B50]" />
              Full chat transcript
            </h3>
            <span className="text-[11px] text-[#5A6578]">
              {messages.length} messages
            </span>
          </div>

          <div
            tabIndex={0}
            aria-label="Chat transcript"
            className="border border-[#E2E8F0] bg-[#FAFCFF] p-3 max-h-96 overflow-y-auto space-y-3"
          >
            {messages.length === 0 ? (
              <p className="text-xs text-[#5A6578] text-center py-4">
                No messages recorded yet.
              </p>
            ) : (
              messages.map((msg) => {
                const isCustomer = msg.direction === 'in';
                const isAgent = msg.sender === 'agent';
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-[#5A6578] mb-1">
                      <span className="font-semibold capitalize text-[#1A202C]">
                        {isCustomer ? lead.name : isAgent ? 'Agent' : 'AI Bot'}
                      </span>
                      <span>•</span>
                      <span className="tabular-nums">
                        {formatKarachiDateTime(msg.created_at)}
                      </span>
                    </div>

                    <div
                      dir="auto"
                      className={`max-w-[85%] sm:max-w-[75%] p-3 text-xs leading-relaxed rounded-none border ${
                        isCustomer
                          ? 'bg-white border-[#CBD5E1] text-[#1A202C]'
                          : isAgent
                          ? 'bg-[#0E6B50] text-white border-[#0E6B50]'
                          : 'bg-[#E6F4F0] border-[#B2DFDB] text-[#0A4D3A]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Agent Reply Box */}
          <form onSubmit={handleSendAgentMessage} className="mt-2 flex gap-2">
            <input
              type="text"
              dir="auto"
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="Type a message as agent (Roman Urdu or English)..."
              className="flex-1 text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0E6B50] text-white text-xs font-semibold rounded-none hover:bg-[#0A4D3A] flex items-center gap-1.5 touch-target"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Agent Notes */}
        <div className="border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="agent-notes" className="text-xs font-bold text-[#1A202C]">
              Internal agent notes
            </label>
            {notesSaved && (
              <span className="text-xs text-[#0E6B50] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>
          <textarea
            id="agent-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes (e.g. ready cash buyer, prefers Sunday morning visits)..."
            className="w-full text-xs p-2.5 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50]"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="px-4 py-2 border border-[#0E6B50] text-[#0E6B50] hover:bg-[#E6F4F0] text-xs font-semibold rounded-none touch-target"
            >
              Save note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
