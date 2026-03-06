import {
  Events,
  Interaction,
  Collection,
  ButtonInteraction,
  ModalSubmitInteraction,
} from 'discord.js'
import { Command } from '../types'
import { successEmbed, errorEmbed, infoEmbed, warningEmbed } from '../utils/embeds'
import { upsertMember } from '../db/members'
import { createApplication, updateApplicationStatus } from '../db/applications'
import config from '../../config.json'

export const name = Events.InteractionCreate
export const once = false

// Single handler for ALL interactions.
// Commands, buttons, and modals are all handled here.
// This prevents multiple listeners from firing on the same interaction
// which causes "interaction already replied" errors.
export async function execute(interaction: Interaction, commands: Collection<string, Command>) {
  // ── Slash Commands ──────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName)

    if (!command) {
      await interaction.reply({ embeds: [errorEmbed(`Command not found: ${interaction.commandName}`)], ephemeral: true })
      return
    }

    try {
      await command.execute(interaction)
    } catch (err) {
      console.error(`[Phantom] Error in command /${interaction.commandName}:`, err)
      // Only reply if we haven't already — this prevents "interaction already replied" errors
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed('Something went wrong.')], ephemeral: true })
        } else {
          await interaction.reply({ embeds: [errorEmbed('Something went wrong.')], ephemeral: true })
        }
      } catch {
        // If even the error reply fails, just log it — don't crash the bot
        console.error('[Phantom] Could not send error reply for command:', interaction.commandName)
      }
    }
    return
  }

  // ── Button Interactions ─────────────────────────────────────────────────────
  if (interaction.isButton()) {
    await handleButton(interaction)
    return
  }

  // ── Modal Submissions ───────────────────────────────────────────────────────
  if (interaction.isModalSubmit()) {
    await handleModal(interaction)
    return
  }
}

// ── Button Handler ──────────────────────────────────────────────────────────────
async function handleButton(interaction: ButtonInteraction) {
  const { customId } = interaction

  // Self-assignable role buttons
  if (customId.startsWith('role_')) {
    await handleRoleButton(interaction, customId)
    return
  }

  // Application accept/dismiss buttons
  if (customId.startsWith('app_accept_') || customId.startsWith('app_dismiss_')) {
    await handleApplicationButton(interaction, customId)
    return
  }

  // Unknown button — acknowledge silently
  await interaction.reply({ content: 'Unknown button.', ephemeral: true })
}

async function handleRoleButton(interaction: ButtonInteraction, customId: string) {
  const roleMap: Record<string, keyof typeof config.roles> = {
    role_hurl_user: 'hurl_user',
    role_once_user: 'once_user',
    role_beta_tester: 'beta_tester',
  }

  const roleKey = roleMap[customId]
  if (!roleKey) {
    await interaction.reply({ content: 'Unknown role.', ephemeral: true })
    return
  }

  const roleId = config.roles[roleKey]
  if (!roleId) {
    await interaction.reply({ content: 'Role not configured in config.json.', ephemeral: true })
    return
  }

  const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null)
  if (!member) {
    await interaction.reply({ content: 'Could not find your member data.', ephemeral: true })
    return
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId)
      await interaction.reply({ embeds: [infoEmbed('Role Removed', `Removed role.`)], ephemeral: true })
    } else {
      await member.roles.add(roleId)
      await interaction.reply({ embeds: [successEmbed('Role Assigned', `Role assigned!`)], ephemeral: true })
    }
  } catch {
    await interaction.reply({ content: 'Could not update role. Check bot permissions.', ephemeral: true })
  }
}

async function handleApplicationButton(interaction: ButtonInteraction, customId: string) {
  // Only owner can accept/dismiss
  if (interaction.user.id !== process.env.OWNER_ID) {
    await interaction.reply({ content: 'Only the owner can manage applications.', ephemeral: true })
    return
  }

  const isAccept = customId.startsWith('app_accept_')
  const appId = parseInt(customId.replace('app_accept_', '').replace('app_dismiss_', ''))

  if (isNaN(appId)) {
    await interaction.reply({ content: 'Invalid application ID.', ephemeral: true })
    return
  }

  await updateApplicationStatus(appId, isAccept ? 'accepted' : 'dismissed')

  if (isAccept) {
    // Try to get the applicant's Discord info from DB and DM them
    const { db } = await import('../db/client')
    const res = await db.execute({ sql: `SELECT * FROM applications WHERE id = ?`, args: [appId] })
    const app = res.rows[0]

    if (app?.discord_id) {
      try {
        const user = await interaction.client.users.fetch(app.discord_id as string)

        // DM the applicant
        await user.send({
          embeds: [
            successEmbed(
              'Application Accepted',
              `Your application to Firekid Packages has been accepted. Welcome to the team!`
            ),
          ],
        })

        // Assign contributor role
        const contributorRoleId = config.roles.contributor
        if (contributorRoleId) {
          const guildMember = await interaction.guild?.members.fetch(app.discord_id as string).catch(() => null)
          if (guildMember) await guildMember.roles.add(contributorRoleId).catch(() => {})
        }

        // Post in accepted channel
        const acceptedChannelId = config.channels.accepted
        if (acceptedChannelId) {
          const channel = await interaction.client.channels.fetch(acceptedChannelId).catch(() => null)
          if (channel?.isTextBased()) {
            await channel.send({
              embeds: [successEmbed('New Contributor', `Welcome **${user.username}** to the Firekid team!`)],
            })
          }
        }
      } catch (err) {
        console.error('[Phantom] Could not DM accepted applicant:', err)
      }
    }

    // Update the application message — disable the buttons
    try {
      await interaction.update({
        embeds: [successEmbed(`Application #${appId} — Accepted`, 'This application has been accepted.')],
        components: [],
      })
    } catch {
      await interaction.reply({ embeds: [successEmbed('Accepted', `Application #${appId} accepted.`)], ephemeral: true })
    }
  } else {
    try {
      await interaction.update({
        embeds: [warningEmbed(`Application #${appId} — Dismissed`, 'This application has been dismissed.')],
        components: [],
      })
    } catch {
      await interaction.reply({ embeds: [infoEmbed('Dismissed', `Application #${appId} dismissed.`)], ephemeral: true })
    }
  }
}

// ── Modal Handler ───────────────────────────────────────────────────────────────
async function handleModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId === 'application_modal') {
    await handleApplicationModal(interaction)
    return
  }
}

async function handleApplicationModal(interaction: ModalSubmitInteraction) {
  const name = interaction.fields.getTextInputValue('app_name')
  const experience = interaction.fields.getTextInputValue('app_experience')
  const reason = interaction.fields.getTextInputValue('app_reason')

  await upsertMember(interaction.user.id, interaction.user.username)

  await createApplication({
    discord_id: interaction.user.id,
    discord_username: interaction.user.username,
    name,
    experience,
    reason,
  })

  await interaction.reply({
    embeds: [successEmbed('Application Submitted', 'Your application has been received. You will be notified via DM if accepted.')],
    ephemeral: true,
  })

  // Post to applications channel with Accept and Dismiss buttons
  const appChannelId = config.channels.applications
  if (!appChannelId) return

  try {
    const channel = await interaction.client.channels.fetch(appChannelId)
    if (!channel?.isTextBased()) return

    // Get the app ID from DB — fetch the most recent one for this user
    const { db } = await import('../db/client')
    const res = await db.execute({
      sql: `SELECT id FROM applications WHERE discord_id = ? ORDER BY id DESC LIMIT 1`,
      args: [interaction.user.id],
    })
    const appId = res.rows[0]?.id as number

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js')

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`app_accept_${appId}`)
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`app_dismiss_${appId}`)
        .setLabel('Dismiss')
        .setStyle(ButtonStyle.Secondary)
    )

    const msg = await channel.send({
      embeds: [
        infoEmbed(
          `New Application — ${interaction.user.username}`,
          [
            `**Discord:** ${interaction.user.username} (<@${interaction.user.id}>)`,
            `**Name:** ${name}`,
            `**Experience:** ${experience}`,
            `**Why:** ${reason}`,
          ].join('\n')
        ),
      ],
      components: [row],
    })

    // Save the message ID for future reference
    const { updateApplicationMessageId } = await import('../db/applications')
    await updateApplicationMessageId(appId, msg.id)
  } catch (err) {
    console.error('[Phantom] Could not post application to channel:', err)
  }
}
