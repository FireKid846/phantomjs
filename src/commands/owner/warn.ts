import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { warningEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'
import { addWarning } from '../../db/warnings'
import { upsertMember } from '../../db/members'
import config from '../../../config.json'

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Warn a member')
  .addUserOption((opt) => opt.setName('member').setDescription('Member to warn').setRequired(true))
  .addStringOption((opt) => opt.setName('reason').setDescription('Reason').setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const target = interaction.options.getUser('member', true)
  const reason = interaction.options.getString('reason', true)
  const guildMember = await interaction.guild?.members.fetch(target.id).catch(() => null)

  if (!guildMember) {
    await interaction.reply({ embeds: [errorEmbed('Member not found.')], ephemeral: true })
    return
  }

  await upsertMember(target.id, target.username)
  const totalWarnings = await addWarning(target.id, reason)

  await interaction.reply({
    embeds: [
      warningEmbed(
        'Member Warned',
        `**${target.username}** has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${totalWarnings}`
      ),
    ],
  })

  // Auto kick at warn_limit_kick
  if (totalWarnings >= config.antilink.warn_limit_kick && totalWarnings < config.antilink.warn_limit_ban) {
    try {
      await guildMember.kick(`Reached ${totalWarnings} warnings`)
      await interaction.followUp({ embeds: [warningEmbed('Auto Kicked', `${target.username} reached ${totalWarnings} warnings and was kicked.`)] })
    } catch {
      await interaction.followUp({ content: 'Could not kick member — check bot permissions.', ephemeral: true })
    }
  }

  // Auto ban at warn_limit_ban
  if (totalWarnings >= config.antilink.warn_limit_ban) {
    try {
      await guildMember.ban({ reason: `Reached ${totalWarnings} warnings` })
      await interaction.followUp({ embeds: [warningEmbed('Auto Banned', `${target.username} reached ${totalWarnings} warnings and was banned.`)] })
    } catch {
      await interaction.followUp({ content: 'Could not ban member — check bot permissions.', ephemeral: true })
    }
  }
}
