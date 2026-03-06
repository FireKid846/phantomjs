import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member')
  .addUserOption((opt) => opt.setName('member').setDescription('Member to kick').setRequired(true))
  .addStringOption((opt) => opt.setName('reason').setDescription('Reason').setRequired(false))

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const target = interaction.options.getUser('member', true)
  const reason = interaction.options.getString('reason') ?? 'No reason provided'
  const guildMember = await interaction.guild?.members.fetch(target.id).catch(() => null)

  if (!guildMember) {
    await interaction.reply({ embeds: [errorEmbed('Member not found in server.')], ephemeral: true })
    return
  }

  try {
    await guildMember.kick(reason)
    await interaction.reply({
      embeds: [successEmbed('Member Kicked', `**${target.username}** has been kicked.\n**Reason:** ${reason}`)],
    })
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not kick member. Check bot permissions.')], ephemeral: true })
  }
}
