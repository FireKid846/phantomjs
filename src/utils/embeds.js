const { EmbedBuilder } = require('discord.js');

module.exports = {
  success: (title, description) =>
    new EmbedBuilder().setColor(0x57F287).setTitle(title).setDescription(description).setTimestamp(),

  error: (description) =>
    new EmbedBuilder().setColor(0xED4245).setTitle('Error').setDescription(description).setTimestamp(),

  info: (title, description) =>
    new EmbedBuilder().setColor(0x5865F2).setTitle(title).setDescription(description).setTimestamp(),

  warning: (title, description) =>
    new EmbedBuilder().setColor(0xFEE75C).setTitle(title).setDescription(description).setTimestamp(),
};
