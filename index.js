const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

// ── Validate env ──────────────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN)      { console.error('❌ DISCORD_TOKEN is required');      process.exit(1); }
if (!process.env.GUILD_ID)           { console.error('❌ GUILD_ID is required');           process.exit(1); }
if (!process.env.OWNER_ID)           { console.error('❌ OWNER_ID is required');           process.exit(1); }
if (!process.env.TURSO_DATABASE_URL) { console.error('❌ TURSO_DATABASE_URL is required'); process.exit(1); }
if (!process.env.TURSO_AUTH_TOKEN)   { console.error('❌ TURSO_AUTH_TOKEN is required');   process.exit(1); }

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

// ── Load handlers ─────────────────────────────────────────────────────────────
require('./src/handlers/commandHandler')(client);
require('./src/handlers/eventHandler')(client);
require('./src/handlers/errorHandler')(client);

// ── Health server (starts after bot is ready, just like Synapse) ──────────────
const startHealthServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(express.json());
  app.get('/',       (req, res) => res.json({ status: 'online', bot: client.user?.tag, uptime: process.uptime() }));
  app.get('/health', (req, res) => res.json({ status: 'online', bot: client.user?.tag, uptime: process.uptime() }));
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Health server running on port ${PORT}`);
  });
};

// ── Ready event (inline, just like Synapse) ───────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);

  startHealthServer();
});

// ── Shutdown ──────────────────────────────────────────────────────────────────
process.on('SIGINT',  () => { client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { client.destroy(); process.exit(0); });

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

// ── Start (same pattern as Synapse) ──────────────────────────────────────────
async function start() {
  console.log('🚀 Starting Phantom...');
  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(err => {
  console.error('❌ Failed to start:', err.message);
  process.exit(1);
});
