const { SlashCommandBuilder } = require('discord.js');
const embeds    = require('../../utils/embeds');
const { httpGet } = require('../../utils/http');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Show weekly download stats for all Firekid packages'),

  async execute(interaction) {
    await interaction.deferReply();
    const packages = ['@firekid/hurl', '@firekid/once'];
    const lines = [];
    for (const pkg of packages) {
      const enc = encodeURIComponent(pkg);
      const { data: dl }  = await httpGet(`https://api.npmjs.org/downloads/point/last-week/${enc}`);
      const { data: npm } = await httpGet(`https://registry.npmjs.org/${enc}/latest`);
      lines.push(`**${pkg}** — v${npm?.version ?? 'N/A'} — ${dl?.downloads?.toLocaleString() ?? 'N/A'} downloads this week`);
    }
    await interaction.editReply({ embeds: [embeds.info('Firekid Packages — Stats', lines.join('\n'))] });
  },
};
