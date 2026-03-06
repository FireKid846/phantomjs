const { REST, Routes } = require('discord.js');
const { initDb }              = require('../db/client');
const { startNpmPoller }      = require('../tasks/npmPoller');
const { startChangelogPoller }= require('../tasks/changelogPoller');
const { startSelfPing }       = require('../tasks/selfPing');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);

    // DB
    try {
      await initDb();
      console.log('✅ Database ready');
    } catch (err) {
      console.error('❌ Database init failed:', err.message);
    }

    // Register slash commands
    try {
      const commands = [...client.commands.values()].map(c => c.data.toJSON());
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Registered ${commands.length} slash commands`);
    } catch (err) {
      console.error('❌ Failed to register commands:', err.message);
    }

    // Background tasks
    startNpmPoller(client);
    startChangelogPoller(client);
    startSelfPing();

    client.user.setActivity('Firekid Packages', { type: 3 }); // WATCHING
    console.log('🚀 Phantom fully ready');
  },
};
