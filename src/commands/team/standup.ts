import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { isTeam } from '../../utils/permissions'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('standup')
  .setDescription('Post your daily standup')
  .addStringOption((opt) => opt.setName('did').setDescription('What did you do?').setRequired(true))
  .addStringOption((opt) => opt.setName('doing').setDescription('What are you doing today?').setRequired(true))
  .addStringOption((opt) => opt.setName('blocked').setDescription('Anything blocking you?').setRequired(false))

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isTeam(interaction.member as any)) {
    await interaction.reply({ embeds: [errorEmbed('Team only command.')], ephemeral: true })
    return
  }

  const did = interaction.options.getString('did', true)
  const doing = interaction.options.getString('doing', true)
  const blocked = interaction.options.getString('blocked') ?? 'Nothing'

  const embed = infoEmbed(
    `Standup — ${interaction.user.username}`,
    [
      `**Did:** ${did}`,
      `**Doing:** ${doing}`,
      `**Blocked:** ${blocked}`,
    ].join('\n')
  )

  await interaction.reply({ embeds: [embed], ephemeral: true })

  const teamChannelId = config.channels.team
  if (teamChannelId) {
    try {
      const channel = await interaction.client.channels.fetch(teamChannelId)
      if (channel?.isTextBased()) await channel.send({ embeds: [embed] })
    } catch {
      // Silent fail — team channel not configured yet
    }
  }
}
