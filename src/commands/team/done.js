const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isTeam } = require('../../utils/permissions');
const { updateTask } = require('../../db/tasks');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('done')
    .setDescription('Mark a task as done (team only)')
    .addIntegerOption(opt => opt.setName('id').setDescription('Task ID').setRequired(true)),

  async execute(interaction) {
    if (!isTeam(interaction.member)) {
      await interaction.reply({ embeds: [embeds.error('Team only.')], ephemeral: true });
      return;
    }
    const id = interaction.options.getInteger('id', true);
    try {
      await updateTask(id, { status: 'done' });
      await interaction.reply({ embeds: [embeds.success('Task Done', `Task **#${id}** marked as done.`)] });
    } catch (err) {
      console.error('❌ Done error:', err);
      await interaction.reply({ embeds: [embeds.error(`Could not update task #${id}.`)], ephemeral: true });
    }
  },
};
