import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js'
import { infoEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'

export const data = new SlashCommandBuilder()
  .setName('roles')
  .setDescription('Post the self-assignable roles panel (owner only)')

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ content: 'Only the owner can post the roles panel.', ephemeral: true })
    return
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('role_hurl_user')
      .setLabel('I use @firekid/hurl')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('role_once_user')
      .setLabel('I use @firekid/once')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('role_beta_tester')
      .setLabel('Beta Tester')
      .setStyle(ButtonStyle.Secondary)
  )

  await interaction.reply({
    embeds: [
      infoEmbed(
        'Self-Assignable Roles',
        'Click a button to assign or remove a role.'
      ),
    ],
    components: [row],
  })
}
