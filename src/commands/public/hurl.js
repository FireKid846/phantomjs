const { SlashCommandBuilder } = require('discord.js');
const embeds    = require('../../utils/embeds');
const { httpGet } = require('../../utils/http');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hurl')
    .setDescription('Info and latest version of @firekid/hurl'),

  async execute(interaction) {
    await interaction.deferReply();
    const { data, error } = await httpGet('https://registry.npmjs.org/@firekid%2Fhurl/latest');
    await interaction.editReply({
      embeds: [embeds.info('@firekid/hurl',
        `**Version:** ${error || !data ? 'unknown' : data.version}\n` +
        `**Description:** Zero-dependency HTTP client for Node.js and edge runtimes.\n\n` +
        `\`\`\`bash\nnpm install @firekid/hurl\n\`\`\`\n\n` +
        `**npm:** https://npmjs.com/package/@firekid/hurl\n` +
        `**GitHub:** https://github.com/Firekid-is-him/hurl`)],
    });
  },
};
