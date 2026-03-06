const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel so members cannot send messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      await interaction.reply({ embeds: [embeds.warning('Channel Locked', `#${interaction.channel.name} has been locked.`)] });
    } catch (err) {
      console.error('❌ Lock error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not lock channel.')], ephemeral: true });
    }
  },
};
