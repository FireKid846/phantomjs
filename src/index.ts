import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { Command } from './types'

dotenv.config()

if (!process.env.DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is required')
if (!process.env.CLIENT_ID) throw new Error('CLIENT_ID is required')
if (!process.env.OWNER_ID) throw new Error('OWNER_ID is required')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

// Collection of all slash commands
const commands = new Collection<string, Command>()

// ── Load Commands ────────────────────────────────────────────────────────────
// Reads all command files from public/, team/, and owner/ folders automatically.
// Add a new file to the right folder and it's picked up — no registration needed here.
const commandFolders = ['public', 'team', 'owner']

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands', folder)

  if (!fs.existsSync(folderPath)) continue

  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.js'))

  for (const file of files) {
    const filePath = path.join(folderPath, file)
    const command = require(filePath) as Command

    if (!command.data || !command.execute) {
      console.warn(`[Phantom] Skipping ${file} — missing data or execute export`)
      continue
    }

    commands.set(command.data.name, command)
    console.log(`[Phantom] Loaded command: /${command.data.name}`)
  }
}

// ── Load Events ──────────────────────────────────────────────────────────────
// Each event file exports: name, once, execute
// interactionCreate receives the commands collection as a second argument.
// All other events receive only the Discord event payload.
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)

  if (!event.name || !event.execute) {
    console.warn(`[Phantom] Skipping event ${file} — missing name or execute`)
    continue
  }

  if (event.once) {
    client.once(event.name, (...args: unknown[]) => {
      if (event.name === 'ready') {
        event.execute(client)
      } else {
        event.execute(...args)
      }
    })
  } else {
    client.on(event.name, (...args: unknown[]) => {
      // Pass commands collection to interactionCreate — it handles all interaction types
      if (event.name === 'interactionCreate') {
        event.execute(args[0], commands)
      } else {
        event.execute(...args)
      }
    })
  }

  console.log(`[Phantom] Loaded event: ${event.name}`)
}

client.login(process.env.DISCORD_TOKEN)
