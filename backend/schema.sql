-- FILE: backend/schema.sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS companies (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  sector       TEXT NOT NULL CHECK (sector IN ('nev','battery','robotics','solar','consumer','ai_hardware')),
  hq_city      TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  company_id   TEXT NOT NULL REFERENCES companies(id),
  email        TEXT,
  display_name TEXT,
  role         TEXT NOT NULL DEFAULT 'analyst',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY,
  company_id       TEXT NOT NULL REFERENCES companies(id),
  name             TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('battery_cell','battery_pack','ev','humanoid_robot','industrial_robot','solar_inverter','consumer_electronics','other')),
  spec             TEXT NOT NULL,
  target_country   TEXT NOT NULL DEFAULT 'EU',
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS analyses (
  id               TEXT PRIMARY KEY,
  company_id       TEXT NOT NULL REFERENCES companies(id),
  product_id       TEXT REFERENCES products(id),
  product_snapshot TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','complete','failed')),
  compliance_score INTEGER,
  total_cost_eur   INTEGER,
  weeks_to_launch  INTEGER,
  summary          TEXT,
  report           TEXT,
  error            TEXT,
  started_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  finished_at      INTEGER
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id  TEXT NOT NULL REFERENCES analyses(id),
  agent        TEXT NOT NULL CHECK (agent IN ('chemicals','electrical','carbon','orchestrator')),
  status       TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','complete','failed')),
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd     REAL,
  output       TEXT,
  error        TEXT,
  started_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  finished_at  INTEGER
);

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id   TEXT REFERENCES companies(id),
  user_id      TEXT REFERENCES users(id),
  event        TEXT NOT NULL,
  payload      TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_company   ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_company ON analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status  ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_analysis ON agent_runs(analysis_id);
