const { SlashCommandBuilder } = require('discord.js');
const embeds    = require('../../utils/embeds');
const { httpGet } = require('../../utils/http');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('version')
    .setDescription('Show the current npm version of a Firekid package')
    .addStringOption(opt => opt
      .setName('package')
      .setDescription('Which package')
      .setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: '@firekid/hurl' },
        { name: '@firekid/once', value: '@firekid/once' }
      )),

  async execute(interaction) {
    await interaction.deferReply();
    const pkg = interaction.options.getString('package', true);
    const { data, error } = await httpGet(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`);
    if (error || !data) {
      await interaction.editReply({ embeds: [embeds.error(`Could not fetch version for **${pkg}**.`)] });
      return;
    }
    await interaction.editReply({ embeds: [embeds.info(pkg, `Current version: **${data.version}**`)] });
  },
};
