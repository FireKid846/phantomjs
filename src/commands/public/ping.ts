import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if Phantom is online')

export async function execute(interaction: ChatInputCommandInteraction) {
  const latency = Date.now() - interaction.createdTimestamp
  await interaction.reply({
    embeds: [infoEmbed('Phantom is online', `Latency: **${latency}ms**`)],
    ephemeral: true,
  })
}
