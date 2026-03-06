const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const CODES = {
  200: 'OK — Request succeeded.',
  201: 'Created — Resource was created.',
  204: 'No Content — Success with no response body.',
  301: 'Moved Permanently — Resource has a new URL forever.',
  302: 'Found — Temporary redirect.',
  304: 'Not Modified — Use your cached version.',
  400: 'Bad Request — The server could not understand the request.',
  401: 'Unauthorized — Authentication is required.',
  403: 'Forbidden — You do not have permission.',
  404: 'Not Found — The resource does not exist.',
  405: 'Method Not Allowed — HTTP method not supported here.',
  408: 'Request Timeout — Server timed out waiting for the request.',
  409: 'Conflict — Request conflicts with current server state.',
  410: 'Gone — Resource has been permanently deleted.',
  422: 'Unprocessable Entity — Validation failed.',
  429: 'Too Many Requests — Rate limit exceeded.',
  500: 'Internal Server Error — Something went wrong on the server.',
  502: 'Bad Gateway — Invalid response from upstream server.',
  503: 'Service Unavailable — Server is down or overloaded.',
  504: 'Gateway Timeout — Upstream server did not respond in time.',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('http-status')
    .setDescription('Explain an HTTP status code')
    .addIntegerOption(opt => opt.setName('code').setDescription('Status code e.g. 404').setRequired(true)),

  async execute(interaction) {
    const code = interaction.options.getInteger('code', true);
    if (!CODES[code]) {
      await interaction.reply({ embeds: [embeds.error(`Unknown status code: **${code}**`)], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [embeds.info(`HTTP ${code}`, CODES[code])] });
  },
};
