import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('base64')
  .setDescription('Encode or decode a base64 string')
  .addStringOption((opt) =>
    opt
      .setName('action')
      .setDescription('Encode or decode')
      .setRequired(true)
      .addChoices(
        { name: 'encode', value: 'encode' },
        { name: 'decode', value: 'decode' }
      )
  )
  .addStringOption((opt) =>
    opt.setName('input').setDescription('Input string').setRequired(true)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const action = interaction.options.getString('action', true)
  const input = interaction.options.getString('input', true)

  try {
    const result =
      action === 'encode'
        ? Buffer.from(input).toString('base64')
        : Buffer.from(input, 'base64').toString('utf-8')

    await interaction.reply({
      embeds: [infoEmbed(`Base64 ${action}`, `\`\`\`\n${result}\n\`\`\``)],
      ephemeral: true,
    })
  } catch {
    await interaction.reply({
      embeds: [errorEmbed('Failed to process input.')],
      ephemeral: true,
    })
  }
}
