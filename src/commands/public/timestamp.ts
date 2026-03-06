import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('timestamp')
  .setDescription('Convert a Unix timestamp to a readable date or get the current timestamp')
  .addIntegerOption((opt) =>
    opt.setName('unix').setDescription('Unix timestamp in seconds (leave empty for now)').setRequired(false)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const unix = interaction.options.getInteger('unix')

  try {
    if (unix) {
      const date = new Date(unix * 1000)
      await interaction.reply({
        embeds: [
          infoEmbed(
            'Timestamp',
            [
              `**Unix:** ${unix}`,
              `**UTC:** ${date.toUTCString()}`,
              `**ISO:** ${date.toISOString()}`,
              `**Discord:** <t:${unix}:F>`,
            ].join('\n')
          ),
        ],
        ephemeral: true,
      })
    } else {
      const now = Math.floor(Date.now() / 1000)
      await interaction.reply({
        embeds: [
          infoEmbed(
            'Current Timestamp',
            [
              `**Unix:** ${now}`,
              `**UTC:** ${new Date().toUTCString()}`,
              `**Discord:** <t:${now}:F>`,
            ].join('\n')
          ),
        ],
        ephemeral: true,
      })
    }
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Invalid timestamp.')], ephemeral: true })
  }
}
