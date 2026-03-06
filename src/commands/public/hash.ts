import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'
import { createHash } from 'crypto'

export const data = new SlashCommandBuilder()
  .setName('hash')
  .setDescription('Generate a hash from a string')
  .addStringOption((opt) =>
    opt.setName('input').setDescription('Input string').setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('algorithm')
      .setDescription('Hash algorithm')
      .setRequired(false)
      .addChoices(
        { name: 'sha256', value: 'sha256' },
        { name: 'sha512', value: 'sha512' },
        { name: 'md5', value: 'md5' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString('input', true)
  const algorithm = interaction.options.getString('algorithm') ?? 'sha256'

  const hash = createHash(algorithm).update(input).digest('hex')

  await interaction.reply({
    embeds: [infoEmbed(`${algorithm.toUpperCase()} Hash`, `\`\`\`\n${hash}\n\`\`\``)],
    ephemeral: true,
  })
}
