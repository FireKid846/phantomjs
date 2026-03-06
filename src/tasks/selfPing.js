const cron = require('node-cron');
const { httpGet } = require('../utils/http');

function startSelfPing() {
  const url = process.env.RENDER_URL;
  if (!url) { console.warn('⚠️  RENDER_URL not set — self-ping disabled'); return; }

  cron.schedule('*/10 * * * *', async () => {
    const { error } = await httpGet(url);
    if (error) console.warn(`⚠️  Self-ping failed: ${error}`);
  });

  console.log(`✅ Self-ping started → ${url}`);
}

module.exports = { startSelfPing };
