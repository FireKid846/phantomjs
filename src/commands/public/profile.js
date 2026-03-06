const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { getMember, upsertMember } = require('../../db/members');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription("View a member's Phantom profile")
    .addUserOption(opt => opt.setName('member').setDescription('Member to view (defaults to you)')),

  async execute(interaction) {
    const target = interaction.options.getUser('member') ?? interaction.user;
    await upsertMember(target.id, target.username);
    const m = await getMember(target.id);
    if (!m) { await interaction.reply({ embeds: [embeds.error('Member not found.')], ephemeral: true }); return; }
    await interaction.reply({
      embeds: [embeds.info(`${target.username}'s Profile`,
        `**Rep:** ${m.rep}\n**Warnings:** ${m.warning_count}\n**Messages:** ${m.message_count}\n**Member since:** ${new Date(m.joined_at).toDateString()}`)],
      ephemeral: true,
    });
  },
};
