const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a member')
    .addUserOption(opt => opt.setName('user').setDescription('Member').setRequired(true))
    .addRoleOption(opt => opt.setName('role').setDescription('Role').setRequired(true))
    .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
      .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' })),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const target = interaction.options.getUser('user', true);
    const role   = interaction.options.getRole('role', true);
    const action = interaction.options.getString('action', true);
    const member = await interaction.guild?.members.fetch(target.id).catch(() => null);
    if (!member) { await interaction.reply({ embeds: [embeds.error('Member not found.')], ephemeral: true }); return; }
    try {
      if (action === 'add') {
        await member.roles.add(role.id);
        await interaction.reply({ embeds: [embeds.success('Role Added', `**${role.name}** added to **${target.username}**.`)] });
      } else {
        await member.roles.remove(role.id);
        await interaction.reply({ embeds: [embeds.success('Role Removed', `**${role.name}** removed from **${target.username}**.`)] });
      }
    } catch (err) {
      console.error('❌ Role error:', err);
      await interaction.reply({ embeds: [embeds.error('Could not update role.')], ephemeral: true });
    }
  },
};
