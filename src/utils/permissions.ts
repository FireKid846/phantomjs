import { GuildMember } from 'discord.js'
import config from '../../config.json'

export function isOwner(userId: string): boolean {
  return userId === process.env.OWNER_ID
}

export function isMaintainer(member: GuildMember): boolean {
  return (
    isOwner(member.id) ||
    member.roles.cache.has(config.roles.maintainer) ||
    member.roles.cache.has(config.roles.firekid)
  )
}

export function isTeam(member: GuildMember): boolean {
  return (
    isMaintainer(member) ||
    member.roles.cache.has(config.roles.contributor)
  )
}
