const { db } = require('./client');

async function createApplication(data) {
  await db.execute({
    sql:  `INSERT INTO applications (discord_id, discord_username, name, experience, reason, status, timestamp, message_id)
           VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [data.discord_id, data.discord_username, data.name, data.experience, data.reason, new Date().toISOString(), data.message_id ?? null],
  });
}

async function updateApplicationStatus(id, status) {
  await db.execute({ sql: `UPDATE applications SET status = ? WHERE id = ?`, args: [status, id] });
}

async function updateApplicationMessageId(id, messageId) {
  await db.execute({ sql: `UPDATE applications SET message_id = ? WHERE id = ?`, args: [messageId, id] });
}

async function getApplicationById(id) {
  const res = await db.execute({ sql: `SELECT * FROM applications WHERE id = ?`, args: [id] });
  return res.rows[0] ?? null;
}

async function getLatestApplicationByUser(discordId) {
  const res = await db.execute({
    sql:  `SELECT id FROM applications WHERE discord_id = ? ORDER BY id DESC LIMIT 1`,
    args: [discordId],
  });
  return res.rows[0] ?? null;
}

module.exports = { createApplication, updateApplicationStatus, updateApplicationMessageId, getApplicationById, getLatestApplicationByUser };
