# Multi-Agency WhatsApp Bot (Credential Manager Architecture)

Every real estate agency / agent has their own dedicated n8n workflow.

All sensitive secrets (Database passwords, OpenAI API keys, WhatsApp access tokens) live **100% in n8n's Credential Manager**. Nodes do not store raw passwords or keys.

The ready-to-import template is: [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json)

---

## 1. Add Your Credentials in n8n Credential Manager

Go to your n8n Dashboard -> **Credentials** -> **Add Credential**:

### A. Postgres Credential (Direct Supabase Connection)
* **Credential Type**: `Postgres`
* **Credential Name**: `Supabase Postgres`
* **Host**: `db.YOUR_PROJECT_REF.supabase.co` *(from Supabase Dashboard -> Project Settings -> Database)*
* **Database**: `postgres`
* **User**: `postgres`
* **Password**: `[YOUR_SUPABASE_DATABASE_PASSWORD]`
* **Port**: `5432` *(or `6543` for connection pooling)*
* **SSL**: `require`

---

### B. OpenAI Credential
* **Credential Type**: `OpenAI API`
* **Credential Name**: `OpenAI Account`
* **API Key**: `sk-proj-...`

---

### C. WhatsApp Cloud API Token (Header Auth)
* **Credential Type**: `Header Auth`
* **Credential Name**: `WhatsApp Cloud API Token`
* **Name**: `Authorization`
* **Value**: `Bearer YOUR_WHATSAPP_PERMANENT_ACCESS_TOKEN`

---

## 2. How to Set Up an Agency Workflow

1. In n8n, click **Workflows** -> **Import from File**.
2. Select [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json).
3. In the workflow, double-click **`🏢 Agency Info & Routing`**:
   This node only holds **non-sensitive routing identifiers**:
   ```javascript
   const agencyInfo = {
     // Agency UUID from Supabase public.agencies table
     agencyId: "00000000-0000-0000-0000-000000000001",
     
     // Agency Profile for customer greetings
     agencyName: "Al-Raziq Estate & Builders",
     agentPhone: "+92 300 8251940",
     primaryCity: "Karachi & Lahore",
     
     // Meta Phone Number ID (from WhatsApp Business App Dashboard)
     phoneNumberId: "104928392019482"
   };
   ```
4. Set the Webhook Path:
   Double click **WhatsApp Webhook (POST)** and **WhatsApp Verification (GET)** and set a unique path for this agency:
   e.g. `whatsapp-alraziq` or `whatsapp-zamindar`.
5. Connect your Meta Developer Webhook to:
   `https://<your-n8n-domain>/webhook/whatsapp-alraziq`
6. Toggle the workflow to **Active**.

---

## 3. When Onboarding Client #2, Client #3, etc.

1. In n8n, click **Duplicate** on the workflow.
2. Rename to **"Bot — Zamindar Associates"**.
3. Open **`🏢 Agency Info & Routing`** and change:
   - `agencyId` -> Client #2's agency UUID from Supabase
   - `agencyName` -> `Zamindar Associates`
   - `phoneNumberId` -> Client #2's WhatsApp Phone Number ID
4. Change the Webhook path to `whatsapp-zamindar`.
5. Point Client #2's Meta WhatsApp Webhook URL to `https://<your-n8n-domain>/webhook/whatsapp-zamindar`.
6. Done! All Postgres, OpenAI, and WhatsApp credentials are automatically reused from your Credential Manager.
