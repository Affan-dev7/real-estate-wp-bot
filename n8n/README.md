# Multi-Agency WhatsApp Bot (Supabase Credential Guide)

You can now use your **Supabase API Credential** directly in n8n's Credential Manager without needing direct PostgreSQL connection strings or database passwords!

Workflow templates available:
* **Primary (Supabase API Credential)**: [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json) *(Recommended - uses native Supabase nodes)*
* **Alternative (Postgres Credential)**: [`n8n/whatsapp_real_estate_bot_postgres.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_postgres.json) *(If you prefer raw SQL queries)*

---

## 1. Setting up the Supabase Credential in n8n

In your n8n Dashboard:
1. Click **Credentials** in the left sidebar -> Click **Add Credential**.
2. Search for **Supabase** and click **Supabase API**.
3. Fill in the 2 fields from your Supabase Dashboard:

| Field in n8n | What to Enter | Where in Supabase Dashboard |
| :--- | :--- | :--- |
| **Host** | `https://YOUR_PROJECT_REF.supabase.co` | **Project Settings** -> **API** -> **Project URL** |
| **Service Role Secret** | `eyJhbGciOi...` | **Project Settings** -> **API** -> `service_role` (secret) |

4. Click **Save**!

> [!TIP]
> The Supabase API credential connects over standard HTTPS (port 443). You never have to worry about database ports (5432 / 6543) or database passwords!

---

## 2. Other Credentials to Add in n8n

### A. OpenAI Credential
* **Credential Type**: `OpenAI API`
* **API Key**: `sk-proj-...`

### B. WhatsApp Cloud API Token (Header Auth)
* **Credential Type**: `Header Auth`
* **Name**: `Authorization`
* **Value**: `Bearer YOUR_WHATSAPP_PERMANENT_ACCESS_TOKEN`

---

## 3. How to Set Up an Agency Workflow

1. In n8n, click **Workflows** -> **Import from File**.
2. Select [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json).
3. The workflow will automatically link to your saved **Supabase account** and **OpenAI Account** credentials.
4. Double click **`🏢 Agency Info & Routing`** to set this agency's details:
   ```javascript
   const agencyInfo = {
     // Agency UUID from Supabase public.agencies table
     agencyId: "00000000-0000-0000-0000-000000000001",
     
     // Agency profile for customer greetings
     agencyName: "Al-Raziq Estate & Builders",
     agentPhone: "+92 300 8251940",
     primaryCity: "Karachi & Lahore",
     
     // Meta WhatsApp Phone Number ID
     phoneNumberId: "104928392019482"
   };
   ```
5. Set your unique Webhook Path (e.g. `whatsapp-alraziq`).
6. Point your Meta Developer Webhook to `https://<your-n8n-domain>/webhook/whatsapp-alraziq`.
7. Turn the workflow to **Active**.
