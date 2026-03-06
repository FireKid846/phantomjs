const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');
const { addWarning } = require('../../db/warnings');
const { upsertMember } = require('../../db/members');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    if (target.id === interaction.user.id) { await interaction.reply({ embeds: [embeds.error('You cannot warn yourself.')], ephemeral: true }); return; }
    if (target.bot) { await interaction.reply({ embeds: [embeds.error('You cannot warn bots.')], ephemeral: true }); return; }

    await upsertMember(target.id, target.username);
    const total = await addWarning(target.id, reason);

    await interaction.reply({
      embeds: [embeds.warning('Member Warned',
        `**User:** ${target.username} (<@${target.id}>)\n**Reason:** ${reason}\n**Total warnings:** ${total}`)],
    });

    // Escalation
    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) return;
    if (total >= config.antilink.warn_limit_kick && total < config.antilink.warn_limit_ban) {
      await member.kick(`${total} warnings — latest: ${reason}`).catch(() => {});
      await interaction.followUp({ embeds: [embeds.warning('Auto-Kicked', `${target.username} has reached ${total} warnings.`)] });
    } else if (total >= config.antilink.warn_limit_ban) {
      await member.ban({ reason: `${total} warnings — latest: ${reason}` }).catch(() => {});
      await interaction.followUp({ embeds: [embeds.warning('Auto-Banned', `${target.username} has reached ${total} warnings.`)] });
    }
  },
};
