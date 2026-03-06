const cron = require('node-cron');
const { httpGet }                       = require('../utils/http');
const { getChangelogCache, setChangelogCache } = require('../db/changelog');
const { hashString, parseChangelogSection }    = require('../utils/format');
const embeds = require('../utils/embeds');
const config = require('../../config.json');

function startChangelogPoller(client) {
  cron.schedule('5,15,25,35,45,55 * * * *', async () => {
    for (const [repoName, repoConfig] of Object.entries(config.github.repos)) {
      await checkChangelog(client, repoName, repoConfig);
    }
  });
  console.log('✅ Changelog poller started (every 10 min, offset)');
}

async function checkChangelog(client, repoName, repoConfig) {
  try {
    const url = `https://raw.githubusercontent.com/${config.github.owner}/${repoName}/${repoConfig.branch}/${repoConfig.changelog}`;
    const { data: content, error } = await httpGet(url, { accept: 'text/plain' });
    if (error || !content) return;

    const hash   = hashString(content);
    const cached = await getChangelogCache(`@firekid/${repoName}`);

    if (!cached) {
      const m = content.match(/## (.+)/);
      await setChangelogCache(`@firekid/${repoName}`, hash, m?.[1]?.trim() ?? 'unknown');
      return;
    }
    if (cached.hash === hash) return;

    const section = parseChangelogSection(content);
    const m       = section.match(/## (.+)/);
    const version = m?.[1]?.trim() ?? 'latest';
    await setChangelogCache(`@firekid/${repoName}`, hash, version);

    if (!config.channels.announcements) return;
    const channel = await client.channels.fetch(config.channels.announcements).catch(() => null);
    if (!channel?.isSendable()) return;

    await channel.send({
      embeds: [embeds.info(`@firekid/${repoName} — Changelog Updated`, `\`\`\`md\n${section.slice(0, 1800)}\n\`\`\``)],
    });
    console.log(`✅ Changelog announced for @firekid/${repoName}`);
  } catch (err) { console.error(`❌ Changelog poller error (${repoName}):`, err.message); }
}

module.exports = { startChangelogPoller };
