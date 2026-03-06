const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Post the self-assignable roles panel (owner only)'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: '❌ Only the owner can post the roles panel.', ephemeral: true });
      return;
    }
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('role_hurl_user').setLabel('I use @firekid/hurl').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('role_once_user').setLabel('I use @firekid/once').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('role_beta_tester').setLabel('Beta Tester').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
      embeds:     [embeds.info('Self-Assignable Roles', 'Click a button to toggle a role.')],
      components: [row],
    });
  },
};
