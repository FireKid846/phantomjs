const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('install')
    .setDescription('Get the install command for a Firekid package')
    .addStringOption(opt => opt
      .setName('package').setDescription('Package').setRequired(true)
      .addChoices(
        { name: '@firekid/hurl', value: '@firekid/hurl' },
        { name: '@firekid/once', value: '@firekid/once' }
      ))
    .addStringOption(opt => opt
      .setName('manager').setDescription('Package manager')
      .addChoices(
        { name: 'npm',  value: 'npm'  },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun',  value: 'bun'  }
      )),

  async execute(interaction) {
    const pkg = interaction.options.getString('package', true);
    const mgr = interaction.options.getString('manager') ?? 'npm';
    const cmds = { npm: `npm install ${pkg}`, yarn: `yarn add ${pkg}`, pnpm: `pnpm add ${pkg}`, bun: `bun add ${pkg}` };
    await interaction.reply({ embeds: [embeds.info(`Install ${pkg}`, `\`\`\`bash\n${cmds[mgr]}\n\`\`\``)] });
  },
};
