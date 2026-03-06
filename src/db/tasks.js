const { db } = require('./client');

async function createTask(data) {
  await db.execute({
    sql:  `INSERT INTO tasks (title, description, assignee_id, priority, status, created_at) VALUES (?, ?, ?, ?, 'open', ?)`,
    args: [data.title, data.description ?? null, data.assignee_id ?? null, data.priority ?? 'medium', new Date().toISOString()],
  });
}

async function getTasks(status) {
  if (status) {
    const res = await db.execute({ sql: `SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC`, args: [status] });
    return res.rows;
  }
  const res = await db.execute({ sql: `SELECT * FROM tasks ORDER BY created_at DESC`, args: [] });
  return res.rows;
}

async function updateTask(id, data) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  await db.execute({ sql: `UPDATE tasks SET ${fields} WHERE id = ?`, args: [...Object.values(data), id] });
}

module.exports = { createTask, getTasks, updateTask };
