const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('base64')
    .setDescription('Encode or decode a Base64 string')
    .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
      .addChoices({ name: 'encode', value: 'encode' }, { name: 'decode', value: 'decode' }))
    .addStringOption(opt => opt.setName('input').setDescription('Input string').setRequired(true)),

  async execute(interaction) {
    const action = interaction.options.getString('action', true);
    const input  = interaction.options.getString('input', true);
    try {
      const result = action === 'encode'
        ? Buffer.from(input).toString('base64')
        : Buffer.from(input, 'base64').toString('utf-8');
      await interaction.reply({ embeds: [embeds.info(`Base64 ${action}`, `\`\`\`\n${result}\n\`\`\``)], ephemeral: true });
    } catch {
      await interaction.reply({ embeds: [embeds.error('Failed to process input.')], ephemeral: true });
    }
  },
};
