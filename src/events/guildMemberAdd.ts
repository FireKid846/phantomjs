import { Events, GuildMember } from 'discord.js'
import { successEmbed } from '../utils/embeds'
import { upsertMember } from '../db/members'
import config from '../../config.json'

export const name = Events.GuildMemberAdd
export const once = false

export async function execute(member: GuildMember) {
  // Save member to DB
  try {
    await upsertMember(member.id, member.user.username)
  } catch (err) {
    console.error('[Phantom] Could not upsert member on join:', err)
  }

  // Assign member role
  const memberRoleId = config.roles.member
  if (memberRoleId) {
    try {
      await member.roles.add(memberRoleId)
    } catch {
      console.error('[Phantom] Could not assign member role — check bot permissions and role ID in config.json')
    }
  }

  // Check if this is one of the first 100 members — assign Early Adopter
  const earlyAdopterRoleId = config.roles.early_adopter
  if (earlyAdopterRoleId) {
    try {
      const guild = member.guild
      const memberCount = guild.memberCount
      if (memberCount <= 100) {
        await member.roles.add(earlyAdopterRoleId)
      }
    } catch {
      // Non-critical — skip silently
    }
  }

  // Send welcome DM
  try {
    await member.send({
      embeds: [
        successEmbed(
          'Welcome to Firekid Packages',
          [
            `Hey **${member.user.username}**, welcome to the official server for @firekid npm packages.`,
            '',
            '**Get started:**',
            '• Pick your roles in the roles channel',
            '• Say hi in general',
            '• Check announcements for the latest releases',
            '• Use `/hurl` or `/once` to learn about the packages',
            '',
            'Glad to have you here.',
          ].join('\n')
        ),
      ],
    })
  } catch {
    // DMs may be disabled — not critical
  }

  // Post in welcome channel
  const welcomeChannelId = config.channels.welcome
  if (!welcomeChannelId) return

  try {
    const channel = await member.client.channels.fetch(welcomeChannelId)
    if (channel?.isTextBased()) {
      await channel.send({
        embeds: [
          successEmbed(
            'New Member',
            `Welcome <@${member.id}> to **Firekid Packages**! Check out the roles channel to get started.`
          ),
        ],
      })
    }
  } catch (err) {
    console.error('[Phantom] Could not post welcome message:', err)
  }
}
