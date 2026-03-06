const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) { await interaction.reply({ embeds: [embeds.error('Member not found.')], ephemeral: true }); return; }
    try {
      await member.kick(reason);
      await interaction.reply({ embeds: [embeds.success('Kicked', `**${target.username}** was kicked.\n**Reason:** ${reason}`)] });
    } catch (err) {
      console.error('❌ Kick error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not kick member.')], ephemeral: true });
    }
  },
};
