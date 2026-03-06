const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [embeds.error('You cannot ban yourself.')], ephemeral: true });
      return;
    }
    try {
      await interaction.guild.members.ban(target.id, { reason: `${reason} | By: ${interaction.user.tag}`, deleteMessageDays: 1 });
      await interaction.reply({ embeds: [embeds.success('Banned', `**${target.tag}** has been banned.\n**Reason:** ${reason}`)] });
    } catch (err) {
      console.error('❌ Ban error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not ban user — they may have higher permissions.')], ephemeral: true });
    }
  },
};
