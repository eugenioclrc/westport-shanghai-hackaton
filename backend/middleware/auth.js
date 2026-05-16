// FILE: backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config.js';

export function signToken(payload) {
  return jwt.sign(payload, CONFIG.server.jwtSecret, { expiresIn: '30d' });
}

export function verifyToken(token) {
  return jwt.verify(token, CONFIG.server.jwtSecret);
}

// The app is stateless: there is no `analyses` row to point at. Instead,
// `POST /analyses` signs the product snapshot into a short-lived job token
// that doubles as the analysisId. The SSE stream endpoint verifies it and
// runs the orchestrator inline. 15-minute TTL covers any reasonable run.
export function signJobToken(payload) {
  return jwt.sign({ kind: 'job', ...payload }, CONFIG.server.jwtSecret, { expiresIn: '15m' });
}

export function verifyJobToken(token) {
  const decoded = jwt.verify(token, CONFIG.server.jwtSecret);
  if (decoded.kind !== 'job') {
    throw new Error('not a job token');
  }
  return decoded;
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
    req.email = decoded.email ?? null;
    req.displayName = decoded.displayName ?? 'Guest analyst';
    return next();
  } catch (_err) {
    return res.status(401).json({ ok: false, error: 'AUTH_REQUIRED', message: 'Invalid or expired token' });
  }
}

export default authMiddleware;
