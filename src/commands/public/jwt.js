const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jwt')
    .setDescription('Decode a JWT token (does not verify signature)')
    .addStringOption(opt => opt.setName('token').setDescription('JWT token').setRequired(true)),

  async execute(interaction) {
    const token = interaction.options.getString('token', true);
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Not a JWT');
      const header  = JSON.parse(Buffer.from(parts[0], 'base64').toString());
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const formatted = JSON.stringify({ header, payload }, null, 2);
      await interaction.reply({
        embeds: [embeds.info('JWT Decoded', `\`\`\`json\n${formatted.slice(0, 1900)}\n\`\`\`\n⚠️ *Signature not verified.*`)],
        ephemeral: true,
      });
    } catch {
      await interaction.reply({ embeds: [embeds.error('Invalid JWT token.')], ephemeral: true });
    }
  },
};
