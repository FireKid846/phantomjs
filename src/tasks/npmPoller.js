const cron   = require('node-cron');
const { httpGet }       = require('../utils/http');
const { getNpmCache, setNpmCache } = require('../db/changelog');
const embeds = require('../utils/embeds');
const config = require('../../config.json');

function startNpmPoller(client) {
  cron.schedule('*/10 * * * *', async () => {
    for (const pkg of config.npm.packages) await checkPackage(client, pkg);
  });
  console.log('✅ npm poller started (every 10 min)');
}

async function checkPackage(client, pkg) {
  try {
    const { data, error } = await httpGet(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`);
    if (error || !data) return;

    const cached = await getNpmCache(pkg);
    if (!cached) { await setNpmCache(pkg, data.version); return; }
    if (cached.version === data.version) return;

    await setNpmCache(pkg, data.version);

    if (!config.channels.announcements) return;
    const channel = await client.channels.fetch(config.channels.announcements).catch(() => null);
    if (!channel?.isSendable()) return;

    const shortName = pkg.split('/')[1];
    await channel.send({
      embeds: [embeds.info(`${pkg} ${data.version} is live`,
        `A new version of **${pkg}** has been published to npm.\n\n` +
        `\`\`\`bash\nnpm install ${pkg}\n\`\`\`\n\n` +
        `**npm:** https://npmjs.com/package/${pkg}\n` +
        `**GitHub:** https://github.com/${config.github.owner}/${shortName}`)],
    });
    console.log(`✅ Announced ${pkg} ${data.version}`);
  } catch (err) { console.error(`❌ npm poller error (${pkg}):`, err.message); }
}

module.exports = { startNpmPoller };
