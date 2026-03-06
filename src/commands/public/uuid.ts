import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'
import { randomUUID } from 'crypto'

export const data = new SlashCommandBuilder()
  .setName('uuid')
  .setDescription('Generate a UUID')

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = randomUUID()
  await interaction.reply({
    embeds: [infoEmbed('UUID Generated', `\`${id}\``)],
    ephemeral: true,
  })
}
