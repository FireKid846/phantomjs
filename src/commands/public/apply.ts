import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('apply')
  .setDescription('Apply to become a contributor or maintainer')

export async function execute(interaction: ChatInputCommandInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('application_modal')
    .setTitle('Firekid Packages — Apply')

  const nameInput = new TextInputBuilder()
    .setCustomId('app_name')
    .setLabel('Your name or GitHub username')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)

  const experienceInput = new TextInputBuilder()
    .setCustomId('app_experience')
    .setLabel('Your experience with Node.js / TypeScript')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500)

  const reasonInput = new TextInputBuilder()
    .setCustomId('app_reason')
    .setLabel('Why do you want to contribute?')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500)

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(experienceInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)
  )

  await interaction.showModal(modal)
}
