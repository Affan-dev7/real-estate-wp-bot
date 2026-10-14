#!/usr/bin/env node
/**
 * 1-Click Multi-Agency WhatsApp AI Bot Workflow Generator for n8n
 * 
 * Generates an agency-specific n8n workflow from the master template.
 * Binds that agency's specific Supabase database credential across all database nodes,
 * uses the shared global OpenAI credential, sets up unique webhooks, and injects
 * the agency's real estate profile.
 * 
 * Usage (CLI args):
 *   node scripts/create_agency_bot.mjs \
 *     --name "Al-Raziq Estate & Builders" \
 *     --agency-id "00000000-0000-0000-0000-000000000001" \
 *     --supabase-cred "Al-Raziq Supabase" \
 *     --whatsapp-cred "Al-Raziq WhatsApp" \
 *     --openai-cred "OpenAI Account" \
 *     --phone "+92 300 8251940" \
 *     --city "Karachi & Lahore" \
 *     --phone-number-id "104928392019482"
 * 
 * Or run interactively:
 *   npm run create-agency-bot
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const templatePath = path.join(rootDir, 'n8n', 'whatsapp_real_estate_bot_workflow.json');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    }
  }
  return options;
}

async function promptInputs(cliOpts) {
  // If required flags are provided via CLI, skip interactive prompt
  if (cliOpts.name && cliOpts['agency-id']) {
    return {
      agencyName: cliOpts.name,
      agencyId: cliOpts['agency-id'],
      supabaseCred: cliOpts['supabase-cred'] || `${cliOpts.name} Supabase`,
      whatsappCred: cliOpts['whatsapp-cred'] || 'WhatsApp Cloud API Token',
      openaiCred: cliOpts['openai-cred'] || 'OpenAI Account',
      agentPhone: cliOpts.phone || '+92 300 8251940',
      primaryCity: cliOpts.city || 'Karachi, Lahore & Islamabad',
      phoneNumberId: cliOpts['phone-number-id'] || '104928392019482',
    };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n============================================================');
  console.log('🤖 Real Estate WhatsApp AI Bot - Agency Workflow Generator');
  console.log('============================================================\n');

  try {
    const agencyName = (await rl.question('🏢 Agency Name (e.g. Al-Raziq Estate): ')).trim() || 'Al-Raziq Estate';
    const agencyId = (await rl.question('🔑 Agency UUID (from Supabase agencies table) [00000000-0000-0000-0000-000000000001]: ')).trim() || '00000000-0000-0000-0000-000000000001';
    const supabaseCred = (await rl.question(`📦 Supabase Credential Name in n8n [${agencyName} Supabase]: `)).trim() || `${agencyName} Supabase`;
    const whatsappCred = (await rl.question('💬 WhatsApp Cloud API Credential in n8n [WhatsApp Cloud API Token]: ')).trim() || 'WhatsApp Cloud API Token';
    const openaiCred = (await rl.question('🧠 Shared OpenAI Credential in n8n [OpenAI Account]: ')).trim() || 'OpenAI Account';
    const agentPhone = (await rl.question('📞 Human Agent Phone (Pakistani format) [+92 300 8251940]: ')).trim() || '+92 300 8251940';
    const primaryCity = (await rl.question('📍 Operating Cities/Areas [Karachi & Lahore]: ')).trim() || 'Karachi & Lahore';
    const phoneNumberId = (await rl.question('📱 Meta Phone Number ID [104928392019482]: ')).trim() || '104928392019482';

    return {
      agencyName,
      agencyId,
      supabaseCred,
      whatsappCred,
      openaiCred,
      agentPhone,
      primaryCity,
      phoneNumberId,
    };
  } finally {
    rl.close();
  }
}

async function main() {
  const cliOpts = parseArgs();
  const config = await promptInputs(cliOpts);

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template workflow not found at: ${templatePath}`);
    process.exit(1);
  }

  const templateRaw = fs.readFileSync(templatePath, 'utf8');
  const workflow = JSON.parse(templateRaw);

  const slug = slugify(config.agencyName);
  const webhookSlug = `whatsapp-${slug}`;
  const supabaseCredId = `${slug}-supabase`;
  const whatsappCredId = `${slug}-whatsapp-token`;

  // 1. Update Workflow Name
  workflow.name = `Pakistan Real Estate WhatsApp Bot - ${config.agencyName}`;

  let supabaseNodesUpdated = 0;
  let whatsappNodesUpdated = 0;
  let openaiNodesUpdated = 0;

  // 2. Iterate through nodes and configure bindings
  for (const node of workflow.nodes) {
    // A. Update Webhook URLs
    if (node.type === 'n8n-nodes-base.webhook') {
      node.parameters.path = webhookSlug;
      if (node.name.includes('(POST)')) {
        node.webhookId = `whatsapp-${slug}-post`;
      } else {
        node.webhookId = `whatsapp-${slug}-get`;
      }
    }

    // B. Update Agency Info Code Node
    if (node.name === '🏢 Agency Info & Routing') {
      node.parameters.jsCode = `// =====================================================================
// 🏢 AGENCY ROUTING & PROFILE (${config.agencyName})
// Credentials (Supabase, OpenAI, WhatsApp) live in n8n Credential Manager
// =====================================================================

const agencyInfo = {
  // Agency UUID from Supabase public.agencies table
  agencyId: "${config.agencyId}",
  
  // Agency Profile for AI customer greetings
  agencyName: "${config.agencyName.replace(/"/g, '\\"')}",
  agentPhone: "${config.agentPhone}",
  primaryCity: "${config.primaryCity.replace(/"/g, '\\"')}",
  
  // Meta Phone Number ID (from WhatsApp Business App Dashboard)
  phoneNumberId: "${config.phoneNumberId}"
};

const webhookData = $input.first()?.json || {};

return [{
  json: {
    ...webhookData,
    ...agencyInfo
  }
}];`;
    }

    // C. Bind Supabase Database Credential
    if (node.type === 'n8n-nodes-base.supabase') {
      node.credentials = {
        supabaseApi: {
          id: supabaseCredId,
          name: config.supabaseCred,
        },
      };
      supabaseNodesUpdated++;
    }

    // D. Bind WhatsApp Cloud API Credential
    if (node.type === 'n8n-nodes-base.httpRequest' && node.credentials?.httpHeaderAuth) {
      node.credentials = {
        httpHeaderAuth: {
          id: whatsappCredId,
          name: config.whatsappCred,
        },
      };
      whatsappNodesUpdated++;
    }

    // E. Bind OpenAI Credential (Shared Global)
    if (node.type === 'n8n-nodes-base.openAi') {
      node.credentials = {
        openAiApi: {
          id: 'openai-cred',
          name: config.openaiCred,
        },
      };
      openaiNodesUpdated++;
    }
  }

  // Ensure output directory exists
  const outDir = path.join(rootDir, 'n8n', 'agencies');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = cliOpts.out || path.join(outDir, `${slug}_whatsapp_bot.json`);
  fs.writeFileSync(outFilePath, JSON.stringify(workflow, null, 2), 'utf8');

  console.log('\n✅ Workflow generated successfully!');
  console.log(`📁 Saved to: ${path.relative(rootDir, outFilePath)}`);
  console.log('------------------------------------------------------------');
  console.log(`🏢 Agency:                 ${config.agencyName}`);
  console.log(`🔑 Agency UUID:            ${config.agencyId}`);
  console.log(`📦 Supabase Credential:    "${config.supabaseCred}" (linked to all ${supabaseNodesUpdated} Supabase nodes)`);
  console.log(`💬 WhatsApp Credential:    "${config.whatsappCred}" (linked to ${whatsappNodesUpdated} WhatsApp nodes)`);
  console.log(`🧠 OpenAI Credential:      "${config.openaiCred}" (linked to ${openaiNodesUpdated} OpenAI node)`);
  console.log(`🌐 Webhook Path:           /webhook/${webhookSlug}`);
  console.log('------------------------------------------------------------');
  console.log('\n🚀 Next Steps in n8n:');
  console.log(`1. In n8n, ensure you have a Supabase credential named: "${config.supabaseCred}"`);
  console.log('2. Click "Workflows" -> "Import from File" and select:');
  console.log(`   ${outFilePath}`);
  console.log('3. Turn the workflow toggle to ACTIVE!');
  console.log('   All 7 Supabase nodes are already linked to this agency\'s database automatically.\n');
}

main().catch((err) => {
  console.error('Error generating agency workflow:', err);
  process.exit(1);
});
