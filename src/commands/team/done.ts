import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isTeam } from '../../utils/permissions'
import { updateTask } from '../../db/tasks'

export const data = new SlashCommandBuilder()
  .setName('done')
  .setDescription('Mark a task as completed')
  .addIntegerOption((opt) => opt.setName('id').setDescription('Task ID').setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isTeam(interaction.member as any)) {
    await interaction.reply({ embeds: [errorEmbed('Team only command.')], ephemeral: true })
    return
  }

  const id = interaction.options.getInteger('id', true)
  await updateTask(id, { status: 'done' })

  await interaction.reply({
    embeds: [successEmbed('Task Completed', `Task **#${id}** marked as done.`)],
  })
}
