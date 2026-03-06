import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { addRep, upsertMember, getMember } from '../../db/members'

export const data = new SlashCommandBuilder()
  .setName('rep')
  .setDescription('Give reputation to a helpful member')
  .addUserOption((opt) =>
    opt.setName('member').setDescription('Member to give rep to').setRequired(true)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('member', true)

  if (target.id === interaction.user.id) {
    await interaction.reply({ embeds: [errorEmbed('You cannot give rep to yourself.')], ephemeral: true })
    return
  }

  if (target.bot) {
    await interaction.reply({ embeds: [errorEmbed('You cannot give rep to a bot.')], ephemeral: true })
    return
  }

  await upsertMember(target.id, target.username)
  await addRep(interaction.user.id, target.id)
  const member = await getMember(target.id)

  await interaction.reply({
    embeds: [
      successEmbed(
        'Rep Given',
        `You gave rep to **${target.username}**. They now have **${member?.rep ?? 1}** rep.`
      ),
    ],
  })
}
