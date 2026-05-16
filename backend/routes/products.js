// FILE: backend/routes/products.js
// Stateless products. The sample library is static; user products are not
// persisted (the analysis flow passes the product snapshot inline).
import express from 'express';
import { randomUUID } from 'node:crypto';
import { SAMPLE_PRODUCTS, SAMPLE_BY_ID } from '../data/seed.js';

const router = express.Router();

// No persistence -> a company has no saved products of its own.
router.get('/', (_req, res) => {
  return res.json({ ok: true, data: [] });
});

router.get('/samples', (_req, res) => {
  const rows = SAMPLE_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    target_country: p.target_country,
    spec: p.spec,
  }));
  return res.json({ ok: true, data: rows });
});

router.get('/:id', (req, res) => {
  const row = SAMPLE_BY_ID.get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  return res.json({ ok: true, data: { ...row, spec: row.spec } });
});

// Accepted for API compatibility but not stored: the caller should send the
// product snapshot directly to POST /analyses.
router.post('/', (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.category) {
    return res.status(400).json({ ok: false, error: 'INVALID_PARAMS', message: 'name and category required' });
  }
  const id = `prd_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  return res.json({ ok: true, data: { id } });
});

export default router;
