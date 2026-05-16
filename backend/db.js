// FILE: backend/db.js
// libSQL (Turso) data layer. Replaces better-sqlite3 so the backend can run on
// Vercel serverless, where the filesystem is ephemeral and a local SQLite file
// would not persist between invocations.
//
//   - Production / Vercel : set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (remote).
//   - Local development   : no Turso env -> falls back to a local file
//                           (file:backend/westport.sqlite), same as before.
//   - Tests               : NODE_ENV=test -> in-memory (:memory:).
//
// better-sqlite3 is synchronous; libSQL is async. To keep the call-site churn
// small we expose a `db.prepare(sql)` shim whose `.get/.all/.run` are async and
// must be `await`ed. Module-level `const stmt = db.prepare(...)` still works
// because `prepare` itself is synchronous.
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(__dirname, 'schema.sql');

const tursoUrl = process.env.TURSO_DATABASE_URL || '';
const tursoToken = process.env.TURSO_AUTH_TOKEN || '';
const isTest = process.env.NODE_ENV === 'test';

// Resolve connection target. Remote wins when configured; otherwise local file
// (dev) or in-memory (test).
const url = isTest
  ? ':memory:'
  : tursoUrl || `file:${join(__dirname, 'westport.sqlite')}`;
const isRemote =
  url.startsWith('libsql://') || url.startsWith('https://') || url.startsWith('http://');

export const client = createClient(
  isRemote ? { url, authToken: tursoToken } : { url }
);

// Build clean plain objects from libSQL rows so callers can safely spread
// `{ ...row }` without leaking positional index keys.
function toPlain(row, columns) {
  if (!row) return undefined;
  const out = {};
  for (const c of columns) out[c] = row[c];
  return out;
}

function makeStmt(sql) {
  return {
    async get(...args) {
      const r = await client.execute({ sql, args });
      return toPlain(r.rows[0], r.columns);
    },
    async all(...args) {
      const r = await client.execute({ sql, args });
      return r.rows.map((row) => toPlain(row, r.columns));
    },
    async run(...args) {
      const r = await client.execute({ sql, args });
      return { changes: r.rowsAffected, lastInsertRowid: r.lastInsertRowid };
    },
  };
}

export const db = { prepare: makeStmt };

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export async function logEvent({ companyId, userId, event, payload }) {
  await client.execute({
    sql: 'INSERT INTO audit_log (company_id, user_id, event, payload, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [companyId ?? null, userId ?? null, event, payload ? JSON.stringify(payload) : null, nowSec()],
  });
}

// Strip PRAGMA lines (journal mode / foreign keys) — they are no-ops or invalid
// against a remote libSQL connection and are not needed there.
export function schemaStatements() {
  const raw = readFileSync(SCHEMA_PATH, 'utf8');
  return raw
    .split('\n')
    .filter((line) => !/^\s*PRAGMA\b/i.test(line))
    .join('\n');
}

export async function migrate() {
  await client.executeMultiple(schemaStatements());
}

// Auto-migrate for local file / in-memory targets so dev and tests need zero
// extra steps. For remote Turso run `pnpm db:push` once instead (keeps cold
// starts fast and avoids a migration round-trip on every serverless boot).
if (!isRemote) {
  await migrate();
}

export default db;
