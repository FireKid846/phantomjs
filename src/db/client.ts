import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
dotenv.config()

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables.')
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      warning_count INTEGER DEFAULT 0,
      rep INTEGER DEFAULT 0,
      message_count INTEGER DEFAULT 0,
      last_active TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS warnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT,
      discord_username TEXT,
      name TEXT NOT NULL,
      experience TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      timestamp TEXT NOT NULL,
      message_id TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS changelog_cache (
      package TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      last_version TEXT NOT NULL,
      last_checked TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS npm_cache (
      package TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      last_checked TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      message_id TEXT
    )`,
  ])
}
