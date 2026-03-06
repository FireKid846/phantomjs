const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isTeam } = require('../../utils/permissions');
const { createTask } = require('../../db/tasks');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('task')
    .setDescription('Create a new team task (team only)')
    .addStringOption(opt => opt.setName('title').setDescription('Task title').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Task description'))
    .addUserOption(opt => opt.setName('assignee').setDescription('Assign to a team member'))
    .addStringOption(opt => opt.setName('priority').setDescription('Priority level')
      .addChoices(
        { name: 'low',      value: 'low'      },
        { name: 'medium',   value: 'medium'   },
        { name: 'high',     value: 'high'     },
        { name: 'critical', value: 'critical' }
      )),

  async execute(interaction) {
    if (!isTeam(interaction.member)) {
      await interaction.reply({ embeds: [embeds.error('Team only.')], ephemeral: true });
      return;
    }
    const title    = interaction.options.getString('title', true);
    const desc     = interaction.options.getString('description');
    const assignee = interaction.options.getUser('assignee');
    const priority = interaction.options.getString('priority') ?? 'medium';

    await createTask({ title, description: desc ?? undefined, assignee_id: assignee?.id, priority });

    await interaction.reply({
      embeds: [embeds.success('Task Created',
        `**Title:** ${title}${desc ? `\n**Description:** ${desc}` : ''}\n` +
        `**Assignee:** ${assignee ? `<@${assignee.id}>` : 'Unassigned'}\n**Priority:** ${priority}`)],
    });
  },
};
