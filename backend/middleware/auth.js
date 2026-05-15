// FILE: backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config.js';

export function signToken(payload) {
  return jwt.sign(payload, CONFIG.server.jwtSecret, { expiresIn: '30d' });
}

export function verifyToken(token) {
  return jwt.verify(token, CONFIG.server.jwtSecret);
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/);
  if (!match) {
    return res.status(401).json({ ok: false, error: 'AUTH_REQUIRED', message: 'Missing bearer token' });
  }
  try {
    const decoded = verifyToken(match[1]);
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.role = decoded.role || 'analyst';
    return next();
  } catch (_err) {
    return res.status(401).json({ ok: false, error: 'AUTH_REQUIRED', message: 'Invalid or expired token' });
  }
}

export default authMiddleware;
