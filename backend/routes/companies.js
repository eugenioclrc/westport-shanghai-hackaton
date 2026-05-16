// FILE: backend/routes/companies.js
// Static company directory (no database).
import express from 'express';
import { COMPANIES, COMPANY_BY_ID } from '../data/seed.js';

const router = express.Router();

router.get('/', (_req, res) => {
  return res.json({ ok: true, data: COMPANIES });
});

router.get('/:id', (req, res) => {
  const row = COMPANY_BY_ID.get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  return res.json({ ok: true, data: row });
});

export default router;
