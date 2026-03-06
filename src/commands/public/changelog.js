const { SlashCommandBuilder } = require('discord.js');
const embeds    = require('../../utils/embeds');
const { httpGet }  = require('../../utils/http');
const { parseChangelogSection } = require('../../utils/format');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Show the latest changelog entry for a package')
    .addStringOption(opt => opt
      .setName('package')
      .setDescription('Which package')
      .setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: 'hurl' },
        { name: '@firekid/once', value: 'once' }
      )),

  async execute(interaction) {
    await interaction.deferReply();
    const pkg = interaction.options.getString('package', true);
    const rc  = config.github.repos[pkg];
    const url = `https://raw.githubusercontent.com/${config.github.owner}/${pkg}/${rc.branch}/${rc.changelog}`;
    const { data: content, error } = await httpGet(url, { accept: 'text/plain' });
    if (error || !content) {
      await interaction.editReply({ embeds: [embeds.error('Could not fetch changelog.')] });
      return;
    }
    const section = parseChangelogSection(content);
    await interaction.editReply({ embeds: [embeds.info(`@firekid/${pkg} — Latest Changelog`, `\`\`\`md\n${section}\n\`\`\``)] });
  },
};
