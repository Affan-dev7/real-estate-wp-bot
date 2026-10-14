'use client';

import { Agency, Listing, Lead, Message, Visit, DashboardStats, DateRange, LeadStatus } from './types';
import { MOCK_AGENCY, MOCK_LISTINGS, MOCK_LEADS, MOCK_MESSAGES, MOCK_VISITS } from './mockData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  USER_SESSION: 'property_desk_user',
  AGENCY: 'property_desk_agency',
  LISTINGS: 'property_desk_listings',
  LEADS: 'property_desk_leads',
  MESSAGES: 'property_desk_messages',
  VISITS: 'property_desk_visits',
};

// Safe localStorage getter
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export interface UserSession {
  email: string;
  agencyId: string;
  role: 'owner' | 'admin';
  isDemo: boolean;
}

export class DataStore {
  // Check if authenticated
  static getSession(): UserSession | null {
    return getLocalStorageItem<UserSession | null>(STORAGE_KEYS.USER_SESSION, {
      email: 'agent@alraziqestate.pk',
      agencyId: MOCK_AGENCY.id,
      role: 'owner',
      isDemo: true,
    });
  }

  static setSession(session: UserSession | null) {
    if (session) {
      setLocalStorageItem(STORAGE_KEYS.USER_SESSION, session);
    } else {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
      }
    }
  }

  static async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();
    
    // If Supabase is configured and not in forced demo mode
    if (supabase && isSupabaseConfigured() && email !== 'agent@alraziqestate.pk') {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch agency profile
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('agency_id, role')
            .eq('user_id', data.user.id)
            .single();

          if (profileErr || !profile) {
            return {
              success: false,
              error: 'No agency profile found for this user account. Contact your administrator.',
            };
          }

          this.setSession({
            email: data.user.email || email,
            agencyId: profile.agency_id,
            role: profile.role,
            isDemo: false,
          });

          return { success: true };
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Authentication failed',
        };
      }
    }

    // Default demo login handler
    if (email.toLowerCase().includes('agent') || email.toLowerCase().includes('demo') || pass === 'demo123456' || pass === 'alraziq123') {
      this.setSession({
        email: 'agent@alraziqestate.pk',
        agencyId: MOCK_AGENCY.id,
        role: 'owner',
        isDemo: true,
      });
      return { success: true };
    }

    // Allow user to log in if test pass or generic login
    this.setSession({
      email,
      agencyId: MOCK_AGENCY.id,
      role: 'admin',
      isDemo: true,
    });
    return { success: true };
  }

  static async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    this.setSession(null);
  }

  // Agency
  static getAgency(): Agency {
    return getLocalStorageItem<Agency>(STORAGE_KEYS.AGENCY, MOCK_AGENCY);
  }

  // Listings
  static getListings(): Listing[] {
    const list = getLocalStorageItem<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
    return list;
  }

  static getListingById(id: string): Listing | undefined {
    return this.getListings().find((l) => l.id === id);
  }

  static saveListing(listing: Listing): void {
    const list = this.getListings();
    const idx = list.findIndex((l) => l.id === listing.id);
    if (idx >= 0) {
      list[idx] = { ...listing, updated_at: new Date().toISOString() };
    } else {
      list.unshift(listing);
    }
    setLocalStorageItem(STORAGE_KEYS.LISTINGS, list);
  }

  static markListingAsSold(id: string): Listing | null {
    const list = this.getListings();
    const listing = list.find((l) => l.id === id);
    if (listing) {
      listing.status = listing.status === 'sold' ? 'available' : 'sold';
      listing.updated_at = new Date().toISOString();
      setLocalStorageItem(STORAGE_KEYS.LISTINGS, list);
      return listing;
    }
    return null;
  }

  static toggleListingBotVisibility(id: string, visible: boolean): Listing | null {
    const list = this.getListings();
    const listing = list.find((l) => l.id === id);
    if (listing) {
      listing.visible_to_bot = visible;
      listing.updated_at = new Date().toISOString();
      setLocalStorageItem(STORAGE_KEYS.LISTINGS, list);
      return listing;
    }
    return null;
  }

  // Leads
  static getLeads(): Lead[] {
    const list = getLocalStorageItem<Lead[]>(STORAGE_KEYS.LEADS, MOCK_LEADS);
    return list;
  }

  static async syncFromSupabase(): Promise<Lead[]> {
    if (typeof window === 'undefined') return this.getLeads();
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const liveLeads = await res.json();
        if (Array.isArray(liveLeads) && liveLeads.length > 0) {
          const formatted: Lead[] = liveLeads.map((l: any) => ({
            id: l.id,
            agency_id: l.agency_id,
            name: l.name || 'WhatsApp Customer',
            phone: l.phone,
            wants_type: l.wants_type || undefined,
            wants_area: l.wants_area || undefined,
            wants_size: l.wants_size || undefined,
            budget_max_pkr: l.budget_max_pkr || undefined,
            buy_or_rent: l.buy_or_rent || 'buy',
            label: l.label || 'cold',
            status: l.status || 'new',
            notes: l.notes || '',
            bot_paused: Boolean(l.bot_paused),
            first_message_at: l.first_message_at || l.created_at || new Date().toISOString(),
            last_message_at: l.last_message_at || l.created_at || new Date().toISOString(),
          }));

          setLocalStorageItem(STORAGE_KEYS.LEADS, formatted);
          return formatted;
        }
      }
    } catch (e) {
      console.warn('Could not sync leads from Supabase API', e);
    }
    return this.getLeads();
  }

  static getLeadById(id: string): Lead | undefined {
    return this.getLeads().find((l) => l.id === id);
  }

  static updateLead(lead: Lead): void {
    const list = this.getLeads();
    const idx = list.findIndex((l) => l.id === lead.id);
    if (idx >= 0) {
      list[idx] = lead;
      setLocalStorageItem(STORAGE_KEYS.LEADS, list);
    }
  }

  static updateLeadStatus(id: string, status: LeadStatus): void {
    const list = this.getLeads();
    const lead = list.find((l) => l.id === id);
    if (lead) {
      lead.status = status;
      setLocalStorageItem(STORAGE_KEYS.LEADS, list);
    }
  }

  static toggleBotPaused(id: string, paused: boolean): void {
    const list = this.getLeads();
    const lead = list.find((l) => l.id === id);
    if (lead) {
      lead.bot_paused = paused;
      setLocalStorageItem(STORAGE_KEYS.LEADS, list);
    }
    // Also patch Supabase in background
    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, bot_paused: paused }),
      }).catch(console.warn);
    }
  }

  static updateLeadNotes(id: string, notes: string): void {
    const list = this.getLeads();
    const lead = list.find((l) => l.id === id);
    if (lead) {
      lead.notes = notes;
      setLocalStorageItem(STORAGE_KEYS.LEADS, list);
    }
    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes }),
      }).catch(console.warn);
    }
  }

  // Messages
  static getMessages(leadId?: string): Message[] {
    const all = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, MOCK_MESSAGES);
    if (leadId) {
      return all.filter((m) => m.lead_id === leadId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return all;
  }

  static async syncMessagesFromSupabase(leadId: string): Promise<Message[]> {
    if (typeof window === 'undefined') return this.getMessages(leadId);
    try {
      const res = await fetch(`/api/messages?lead_id=${leadId}`);
      if (res.ok) {
        const liveMsgs = await res.json();
        if (Array.isArray(liveMsgs) && liveMsgs.length > 0) {
          const all = getLocalStorageItem<Message[]>(STORAGE_KEYS.MESSAGES, MOCK_MESSAGES);
          const others = all.filter((m) => m.lead_id !== leadId);
          const combined = [...others, ...liveMsgs];
          setLocalStorageItem(STORAGE_KEYS.MESSAGES, combined);
          return liveMsgs;
        }
      }
    } catch (e) {
      console.warn('Could not sync messages from Supabase', e);
    }
    return this.getMessages(leadId);
  }

  static addMessage(message: Omit<Message, 'id' | 'created_at'>): Message {
    const all = this.getMessages();
    const newMsg: Message = {
      ...message,
      id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 7),
      created_at: new Date().toISOString(),
    };
    all.push(newMsg);
    setLocalStorageItem(STORAGE_KEYS.MESSAGES, all);

    // Update lead's last_message_at
    const leads = this.getLeads();
    const lead = leads.find((l) => l.id === message.lead_id);
    if (lead) {
      lead.last_message_at = newMsg.created_at;
      setLocalStorageItem(STORAGE_KEYS.LEADS, leads);
    }

    return newMsg;
  }

  // Visits
  static getVisits(): Visit[] {
    const list = getLocalStorageItem<Visit[]>(STORAGE_KEYS.VISITS, MOCK_VISITS);
    const leads = this.getLeads();
    const listings = this.getListings();

    return list.map((v) => ({
      ...v,
      lead: leads.find((l) => l.id === v.lead_id),
      listing: listings.find((list) => list.id === v.listing_id),
    })).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }

  static updateVisitStatus(id: string, status: Visit['status']): void {
    const list = getLocalStorageItem<Visit[]>(STORAGE_KEYS.VISITS, MOCK_VISITS);
    const visit = list.find((v) => v.id === id);
    if (visit) {
      visit.status = status;
      setLocalStorageItem(STORAGE_KEYS.VISITS, list);
    }
  }

  // Dashboard Stats
  static getDashboardStats(range: DateRange): DashboardStats {
    const now = Date.now();
    let rangeMs = 86400000; // today (24h)
    let daysCount = 1;

    if (range === '7days') {
      rangeMs = 7 * 86400000;
      daysCount = 7;
    } else if (range === '30days') {
      rangeMs = 30 * 86400000;
      daysCount = 30;
    }

    const cutoff = new Date(now - rangeMs).getTime();

    const messages = this.getMessages();
    const leads = this.getLeads();
    const visits = this.getVisits();

    const rangeMessages = messages.filter((m) => new Date(m.created_at).getTime() >= cutoff);
    const rangeLeads = leads.filter((l) => new Date(l.first_message_at).getTime() >= cutoff);
    const rangeVisits = visits.filter((v) => new Date(v.created_at).getTime() >= cutoff);

    const messagesReceived = rangeMessages.filter((m) => m.direction === 'in').length;
    const messagesSentByBot = rangeMessages.filter((m) => m.direction === 'out' && m.sender === 'bot').length;
    const newLeads = rangeLeads.length;
    const hotLeads = leads.filter((l) => l.label === 'hot').length;
    const visitsBooked = rangeVisits.length;

    // "Show how many chats need a human (customer asked for a person or bot is paused)"
    const chatsNeedHuman = leads.filter((l) => {
      if (l.bot_paused) return true;
      // Check customer messages for keywords
      const leadMsgs = messages.filter((m) => m.lead_id === l.id && m.direction === 'in');
      const lastInMsg = leadMsgs[leadMsgs.length - 1];
      if (lastInMsg) {
        const txt = lastInMsg.body.toLowerCase();
        if (
          txt.includes('human') ||
          txt.includes('agent') ||
          txt.includes('call') ||
          txt.includes('phone') ||
          txt.includes('baat karni') ||
          txt.includes('rabta')
        ) {
          return true;
        }
      }
      return false;
    }).length;

    // Simple bar chart: new leads per day
    const dayLabels: { date: string; label: string; count: number }[] = [];
    const chartDays = range === '30days' ? 14 : range === '7days' ? 7 : 7; // Show 7 days for readability

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const ymd = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-PK', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        day: 'numeric',
      });

      const dayCount = leads.filter((l) => {
        const leadDate = new Date(l.first_message_at).toISOString().split('T')[0];
        return leadDate === ymd;
      }).length;

      dayLabels.push({
        date: ymd,
        label,
        count: dayCount,
      });
    }

    return {
      messagesReceived,
      messagesSentByBot,
      newLeads,
      hotLeads,
      visitsBooked,
      chatsNeedHuman,
      leadsPerDay: dayLabels,
    };
  }

  // Export leads to CSV
  static exportLeadsToCsv(): string {
    const leads = this.getLeads();
    const headers = [
      'Lead ID',
      'Name',
      'Phone',
      'Requirement Type',
      'Area',
      'Size',
      'Budget Max (PKR)',
      'Buy/Rent',
      'Label',
      'Status',
      'Bot Paused',
      'Notes',
      'First Message (Karachi)',
      'Last Message (Karachi)',
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.wants_type || ''}"`,
      `"${(l.wants_area || '').replace(/"/g, '""')}"`,
      `"${(l.wants_size || '').replace(/"/g, '""')}"`,
      l.budget_max_pkr || 0,
      `"${l.buy_or_rent || ''}"`,
      `"${l.label}"`,
      `"${l.status}"`,
      l.bot_paused ? 'YES' : 'NO',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      `"${l.first_message_at}"`,
      `"${l.last_message_at}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  static downloadLeadsCsv(): void {
    if (typeof window === 'undefined') return;
    const csvContent = this.exportLeadsToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
