import { db } from './client'

export async function upsertMember(id: string, username: string) {
  await db.execute({
    sql: `INSERT INTO members (id, username, joined_at, warning_count, rep, message_count, last_active)
          VALUES (?, ?, ?, 0, 0, 0, ?)
          ON CONFLICT(id) DO UPDATE SET username = excluded.username`,
    args: [id, username, new Date().toISOString(), new Date().toISOString()],
  })
}

export async function getMember(id: string) {
  const res = await db.execute({
    sql: `SELECT * FROM members WHERE id = ?`,
    args: [id],
  })
  return res.rows[0] ?? null
}

export async function incrementMessages(id: string) {
  await db.execute({
    sql: `UPDATE members SET message_count = message_count + 1, last_active = ? WHERE id = ?`,
    args: [new Date().toISOString(), id],
  })
}

export async function addRep(fromId: string, toId: string) {
  await db.execute({
    sql: `UPDATE members SET rep = rep + 1 WHERE id = ?`,
    args: [toId],
  })
}
