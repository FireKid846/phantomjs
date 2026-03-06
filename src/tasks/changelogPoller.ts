import { Client } from 'discord.js'
import cron from 'node-cron'
import { httpGet } from '../utils/http'
import { getChangelogCache, setChangelogCache } from '../db/changelog'
import { hashString, parseChangelogSection } from '../utils/format'
import { infoEmbed } from '../utils/embeds'
import config from '../../config.json'

export function startChangelogPoller(client: Client) {
  // Offset by 5 minutes from npm poller to avoid hitting rate limits at same time
  cron.schedule('5,15,25,35,45,55 * * * *', async () => {
    for (const [repoName, repoConfig] of Object.entries(config.github.repos)) {
      await checkChangelog(client, repoName, repoConfig)
    }
  })

  console.log('[Phantom] Changelog poller started')
}

async function checkChangelog(
  client: Client,
  repoName: string,
  repoConfig: { changelog: string; branch: string }
) {
  try {
    const url = `https://raw.githubusercontent.com/${config.github.owner}/${repoName}/${repoConfig.branch}/${repoConfig.changelog}`

    // hurl fetches raw text from GitHub — no auth needed for public repos
    const { data: content, error } = await httpGet<string>(url, {
      // GitHub raw returns text/plain — hurl handles this correctly
      accept: 'text/plain',
    })

    if (error || !content) {
      console.warn(`[Phantom] Changelog fetch failed for ${repoName}: ${error}`)
      return
    }

    const hash = hashString(content)
    const cached = await getChangelogCache(`@firekid/${repoName}`)

    // First run — just cache it, don't announce
    if (!cached) {
      // Pull version from first ## heading in changelog
      const versionMatch = content.match(/## (.+)/)
      const version = versionMatch?.[1]?.trim() ?? 'unknown'
      await setChangelogCache(`@firekid/${repoName}`, hash, version)
      return
    }

    // Changelog hasn't changed
    if (cached.hash === hash) return

    // Changelog changed — extract the new section at the top and announce
    const newSection = parseChangelogSection(content)
    const versionMatch = newSection.match(/## (.+)/)
    const version = versionMatch?.[1]?.trim() ?? 'latest'

    await setChangelogCache(`@firekid/${repoName}`, hash, version)
    await announceChangelog(client, repoName, version, newSection)
  } catch (err) {
    console.error(`[Phantom] Changelog poller error for ${repoName}:`, err)
  }
}

async function announceChangelog(
  client: Client,
  repoName: string,
  version: string,
  section: string
) {
  const channelId = config.channels.announcements
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel?.isTextBased()) return

    await channel.send({
      embeds: [
        infoEmbed(
          `@firekid/${repoName} — Changelog Updated`,
          `\`\`\`md\n${section.slice(0, 1800)}\n\`\`\``
        ),
      ],
    })

    console.log(`[Phantom] Changelog announced for @firekid/${repoName} ${version}`)
  } catch (err) {
    console.error('[Phantom] Could not post changelog announcement:', err)
  }
}
