const { SlashCommandBuilder } = require('discord.js');
const embeds    = require('../../utils/embeds');
const { httpGet } = require('../../utils/http');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('once')
    .setDescription('Info and latest version of @firekid/once'),

  async execute(interaction) {
    await interaction.deferReply();
    const { data, error } = await httpGet('https://registry.npmjs.org/@firekid%2Fonce/latest');
    await interaction.editReply({
      embeds: [embeds.info('@firekid/once',
        `**Version:** ${error || !data ? 'unknown' : data.version}\n` +
        `**Description:** Deduplicate async function calls — the modern replacement for inflight.\n\n` +
        `\`\`\`bash\nnpm install @firekid/once\n\`\`\`\n\n` +
        `**npm:** https://npmjs.com/package/@firekid/once\n` +
        `**GitHub:** https://github.com/Firekid-is-him/once`)],
    });
  },
};
