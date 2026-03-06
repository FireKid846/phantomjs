import { REST, Routes } from 'discord.js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.CLIENT_ID
const guildId = process.env.GUILD_ID

if (!token || !clientId || !guildId) {
  throw new Error('DISCORD_TOKEN, CLIENT_ID and GUILD_ID are required in .env to deploy commands')
}

const commandBodies: unknown[] = []
const folders = ['public', 'team', 'owner']

for (const folder of folders) {
  const folderPath = path.join(__dirname, 'commands', folder)
  if (!fs.existsSync(folderPath)) continue

  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'))
  for (const file of files) {
    const command = require(path.join(folderPath, file))
    if (command.data) {
      commandBodies.push(command.data.toJSON())
      console.log(`[Deploy] Queued: /${command.data.name}`)
    }
  }
}

const rest = new REST().setToken(token)

;(async () => {
  try {
    console.log(`[Deploy] Registering ${commandBodies.length} commands to guild ${guildId}...`)

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandBodies,
    })

    console.log(`[Deploy] Done. ${commandBodies.length} commands registered.`)
  } catch (err) {
    console.error('[Deploy] Failed:', err)
  }
})()
