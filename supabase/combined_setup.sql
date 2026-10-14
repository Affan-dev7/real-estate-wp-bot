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


-- ==========================================================
-- SEED DATA
-- ==========================================================

-- ==========================================================
-- REAL ESTATE CRM FOR PAKISTAN AGENCIES
-- Comprehensive Seed Data
-- Agency, 10 Realistic Listings, 15 Leads, Realistic Messages, and Visits
-- Timezone: Asia/Karachi | Currency: PKR
-- ==========================================================

-- Variables / Static UUIDs for deterministic relational linking
do $$
declare
    v_agency_id uuid := '00000000-0000-0000-0000-000000000001';
    
    -- Listings UUIDs
    v_list_1 uuid := '11111111-0000-0000-0000-000000000001';
    v_list_2 uuid := '11111111-0000-0000-0000-000000000002';
    v_list_3 uuid := '11111111-0000-0000-0000-000000000003';
    v_list_4 uuid := '11111111-0000-0000-0000-000000000004';
    v_list_5 uuid := '11111111-0000-0000-0000-000000000005';
    v_list_6 uuid := '11111111-0000-0000-0000-000000000006';
    v_list_7 uuid := '11111111-0000-0000-0000-000000000007';
    v_list_8 uuid := '11111111-0000-0000-0000-000000000008';
    v_list_9 uuid := '11111111-0000-0000-0000-000000000009';
    v_list_10 uuid := '11111111-0000-0000-0000-000000000010';

    -- Leads UUIDs
    v_lead_1 uuid := '22222222-0000-0000-0000-000000000001';
    v_lead_2 uuid := '22222222-0000-0000-0000-000000000002';
    v_lead_3 uuid := '22222222-0000-0000-0000-000000000003';
    v_lead_4 uuid := '22222222-0000-0000-0000-000000000004';
    v_lead_5 uuid := '22222222-0000-0000-0000-000000000005';
    v_lead_6 uuid := '22222222-0000-0000-0000-000000000006';
    v_lead_7 uuid := '22222222-0000-0000-0000-000000000007';
    v_lead_8 uuid := '22222222-0000-0000-0000-000000000008';
    v_lead_9 uuid := '22222222-0000-0000-0000-000000000009';
    v_lead_10 uuid := '22222222-0000-0000-0000-000000000010';
    v_lead_11 uuid := '22222222-0000-0000-0000-000000000011';
    v_lead_12 uuid := '22222222-0000-0000-0000-000000000012';
    v_lead_13 uuid := '22222222-0000-0000-0000-000000000013';
    v_lead_14 uuid := '22222222-0000-0000-0000-000000000014';
    v_lead_15 uuid := '22222222-0000-0000-0000-000000000015';

begin
    -- 1. Agency
    insert into public.agencies (id, name, agent_phone, notify_email, language_default)
    values (
        v_agency_id,
        'Al-Raziq Estate & Builders',
        '+923008251940',
        'leads@alraziqestate.pk',
        'ur'
    ) on conflict (id) do update set
        name = excluded.name,
        agent_phone = excluded.agent_phone;

    -- 2. 10 Realistic Listings across Karachi, Lahore, Islamabad
    insert into public.listings (
        id, agency_id, title, type, buy_or_rent, area, city, size_value, size_unit,
        bedrooms, bathrooms, price_pkr, description, features, photo_urls, video_urls, status, visible_to_bot
    ) values
    (
        v_list_1,
        v_agency_id,
        '500 Sq Yd Luxury Designer Bungalow - DHA Phase 6',
        'house',
        'buy',
        'DHA Phase 6',
        'Karachi',
        500.00,
        'sq_yd',
        5,
        6,
        145000000, -- 14.5 crore
        'Architect-designed corner bungalow with basement, imported Italian fixtures, designer lawn, rooftop swimming plunge pool, and solar system installed.',
        array['Basement', 'Solar System', 'Servant Quarters', 'Corner Plot', 'Brand New', 'Water Bore'],
        array[
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
        ],
        array['https://www.instagram.com/reel/C8qA12bI3dO/'],
        'available',
        true
    ),
    (
        v_list_2,
        v_agency_id,
        '3 Bed Executive Sea-View Apartment - Clifton Block 4',
        'flat',
        'buy',
        'Clifton Block 4',
        'Karachi',
        2200.00,
        'sq_ft',
        3,
        3,
        42000000, -- 4.2 crore
        'High-floor sea-facing flat with uninterrupted Arabian Sea view, reserved covered parking, standby generator, and 24/7 building security.',
        array['Sea Facing', 'Standby Generator', 'Reserved Parking', 'Gym', 'High Speed Lifts'],
        array[
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ],
        array['https://www.instagram.com/p/C7u18zXyB90/'],
        'available',
        true
    ),
    (
        v_list_3,
        v_agency_id,
        '240 Sq Yd Double Storey House - Gulshan-e-Iqbal Block 7',
        'house',
        'buy',
        'Gulshan-e-Iqbal Block 7',
        'Karachi',
        240.00,
        'sq_yd',
        4,
        4,
        38000000, -- 3.8 crore
        'Well maintained house on 40 ft road, near main University Road. Separate gas and electricity meters for upper and lower portions.',
        array['Double Storey', 'Separate Utilities', 'West Open', 'Close to Metro/Bus', 'Solid Construction'],
        array[
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'booked',
        true
    ),
    (
        v_list_4,
        v_agency_id,
        '1 Kanal Spanish Elevation Bungalow - DHA Phase 5',
        'house',
        'buy',
        'DHA Phase 5 Block L',
        'Lahore',
        1.00,
        'kanal',
        5,
        6,
        85000000, -- 8.5 crore
        'Magnificent spanish elevation house near Jalal Sons and sports complex. High ceiling lobby, Ash wood doors, Grohe fittings, dirty kitchen.',
        array['Spanish Design', 'Imported Kitchen', 'Cinema Room', 'Lush Lawn', 'Dirty Kitchen'],
        array[
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
        ],
        array['https://www.instagram.com/reel/C3zY5W4M10x/'],
        'available',
        true
    ),
    (
        v_list_5,
        v_agency_id,
        '10 Marla Brand New Modern House - DHA Phase 6',
        'house',
        'buy',
        'DHA Phase 6',
        'Lahore',
        10.00,
        'marla',
        4,
        5,
        49000000, -- 4.9 crore
        'Contemporary architectural masterpiece with double height lobby, SMEG kitchen appliances, Italian marble flooring, and CCTV security system.',
        array['Double Height Lobby', 'Italian Marble', 'CCTV System', 'Barbeque Area', 'Near Park'],
        array[
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'available',
        true
    ),
    (
        v_list_6,
        v_agency_id,
        '5 Marla Solid Construction House - Johar Town Phase 2',
        'house',
        'buy',
        'Johar Town Phase 2',
        'Lahore',
        5.00,
        'marla',
        3,
        4,
        21500000, -- 2.15 crore
        'Walking distance to Doctors Hospital and Emporium Mall. Ideal for small family or rental investment with dual unit options.',
        array['Rental Potential', 'Near Emporium Mall', 'Gas Connection', 'Car Porch'],
        array[
            'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'available',
        true
    ),
    (
        v_list_7,
        v_agency_id,
        '1 Kanal Executive Residence - Sector F-7/2',
        'house',
        'buy',
        'Sector F-7/2',
        'Islamabad',
        1.00,
        'kanal',
        5,
        6,
        180000000, -- 18 crore
        'Margalla facing prestigious villa located in diplomatic zone buffer. Teak woodwork, central air conditioning, guard post, and sprawling garden.',
        array['Margalla View', 'Diplomatic Buffer Zone', 'Guard Post', 'Central Heating/AC', 'Lush Green Lawn'],
        array[
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
        ],
        array['https://www.instagram.com/reel/C4x01_mI7Y/'],
        'available',
        true
    ),
    (
        v_list_8,
        v_agency_id,
        '10 Marla Solid Built House - DHA Phase 2 Sector E',
        'house',
        'buy',
        'DHA Phase 2 Sector E',
        'Islamabad',
        10.00,
        'marla',
        4,
        4,
        44000000, -- 4.4 crore
        'Direct approach from GT Road and Islamabad Expressway. Gated community with world class amenities and underground electrification.',
        array['Underground Electricity', 'Gated Community', 'Near Commercial', 'Mosque Nearby'],
        array[
            'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'available',
        true
    ),
    (
        v_list_9,
        v_agency_id,
        '200 Sq Yd Ready Villa - Bahria Town Precinct 10',
        'house',
        'buy',
        'Precinct 10',
        'Karachi',
        200.00,
        'sq_yd',
        3,
        3,
        17500000, -- 1.75 crore
        'Clean title, ready to move in villa near Rafi Cricket Stadium and Grand Mosque. Continuous electricity and water supply.',
        array['No Load Shedding', 'Clean Title', 'Ready to Move', 'Park Facing'],
        array[
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'available',
        true
    ),
    (
        v_list_10,
        v_agency_id,
        'Prime 1 Kanal Commercial Plot - Gulberg III',
        'commercial',
        'buy',
        'Main Boulevard Gulberg III',
        'Lahore',
        1.00,
        'kanal',
        null,
        null,
        160000000, -- 16 crore
        'Frontage on high-traffic boulevard. Approved for multi-storey plaza, corporate offices or flagship showroom.',
        array['Approved Commercial', 'Main Boulevard Frontage', 'High Footfall', 'High Rental Yield'],
        array[
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
        ],
        array[]::text[],
        'sold',
        false
    )
    on conflict (id) do nothing;

    -- 3. 15 Realistic Leads
    insert into public.leads (
        id, agency_id, name, phone, wants_type, wants_area, budget_max_pkr, wants_size,
        buy_or_rent, label, status, notes, bot_paused, first_message_at, last_message_at
    ) values
    (
        v_lead_1,
        v_agency_id,
        'Muhammad Tariq Khan',
        '+923008219401',
        'house',
        'DHA Phase 6',
        50000000, -- 5 crore
        '10 marla',
        'buy',
        'hot',
        'contacted',
        'Overseas Pakistani returning next week. Very serious buyer, looking for ready-to-move bungalow.',
        false,
        timezone('Asia/Karachi', now() - interval '3 hours'),
        timezone('Asia/Karachi', now() - interval '12 minutes')
    ),
    (
        v_lead_2,
        v_agency_id,
        'Dr. Fatima Zahra',
        '+923214567890',
        'flat',
        'Clifton Block 4',
        45000000, -- 4.5 crore
        '3 bed / 2200 sq ft',
        'buy',
        'hot',
        'visit_booked',
        'Husband is a cardiac surgeon at South City Hospital. Wants sea view apartment only.',
        false,
        timezone('Asia/Karachi', now() - interval '1 day'),
        timezone('Asia/Karachi', now() - interval '25 minutes')
    ),
    (
        v_lead_3,
        v_agency_id,
        'Chaudhry Usman Gujjar',
        '+923335551234',
        'house',
        'DHA Phase 5',
        90000000, -- 9 crore
        '1 kanal',
        'buy',
        'hot',
        'new',
        'Asked to speak directly with the owner agent. Bot paused automatically.',
        true, -- BOT PAUSED / NEEDS HUMAN
        timezone('Asia/Karachi', now() - interval '45 minutes'),
        timezone('Asia/Karachi', now() - interval '8 minutes')
    ),
    (
        v_lead_4,
        v_agency_id,
        'Kamran Abbasi',
        '+923017778899',
        'house',
        'Johar Town',
        22000000, -- 2.2 crore
        '5 marla',
        'buy',
        'cold',
        'new',
        'Looking for bank financing options or 6 months payment plan.',
        false,
        timezone('Asia/Karachi', now() - interval '2 days'),
        timezone('Asia/Karachi', now() - interval '1 hour')
    ),
    (
        v_lead_5,
        v_agency_id,
        'Zainab Bibi',
        '+923459990011',
        'house',
        'Gulshan-e-Iqbal',
        40000000, -- 4 crore
        '240 sq yd',
        'buy',
        'hot',
        'contacted',
        'Customer asked if owner can negotiate down to 3.6 crore. Needs human callback.',
        true, -- BOT PAUSED / NEEDS HUMAN
        timezone('Asia/Karachi', now() - interval '4 hours'),
        timezone('Asia/Karachi', now() - interval '18 minutes')
    ),
    (
        v_lead_6,
        v_agency_id,
        'Brigadier (R) Asad Mehmood',
        '+923005112233',
        'house',
        'Sector F-7',
        185000000, -- 18.5 crore
        '1 kanal',
        'buy',
        'hot',
        'visit_booked',
        'Wants private visit on Saturday 11:00 AM. Cash deal ready.',
        false,
        timezone('Asia/Karachi', now() - interval '3 days'),
        timezone('Asia/Karachi', now() - interval '3 hours')
    ),
    (
        v_lead_7,
        v_agency_id,
        'Bilal Farooq Shaikh',
        '+923228889911',
        'house',
        'DHA Phase 2',
        45000000, -- 4.5 crore
        '10 marla',
        'buy',
        'cold',
        'contacted',
        'Comparing DHA Phase 2 with Bahria Town. Undecided on area.',
        false,
        timezone('Asia/Karachi', now() - interval '5 days'),
        timezone('Asia/Karachi', now() - interval '6 hours')
    ),
    (
        v_lead_8,
        v_agency_id,
        'Syed Murtaza Rizvi',
        '+923024443322',
        'house',
        'Bahria Town Precinct 10',
        18000000, -- 1.8 crore
        '200 sq yd',
        'buy',
        'hot',
        'contacted',
        'Sold his flat in Federal B Area, has ready funds for possession villa.',
        false,
        timezone('Asia/Karachi', now() - interval '6 hours'),
        timezone('Asia/Karachi', now() - interval '42 minutes')
    ),
    (
        v_lead_9,
        v_agency_id,
        'Hamza Nisar',
        '+923136667788',
        'commercial',
        'Gulberg III',
        160000000, -- 16 crore
        '1 kanal',
        'buy',
        'cold',
        'lost',
        'Required commercial plot on MM Alam road specifically, ours is on Main Boulevard.',
        false,
        timezone('Asia/Karachi', now() - interval '10 days'),
        timezone('Asia/Karachi', now() - interval '2 days')
    ),
    (
        v_lead_10,
        v_agency_id,
        'Malik Sheraz Awan',
        '+923081112244',
        'house',
        'DHA Phase 6',
        150000000, -- 15 crore
        '500 sq yd',
        'buy',
        'hot',
        'visit_booked',
        'Requested site inspection for bungalow in Phase 6 with his architect.',
        false,
        timezone('Asia/Karachi', now() - interval '2 days'),
        timezone('Asia/Karachi', now() - interval '50 minutes')
    ),
    (
        v_lead_11,
        v_agency_id,
        'Ayesha Siddiqui',
        '+923315556677',
        'flat',
        'Clifton',
        35000000, -- 3.5 crore
        '3 bed',
        'buy',
        'cold',
        'new',
        'Budget is slightly under market price for 3 bed sea view.',
        false,
        timezone('Asia/Karachi', now() - interval '1 day'),
        timezone('Asia/Karachi', now() - interval '4 hours')
    ),
    (
        v_lead_12,
        v_agency_id,
        'Engr. Raheel Baig',
        '+923009998877',
        'house',
        'DHA Phase 5',
        85000000, -- 8.5 crore
        '1 kanal',
        'buy',
        'hot',
        'new',
        'Customer stated: "Bot can not answer my question, give me real agent phone number right now".',
        true, -- BOT PAUSED / NEEDS HUMAN
        timezone('Asia/Karachi', now() - interval '2 hours'),
        timezone('Asia/Karachi', now() - interval '4 minutes')
    ),
    (
        v_lead_13,
        v_agency_id,
        'Naveed Akhtar',
        '+923234441199',
        'house',
        'Johar Town',
        20000000, -- 2 crore
        '5 marla',
        'buy',
        'cold',
        'contacted',
        'Follow up next Monday.',
        false,
        timezone('Asia/Karachi', now() - interval '4 days'),
        timezone('Asia/Karachi', now() - interval '1 day')
    ),
    (
        v_lead_14,
        v_agency_id,
        'Saadullah Khan',
        '+923002223344',
        'plot',
        'DHA Phase 8',
        30000000, -- 3 crore
        '500 sq yd',
        'buy',
        'cold',
        'new',
        'Looking for investment plot with high appreciation potential.',
        false,
        timezone('Asia/Karachi', now() - interval '5 hours'),
        timezone('Asia/Karachi', now() - interval '2 hours')
    ),
    (
        v_lead_15,
        v_agency_id,
        'Omer Qureshi',
        '+923361239876',
        'house',
        'Sector F-10',
        95000000, -- 9.5 crore
        '1 kanal',
        'buy',
        'hot',
        'closed',
        'Deal concluded successfully last month. Retaining for referrals.',
        false,
        timezone('Asia/Karachi', now() - interval '25 days'),
        timezone('Asia/Karachi', now() - interval '18 days')
    )
    on conflict (id) do nothing;

    -- 4. Sample Messages (English, Roman Urdu, Urdu script)
    -- Tariq Khan (Lead 1) Conversation
    insert into public.messages (agency_id, lead_id, direction, sender, body, listing_id, created_at) values
    (v_agency_id, v_lead_1, 'in', 'customer', 'Assalam o alaikum! DHA Phase 6 Lahore mein 10 marla brand new house available hai?', null, timezone('Asia/Karachi', now() - interval '3 hours')),
    (v_agency_id, v_lead_1, 'out', 'bot', 'Walaikum Assalam Tariq sb! Welcome to Al-Raziq Estate. Yes, we have a top quality 10 Marla brand new designer bungalow in DHA Phase 6.', v_list_5, timezone('Asia/Karachi', now() - interval '2 hours 59 minutes')),
    (v_agency_id, v_lead_1, 'out', 'bot', 'Here are the details: 4 Master Bedrooms, double-height lobby, Italian marble, asking 4.9 Crore.', v_list_5, timezone('Asia/Karachi', now() - interval '2 hours 58 minutes')),
    (v_agency_id, v_lead_1, 'in', 'customer', 'Price thora negotiate ho sakta hai? My budget is around 4.65 crore.', null, timezone('Asia/Karachi', now() - interval '45 minutes')),
    (v_agency_id, v_lead_1, 'out', 'agent', 'G Tariq sb, owner table pe negotiate karne ke liye willing hain. Would you like to schedule a visit this weekend?', null, timezone('Asia/Karachi', now() - interval '12 minutes'));

    -- Dr Fatima Zahra (Lead 2) Conversation
    insert into public.messages (agency_id, lead_id, direction, sender, body, listing_id, created_at) values
    (v_agency_id, v_lead_2, 'in', 'customer', 'Hello, do you have any sea-facing 3 bed flats in Clifton Block 4 or 5?', null, timezone('Asia/Karachi', now() - interval '1 day')),
    (v_agency_id, v_lead_2, 'out', 'bot', 'Hello Dr. Fatima! Yes, we have an exclusive 3 Bed Executive Sea-View flat in Clifton Block 4 on a high floor.', v_list_2, timezone('Asia/Karachi', now() - interval '23 hours 55 minutes')),
    (v_agency_id, v_lead_2, 'in', 'customer', 'Can we book a visit tomorrow at 5 PM?', null, timezone('Asia/Karachi', now() - interval '1 hour')),
    (v_agency_id, v_lead_2, 'out', 'agent', 'Visit confirmed for tomorrow at 5:00 PM. Our property consultant will meet you at the reception lobby.', null, timezone('Asia/Karachi', now() - interval '25 minutes'));

    -- Chaudhry Usman Gujjar (Lead 3) - Bot Paused / Human Needed
    insert into public.messages (agency_id, lead_id, direction, sender, body, listing_id, created_at) values
    (v_agency_id, v_lead_3, 'in', 'customer', 'DHA Phase 5 Block L mein jo Spanish kothi hai us ki video bhejo.', null, timezone('Asia/Karachi', now() - interval '45 minutes')),
    (v_agency_id, v_lead_3, 'out', 'bot', 'Ji Chaudhry sb, ye 1 Kanal Spanish Bungalow ki details aur video link hai:', v_list_4, timezone('Asia/Karachi', now() - interval '44 minutes')),
    (v_agency_id, v_lead_3, 'in', 'customer', 'Mujhe automated bot ke bajaye direct Malik sb ya senior agent se baat karni hai abhi phone karein.', null, timezone('Asia/Karachi', now() - interval '8 minutes'));

    -- Zainab Bibi (Lead 5) - Bot Paused / Human Needed
    insert into public.messages (agency_id, lead_id, direction, sender, body, listing_id, created_at) values
    (v_agency_id, v_lead_5, 'in', 'customer', 'Gulshan Block 7 wala 240 gaz ka ghar final kitne tak ho jaye ga?', null, timezone('Asia/Karachi', now() - interval '4 hours')),
    (v_agency_id, v_lead_5, 'out', 'bot', 'Asking price 3.8 crore hai with double storey and separate utility meters.', v_list_3, timezone('Asia/Karachi', now() - interval '3 hours 50 minutes')),
    (v_agency_id, v_lead_5, 'in', 'customer', 'سلام، کیا کوئی ایجنٹ کال کر سکتا ہے؟ ہم 3.6 کروڑ میں کیش آفر دینا چاہتے ہیں۔', null, timezone('Asia/Karachi', now() - interval '18 minutes'));

    -- Engr. Raheel Baig (Lead 12) - Human Needed
    insert into public.messages (agency_id, lead_id, direction, sender, body, listing_id, created_at) values
    (v_agency_id, v_lead_12, 'in', 'customer', 'Bot can not answer my question, give me real agent phone number right now.', null, timezone('Asia/Karachi', now() - interval '4 minutes'));

    -- 5. Visits
    insert into public.visits (agency_id, lead_id, listing_id, scheduled_at, status) values
    (
        v_agency_id,
        v_lead_2,
        v_list_2,
        timezone('Asia/Karachi', now() + interval '1 day' + interval '1 hour'),
        'confirmed'
    ),
    (
        v_agency_id,
        v_lead_6,
        v_list_7,
        timezone('Asia/Karachi', now() + interval '3 days'),
        'confirmed'
    ),
    (
        v_agency_id,
        v_lead_10,
        v_list_1,
        timezone('Asia/Karachi', now() + interval '2 days' + interval '4 hours'),
        'requested'
    ),
    (
        v_agency_id,
        v_lead_1,
        v_list_5,
        timezone('Asia/Karachi', now() - interval '1 day'),
        'done'
    ),
    (
        v_agency_id,
        v_lead_8,
        v_list_9,
        timezone('Asia/Karachi', now() - interval '4 days'),
        'cancelled'
    )
    on conflict do nothing;

end $$;
