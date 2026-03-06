import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('jwt')
  .setDescription('Decode a JWT token and show the payload')
  .addStringOption((opt) =>
    opt.setName('token').setDescription('JWT token').setRequired(true)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const token = interaction.options.getString('token', true)

  try {
    const parts = token.split('.')
    if (parts.length !== 3) throw new Error('Invalid JWT format')

    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'))
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))

    const formatted = JSON.stringify({ header, payload }, null, 2)

    await interaction.reply({
      embeds: [
        infoEmbed(
          'JWT Decoded',
          `\`\`\`json\n${formatted.slice(0, 1900)}\n\`\`\`\n\n*Signature not verified — never paste sensitive tokens in public channels.*`
        ),
      ],
      ephemeral: true,
    })
  } catch {
    await interaction.reply({
      embeds: [errorEmbed('Invalid JWT token.')],
      ephemeral: true,
    })
  }
}
