const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
      await interaction.reply({ embeds: [embeds.success('Channel Unlocked', `#${interaction.channel.name} is now unlocked.`)] });
    } catch (err) {
      console.error('❌ Unlock error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not unlock channel.')], ephemeral: true });
    }
  },
};
