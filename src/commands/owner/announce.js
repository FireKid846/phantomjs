const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post an announcement to the announcements channel')
    .addStringOption(opt => opt.setName('message').setDescription('Announcement body').setRequired(true).setMaxLength(1500))
    .addStringOption(opt => opt.setName('title').setDescription('Announcement title')),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('Only the owner can post announcements.')], ephemeral: true });
      return;
    }
    const message = interaction.options.getString('message', true);
    const title   = interaction.options.getString('title') ?? 'Announcement';

    if (!config.channels.announcements) {
      await interaction.reply({ embeds: [embeds.error('Announcements channel not configured in config.json.')], ephemeral: true });
      return;
    }

    try {
      const ch = await interaction.client.channels.fetch(config.channels.announcements);
      if (!ch?.isSendable()) throw new Error('Channel not sendable');
      await ch.send({ embeds: [embeds.info(title, message)] });
      await interaction.reply({ embeds: [embeds.success('Announced', 'Message posted to announcements.')], ephemeral: true });
    } catch (err) {
      console.error('❌ Announce error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not post announcement.')], ephemeral: true });
    }
  },
};
