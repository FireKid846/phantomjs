import config from '../../config.json'

const URL_REGEX = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+/gi

export function containsLink(content: string): boolean {
  return URL_REGEX.test(content)
}

export function isWhitelisted(content: string): boolean {
  const matches = content.match(URL_REGEX) ?? []
  return matches.every((url) =>
    config.antilink.whitelist_domains.some((domain) => url.includes(domain))
  )
}

export function isExemptChannel(channelName: string): boolean {
  return config.antilink.exempt_channels.includes(channelName)
}
