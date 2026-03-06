const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Submit a formal bug report for a Firekid package')
    .addStringOption(opt => opt.setName('package').setDescription('Which package').setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: '@firekid/hurl' },
        { name: '@firekid/once', value: '@firekid/once' }
      ))
    .addStringOption(opt => opt.setName('description').setDescription('Describe the bug').setRequired(true).setMaxLength(800))
    .addStringOption(opt => opt.setName('version').setDescription('Package version e.g. 1.0.5')),

  async execute(interaction) {
    const pkg  = interaction.options.getString('package', true);
    const desc = interaction.options.getString('description', true);
    const ver  = interaction.options.getString('version') ?? 'not specified';

    await interaction.reply({ embeds: [embeds.success('Bug Reported', 'Your report has been submitted. Thank you!')], ephemeral: true });

    const channelId = config.channels['bug-reports'];
    if (!channelId) return;
    try {
      const ch = await interaction.client.channels.fetch(channelId);
      if (ch?.isSendable()) {
        await ch.send({
          embeds: [embeds.warning(`Bug Report — ${pkg}`,
            `**Package:** ${pkg}\n**Version:** ${ver}\n**Reporter:** ${interaction.user.username} (<@${interaction.user.id}>)\n\n**Description:**\n${desc}`)],
        });
      }
    } catch (err) { console.error('❌ Bug report post error:', err); }
  },
};
