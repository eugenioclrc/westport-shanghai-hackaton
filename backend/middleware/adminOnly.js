// FILE: backend/middleware/adminOnly.js
import db from '../db.js';

const getRoleStmt = db.prepare('SELECT role FROM users WHERE id = ?');

export async function adminOnly(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ ok: false, error: 'AUTH_REQUIRED', message: 'Login required' });
  }
  const row = await getRoleStmt.get(req.userId);
  if (!row || row.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'FORBIDDEN', message: 'Admin role required' });
  }
  req.role = 'admin';
  return next();
}

export default adminOnly;
