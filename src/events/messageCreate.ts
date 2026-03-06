import { Events, Message } from 'discord.js'
import { containsLink, isWhitelisted, isExemptChannel } from '../utils/antilink'
import { warningEmbed } from '../utils/embeds'
import { addWarning } from '../db/warnings'
import { upsertMember, incrementMessages } from '../db/members'
import config from '../../config.json'

export const name = Events.MessageCreate
export const once = false

export async function execute(message: Message) {
  // Ignore bots and DMs — bots includes Phantom itself, prevents infinite loops
  if (message.author.bot) return
  if (!message.guild) return

  // Track message count for activity roles
  try {
    await upsertMember(message.author.id, message.author.username)
    await incrementMessages(message.author.id)
  } catch {
    // Non-critical — don't block message processing
  }

  // Antilink check
  if (config.antilink.enabled) {
    await handleAntilink(message)
  }
}

async function handleAntilink(message: Message) {
  const channelName = (message.channel as any).name ?? ''

  // Skip exempt channels
  if (isExemptChannel(channelName)) return

  // Skip if no link in message
  if (!containsLink(message.content)) return

  // Skip if all links are whitelisted
  if (isWhitelisted(message.content)) return

  // Skip owner
  if (message.author.id === process.env.OWNER_ID) return

  // Delete the message
  try {
    await message.delete()
  } catch {
    // Message may have already been deleted — skip
    return
  }

  // Add warning to DB and get total count
  let totalWarnings = 0
  try {
    await upsertMember(message.author.id, message.author.username)
    totalWarnings = await addWarning(message.author.id, 'Posted a link')
  } catch (err) {
    console.error('[Phantom] Could not save antilink warning:', err)
  }

  // Warn publicly in the channel
  try {
    const warning = await message.channel.send({
      embeds: [
        warningEmbed(
          'Link Removed',
          `<@${message.author.id}>, links are not allowed here.\n**Warning ${totalWarnings}/${config.antilink.warn_limit_ban}**`
        ),
      ],
    })

    // Auto-delete the warning message after 5 seconds to keep channels clean
    setTimeout(() => {
      warning.delete().catch(() => {})
    }, 5000)
  } catch {
    // Cannot send in channel — skip
  }

  const member = await message.guild?.members.fetch(message.author.id).catch(() => null)
  if (!member) return

  // Auto kick at warn_limit_kick
  if (totalWarnings >= config.antilink.warn_limit_kick && totalWarnings < config.antilink.warn_limit_ban) {
    try {
      await member.kick(`Antilink: reached ${totalWarnings} warnings`)
    } catch {
      console.error('[Phantom] Could not kick member — check permissions')
    }
    return
  }

  // Auto ban at warn_limit_ban
  if (totalWarnings >= config.antilink.warn_limit_ban) {
    try {
      await member.ban({ reason: `Antilink: reached ${totalWarnings} warnings` })
    } catch {
      console.error('[Phantom] Could not ban member — check permissions')
    }
  }
}
