# n8n WhatsApp Real Estate AI Bot Setup

A complete, production-ready n8n workflow that connects **Meta WhatsApp Cloud API**, **Supabase (Postgres & Auth)**, and **OpenAI (GPT-4o)** for Pakistani real estate agencies.

The workflow file is: [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json)

---

## What This Workflow Does

1. **Meta Webhook Verification**: Handles the Meta GET request (`hub.challenge`) automatically when you configure the webhook in Meta Developers Console.
2. **Multi-Tenant Lead Management**:
   - Captures incoming WhatsApp messages from customers.
   - Normalizes Pakistani phone numbers to `+92 XXX XXXXXXX` format.
   - Looks up the customer in Supabase `public.leads` for your specific `agency_id`.
   - Automatically creates a new lead if this is their first message.
3. **Smart Human Takeover & Bot Pause**:
   - Checks if the lead already has `bot_paused = true` (e.g., set by an agent in the web app). If paused, the bot stays completely quiet and only logs the customer's message.
   - Listens for human handover triggers in Roman Urdu, Urdu script, and English (e.g., *"agent se baat karni hai"*, *"call me"*, *"insan"*, *"rabta karein"*).
   - If triggered:
     - Automatically sets `bot_paused = true` and `label = 'hot'`.
     - Sends a courteous confirmation message to the customer on WhatsApp:
       > *"Bohat shukriya! Humne automated bot pause kardiya hai aur hamare senior property agent ko notify kardiya hai. Agent jald hi aapko isi number pe rabta karein gay."*
     - Instantly raises the **"Chats need a human"** alert on your web app dashboard.
4. **AI Property Matching & Pakistani Market Knowledge**:
   - Queries `public.listings` where `visible_to_bot = true` and `status = 'available'`.
   - Passes available inventory to the AI model.
   - Speaks fluent, respectful Roman Urdu and English.
   - Understands Pakistani real estate terminology: **Marla, Kanal, Sq. Yards (Gaz), Sq. Feet, Lakh, Crore, DHA, Bahria, Clifton, CDA, LDA**.
   - Recommends matching properties with prices, bedrooms, features, and Instagram video tour links.
   - Extracts customer budget and requirements (`wants_type`, `wants_area`, `budget_max_pkr`, `wants_size`, `hot/cold` label) and updates `public.leads`.
5. **Chat History**:
   - Writes all inbound and outbound messages into `public.messages` with timestamps and links `listing_id` whenever a property is recommended.

---

## 1. How to Import into n8n

1. Open your **n8n** dashboard.
2. Click **Workflows** in the left sidebar -> Click **Add workflow** (or click the three dots `...` in top right).
3. Select **Import from File**.
4. Choose [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json).
5. The complete workflow will open on your canvas.

---

## 2. Variables & Credentials to Add

You only need to supply your project credentials:

### A. Environment Variables in n8n (or n8n Variables tab)

In n8n Settings -> **Variables** (or in your n8n `.env` file):

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://xyzproject.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase **Service Role Key** (bypasses RLS for backend bot) |
| `AGENCY_ID` | `00000000-0000-0000-0000-000000000001` | Your agency's UUID from `public.agencies` |
| `WHATSAPP_PHONE_NUMBER_ID` | `104928392019482` | Phone Number ID from Meta WhatsApp Cloud API |
| `WHATSAPP_ACCESS_TOKEN` | `EAAG...` | Meta Permanent System User Access Token |

*(Note: If your n8n version does not use `$env`, you can directly paste these 5 values into the respective HTTP Request node parameter fields or use n8n Workflow Variables).*

### B. OpenAI Credential

1. In n8n, click **Credentials** -> **New Credential**.
2. Select **OpenAI API**.
3. Paste your **OpenAI API Key**.
4. Double click the **AI Real Estate Agent (OpenAI)** node in the workflow and select your new credential.

---

## 3. Meta WhatsApp Cloud API Webhook Setup

1. In the n8n workflow, double click the **WhatsApp Webhook (POST)** node and copy the **Production Webhook URL**:
   `https://your-n8n-instance.com/webhook/whatsapp`
2. Go to **Meta for Developers** -> [developers.facebook.com](https://developers.facebook.com) -> Your App -> **WhatsApp** -> **Configuration**.
3. Under **Webhook**, click **Edit**:
   - **Callback URL**: `https://your-n8n-instance.com/webhook/whatsapp`
   - **Verify token**: Enter any secret phrase (e.g. `al_raziq_crm_token_2026`)
4. Click **Verify and Save**.
5. Under **Webhook fields**, click **Manage** and subscribe to **`messages`**.
6. Activate your n8n workflow (toggle the switch in the top right to **Active**).

---

## 4. Testing with Mock Data

You can test the workflow immediately without sending real WhatsApp messages:

1. Open [`n8n/sample_webhook_payload.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/sample_webhook_payload.json).
2. In n8n, click the **WhatsApp Webhook (POST)** node -> Click **Listen for test event**.
3. Or paste the JSON content into the first node's pin data and execute step by step.
4. You will see the lead created, listings fetched, AI response generated, and message saved to Supabase!
