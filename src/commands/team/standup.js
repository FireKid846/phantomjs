const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isTeam } = require('../../utils/permissions');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('standup')
    .setDescription('Post your daily standup update (team only)')
    .addStringOption(opt => opt.setName('did').setDescription('What did you do?').setRequired(true))
    .addStringOption(opt => opt.setName('doing').setDescription('What are you working on?').setRequired(true))
    .addStringOption(opt => opt.setName('blocked').setDescription('Anything blocking you?')),

  async execute(interaction) {
    if (!isTeam(interaction.member)) {
      await interaction.reply({ embeds: [embeds.error('Team only.')], ephemeral: true });
      return;
    }
    const did     = interaction.options.getString('did', true);
    const doing   = interaction.options.getString('doing', true);
    const blocked = interaction.options.getString('blocked') ?? 'Nothing';

    const embed = embeds.info(
      `Standup — ${interaction.user.username}`,
      `**✅ Did:** ${did}\n**🔨 Doing:** ${doing}\n**🚧 Blocked:** ${blocked}`
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });

    if (config.channels.team) {
      try {
        const ch = await interaction.client.channels.fetch(config.channels.team);
        if (ch?.isSendable()) await ch.send({ embeds: [embed] });
      } catch (err) { console.error('❌ Standup post error:', err); }
    }
  },
};
