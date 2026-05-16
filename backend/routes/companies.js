// FILE: backend/routes/companies.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

const listStmt = db.prepare('SELECT id, name, sector, hq_city FROM companies ORDER BY created_at ASC');
const getStmt = db.prepare('SELECT * FROM companies WHERE id = ?');

router.get('/', async (_req, res) => {
  return res.json({ ok: true, data: await listStmt.all() });
});

router.get('/:id', async (req, res) => {
  const row = await getStmt.get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  return res.json({ ok: true, data: row });
});

export default router;
