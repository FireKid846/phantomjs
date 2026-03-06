import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('install')
  .setDescription('Get the install command for a package')
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
  .addStringOption((opt) =>
    opt
      .setName('manager')
      .setDescription('Package manager')
      .setRequired(false)
      .addChoices(
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun', value: 'bun' }
      )
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const pkg = interaction.options.getString('package', true)
  const manager = interaction.options.getString('manager') ?? 'npm'

  const commands: Record<string, string> = {
    npm: `npm install ${pkg}`,
    yarn: `yarn add ${pkg}`,
    pnpm: `pnpm add ${pkg}`,
    bun: `bun add ${pkg}`,
  }

  await interaction.reply({
    embeds: [
      infoEmbed(
        `Install ${pkg}`,
        `\`\`\`bash\n${commands[manager]}\n\`\`\``
      ),
    ],
  })
}
