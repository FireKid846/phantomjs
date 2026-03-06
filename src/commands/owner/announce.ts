import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Post an announcement')
  .addStringOption((opt) =>
    opt.setName('message').setDescription('Announcement message').setRequired(true).setMaxLength(1500)
  )
  .addStringOption((opt) =>
    opt.setName('title').setDescription('Announcement title').setRequired(false)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const message = interaction.options.getString('message', true)
  const title = interaction.options.getString('title') ?? 'Announcement'
  const channelId = config.channels.announcements

  if (!channelId) {
    await interaction.reply({ embeds: [errorEmbed('Announcements channel not configured in config.json.')], ephemeral: true })
    return
  }

  try {
    const channel = await interaction.client.channels.fetch(channelId)
    if (!channel?.isTextBased()) throw new Error('Not a text channel')

    await channel.send({ embeds: [infoEmbed(title, message)] })
    await interaction.reply({ embeds: [infoEmbed('Announced', 'Message posted in announcements.')], ephemeral: true })
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not post announcement.')], ephemeral: true })
  }
}
