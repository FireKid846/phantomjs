import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock a channel')

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const channel = interaction.channel as TextChannel

  try {
    await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
      SendMessages: null,
    })
    await interaction.reply({ embeds: [successEmbed('Channel Unlocked', `${channel.name} is now unlocked.`)] })
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not unlock channel.')], ephemeral: true })
  }
}
