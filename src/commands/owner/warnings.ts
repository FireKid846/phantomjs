import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'
import { getWarnings, clearWarnings } from '../../db/warnings'
import { upsertMember } from '../../db/members'

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('View or clear warnings for a member')
  .addUserOption((opt) => opt.setName('member').setDescription('Member').setRequired(true))
  .addBooleanOption((opt) => opt.setName('clear').setDescription('Clear all warnings').setRequired(false))

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const target = interaction.options.getUser('member', true)
  const shouldClear = interaction.options.getBoolean('clear') ?? false

  await upsertMember(target.id, target.username)

  if (shouldClear) {
    await clearWarnings(target.id)
    await interaction.reply({
      embeds: [infoEmbed('Warnings Cleared', `All warnings cleared for **${target.username}**.`)],
      ephemeral: true,
    })
    return
  }

  const warnings = await getWarnings(target.id)

  if (warnings.length === 0) {
    await interaction.reply({
      embeds: [infoEmbed('No Warnings', `**${target.username}** has no warnings.`)],
      ephemeral: true,
    })
    return
  }

  const lines = warnings.map((w, i) => `**${i + 1}.** ${w.reason} — ${new Date(w.timestamp as string).toDateString()}`)

  await interaction.reply({
    embeds: [infoEmbed(`Warnings for ${target.username}`, lines.join('\n'))],
    ephemeral: true,
  })
}
