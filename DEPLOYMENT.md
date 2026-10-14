# Deployment & Setup Guide: Property Desk (Pakistan Real Estate CRM)

A fast, daylight-optimized real estate CRM for small property agencies in Pakistan (Karachi, Lahore, Islamabad).

---

## 1. Database Setup (Supabase)

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/combined_setup.sql`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/supabase/combined_setup.sql) from this repository, copy the entire SQL script, and click **Run**.
   - This creates all 6 tables (`agencies`, `profiles`, `listings`, `leads`, `messages`, `visits`), indexes, Row Level Security (RLS) policies, and seeds 1 agency, 10 realistic listings across Karachi/Lahore/Islamabad, 15 leads, full message histories, and visits.
4. Set up your Storage bucket:
   - Go to **Storage** -> ensure the bucket `listing-photos` is present (it is created by the script).
5. Create your initial Agency User:
   - Go to **Authentication** -> **Users** -> **Add User** -> **Create user**.
   - Email: `agent@alraziqestate.pk` (or your agency email).
   - Password: Choose a secure password.
   - Auto Confirm User: **Yes**.
   - Copy the newly created **User UUID**.
   - In the **SQL Editor**, run:
     ```sql
     insert into public.profiles (user_id, agency_id, role)
     values (
       'PASTE_USER_UUID_HERE',
       '00000000-0000-0000-0000-000000000001',
       'owner'
     ) on conflict (user_id) do update set agency_id = excluded.agency_id;
     ```

---

## 2. Environment Variables

In your deployment dashboard, configure the following variables:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | Your Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Your Supabase public anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Confidential (Server Only)** | Secret service role key (used by n8n bot / admin only) |
| `NEXT_PUBLIC_APP_TIMEZONE` | Public | `Asia/Karachi` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Public | `PKR` |

> [!CAUTION]
> Never provide `SUPABASE_SERVICE_ROLE_KEY` with the `NEXT_PUBLIC_` prefix. It must remain strictly confidential to prevent client-side exposure.

---

## 3. Deploying to Vercel (Recommended)

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your repository.
4. **Framework Preset**: Vercel will automatically detect **Next.js**.
5. **Root Directory**: `./`
6. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_TIMEZONE` (`Asia/Karachi`)
7. Click **Deploy**.
8. Once deployment is complete, your app is live on your `*.vercel.app` domain or custom domain with automatic SSL.

---

## 4. Deploying to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your Git repository.
3. Build Settings:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: `.vercel/output/static`
4. Under **Environment variables**, define:
   - `NODE_VERSION`: `20.10.0` or higher
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_TIMEZONE`: `Asia/Karachi`
5. Click **Save and Deploy**.

---

## 5. Integrating the WhatsApp AI Bot (n8n)

The WhatsApp bot (running in n8n) communicates directly with the same Supabase Postgres database using the `SUPABASE_SERVICE_ROLE_KEY`:

1. **Incoming WhatsApp Message**:
   - Customer sends message on WhatsApp.
   - n8n receives webhook from WhatsApp Cloud API / Twilio.
   - n8n queries `public.leads` by phone number `+92...`. If new, inserts lead.
   - n8n checks `bot_paused`:
     - If `bot_paused = true`, n8n stops auto-replying and only logs the incoming message into `public.messages`.
     - If `bot_paused = false`, AI bot suggests matching listings from `public.listings` where `visible_to_bot = true` and logs both customer and bot messages.
2. **Human Takeover**:
   - In this web app, clicking **"Take over chat"** sets `bot_paused = true`.
   - The agent can reply directly via the web app or WhatsApp, and the bot will stay quiet until unpaused.
