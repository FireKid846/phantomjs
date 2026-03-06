const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { db }  = require('../../db/client');
const config  = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a feature suggestion')
    .addStringOption(opt => opt.setName('suggestion').setDescription('Your suggestion').setRequired(true).setMaxLength(500)),

  async execute(interaction) {
    const content = interaction.options.getString('suggestion', true);
    await db.execute({
      sql:  'INSERT INTO suggestions (member_id, content, upvotes, timestamp) VALUES (?, ?, 0, ?)',
      args: [interaction.user.id, content, new Date().toISOString()],
    });
    await interaction.reply({ embeds: [embeds.success('Suggestion Submitted', content)], ephemeral: true });

    if (!config.channels.roadmap) return;
    try {
      const ch = await interaction.client.channels.fetch(config.channels.roadmap);
      if (ch?.isSendable()) {
        const msg = await ch.send({ embeds: [embeds.success(`Suggestion — ${interaction.user.username}`, content)] });
        await msg.react('👍');
        await msg.react('👎');
      }
    } catch (err) { console.error('❌ Suggest post error:', err); }
  },
};
