const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Convert a Unix timestamp or get the current one')
    .addIntegerOption(opt => opt.setName('unix').setDescription('Unix timestamp in seconds (leave empty for now)')),

  async execute(interaction) {
    const unix = interaction.options.getInteger('unix');
    try {
      if (unix) {
        const d = new Date(unix * 1000);
        await interaction.reply({
          embeds: [embeds.info('Timestamp', `**Unix:** ${unix}\n**UTC:** ${d.toUTCString()}\n**Discord:** <t:${unix}:F>`)],
          ephemeral: true,
        });
      } else {
        const now = Math.floor(Date.now() / 1000);
        await interaction.reply({
          embeds: [embeds.info('Current Timestamp', `**Unix:** ${now}\n**UTC:** ${new Date().toUTCString()}\n**Discord:** <t:${now}:F>`)],
          ephemeral: true,
        });
      }
    } catch {
      await interaction.reply({ embeds: [embeds.error('Invalid timestamp.')], ephemeral: true });
    }
  },
};
