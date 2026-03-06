import { Client } from 'discord.js'
import cron from 'node-cron'
import { httpGet } from '../utils/http'
import { getNpmCache, setNpmCache } from '../db/changelog'
import { infoEmbed } from '../utils/embeds'
import config from '../../config.json'

interface NpmLatest {
  version: string
  description: string
}

export function startNpmPoller(client: Client) {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    for (const pkg of config.npm.packages) {
      await checkPackage(client, pkg)
    }
  })

  console.log('[Phantom] npm poller started — checking every 10 minutes')
}

async function checkPackage(client: Client, pkg: string) {
  try {
    const encoded = encodeURIComponent(pkg)
    const { data, error } = await httpGet<NpmLatest>(
      `https://registry.npmjs.org/${encoded}/latest`
    )

    if (error || !data) {
      console.warn(`[Phantom] npm poll failed for ${pkg}: ${error}`)
      return
    }

    const cached = await getNpmCache(pkg)
    const latestVersion = data.version

    // First run — just cache it, don't announce
    if (!cached) {
      await setNpmCache(pkg, latestVersion)
      return
    }

    // Version hasn't changed
    if (cached.version === latestVersion) return

    // New version detected — update cache and announce
    await setNpmCache(pkg, latestVersion)
    await announceRelease(client, pkg, latestVersion)
  } catch (err) {
    console.error(`[Phantom] npm poller error for ${pkg}:`, err)
  }
}

async function announceRelease(client: Client, pkg: string, version: string) {
  const channelId = config.channels.announcements
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel?.isTextBased()) return

    const shortName = pkg.split('/')[1] // hurl or once

    await channel.send({
      embeds: [
        infoEmbed(
          `${pkg} ${version} is live`,
          [
            `A new version of **${pkg}** has been published to npm.`,
            '',
            '```bash',
            `npm install ${pkg}`,
            '```',
            '',
            `**npm:** https://npmjs.com/package/${pkg}`,
            `**GitHub:** https://github.com/${config.github.owner}/${shortName}`,
            `**Changelog:** use \`/changelog\` to see what changed`,
          ].join('\n')
        ),
      ],
    })

    console.log(`[Phantom] Announced ${pkg} ${version}`)
  } catch (err) {
    console.error('[Phantom] Could not post npm release announcement:', err)
  }
}
