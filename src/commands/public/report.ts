import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { warningEmbed, successEmbed } from '../../utils/embeds'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('report')
  .setDescription('Report a bug formally')
  .addStringOption((opt) =>
    opt.setName('package').setDescription('Which package').setRequired(true)
    .addChoices(
      { name: '@firekid/hurl', value: '@firekid/hurl' },
      { name: '@firekid/once', value: '@firekid/once' }
    )
  )
  .addStringOption((opt) =>
    opt.setName('description').setDescription('Describe the bug').setRequired(true).setMaxLength(800)
  )
  .addStringOption((opt) =>
    opt.setName('version').setDescription('Package version e.g. 1.0.4').setRequired(false)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const pkg = interaction.options.getString('package', true)
  const description = interaction.options.getString('description', true)
  const version = interaction.options.getString('version') ?? 'not specified'
  const bugChannelId = config.channels['bug-reports']

  await interaction.reply({
    embeds: [successEmbed('Bug Reported', 'Your report has been submitted. Thank you.')],
    ephemeral: true,
  })

  if (bugChannelId) {
    try {
      const channel = await interaction.client.channels.fetch(bugChannelId)
      if (channel?.isTextBased()) {
        await channel.send({
          embeds: [
            warningEmbed(
              `Bug Report — ${pkg}`,
              [
                `**Package:** ${pkg}`,
                `**Version:** ${version}`,
                `**Reported by:** ${interaction.user.username}`,
                `**Description:**\n${description}`,
              ].join('\n')
            ),
          ],
        })
      }
    } catch {
      // Channel fetch failed — user already got confirmation
    }
  }
}
