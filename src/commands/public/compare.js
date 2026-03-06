const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compare')
    .setDescription('Compare @firekid/hurl vs other HTTP libraries'),

  async execute(interaction) {
    await interaction.reply({
      embeds: [embeds.info('hurl vs alternatives',
        '**axios** — 35KB, no edge runtime, no built-in retry\n' +
        '**got** — ESM-only since v12, breaks CJS projects\n' +
        '**ky** — browser only, no Node.js support\n' +
        '**node-fetch** — no retry, no auth, no interceptors\n' +
        '**request** — deprecated 2020, callback-based\n\n' +
        '**@firekid/hurl** ✅ — native fetch, works everywhere\n' +
        'Retry, auth, deduplication, interceptors. Zero dependencies.\n\n' +
        '```bash\nnpm install @firekid/hurl\n```')],
    });
  },
};
