// FILE: backend/routes/auth.js
// Stateless demo auth. No user table: a guest seat is minted as a signed JWT
// and the identity lives entirely inside the token. Production would do
// SSO + RBAC against a real directory.
import express from 'express';
import { randomUUID } from 'node:crypto';
import { authLimiter } from '../middleware/rateLimit.js';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { COMPANY_BY_ID, DEFAULT_COMPANY_ID } from '../data/seed.js';

const router = express.Router();

router.post('/login', authLimiter, async (req, res) => {
  const { email, companyId } = req.body || {};
  const targetCompanyId = companyId || DEFAULT_COMPANY_ID;
  if (!COMPANY_BY_ID.has(targetCompanyId)) {
    return res.status(404).json({ ok: false, error: 'NOT_FOUND', message: 'Company not found' });
  }

  const id = `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const displayName = email ? email.split('@')[0] : 'Guest analyst';
  const token = signToken({
    userId: id,
    companyId: targetCompanyId,
    role: 'analyst',
    email: email ?? null,
    displayName,
  });
  return res.json({ ok: true, data: { token, userId: id, companyId: targetCompanyId } });
});

router.get('/me', authMiddleware, async (req, res) => {
  const company = COMPANY_BY_ID.get(req.companyId);
  return res.json({
    ok: true,
    data: {
      id: req.userId,
      company_id: req.companyId,
      company_name: company?.name,
      sector: company?.sector,
      email: req.email ?? null,
      display_name: req.displayName ?? 'Guest analyst',
      role: req.role,
    },
  });
});

export default router;
