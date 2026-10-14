-- ============================================================================
-- COMPLETE SETUP SCRIPT: REAL ESTATE CRM (PAKISTAN)
-- Copy and paste this directly into Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- Step 1: Run Schema
\i schema.sql;

-- Step 2: Run Seed
\i seed.sql;

-- ============================================================================
-- HOW TO CREATE AND LINK YOUR ADMIN USER:
-- 1. In Supabase Dashboard -> Authentication -> Users -> Add User (Create user)
--    Email: e.g. agent@alraziqestate.pk
--    Password: [your-secure-password]
--    Auto Confirm: Yes
-- 2. Copy the newly created User UUID
-- 3. Run the following snippet with that User UUID:
--
--    INSERT INTO public.profiles (user_id, agency_id, role)
--    VALUES (
--      'PASTE_YOUR_AUTH_USER_UUID_HERE',
--      '00000000-0000-0000-0000-000000000001', -- Al-Raziq Estate agency_id
--      'owner'
--    ) ON CONFLICT (user_id) DO UPDATE SET agency_id = excluded.agency_id;
-- ============================================================================
