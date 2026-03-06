const { SlashCommandBuilder } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const embeds = require('../../utils/embeds');
const { isOwner } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Manage antilink settings')
    .addSubcommand(sub => sub.setName('status').setDescription('Show current antilink status'))
    .addSubcommand(sub => sub
      .setName('whitelist')
      .setDescription('Manage whitelisted domains')
      .addStringOption(opt => opt.setName('action').setDescription('Action').setRequired(true)
        .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }, { name: 'list', value: 'list' }))
      .addStringOption(opt => opt.setName('domain').setDescription('Domain e.g. github.com'))),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [embeds.error('No permission.')], ephemeral: true });
      return;
    }
    const sub = interaction.options.getSubcommand();
    const cfgPath = path.join(__dirname, '../../../config.json');
    const cfg     = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));

    if (sub === 'status') {
      await interaction.reply({
        embeds: [embeds.info('Antilink Status',
          `**Enabled:** ${cfg.antilink.enabled}\n` +
          `**Exempt channels:** ${cfg.antilink.exempt_channels.join(', ') || 'none'}\n` +
          `**Whitelisted domains:** ${cfg.antilink.whitelist_domains.join(', ') || 'none'}\n` +
          `**Kick at:** ${cfg.antilink.warn_limit_kick} warnings\n` +
          `**Ban at:** ${cfg.antilink.warn_limit_ban} warnings`)],
        ephemeral: true,
      });
      return;
    }

    if (sub === 'whitelist') {
      const action = interaction.options.getString('action', true);
      const domain = interaction.options.getString('domain');

      if (action === 'list') {
        await interaction.reply({ embeds: [embeds.info('Whitelisted Domains', cfg.antilink.whitelist_domains.join('\n') || 'None')], ephemeral: true });
        return;
      }
      if (!domain) { await interaction.reply({ embeds: [embeds.error('Provide a domain.')], ephemeral: true }); return; }

      if (action === 'add') {
        if (!cfg.antilink.whitelist_domains.includes(domain)) cfg.antilink.whitelist_domains.push(domain);
        fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
        await interaction.reply({ embeds: [embeds.success('Whitelisted', `**${domain}** added.`)], ephemeral: true });
      } else {
        cfg.antilink.whitelist_domains = cfg.antilink.whitelist_domains.filter(d => d !== domain);
        fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
        await interaction.reply({ embeds: [embeds.success('Removed', `**${domain}** removed.`)], ephemeral: true });
      }
    }
  },
};
