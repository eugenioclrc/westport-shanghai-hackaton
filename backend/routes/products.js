// FILE: backend/routes/products.js
import express from 'express';
import { randomUUID } from 'node:crypto';
import db, { nowSec } from '../db.js';

const router = express.Router();

const listForCompanyStmt = db.prepare(
  'SELECT id, name, category, target_country, created_at FROM products WHERE company_id = ? ORDER BY created_at DESC'
);
const getStmt = db.prepare('SELECT * FROM products WHERE id = ? AND company_id = ?');
const listSamplesStmt = db.prepare(
  "SELECT id, name, category, target_country, spec FROM products WHERE company_id = 'demo' ORDER BY created_at ASC"
);
const insertStmt = db.prepare(
  'INSERT INTO products (id, company_id, name, category, spec, target_country, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);

router.get('/', (req, res) => {
  return res.json({ ok: true, data: listForCompanyStmt.all(req.companyId) });
});

router.get('/samples', (_req, res) => {
  const rows = listSamplesStmt.all().map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    target_country: r.target_country,
    spec: JSON.parse(r.spec),
  }));
  return res.json({ ok: true, data: rows });
});

router.get('/:id', (req, res) => {
  const row = getStmt.get(req.params.id, req.companyId) || getStmt.get(req.params.id, 'demo');
  if (!row) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  return res.json({ ok: true, data: { ...row, spec: JSON.parse(row.spec) } });
});

router.post('/', (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.category) {
    return res.status(400).json({ ok: false, error: 'INVALID_PARAMS', message: 'name and category required' });
  }
  const id = `prd_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  insertStmt.run(
    id,
    req.companyId,
    b.name,
    b.category,
    JSON.stringify(b.spec ?? {}),
    b.target_country ?? 'EU',
    nowSec()
  );
  return res.json({ ok: true, data: { id } });
});

export default router;
