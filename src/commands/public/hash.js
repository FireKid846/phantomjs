const { SlashCommandBuilder } = require('discord.js');
const { createHash } = require('crypto');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hash')
    .setDescription('Hash a string using a chosen algorithm')
    .addStringOption(opt => opt.setName('input').setDescription('Input string').setRequired(true))
    .addStringOption(opt => opt.setName('algorithm').setDescription('Algorithm (default: sha256)')
      .addChoices(
        { name: 'sha256', value: 'sha256' },
        { name: 'sha512', value: 'sha512' },
        { name: 'md5',    value: 'md5'    }
      )),

  async execute(interaction) {
    const input = interaction.options.getString('input', true);
    const alg   = interaction.options.getString('algorithm') ?? 'sha256';
    const hash  = createHash(alg).update(input).digest('hex');
    await interaction.reply({ embeds: [embeds.info(`${alg.toUpperCase()} Hash`, `\`\`\`\n${hash}\n\`\`\``)], ephemeral: true });
  },
};
