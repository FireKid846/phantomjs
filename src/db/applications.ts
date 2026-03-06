import { db } from './client'

export async function createApplication(data: {
  discord_id: string
  discord_username: string
  name: string
  experience: string
  reason: string
  message_id?: string
}) {
  await db.execute({
    sql: `INSERT INTO applications (discord_id, discord_username, name, experience, reason, status, timestamp, message_id)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [
      data.discord_id,
      data.discord_username,
      data.name,
      data.experience,
      data.reason,
      new Date().toISOString(),
      data.message_id ?? null,
    ],
  })
}

export async function getApplication(id: number) {
  const res = await db.execute({
    sql: `SELECT * FROM applications WHERE id = ?`,
    args: [id],
  })
  return res.rows[0] ?? null
}

export async function updateApplicationStatus(id: number, status: 'accepted' | 'dismissed') {
  await db.execute({
    sql: `UPDATE applications SET status = ? WHERE id = ?`,
    args: [status, id],
  })
}

export async function updateApplicationMessageId(id: number, messageId: string) {
  await db.execute({
    sql: `UPDATE applications SET message_id = ? WHERE id = ?`,
    args: [messageId, id],
  })
}
