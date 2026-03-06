import { db } from './client'

export async function addWarning(memberId: string, reason: string): Promise<number> {
  await db.execute({
    sql: `INSERT INTO warnings (member_id, reason, timestamp) VALUES (?, ?, ?)`,
    args: [memberId, reason, new Date().toISOString()],
  })
  await db.execute({
    sql: `UPDATE members SET warning_count = warning_count + 1 WHERE id = ?`,
    args: [memberId],
  })
  const res = await db.execute({
    sql: `SELECT warning_count FROM members WHERE id = ?`,
    args: [memberId],
  })
  return Number(res.rows[0]?.warning_count ?? 0)
}

export async function getWarnings(memberId: string) {
  const res = await db.execute({
    sql: `SELECT * FROM warnings WHERE member_id = ? ORDER BY timestamp DESC`,
    args: [memberId],
  })
  return res.rows
}

export async function clearWarnings(memberId: string) {
  await db.execute({
    sql: `DELETE FROM warnings WHERE member_id = ?`,
    args: [memberId],
  })
  await db.execute({
    sql: `UPDATE members SET warning_count = 0 WHERE id = ?`,
    args: [memberId],
  })
}
