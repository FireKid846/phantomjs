import cron from 'node-cron'
import { httpGet } from '../utils/http'

export function startSelfPing() {
  const renderUrl = process.env.RENDER_URL

  if (!renderUrl) {
    console.warn('[Phantom] RENDER_URL not set — self ping disabled')
    return
  }

  // Ping every 10 minutes to prevent Render from spinning down
  cron.schedule('*/10 * * * *', async () => {
    const { error } = await httpGet(renderUrl)

    if (error) {
      console.warn(`[Phantom] Self ping failed: ${error}`)
    } else {
      console.log(`[Phantom] Self ping ok — ${new Date().toISOString()}`)
    }
  })

  console.log(`[Phantom] Self ping started — pinging ${renderUrl} every 10 minutes`)
}
