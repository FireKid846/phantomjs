const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 PHANTOM BOT - STARTUP SEQUENCE');
console.log(`🕐 Started at: ${new Date().toISOString()}`);
console.log(`📦 Node version: ${process.version}`);
console.log(`💻 Platform: ${process.platform}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ── Validate env ──────────────────────────────────────────────────────────────
console.log('\n🔍 [1/5] Validating environment variables...');

const requiredEnv = [
  'DISCORD_TOKEN',
  'CLIENT_ID',
  'GUILD_ID',
  'OWNER_ID',
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
];

let envFailed = false;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`   ❌ MISSING: ${key}`);
    envFailed = true;
  } else {
    const val = process.env[key];
    const preview = val.length > 12 ? val.slice(0, 6) + '...' + val.slice(-4) : '***';
    console.log(`   ✅ ${key} = ${preview} (length: ${val.length})`);
  }
}

if (envFailed) {
  console.error('\n❌ One or more required env vars are missing. Exiting.');
  process.exit(1);
}

// Extra token sanity check
const token = process.env.DISCORD_TOKEN;
console.log(`\n🔑 Token debug:`);
console.log(`   - Length: ${token.length} (expected ~70)`);
console.log(`   - Starts with: "${token.slice(0, 10)}..."`);
console.log(`   - Contains spaces: ${/\s/.test(token)}`);
console.log(`   - Contains newlines: ${/\n|\r/.test(token)}`);
if (token.length < 50) {
  console.warn('   ⚠️  Token looks too short — it may be truncated or invalid!');
}
if (/\s/.test(token)) {
  console.warn('   ⚠️  Token has whitespace — this will cause login to fail!');
}

// ── Express health server ─────────────────────────────────────────────────────
console.log('\n🌐 [2/5] Starting Express health server...');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get('/', (req, res) => {
  console.log(`   📡 Health check hit: /`);
  res.json({ status: 'online', uptime: process.uptime() });
});
app.get('/health', (req, res) => {
  console.log(`   📡 Health check hit: /health`);
  res.json({ status: 'online', uptime: process.uptime() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`   ✅ Health server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`   ❌ Express server error: ${err.message}`);
});

// ── Discord client ────────────────────────────────────────────────────────────
console.log('\n🔧 [3/5] Creating Discord client...');
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
console.log('   ✅ Discord client created');
console.log('   📋 Intents: Guilds, GuildMembers, GuildMessages, MessageContent, GuildMessageReactions');
console.log('   📋 Partials: Message, Channel, Reaction');

// ── Raw Discord gateway debug events ─────────────────────────────────────────
client.on('debug', (info) => {
  // Filter only the most useful debug lines to avoid spam
  if (
    info.includes('Connecting') ||
    info.includes('READY') ||
    info.includes('Session') ||
    info.includes('Heartbeat') ||
    info.includes('reconnect') ||
    info.includes('token') ||
    info.includes('401') ||
    info.includes('Invalid')
  ) {
    console.log(`   🔬 [DISCORD DEBUG] ${info}`);
  }
});

client.on('shardReady', (id) => {
  console.log(`   ✅ Shard ${id} is ready`);
});

client.on('shardDisconnect', (event, id) => {
  console.warn(`   ⚠️  Shard ${id} disconnected — code: ${event.code}, reason: ${event.reason}`);
});

client.on('shardError', (error, id) => {
  console.error(`   ❌ Shard ${id} error:`, error.message);
});

client.on('shardReconnecting', (id) => {
  console.log(`   🔄 Shard ${id} reconnecting...`);
});

client.on('invalidated', () => {
  console.error('   ❌ SESSION INVALIDATED — token is likely revoked or invalid!');
  console.error('   ➡️  Go to discord.com/developers → your app → Bot → Reset Token');
  process.exit(1);
});

client.on('error', (err) => {
  console.error(`   ❌ Client error: ${err.message}`);
});

client.on('warn', (msg) => {
  console.warn(`   ⚠️  Client warning: ${msg}`);
});

// ── Load handlers ─────────────────────────────────────────────────────────────
console.log('\n📂 [4/5] Loading handlers...');
try {
  require('./src/handlers/commandHandler')(client);
  console.log('   ✅ commandHandler loaded');
} catch (err) {
  console.error('   ❌ commandHandler failed:', err.message);
}
try {
  require('./src/handlers/eventHandler')(client);
  console.log('   ✅ eventHandler loaded');
} catch (err) {
  console.error('   ❌ eventHandler failed:', err.message);
}
try {
  require('./src/handlers/errorHandler')(client);
  console.log('   ✅ errorHandler loaded');
} catch (err) {
  console.error('   ❌ errorHandler failed:', err.message);
}

// ── Shutdown ──────────────────────────────────────────────────────────────────
process.on('SIGINT',  () => {
  console.log('\n🛑 SIGINT received — shutting down gracefully...');
  server.close();
  client.destroy();
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received — shutting down gracefully...');
  server.close();
  client.destroy();
  process.exit(0);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

// ── Login ─────────────────────────────────────────────────────────────────────
async function startBot() {
  console.log('\n🚀 [5/5] Attempting Discord login...');
  console.log('   ⏳ Sending token to Discord gateway...');

  const loginTimeout = setTimeout(() => {
    console.error('   ❌ LOGIN TIMEOUT — no response from Discord after 15 seconds!');
    console.error('   ➡️  This usually means:');
    console.error('       1. Your token is invalid/revoked — reset it in the Dev Portal');
    console.error('       2. Your host is blocking Discord WebSocket connections');
    console.error('       3. Discord gateway is down — check discordstatus.com');
    process.exit(1);
  }, 15000);

  try {
    await client.login(process.env.DISCORD_TOKEN.trim());
    clearTimeout(loginTimeout);
    console.log('   ✅ Login call succeeded — waiting for READY event...');
  } catch (err) {
    clearTimeout(loginTimeout);
    console.error(`\n❌ LOGIN FAILED`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Code:  ${err.code ?? 'N/A'}`);
    console.error(`   Status: ${err.status ?? 'N/A'}`);
    if (err.message?.includes('TOKEN_INVALID') || err.status === 401) {
      console.error('\n   ➡️  Your token is INVALID or REVOKED.');
      console.error('   ➡️  Go to: discord.com/developers → your app → Bot → Reset Token');
      console.error('   ➡️  Paste the new token into your environment variables and redeploy.');
    }
    process.exit(1);
  }
}

startBot();
