import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'
import { httpGet } from '../../utils/http'

export const data = new SlashCommandBuilder()
  .setName('once')
  .setDescription('Info about @firekid/once')

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const { data: npmData } = await httpGet<{ version: string }>(
    'https://registry.npmjs.org/@firekid%2Fonce/latest'
  )

  const version = npmData?.version ?? 'unknown'

  await interaction.editReply({
    embeds: [
      infoEmbed(
        '@firekid/once',
        [
          `**Version:** ${version}`,
          `**Description:** Deduplicate async function calls. The modern, memory-safe replacement for inflight.`,
          '',
          '**Install:**',
          '```bash',
          'npm install @firekid/once',
          '```',
          '',
          `**npm:** https://npmjs.com/package/@firekid/once`,
          `**GitHub:** https://github.com/Firekid-is-him/once`,
        ].join('\n')
      ),
    ],
  })
}
