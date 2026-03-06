const { db } = require('./client');

async function getChangelogCache(pkg) {
  const res = await db.execute({ sql: `SELECT * FROM changelog_cache WHERE package = ?`, args: [pkg] });
  return res.rows[0] ?? null;
}

async function setChangelogCache(pkg, hash, version) {
  await db.execute({
    sql:  `INSERT INTO changelog_cache (package, hash, last_version, last_checked) VALUES (?, ?, ?, ?)
           ON CONFLICT(package) DO UPDATE SET hash = excluded.hash, last_version = excluded.last_version, last_checked = excluded.last_checked`,
    args: [pkg, hash, version, new Date().toISOString()],
  });
}

async function getNpmCache(pkg) {
  const res = await db.execute({ sql: `SELECT * FROM npm_cache WHERE package = ?`, args: [pkg] });
  return res.rows[0] ?? null;
}

async function setNpmCache(pkg, version) {
  await db.execute({
    sql:  `INSERT INTO npm_cache (package, version, last_checked) VALUES (?, ?, ?)
           ON CONFLICT(package) DO UPDATE SET version = excluded.version, last_checked = excluded.last_checked`,
    args: [pkg, version, new Date().toISOString()],
  });
}

module.exports = { getChangelogCache, setChangelogCache, getNpmCache, setNpmCache };
