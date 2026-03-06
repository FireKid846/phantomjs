import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'
import { httpGet } from '../../utils/http'

export const data = new SlashCommandBuilder()
  .setName('hurl')
  .setDescription('Info about @firekid/hurl')

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const { data: npmData } = await httpGet<{ version: string; description: string }>(
    'https://registry.npmjs.org/@firekid%2Fhurl/latest'
  )

  const version = npmData?.version ?? 'unknown'

  await interaction.editReply({
    embeds: [
      infoEmbed(
        '@firekid/hurl',
        [
          `**Version:** ${version}`,
          `**Description:** Zero-dependency HTTP client for Node.js and edge runtimes.`,
          '',
          '**Install:**',
          '```bash',
          'npm install @firekid/hurl',
          '```',
          '',
          `**npm:** https://npmjs.com/package/@firekid/hurl`,
          `**GitHub:** https://github.com/Firekid-is-him/hurl`,
        ].join('\n')
      ),
    ],
  })
}
