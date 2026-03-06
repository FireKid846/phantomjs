import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed, errorEmbed } from '../../utils/embeds'

const STATUS_CODES: Record<number, string> = {
  200: 'OK — Request succeeded.',
  201: 'Created — Resource was created.',
  204: 'No Content — Success but no response body.',
  301: 'Moved Permanently — Resource has a new permanent URL.',
  302: 'Found — Resource is temporarily at a different URL.',
  304: 'Not Modified — Use cached version.',
  400: 'Bad Request — The server could not understand the request.',
  401: 'Unauthorized — Authentication is required.',
  403: 'Forbidden — You do not have permission.',
  404: 'Not Found — Resource does not exist.',
  405: 'Method Not Allowed — HTTP method not supported.',
  408: 'Request Timeout — Server timed out waiting.',
  409: 'Conflict — Request conflicts with current state.',
  410: 'Gone — Resource permanently deleted.',
  422: 'Unprocessable Entity — Validation failed.',
  429: 'Too Many Requests — Rate limit exceeded.',
  500: 'Internal Server Error — Something broke on the server.',
  502: 'Bad Gateway — Invalid response from upstream server.',
  503: 'Service Unavailable — Server is temporarily down.',
  504: 'Gateway Timeout — Upstream server timed out.',
}

export const data = new SlashCommandBuilder()
  .setName('http-status')
  .setDescription('Explain an HTTP status code')
  .addIntegerOption((opt) =>
    opt.setName('code').setDescription('HTTP status code e.g. 404').setRequired(true)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getInteger('code', true)
  const description = STATUS_CODES[code]

  if (!description) {
    await interaction.reply({
      embeds: [errorEmbed(`Unknown HTTP status code: **${code}**`)],
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    embeds: [infoEmbed(`HTTP ${code}`, description)],
  })
}
