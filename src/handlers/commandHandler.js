const fs   = require('fs');
const path = require('path');

module.exports = (client) => {
  client.commands = new Map();

  const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));

  for (const folder of commandFolders) {
    const folderPath   = path.join(__dirname, '../commands', folder);
    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Loaded command: /${command.data.name}`);
      } else {
        console.warn(`⚠️  Skipping ${file} — missing data or execute`);
      }
    }
  }
};
