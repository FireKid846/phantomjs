import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { db } from '../../db/client'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('suggest')
  .setDescription('Submit a feature suggestion')
  .addStringOption((opt) =>
    opt.setName('suggestion').setDescription('Your suggestion').setRequired(true).setMaxLength(500)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const content = interaction.options.getString('suggestion', true)
  const roadmapChannelId = config.channels.roadmap

  await db.execute({
    sql: `INSERT INTO suggestions (member_id, content, upvotes, timestamp) VALUES (?, ?, 0, ?)`,
    args: [interaction.user.id, content, new Date().toISOString()],
  })

  await interaction.reply({
    embeds: [successEmbed('Suggestion Submitted', content)],
    ephemeral: true,
  })

  if (roadmapChannelId) {
    try {
      const channel = await interaction.client.channels.fetch(roadmapChannelId)
      if (channel?.isTextBased()) {
        const msg = await channel.send({
          embeds: [
            successEmbed(
              `Suggestion from ${interaction.user.username}`,
              content
            ),
          ],
        })
        await msg.react('👍')
        await msg.react('👎')
      }
    } catch {
      // Channel fetch failed — suggestion still saved to DB
    }
  }
}
