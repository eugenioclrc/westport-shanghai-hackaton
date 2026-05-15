// FILE: backend/routes/auth.js
import express from 'express';
import { randomUUID } from 'node:crypto';
import db, { nowSec } from '../db.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const findUserStmt = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUserStmt = db.prepare(
  'INSERT INTO users (id, company_id, email, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
);
const findCompanyStmt = db.prepare('SELECT * FROM companies WHERE id = ?');
const firstCompanyStmt = db.prepare('SELECT id FROM companies ORDER BY created_at ASC LIMIT 1');

router.post('/login', authLimiter, (req, res) => {
  // Demo-grade auth: any unauthenticated visitor gets a guest analyst seat in
  // the first seeded company. Production would do SSO + RBAC.
  const { email, companyId } = req.body || {};
  let targetCompanyId = companyId || firstCompanyStmt.get()?.id;
  if (!targetCompanyId) {
    return res.status(500).json({ ok: false, error: 'NO_COMPANY', message: 'No companies seeded' });
  }
  if (!findCompanyStmt.get(targetCompanyId)) {
    return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Company not found' });
  }

  const id = `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  insertUserStmt.run(id, targetCompanyId, email ?? null, email ? email.split('@')[0] : 'Guest analyst', 'analyst', nowSec());

  const token = signToken({ userId: id, companyId: targetCompanyId, role: 'analyst' });
  return res.json({
    ok: true,
    data: { token, userId: id, companyId: targetCompanyId },
  });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = findUserStmt.get(req.userId);
  if (!user) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  const company = findCompanyStmt.get(user.company_id);
  return res.json({
    ok: true,
    data: {
      id: user.id,
      company_id: user.company_id,
      company_name: company?.name,
      sector: company?.sector,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    },
  });
});

export default router;
