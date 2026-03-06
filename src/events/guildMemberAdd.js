const config = require('../../config.json');
const embeds = require('../utils/embeds');
const { upsertMember } = require('../db/members');

module.exports = {
  name: 'guildMemberAdd',

  async execute(member, client) {
    try { await upsertMember(member.id, member.user.username); } catch {}

    if (config.roles.member)        await member.roles.add(config.roles.member).catch(() => {});
    if (config.roles.early_adopter && member.guild.memberCount <= 100)
      await member.roles.add(config.roles.early_adopter).catch(() => {});

    // Welcome DM
    await member.send({
      embeds: [embeds.success('Welcome to Firekid Packages',
        `Hey **${member.user.username}**, welcome!\n\n` +
        `• Pick your roles in the roles channel\n` +
        `• Say hi in general\n` +
        `• Check announcements for the latest releases\n` +
        `• Use \`/hurl\` or \`/once\` to learn about our packages`)],
    }).catch(() => {});

    if (!config.channels.welcome) return;
    try {
      const ch = await member.client.channels.fetch(config.channels.welcome);
      if (ch?.isSendable()) {
        await ch.send({
          embeds: [embeds.success('New Member', `Welcome <@${member.id}> to **Firekid Packages**! 🎉`)],
        });
      }
    } catch (err) { console.error('❌ Welcome message error:', err); }
  },
};
