import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare @firekid/hurl vs axios')

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    embeds: [
      infoEmbed(
        'hurl vs axios',
        [
          '**axios** — 35KB, no edge runtime, no built-in retry, no dedup',
          '**got** — ESM only since v12, breaks CommonJS projects',
          '**ky** — browser only, no Node.js support',
          '**node-fetch** — no retry, no interceptors, no auth',
          '**request** — deprecated since 2020, callback-based',
          '',
          '**@firekid/hurl** — built on native fetch, works everywhere',
          'Retry, auth, interceptors, progress, caching, dedup — all built in',
          'Zero dependencies. Full TypeScript.',
          '',
          '```bash',
          'npm install @firekid/hurl',
          '```',
        ].join('\n')
      ),
    ],
  })
}
