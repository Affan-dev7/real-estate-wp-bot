# Multi-Agency WhatsApp AI Bot (n8n Setup Guide)

This guide shows you how to deploy and manage AI WhatsApp Bots for multiple Pakistani real estate agencies in n8n.

### Architecture Overview
* **Per-Agency Database Isolation**: Each client agency has its own Supabase project/database (RLS multi-tenancy).
* **Shared OpenAI Credential**: One OpenAI API key in n8n's Credential Manager is shared across all agency bots.
* **1-Click Agency Generator**: Never manually click and edit 8 different database nodes in the n8n canvas! Use `npm run create-agency-bot` to generate a ready-to-import workflow JSON for each client agency in 1 second.

---

## 1. Credentials in n8n (Credential Manager)

Before importing workflows, set up your credentials once in n8n's **Credential Manager** (`Credentials` -> `Add Credential`):

### A. Shared OpenAI Credential (Added Once)
* **Credential Type**: `OpenAI API`
* **Credential Name**: `OpenAI Account`
* **API Key**: `sk-proj-...`
*(This single credential is used by all agency workflows)*

### B. Agency Supabase Credential (One per Client Agency)
* **Credential Type**: `Supabase API`
* **Credential Name**: e.g., `Al-Raziq Supabase` (or `Clifton Supabase`)
* Fill in 2 fields from that agency's Supabase Dashboard:

| Field in n8n | What to Enter | Where in Supabase Dashboard |
| :--- | :--- | :--- |
| **Host** | `https://YOUR_PROJECT_REF.supabase.co` | **Project Settings** -> **API** -> **Project URL** |
| **Service Role Secret** | `eyJhbGciOi...` | **Project Settings** -> **API** -> `service_role` (secret) |

> [!TIP]
> The Supabase API credential connects over standard HTTPS (port 443). You never have to worry about database passwords or custom ports!

### C. WhatsApp Cloud API Token (Header Auth)
* **Credential Type**: `Header Auth`
* **Credential Name**: `WhatsApp Cloud API Token`
* **Name**: `Authorization`
* **Value**: `Bearer YOUR_WHATSAPP_PERMANENT_ACCESS_TOKEN`

---

## 2. Generate a Client Agency Workflow (1-Click)

Instead of manually editing 8 database nodes inside n8n canvas, run the generator script:

### Interactive Mode:
```bash
npm run create-agency-bot
```
The script will prompt you for:
1. **Agency Name** (e.g. `Al-Raziq Estate & Builders`)
2. **Agency UUID** (from Supabase `agencies` table)
3. **Supabase Credential Name in n8n** (e.g. `Al-Raziq Supabase`)
4. **Agent Phone Number** (e.g. `+92 300 8251940`)
5. **Operating Cities** (e.g. `Karachi & Lahore`)
6. **Meta WhatsApp Phone Number ID**

### Or CLI Flag Mode (Instant):
```bash
node scripts/create_agency_bot.mjs \
  --name "Al-Raziq Estate & Builders" \
  --agency-id "00000000-0000-0000-0000-000000000001" \
  --supabase-cred "Al-Raziq Supabase" \
  --phone "+92 300 8251940" \
  --city "Karachi & Lahore" \
  --phone-number-id "104928392019482"
```

The script instantly creates:
`n8n/agencies/al-raziq-estate-builders_whatsapp_bot.json`

In this file:
- All **8 Supabase nodes** (`Lookup Lead`, `Create Lead`, `Log Customer Message`, `Pause Bot`, `Log Handover`, `Fetch Listings`, `Update Lead`, `Log Outbound`) are **automatically pre-bound** to `"Al-Raziq Supabase"`.
- The **OpenAI node** is bound to `"OpenAI Account"`.
- The **WhatsApp nodes** are bound to `"WhatsApp Cloud API Token"`.
- The **Webhook URL** is automatically namespaced: `/webhook/whatsapp-al-raziq-estate-builders`.

---

## 3. Import & Activate in n8n

1. In your **n8n Dashboard**, go to **Workflows** -> click the **⋮** menu in the top right -> **Import from File**.
2. Select your generated file from `n8n/agencies/`.
3. Click **Save** and toggle the workflow to **Active**!
4. Point that agency's Meta WhatsApp Cloud webhook to:
   `https://YOUR_N8N_DOMAIN/webhook/whatsapp-[agency-slug]`

---

## 4. Testing the Bot Webhook Locally

You can test any agency bot workflow locally using curl with a mock WhatsApp message:

```bash
curl -X POST http://localhost:5678/webhook-test/whatsapp-al-raziq-estate-builders \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "contacts": [{ "profile": { "name": "Bilal Khan" } }],
          "messages": [{
            "from": "923001234567",
            "id": "wamid.test_001",
            "type": "text",
            "text": { "body": "Assalam o alaikum, 10 marla house DHA Phase 6 budget 4 crore" },
            "timestamp": "1728900000"
          }]
        }
      }]
    }]
  }'
```
