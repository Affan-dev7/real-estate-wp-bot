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
