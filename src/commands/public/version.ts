import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { httpGet } from '../../utils/http'

export const data = new SlashCommandBuilder()
  .setName('version')
  .setDescription('Show current version of a package')
  .addStringOption((opt) =>
    opt
      .setName('package')
      .setDescription('Package name')
      .setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: '@firekid/hurl' },
        { name: '@firekid/once', value: '@firekid/once' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const pkg = interaction.options.getString('package', true)
  const encoded = encodeURIComponent(pkg)

  const { data: npmData, error } = await httpGet<{ version: string }>(
    `https://registry.npmjs.org/${encoded}/latest`
  )

  if (error || !npmData) {
    await interaction.editReply({ embeds: [errorEmbed(`Could not fetch version for ${pkg}.`)] })
    return
  }

  await interaction.editReply({
    embeds: [infoEmbed(`${pkg}`, `Current version: **${npmData.version}**`)],
  })
}
