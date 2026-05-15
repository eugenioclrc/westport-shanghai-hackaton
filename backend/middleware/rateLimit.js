// FILE: backend/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

const json429 = (req, res /* , next */) => {
  res.status(429).json({ ok: false, error: 'RATE_LIMITED', message: 'Too many requests, slow down.' });
};

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

// LLM analyses are expensive (3 agents + 1 orchestrator). Cap per-IP starts so
// a single visitor cannot drain provider quota in the live demo.
export const analysisLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
});

export default { globalLimiter, authLimiter, paymentLimiter, analysisLimiter };
