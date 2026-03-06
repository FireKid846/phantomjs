const { SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('crypto');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uuid')
    .setDescription('Generate a random UUID v4'),

  async execute(interaction) {
    await interaction.reply({ embeds: [embeds.info('UUID Generated', `\`${randomUUID()}\``)], ephemeral: true });
  },
};
