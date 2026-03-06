import { Client, Events } from 'discord.js'
import { startNpmPoller } from '../tasks/npmPoller'
import { startChangelogPoller } from '../tasks/changelogPoller'
import { startSelfPing } from '../tasks/selfPing'
import { initDb } from '../db/client'

export const name = Events.ClientReady
export const once = true

export async function execute(client: Client) {
  console.log(`[Phantom] Logged in as ${client.user?.tag}`)

  try {
    await initDb()
    console.log('[Phantom] Database initialized')
  } catch (err) {
    console.error('[Phantom] Database init failed:', err)
  }

  startNpmPoller(client)
  startChangelogPoller(client)
  startSelfPing()

  console.log('[Phantom] All tasks started')
}
