import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { httpGet } from '../../utils/http'
import { parseChangelogSection } from '../../utils/format'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('changelog')
  .setDescription('Show latest changelog for a package')
  .addStringOption((opt) =>
    opt
      .setName('package')
      .setDescription('Package name')
      .setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: 'hurl' },
        { name: '@firekid/once', value: 'once' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const pkg = interaction.options.getString('package', true) as 'hurl' | 'once'
  const repoConfig = config.github.repos[pkg]

  const url = `https://raw.githubusercontent.com/${config.github.owner}/${pkg}/${repoConfig.branch}/${repoConfig.changelog}`

  const { data: content, error } = await httpGet<string>(url)

  if (error || !content) {
    await interaction.editReply({
      embeds: [errorEmbed(`Could not fetch changelog for @firekid/${pkg}. Try again later.`)],
    })
    return
  }

  const section = parseChangelogSection(content)

  await interaction.editReply({
    embeds: [infoEmbed(`@firekid/${pkg} — Latest Changelog`, `\`\`\`md\n${section}\n\`\`\``)],
  })
}
