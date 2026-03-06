import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, PermissionsBitField } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Lock a channel so only staff can send messages')

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const channel = interaction.channel as TextChannel

  try {
    await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, {
      SendMessages: false,
    })
    await interaction.reply({ embeds: [successEmbed('Channel Locked', `${channel.name} is now locked.`)] })
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not lock channel.')], ephemeral: true })
  }
}
