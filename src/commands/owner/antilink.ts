import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { successEmbed, infoEmbed, errorEmbed } from '../../utils/embeds'
import { isOwner } from '../../utils/permissions'
import config from '../../../config.json'
import fs from 'fs'
import path from 'path'

export const data = new SlashCommandBuilder()
  .setName('antilink')
  .setDescription('Manage antilink settings')
  .addSubcommand((sub) =>
    sub.setName('status').setDescription('Show current antilink status')
  )
  .addSubcommand((sub) =>
    sub
      .setName('on')
      .setDescription('Enable antilink for a channel')
      .addChannelOption((opt) => opt.setName('channel').setDescription('Channel').setRequired(false))
  )
  .addSubcommand((sub) =>
    sub
      .setName('off')
      .setDescription('Disable antilink for a channel (add to exempt list)')
      .addChannelOption((opt) => opt.setName('channel').setDescription('Channel').setRequired(false))
  )
  .addSubcommand((sub) =>
    sub
      .setName('whitelist')
      .setDescription('Manage whitelisted domains')
      .addStringOption((opt) =>
        opt
          .setName('action')
          .setDescription('add or remove')
          .setRequired(true)
          .addChoices({ name: 'add', value: 'add' }, { name: 'remove', value: 'remove' }, { name: 'list', value: 'list' })
      )
      .addStringOption((opt) => opt.setName('domain').setDescription('Domain e.g. npmjs.com').setRequired(false))
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!isOwner(interaction.user.id)) {
    await interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true })
    return
  }

  const sub = interaction.options.getSubcommand()

  if (sub === 'status') {
    const exempt = config.antilink.exempt_channels.join(', ') || 'none'
    const domains = config.antilink.whitelist_domains.join(', ') || 'none'
    await interaction.reply({
      embeds: [
        infoEmbed(
          'Antilink Status',
          [
            `**Enabled:** ${config.antilink.enabled}`,
            `**Exempt channels:** ${exempt}`,
            `**Whitelisted domains:** ${domains}`,
            `**Kick at:** ${config.antilink.warn_limit_kick} warnings`,
            `**Ban at:** ${config.antilink.warn_limit_ban} warnings`,
          ].join('\n')
        ),
      ],
      ephemeral: true,
    })
    return
  }

  if (sub === 'whitelist') {
    const action = interaction.options.getString('action', true)
    const domain = interaction.options.getString('domain')

    if (action === 'list') {
      await interaction.reply({
        embeds: [infoEmbed('Whitelisted Domains', config.antilink.whitelist_domains.join('\n') || 'None')],
        ephemeral: true,
      })
      return
    }

    if (!domain) {
      await interaction.reply({ embeds: [errorEmbed('Please provide a domain.')], ephemeral: true })
      return
    }

    const configPath = path.join(process.cwd(), 'config.json')
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

    if (action === 'add') {
      if (!cfg.antilink.whitelist_domains.includes(domain)) {
        cfg.antilink.whitelist_domains.push(domain)
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2))
      }
      await interaction.reply({ embeds: [successEmbed('Domain Whitelisted', `**${domain}** added.`)], ephemeral: true })
    }

    if (action === 'remove') {
      cfg.antilink.whitelist_domains = cfg.antilink.whitelist_domains.filter((d: string) => d !== domain)
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2))
      await interaction.reply({ embeds: [successEmbed('Domain Removed', `**${domain}** removed.`)], ephemeral: true })
    }
  }
}
