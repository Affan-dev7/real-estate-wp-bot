export type Agency = {
  id: string;
  name: string;
  agent_phone: string;
  notify_email: string | null;
  language_default: string;
  created_at: string;
};

export type Profile = {
  user_id: string;
  agency_id: string;
  role: 'owner' | 'admin';
  created_at?: string;
};

export type ListingType = 'house' | 'flat' | 'plot' | 'commercial';
export type BuyOrRent = 'buy' | 'rent';
export type SizeUnit = 'marla' | 'kanal' | 'sq_yd' | 'sq_ft';
export type ListingStatus = 'available' | 'booked' | 'sold';

export type Listing = {
  id: string;
  agency_id: string;
  title: string;
  type: ListingType;
  buy_or_rent: BuyOrRent;
  area: string;
  city: string;
  size_value: number;
  size_unit: SizeUnit;
  bedrooms: number | null;
  bathrooms: number | null;
  price_pkr: number;
  description: string | null;
  features: string[];
  photo_urls: string[];
  video_urls: string[];
  status: ListingStatus;
  visible_to_bot: boolean;
  created_at: string;
  updated_at: string;
};

export type LeadLabel = 'hot' | 'cold';
export type LeadStatus = 'new' | 'contacted' | 'visit_booked' | 'closed' | 'lost';

export type Lead = {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  wants_type: ListingType | null;
  wants_area: string | null;
  budget_max_pkr: number | null;
  wants_size: string | null;
  buy_or_rent: BuyOrRent | null;
  label: LeadLabel;
  status: LeadStatus;
  notes: string | null;
  bot_paused: boolean;
  first_message_at: string;
  last_message_at: string;
};

export type MessageDirection = 'in' | 'out';
export type MessageSender = 'customer' | 'bot' | 'agent';

export type Message = {
  id: string;
  agency_id: string;
  lead_id: string;
  direction: MessageDirection;
  sender: MessageSender;
  body: string;
  media_type: string;
  listing_id: string | null;
  delivery_status: string;
  created_at: string;
};

export type VisitStatus = 'requested' | 'confirmed' | 'done' | 'cancelled';

export type Visit = {
  id: string;
  agency_id: string;
  lead_id: string;
  listing_id: string;
  scheduled_at: string;
  status: VisitStatus;
  created_at: string;
  // Join references for display
  lead?: Lead;
  listing?: Listing;
};

export type DateRange = 'today' | '7days' | '30days';

export type DashboardStats = {
  messagesReceived: number;
  messagesSentByBot: number;
  newLeads: number;
  hotLeads: number;
  visitsBooked: number;
  chatsNeedHuman: number;
  leadsPerDay: { date: string; label: string; count: number }[];
};
