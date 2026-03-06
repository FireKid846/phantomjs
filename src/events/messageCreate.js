const config = require('../../config.json');
const embeds = require('../utils/embeds');
const { upsertMember, incrementMessages } = require('../db/members');
const { addWarning } = require('../db/warnings');

const URL_REGEX = /(https?:\/\/[^\s]+|discord\.gg\/[^\s]+)/gi;

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || message.system || !message.guild) return;

    // Track member
    try {
      await upsertMember(message.author.id, message.author.username);
      await incrementMessages(message.author.id);
    } catch {}

    // Antilink
    if (config.antilink.enabled) await handleAntilink(message);
  },
};

async function handleAntilink(message) {
  const channelName = message.channel.name ?? '';
  if (config.antilink.exempt_channels.includes(channelName)) return;

  URL_REGEX.lastIndex = 0;
  if (!URL_REGEX.test(message.content)) return;

  // Check if all links are whitelisted
  URL_REGEX.lastIndex = 0;
  const links = message.content.match(URL_REGEX) ?? [];
  const allWhitelisted = links.every(url =>
    config.antilink.whitelist_domains.some(domain => url.includes(domain))
  );
  if (allWhitelisted) return;

  // Owner bypass
  if (message.author.id === process.env.OWNER_ID) return;

  // Delete
  try { await message.delete(); } catch { return; }

  // Warn
  let total = 0;
  try {
    await upsertMember(message.author.id, message.author.username);
    total = await addWarning(message.author.id, 'Posted a link (antilink)');
  } catch (err) { console.error('❌ Antilink warning error:', err); }

  // Temp warning message
  try {
    const warn = await message.channel.send({
      embeds: [embeds.warning('Link Removed',
        `<@${message.author.id}>, links are not allowed in this channel.\n**Warning ${total}/${config.antilink.warn_limit_ban}**`)],
    });
    setTimeout(() => warn.delete().catch(() => {}), 5000);
  } catch {}

  // Escalation
  const member = await message.guild?.members.fetch(message.author.id).catch(() => null);
  if (!member) return;

  if (total >= config.antilink.warn_limit_kick && total < config.antilink.warn_limit_ban) {
    await member.kick(`Antilink: ${total} warnings`).catch(() => {});
    return;
  }
  if (total >= config.antilink.warn_limit_ban) {
    await member.ban({ reason: `Antilink: ${total} warnings` }).catch(() => {});
  }
}
