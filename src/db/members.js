const { db } = require('./client');

async function upsertMember(id, username) {
  await db.execute({
    sql: `INSERT INTO members (id, username, joined_at, warning_count, rep, message_count, last_active)
          VALUES (?, ?, ?, 0, 0, 0, ?)
          ON CONFLICT(id) DO UPDATE SET username = excluded.username, last_active = excluded.last_active`,
    args: [id, username, new Date().toISOString(), new Date().toISOString()],
  });
}

async function getMember(id) {
  const res = await db.execute({ sql: `SELECT * FROM members WHERE id = ?`, args: [id] });
  return res.rows[0] ?? null;
}

async function incrementMessages(id) {
  await db.execute({
    sql:  `UPDATE members SET message_count = message_count + 1, last_active = ? WHERE id = ?`,
    args: [new Date().toISOString(), id],
  });
}

async function addRep(toId) {
  await db.execute({ sql: `UPDATE members SET rep = rep + 1 WHERE id = ?`, args: [toId] });
}

module.exports = { upsertMember, getMember, incrementMessages, addRep };
