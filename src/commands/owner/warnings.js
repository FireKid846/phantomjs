const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');
const { getWarnings, clearWarnings } = require('../../db/warnings');
const { upsertMember } = require('../../db/members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View or clear warnings for a member')
    .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
    .addBooleanOption(opt => opt.setName('clear').setDescription('Clear all their warnings')),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user', true);
    await upsertMember(target.id, target.username);

    if (interaction.options.getBoolean('clear')) {
      await clearWarnings(target.id);
      await interaction.reply({ embeds: [embeds.success('Warnings Cleared', `All warnings cleared for **${target.username}**.`)], ephemeral: true });
      return;
    }

    const warnings = await getWarnings(target.id);
    if (!warnings.length) {
      await interaction.reply({ embeds: [embeds.info('No Warnings', `**${target.username}** has no warnings.`)], ephemeral: true });
      return;
    }
    const list = warnings.map((w, i) => `**${i + 1}.** ${w.reason} — ${new Date(w.timestamp).toDateString()}`).join('\n');
    await interaction.reply({ embeds: [embeds.warning(`Warnings for ${target.username}`, list)], ephemeral: true });
  },
};
