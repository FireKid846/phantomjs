import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { httpGet } from '../../utils/http'

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('Show download stats for Firekid packages')

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const packages = ['@firekid/hurl', '@firekid/once']
  const lines: string[] = []

  for (const pkg of packages) {
    const encoded = encodeURIComponent(pkg)
    const { data: downloads } = await httpGet<{ downloads: number }>(
      `https://api.npmjs.org/downloads/point/last-week/${encoded}`
    )
    const { data: npmData } = await httpGet<{ version: string }>(
      `https://registry.npmjs.org/${encoded}/latest`
    )

    const dl = downloads?.downloads?.toLocaleString() ?? 'N/A'
    const ver = npmData?.version ?? 'N/A'
    lines.push(`**${pkg}** — v${ver} — ${dl} downloads this week`)
  }

  if (lines.length === 0) {
    await interaction.editReply({ embeds: [errorEmbed('Could not fetch stats right now.')] })
    return
  }

  await interaction.editReply({
    embeds: [infoEmbed('Firekid Packages — Stats', lines.join('\n'))],
  })
}
