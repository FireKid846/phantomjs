const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { addRep, upsertMember, getMember } = require('../../db/members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Give reputation to a helpful member')
    .addUserOption(opt => opt.setName('member').setDescription('Member to rep').setRequired(true)),

  async execute(interaction) {
    const target = interaction.options.getUser('member', true);
    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [embeds.error('You cannot give rep to yourself.')], ephemeral: true });
      return;
    }
    if (target.bot) {
      await interaction.reply({ embeds: [embeds.error('You cannot give rep to a bot.')], ephemeral: true });
      return;
    }
    await upsertMember(target.id, target.username);
    await addRep(target.id);
    const m = await getMember(target.id);
    await interaction.reply({
      embeds: [embeds.success('Rep Given', `You gave rep to **${target.username}**. They now have **${m?.rep ?? 1}** rep.`)],
    });
  },
};
