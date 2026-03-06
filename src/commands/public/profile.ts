import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'
import { getMember, upsertMember } from '../../db/members'

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('View your profile or another member\'s profile')
  .addUserOption((opt) =>
    opt.setName('member').setDescription('Member to view').setRequired(false)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('member') ?? interaction.user
  await upsertMember(target.id, target.username)
  const member = await getMember(target.id)

  if (!member) {
    await interaction.reply({ embeds: [errorEmbed('Member not found.')], ephemeral: true })
    return
  }

  await interaction.reply({
    embeds: [
      infoEmbed(
        `${target.username}'s Profile`,
        [
          `**Rep:** ${member.rep}`,
          `**Warnings:** ${member.warning_count}`,
          `**Messages:** ${member.message_count}`,
          `**Joined:** ${new Date(member.joined_at as string).toDateString()}`,
        ].join('\n')
      ),
    ],
    ephemeral: true,
  })
}
