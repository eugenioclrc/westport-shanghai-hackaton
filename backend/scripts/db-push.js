// FILE: backend/scripts/db-push.js
// One-time schema push for remote Turso. Run once after creating the database
// (and any time schema.sql changes):
//
//   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm db:push
//
// All statements are CREATE ... IF NOT EXISTS, so this is idempotent. Local
// dev / tests auto-migrate on import and do not need this.
import { migrate, client } from '../db.js';

try {
  await migrate();
  const { rows } = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  console.log('[db:push] schema applied. Tables:', rows.map((r) => r.name).join(', '));
  process.exit(0);
} catch (err) {
  console.error('[db:push] failed:', err);
  process.exit(1);
}
