export function formatTimestamp(date: Date): string {
  return date.toISOString()
}

export function parseChangelogSection(content: string): string {
  // Grab everything from the first ## heading to the next one
  const match = content.match(/(## .+?)(?=\n## |\s*$)/s)
  if (!match) return content.slice(0, 1000)
  return match[1].trim().slice(0, 1500)
}

export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}
