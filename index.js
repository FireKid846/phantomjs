const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

// ── Validate env ──────────────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN)      { console.error('❌ DISCORD_TOKEN is required');      process.exit(1); }
if (!process.env.CLIENT_ID)          { console.error('❌ CLIENT_ID is required');          process.exit(1); }
if (!process.env.GUILD_ID)           { console.error('❌ GUILD_ID is required');           process.exit(1); }
if (!process.env.OWNER_ID)           { console.error('❌ OWNER_ID is required');           process.exit(1); }
if (!process.env.TURSO_DATABASE_URL) { console.error('❌ TURSO_DATABASE_URL is required'); process.exit(1); }
if (!process.env.TURSO_AUTH_TOKEN)   { console.error('❌ TURSO_AUTH_TOKEN is required');   process.exit(1); }

// ── Express health server ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get('/',       (req, res) => res.json({ status: 'online', uptime: process.uptime() }));
app.get('/health', (req, res) => res.json({ status: 'online', uptime: process.uptime() }));
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Health server running on port ${PORT}`);
});

// ── Discord client ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ── Load handlers (same order as sentinentmod) ────────────────────────────────
require('./src/handlers/commandHandler')(client);
require('./src/handlers/eventHandler')(client);
require('./src/handlers/errorHandler')(client);

// ── Shutdown ──────────────────────────────────────────────────────────────────
process.on('SIGINT',  () => { server.close(); client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); client.destroy(); process.exit(0); });

// ── Start ─────────────────────────────────────────────────────────────────────
async function startBot() {
  try {
    console.log('🚀 Starting Phantom...');
    await client.login(process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error('❌ Login failed:', err);
    process.exit(1);
  }
}

startBot();
