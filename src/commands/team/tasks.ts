import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { isTeam } from '../../utils/permissions'
import { getTasks } from '../../db/tasks'

const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
}

export const data = new SlashCommandBuilder()
  .setName('tasks')
  .setDescription('List all tasks')
  .addStringOption((opt) =>
    opt
      .setName('status')
      .setDescription('Filter by status')
      .setRequired(false)
      .addChoices(
        { name: 'open', value: 'open' },
        { name: 'done', value: 'done' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isTeam(interaction.member as any)) {
    await interaction.reply({ embeds: [errorEmbed('Team only command.')], ephemeral: true })
    return
  }

  const status = interaction.options.getString('status') ?? undefined
  const tasks = await getTasks(status)

  if (tasks.length === 0) {
    await interaction.reply({ embeds: [infoEmbed('Tasks', 'No tasks found.')], ephemeral: true })
    return
  }

  const lines = tasks.slice(0, 20).map((t) => {
    const emoji = PRIORITY_EMOJI[t.priority as string] ?? '⚪'
    const assignee = t.assignee_id ? `<@${t.assignee_id}>` : 'Unassigned'
    return `**#${t.id}** ${emoji} ${t.title} — ${assignee} [${t.status}]`
  })

  await interaction.reply({
    embeds: [infoEmbed(`Tasks (${tasks.length})`, lines.join('\n'))],
    ephemeral: true,
  })
}
