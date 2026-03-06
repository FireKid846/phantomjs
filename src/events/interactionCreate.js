const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embeds = require('../utils/embeds');
const { upsertMember } = require('../db/members');
const {
  createApplication, updateApplicationStatus, updateApplicationMessageId,
  getApplicationById, getLatestApplicationByUser,
} = require('../db/applications');
const { db } = require('../db/client');
const config = require('../../config.json');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    // ── Slash commands ──────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({ embeds: [embeds.error(`Unknown command \`${interaction.commandName}\``)], ephemeral: true });
        return;
      }
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`❌ Error in /${interaction.commandName}:`, err);
        const msg = { embeds: [embeds.error('Something went wrong executing that command.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(msg).catch(() => {});
        else await interaction.reply(msg).catch(() => {});
      }
      return;
    }

    // ── Buttons ─────────────────────────────────────────────────────────────
    if (interaction.isButton()) { await handleButton(interaction); return; }

    // ── Modals ───────────────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) { await handleModal(interaction); return; }
  },
};

// ── Button handler ────────────────────────────────────────────────────────────
async function handleButton(interaction) {
  const { customId } = interaction;

  // Self-assignable roles
  if (customId.startsWith('role_')) {
    const map    = { role_hurl_user: 'hurl_user', role_once_user: 'once_user', role_beta_tester: 'beta_tester' };
    const roleId = config.roles[map[customId]];
    if (!roleId) { await interaction.reply({ content: '❌ Role not configured in config.json.', ephemeral: true }); return; }

    const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
    if (!member) { await interaction.reply({ content: '❌ Could not fetch your member data.', ephemeral: true }); return; }

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({ embeds: [embeds.info('Role Removed', 'Role successfully removed.')], ephemeral: true });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({ embeds: [embeds.success('Role Assigned', 'Role successfully assigned!')], ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ Could not update role — check bot permissions.', ephemeral: true });
    }
    return;
  }

  // Application accept / dismiss
  if (customId.startsWith('app_accept_') || customId.startsWith('app_dismiss_')) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      await interaction.reply({ content: '❌ Only the owner can manage applications.', ephemeral: true });
      return;
    }

    const isAccept = customId.startsWith('app_accept_');
    const appId    = parseInt(customId.replace('app_accept_', '').replace('app_dismiss_', ''));
    if (isNaN(appId)) { await interaction.reply({ content: '❌ Invalid application ID.', ephemeral: true }); return; }

    await updateApplicationStatus(appId, isAccept ? 'accepted' : 'dismissed');

    if (isAccept) {
      const app = await getApplicationById(appId);
      if (app?.discord_id) {
        try {
          const user = await interaction.client.users.fetch(app.discord_id);
          await user.send({ embeds: [embeds.success('Application Accepted', 'Your application to Firekid Packages has been accepted. Welcome to the team!')] }).catch(() => {});

          if (config.roles.contributor) {
            const m = await interaction.guild?.members.fetch(app.discord_id).catch(() => null);
            if (m) await m.roles.add(config.roles.contributor).catch(() => {});
          }

          if (config.channels.accepted) {
            const ch = await interaction.client.channels.fetch(config.channels.accepted).catch(() => null);
            if (ch?.isSendable()) await ch.send({ embeds: [embeds.success('New Contributor', `Welcome **${user.username}** to the Firekid team! 🎉`)] });
          }
        } catch (err) { console.error('❌ Error notifying accepted applicant:', err); }
      }

      try {
        await interaction.update({ embeds: [embeds.success(`Application #${appId} — Accepted`, 'This application has been accepted.')], components: [] });
      } catch {
        await interaction.reply({ embeds: [embeds.success('Accepted', `Application #${appId} accepted.`)], ephemeral: true });
      }
    } else {
      try {
        await interaction.update({ embeds: [embeds.warning(`Application #${appId} — Dismissed`, 'This application has been dismissed.')], components: [] });
      } catch {
        await interaction.reply({ embeds: [embeds.info('Dismissed', `Application #${appId} dismissed.`)], ephemeral: true });
      }
    }
    return;
  }

  await interaction.reply({ content: '❌ Unknown button.', ephemeral: true });
}

// ── Modal handler ─────────────────────────────────────────────────────────────
async function handleModal(interaction) {
  if (interaction.customId !== 'application_modal') return;

  const name       = interaction.fields.getTextInputValue('app_name');
  const experience = interaction.fields.getTextInputValue('app_experience');
  const reason     = interaction.fields.getTextInputValue('app_reason');

  await upsertMember(interaction.user.id, interaction.user.username);
  await createApplication({ discord_id: interaction.user.id, discord_username: interaction.user.username, name, experience, reason });

  await interaction.reply({
    embeds:    [embeds.success('Application Submitted', 'Your application has been received. You will be notified via DM if accepted.')],
    ephemeral: true,
  });

  if (!config.channels.applications) return;

  try {
    const channel = await interaction.client.channels.fetch(config.channels.applications);
    if (!channel?.isSendable()) return;

    const latest = await getLatestApplicationByUser(interaction.user.id);
    const appId  = latest?.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`app_accept_${appId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`app_dismiss_${appId}`).setLabel('Dismiss').setStyle(ButtonStyle.Secondary)
    );

    const msg = await channel.send({
      embeds: [embeds.info(
        `New Application — ${interaction.user.username}`,
        `**Discord:** ${interaction.user.username} (<@${interaction.user.id}>)\n**Name:** ${name}\n**Experience:** ${experience}\n**Why:** ${reason}`
      )],
      components: [row],
    });

    await updateApplicationMessageId(appId, msg.id);
  } catch (err) {
    console.error('❌ Could not post application to channel:', err);
  }
}
