require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const http = require('http');

// ── Validate env ──────────────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN)      { console.error('❌ DISCORD_TOKEN is required');      process.exit(1); }
if (!process.env.GUILD_ID)           { console.error('❌ GUILD_ID is required');           process.exit(1); }
if (!process.env.OWNER_ID)           { console.error('❌ OWNER_ID is required');           process.exit(1); }
if (!process.env.TURSO_DATABASE_URL) { console.error('❌ TURSO_DATABASE_URL is required'); process.exit(1); }
if (!process.env.TURSO_AUTH_TOKEN)   { console.error('❌ TURSO_AUTH_TOKEN is required');   process.exit(1); }

// ── Health server FIRST (so Render doesn't kill us before login) ──────────────
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
});
server.listen(PORT, '0.0.0.0', () => {
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

// ── Load handlers ─────────────────────────────────────────────────────────────
require('./src/handlers/commandHandler')(client);
require('./src/handlers/eventHandler')(client);
require('./src/handlers/errorHandler')(client);

// ── Shutdown ──────────────────────────────────────────────────────────────────
process.on('SIGINT',  () => { server.close(); client.destroy(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); client.destroy(); process.exit(0); });
process.on('unhandledRejection', (reason) => console.error('❌ Unhandled Rejection:', reason));
process.on('uncaughtException',  (err)    => console.error('❌ Uncaught Exception:', err.message));

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  console.log('🚀 Starting Phantom...');
  await client.login(process.env.DISCORD_TOKEN);
}

start().catch(err => {
  console.error('❌ Failed to start:', err.message);
  process.exit(1);
});
