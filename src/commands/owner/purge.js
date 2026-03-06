const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages in this channel')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1–100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({ embeds: [embeds.success('Purged', `Deleted **${deleted.size}** messages.`)], ephemeral: true });
    } catch (err) {
      console.error('❌ Purge error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not delete messages. Messages older than 14 days cannot be bulk-deleted.')], ephemeral: true });
    }
  },
};
