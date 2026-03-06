import { db } from './client'

export async function getChangelogCache(pkg: string) {
  const res = await db.execute({
    sql: `SELECT * FROM changelog_cache WHERE package = ?`,
    args: [pkg],
  })
  return res.rows[0] ?? null
}

export async function setChangelogCache(pkg: string, hash: string, version: string) {
  await db.execute({
    sql: `INSERT INTO changelog_cache (package, hash, last_version, last_checked)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(package) DO UPDATE SET
            hash = excluded.hash,
            last_version = excluded.last_version,
            last_checked = excluded.last_checked`,
    args: [pkg, hash, version, new Date().toISOString()],
  })
}

export async function getNpmCache(pkg: string) {
  const res = await db.execute({
    sql: `SELECT * FROM npm_cache WHERE package = ?`,
    args: [pkg],
  })
  return res.rows[0] ?? null
}

export async function setNpmCache(pkg: string, version: string) {
  await db.execute({
    sql: `INSERT INTO npm_cache (package, version, last_checked)
          VALUES (?, ?, ?)
          ON CONFLICT(package) DO UPDATE SET
            version = excluded.version,
            last_checked = excluded.last_checked`,
    args: [pkg, version, new Date().toISOString()],
  })
}
