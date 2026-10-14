-- ==========================================================
-- REAL ESTATE CRM FOR PAKISTAN AGENCIES
-- Multi-Tenant Database Schema with Row Level Security (RLS)
-- Timezone: Asia/Karachi | Currency: PKR
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Agencies Table
create table if not exists public.agencies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    agent_phone text not null,
    notify_email text,
    language_default text not null default 'ur',
    created_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- 2. Profiles Table (linking Auth users to Agencies)
-- Strictly managed by Admin; public signup is disabled.
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    agency_id uuid not null references public.agencies(id) on delete cascade,
    role text not null check (role in ('owner', 'admin')),
    created_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- 3. Listings Table
create table if not exists public.listings (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid not null references public.agencies(id) on delete cascade,
    title text not null,
    type text not null check (type in ('house', 'flat', 'plot', 'commercial')),
    buy_or_rent text not null check (buy_or_rent in ('buy', 'rent')),
    area text not null,
    city text not null,
    size_value numeric(10, 2) not null,
    size_unit text not null check (size_unit in ('marla', 'kanal', 'sq_yd', 'sq_ft')),
    bedrooms integer,
    bathrooms integer,
    price_pkr bigint not null,
    description text,
    features text[] not null default '{}',
    photo_urls text[] not null default '{}',
    video_urls text[] not null default '{}',
    status text not null default 'available' check (status in ('available', 'booked', 'sold')),
    visible_to_bot boolean not null default true,
    created_at timestamptz not null default timezone('Asia/Karachi', now()),
    updated_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- Constraint for max 8 photos
alter table public.listings
    drop constraint if exists check_max_8_photos;
alter table public.listings
    add constraint check_max_8_photos check (array_length(photo_urls, 1) is null or array_length(photo_urls, 1) <= 8);

-- 4. Leads Table
create table if not exists public.leads (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid not null references public.agencies(id) on delete cascade,
    name text not null,
    phone text not null,
    wants_type text check (wants_type in ('house', 'flat', 'plot', 'commercial')),
    wants_area text,
    budget_max_pkr bigint,
    wants_size text,
    buy_or_rent text check (buy_or_rent in ('buy', 'rent')),
    label text not null default 'cold' check (label in ('hot', 'cold')),
    status text not null default 'new' check (status in ('new', 'contacted', 'visit_booked', 'closed', 'lost')),
    notes text,
    bot_paused boolean not null default false,
    first_message_at timestamptz not null default timezone('Asia/Karachi', now()),
    last_message_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- 5. Messages Table
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid not null references public.agencies(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    direction text not null check (direction in ('in', 'out')),
    sender text not null check (sender in ('customer', 'bot', 'agent')),
    body text not null,
    media_type text not null default 'text',
    listing_id uuid references public.listings(id) on delete set null,
    delivery_status text not null default 'delivered',
    created_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- 6. Visits Table
create table if not exists public.visits (
    id uuid primary key default gen_random_uuid(),
    agency_id uuid not null references public.agencies(id) on delete cascade,
    lead_id uuid not null references public.leads(id) on delete cascade,
    listing_id uuid not null references public.listings(id) on delete cascade,
    scheduled_at timestamptz not null,
    status text not null default 'requested' check (status in ('requested', 'confirmed', 'done', 'cancelled')),
    created_at timestamptz not null default timezone('Asia/Karachi', now())
);

-- ==========================================================
-- INDEXES
-- Optimized for tenant isolation, lead sorting, and message feeds
-- ==========================================================

-- agencies
create index if not exists idx_agencies_created_at on public.agencies(created_at desc);

-- profiles
create index if not exists idx_profiles_agency_id on public.profiles(agency_id);
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- listings
create index if not exists idx_listings_agency_id on public.listings(agency_id);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_city_area on public.listings(city, area);
create index if not exists idx_listings_price on public.listings(price_pkr);
create index if not exists idx_listings_bot_visible on public.listings(visible_to_bot);

-- leads
create index if not exists idx_leads_agency_id on public.leads(agency_id);
create index if not exists idx_leads_last_message on public.leads(last_message_at desc);
create index if not exists idx_leads_created_at on public.leads(first_message_at desc);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_label on public.leads(label);
create index if not exists idx_leads_phone on public.leads(phone);

-- messages
create index if not exists idx_messages_agency_id on public.messages(agency_id);
create index if not exists idx_messages_lead_id on public.messages(lead_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);
create index if not exists idx_messages_listing_id on public.messages(listing_id);

-- visits
create index if not exists idx_visits_agency_id on public.visits(agency_id);
create index if not exists idx_visits_lead_id on public.visits(lead_id);
create index if not exists idx_visits_scheduled_at on public.visits(scheduled_at asc);
create index if not exists idx_visits_created_at on public.visits(created_at desc);

-- ==========================================================
-- UPDATED_AT TRIGGER FOR LISTINGS
-- ==========================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('Asia/Karachi', now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists tr_listings_updated_at on public.listings;
create trigger tr_listings_updated_at
    before update on public.listings
    for each row
    execute function public.handle_updated_at();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS)
-- Multi-tenant isolation: Users only see their own agency data
-- ==========================================================

-- Enable RLS on all tables
alter table public.agencies enable row level security;
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.visits enable row level security;

-- Helper function: get agency_id of current authenticated user
create or replace function public.current_user_agency_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select agency_id from public.profiles where user_id = auth.uid() limit 1;
$$;

-- Helper function: check if current user is owner/admin
create or replace function public.current_user_is_agency_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where user_id = auth.uid() and role in ('owner', 'admin')
    );
$$;

-- 1. Agencies Policies
drop policy if exists "Agencies are viewable by members of that agency" on public.agencies;
create policy "Agencies are viewable by members of that agency"
    on public.agencies for select
    using (id = public.current_user_agency_id());

drop policy if exists "Agencies can be updated by agency admins" on public.agencies;
create policy "Agencies can be updated by agency admins"
    on public.agencies for update
    using (id = public.current_user_agency_id() and public.current_user_is_agency_admin())
    with check (id = public.current_user_agency_id() and public.current_user_is_agency_admin());

-- 2. Profiles Policies
drop policy if exists "Profiles are viewable by agency members" on public.profiles;
create policy "Profiles are viewable by agency members"
    on public.profiles for select
    using (agency_id = public.current_user_agency_id());

drop policy if exists "Profiles update by user self or agency admin" on public.profiles;
create policy "Profiles update by user self or agency admin"
    on public.profiles for update
    using (agency_id = public.current_user_agency_id() and (user_id = auth.uid() or public.current_user_is_agency_admin()))
    with check (agency_id = public.current_user_agency_id());

-- 3. Listings Policies
drop policy if exists "Listings viewable by agency members" on public.listings;
create policy "Listings viewable by agency members"
    on public.listings for select
    using (agency_id = public.current_user_agency_id());

drop policy if exists "Listings insertable by agency members" on public.listings;
create policy "Listings insertable by agency members"
    on public.listings for insert
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Listings updatable by agency members" on public.listings;
create policy "Listings updatable by agency members"
    on public.listings for update
    using (agency_id = public.current_user_agency_id())
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Listings deletable by agency members" on public.listings;
create policy "Listings deletable by agency members"
    on public.listings for delete
    using (agency_id = public.current_user_agency_id());

-- 4. Leads Policies
drop policy if exists "Leads viewable by agency members" on public.leads;
create policy "Leads viewable by agency members"
    on public.leads for select
    using (agency_id = public.current_user_agency_id());

drop policy if exists "Leads insertable by agency members" on public.leads;
create policy "Leads insertable by agency members"
    on public.leads for insert
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Leads updatable by agency members" on public.leads;
create policy "Leads updatable by agency members"
    on public.leads for update
    using (agency_id = public.current_user_agency_id())
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Leads deletable by agency members" on public.leads;
create policy "Leads deletable by agency members"
    on public.leads for delete
    using (agency_id = public.current_user_agency_id());

-- 5. Messages Policies
drop policy if exists "Messages viewable by agency members" on public.messages;
create policy "Messages viewable by agency members"
    on public.messages for select
    using (agency_id = public.current_user_agency_id());

drop policy if exists "Messages insertable by agency members" on public.messages;
create policy "Messages insertable by agency members"
    on public.messages for insert
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Messages updatable by agency members" on public.messages;
create policy "Messages updatable by agency members"
    on public.messages for update
    using (agency_id = public.current_user_agency_id())
    with check (agency_id = public.current_user_agency_id());

-- 6. Visits Policies
drop policy if exists "Visits viewable by agency members" on public.visits;
create policy "Visits viewable by agency members"
    on public.visits for select
    using (agency_id = public.current_user_agency_id());

drop policy if exists "Visits insertable by agency members" on public.visits;
create policy "Visits insertable by agency members"
    on public.visits for insert
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Visits updatable by agency members" on public.visits;
create policy "Visits updatable by agency members"
    on public.visits for update
    using (agency_id = public.current_user_agency_id())
    with check (agency_id = public.current_user_agency_id());

drop policy if exists "Visits deletable by agency members" on public.visits;
create policy "Visits deletable by agency members"
    on public.visits for delete
    using (agency_id = public.current_user_agency_id());

-- ==========================================================
-- STORAGE BUCKET SETUP FOR LISTING PHOTOS
-- ==========================================================
-- Note: Run in Supabase SQL editor or storage migrations
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Storage RLS: agency members can upload and read their agency photos
drop policy if exists "Listing photos are publicly accessible" on storage.objects;
create policy "Listing photos are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'listing-photos');

drop policy if exists "Agency members can upload listing photos" on storage.objects;
create policy "Agency members can upload listing photos"
    on storage.objects for insert
    with check (
        bucket_id = 'listing-photos'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = public.current_user_agency_id()::text
    );

drop policy if exists "Agency members can update or delete listing photos" on storage.objects;
create policy "Agency members can update or delete listing photos"
    on storage.objects for delete
    using (
        bucket_id = 'listing-photos'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = public.current_user_agency_id()::text
    );
