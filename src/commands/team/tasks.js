const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isTeam } = require('../../utils/permissions');
const { getTasks } = require('../../db/tasks');

const PRIORITY_EMOJI = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tasks')
    .setDescription('List team tasks (team only)')
    .addStringOption(opt => opt.setName('status').setDescription('Filter by status')
      .addChoices({ name: 'open', value: 'open' }, { name: 'done', value: 'done' })),

  async execute(interaction) {
    if (!isTeam(interaction.member)) {
      await interaction.reply({ embeds: [embeds.error('Team only.')], ephemeral: true });
      return;
    }
    const status = interaction.options.getString('status') ?? undefined;
    const tasks  = await getTasks(status);

    if (!tasks.length) {
      await interaction.reply({ embeds: [embeds.info('Tasks', 'No tasks found.')], ephemeral: true });
      return;
    }

    const list = tasks.slice(0, 20).map(t =>
      `${PRIORITY_EMOJI[t.priority] ?? '⚪'} **#${t.id}** ${t.title} — ${t.assignee_id ? `<@${t.assignee_id}>` : 'Unassigned'} [${t.status}]`
    ).join('\n');

    await interaction.reply({ embeds: [embeds.info(`Tasks (${tasks.length})`, list)], ephemeral: true });
  },
};
