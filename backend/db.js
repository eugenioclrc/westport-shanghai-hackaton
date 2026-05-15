// FILE: backend/db.js
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.NODE_ENV === 'test' ? ':memory:' : join(__dirname, 'westport.sqlite');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

export const db = new Database(DB_PATH);
if (DB_PATH !== ':memory:') db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const runMulti = db['exec'].bind(db);
runMulti(readFileSync(SCHEMA_PATH, 'utf8'));

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function logEvent({ companyId, userId, event, payload }) {
  db.prepare(
    'INSERT INTO audit_log (company_id, user_id, event, payload, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(companyId ?? null, userId ?? null, event, payload ? JSON.stringify(payload) : null, nowSec());
}

export default db;
