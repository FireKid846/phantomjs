const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Apply to become a Firekid Packages contributor'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('application_modal')
      .setTitle('Firekid Packages — Apply');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_name')
          .setLabel('Your name or GitHub username')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_experience')
          .setLabel('Experience with Node.js / TypeScript')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(500)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('app_reason')
          .setLabel('Why do you want to contribute?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(500)
      )
    );

    await interaction.showModal(modal);
  },
};
