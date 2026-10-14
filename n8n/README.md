# Multi-Agency WhatsApp Bot Architecture (1 Workflow per Real Estate Agency)

In your business model, **every real estate agency / agent has their own dedicated n8n workflow**.

This ensures:
1. **Zero Data Leakage**: Agency A only queries listings and creates leads under Agency A's `agency_id`.
2. **Distinct WhatsApp Phone Numbers**: Each agency connects their own Meta WhatsApp Business Phone Number ID and Access Token.
3. **Customized AI Persona**: The bot greets customers using that agency's specific business name (e.g., *"Al-Raziq Estate"*, *"Zamindar Associates"*).
4. **Unique Webhook URLs**: Each agency has their own distinct webhook endpoint (e.g. `/webhook/whatsapp-alraziq`, `/webhook/whatsapp-zamindar`).

The ready-to-import template is: [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json)

---

## How to Set Up a New Agency (Takes 60 Seconds)

### Step 1: In your Supabase Database / Admin Panel
1. Obtain the agency's UUID from `public.agencies` (e.g. `00000000-0000-0000-0000-000000000001`).
2. Make sure you have your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

### Step 2: In n8n
1. Open n8n and click **Workflows** -> **Import from File**.
2. Select [`n8n/whatsapp_real_estate_bot_workflow.json`](file:///home/affan/ClaudeWork/real%20estate%20wp%20bot/n8n/whatsapp_real_estate_bot_workflow.json).
3. Rename the workflow to match the client: e.g. **"Bot - Al-Raziq Estate"**.
4. Double-click the very first node: **`⚙️ Agency & Bot Settings`**.
5. Fill in the values for this agency:

| Setting Name | Value for this Agency | Explanation |
| :--- | :--- | :--- |
| `agencyId` | `00000000-0000-0000-0000-000000000001` | Their UUID from the `agencies` table |
| `agencyName` | `Al-Raziq Estate & Builders` | Agency name (used by AI in greetings) |
| `agentPhone` | `+92 300 8251940` | Agent contact phone |
| `primaryCity` | `Karachi & Lahore` | Focus cities |
| `supabaseUrl` | `https://your-project.supabase.co` | Your Supabase URL |
| `supabaseServiceRoleKey` | `eyJhbGciOi...` | Supabase Service Role Key |
| `whatsappPhoneNumberId` | `104928392019482` | Agency's Meta WhatsApp Phone Number ID |
| `whatsappAccessToken` | `EAAG...` | Agency's Meta System User Access Token |
| `webhookVerifyToken` | `agency_token_alraziq` | Verification phrase for Meta |

*(All 15 subsequent nodes in the workflow automatically read from this node! You never have to touch individual HTTP or code nodes.)*

---

### Step 3: Set Unique Webhook Path
1. In the workflow, double-click **WhatsApp Webhook (POST)** and **WhatsApp Verification (GET)**.
2. Change the path to match the agency slug:
   - For Al-Raziq: `whatsapp-alraziq`
   - For Zamindar: `whatsapp-zamindar`
3. Your agency's live webhook URL will be:
   `https://<your-n8n-domain>/webhook/whatsapp-alraziq`

---

### Step 4: Configure Meta WhatsApp Cloud API
1. In [Meta Developers Console](https://developers.facebook.com) -> WhatsApp -> **Configuration** -> **Webhook**:
   - **Callback URL**: `https://<your-n8n-domain>/webhook/whatsapp-alraziq`
   - **Verify Token**: Enter the phrase you set in `webhookVerifyToken` (e.g. `agency_token_alraziq`).
2. Click **Verify and Save**.
3. Under **Webhook Fields**, subscribe to **`messages`**.
4. In n8n, toggle the workflow switch to **Active**.

---

## When Onboarding Client #2, Client #3, etc.

Simply:
1. Click the `...` menu on your workflow in n8n -> **Duplicate**.
2. Rename to **"Bot - Zamindar Associates"**.
3. Update the 5 fields in **`⚙️ Agency & Bot Settings`** with Client #2's credentials.
4. Change the webhook path to `whatsapp-zamindar`.
5. Connect Client #2's WhatsApp in Meta Developer Console.
6. Done!
