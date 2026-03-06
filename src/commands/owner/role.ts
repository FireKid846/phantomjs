import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Assign or remove a role from a member')
  .addUserOption((opt) => opt.setName('member').setDescription('Member').setRequired(true))
  .addRoleOption((opt) => opt.setName('role').setDescription('Role').setRequired(true))
  .addStringOption((opt) =>
    opt
      .setName('action')
      .setDescription('Add or remove')
      .setRequired(true)
      .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' })
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const target = interaction.options.getUser('member', true)
  const role = interaction.options.getRole('role', true)
  const action = interaction.options.getString('action', true)
  const guildMember = await interaction.guild?.members.fetch(target.id).catch(() => null)

  if (!guildMember) {
    await interaction.reply({ embeds: [errorEmbed('Member not found.')], ephemeral: true })
    return
  }

  try {
    if (action === 'add') {
      await guildMember.roles.add(role.id)
      await interaction.reply({ embeds: [successEmbed('Role Added', `**${role.name}** added to **${target.username}**.`)] })
    } else {
      await guildMember.roles.remove(role.id)
      await interaction.reply({ embeds: [successEmbed('Role Removed', `**${role.name}** removed from **${target.username}**.`)] })
    }
  } catch {
    await interaction.reply({ embeds: [errorEmbed('Could not update role. Check bot permissions.')], ephemeral: true })
  }
}
