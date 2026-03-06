import { EmbedBuilder, ColorResolvable } from 'discord.js'

const BRAND_COLOR: ColorResolvable = 0x5865F2

export function successEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
}

export function errorEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('Error')
    .setDescription(description)
    .setTimestamp()
}

export function infoEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
}

export function warningEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
}
