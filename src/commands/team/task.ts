import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isTeam } from '../../utils/permissions'
import { createTask } from '../../db/tasks'

export const data = new SlashCommandBuilder()
  .setName('task')
  .setDescription('Create a new task')
  .addStringOption((opt) => opt.setName('title').setDescription('Task title').setRequired(true))
  .addStringOption((opt) => opt.setName('description').setDescription('Task description').setRequired(false))
  .addUserOption((opt) => opt.setName('assignee').setDescription('Assign to a member').setRequired(false))
  .addStringOption((opt) =>
    opt
      .setName('priority')
      .setDescription('Priority level')
      .setRequired(false)
      .addChoices(
        { name: 'low', value: 'low' },
        { name: 'medium', value: 'medium' },
        { name: 'high', value: 'high' },
        { name: 'critical', value: 'critical' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isTeam(interaction.member as any)) {
    await interaction.reply({ embeds: [errorEmbed('Team only command.')], ephemeral: true })
    return
  }

  const title = interaction.options.getString('title', true)
  const description = interaction.options.getString('description') ?? undefined
  const assignee = interaction.options.getUser('assignee')
  const priority = interaction.options.getString('priority') ?? 'medium'

  await createTask({ title, description, assignee_id: assignee?.id, priority })

  await interaction.reply({
    embeds: [
      successEmbed(
        'Task Created',
        [
          `**Title:** ${title}`,
          description ? `**Description:** ${description}` : '',
          `**Assignee:** ${assignee ? `<@${assignee.id}>` : 'Unassigned'}`,
          `**Priority:** ${priority}`,
        ].filter(Boolean).join('\n')
      ),
    ],
  })
}
