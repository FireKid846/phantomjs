import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Delete bulk messages in a channel')
  .addIntegerOption((opt) =>
    opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const amount = interaction.options.getInteger('amount', true)
  const channel = interaction.channel as TextChannel

  try {
    const deleted = await channel.bulkDelete(amount, true)
    await interaction.reply({
      embeds: [successEmbed('Messages Purged', `Deleted **${deleted.size}** messages.`)],
      ephemeral: true,
    })
  } catch {
    await interaction.reply({
      embeds: [errorEmbed('Could not delete messages. Messages older than 14 days cannot be bulk deleted.')],
      ephemeral: true,
    })
  }
}
