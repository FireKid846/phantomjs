import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member')
  .addUserOption((opt) => opt.setName('member').setDescription('Member to ban').setRequired(true))
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
    await guildMember.ban({ reason })
    await interaction.reply({
      embeds: [successEmbed('Member Banned', `**${target.username}** has been banned.\n**Reason:** ${reason}`)],
    })
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not ban member. Check bot permissions.')], ephemeral: true })
  }
}
