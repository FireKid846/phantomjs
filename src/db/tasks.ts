import { db } from './client'

export async function createTask(data: {
  title: string
  description?: string
  assignee_id?: string
  priority?: string
}) {
  await db.execute({
    sql: `INSERT INTO tasks (title, description, assignee_id, priority, status, created_at)
          VALUES (?, ?, ?, ?, 'open', ?)`,
    args: [
      data.title,
      data.description ?? null,
      data.assignee_id ?? null,
      data.priority ?? 'medium',
      new Date().toISOString(),
    ],
  })
}

export async function getTasks(status?: string) {
  const res = status
    ? await db.execute({ sql: `SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC`, args: [status] })
    : await db.execute({ sql: `SELECT * FROM tasks ORDER BY created_at DESC`, args: [] })
  return res.rows
}

export async function updateTask(id: number, data: Partial<{ status: string; priority: string; assignee_id: string }>) {
  const fields = Object.entries(data).map(([k]) => `${k} = ?`).join(', ')
  const values = Object.values(data)
  await db.execute({
    sql: `UPDATE tasks SET ${fields} WHERE id = ?`,
    args: [...values, id],
  })
}
