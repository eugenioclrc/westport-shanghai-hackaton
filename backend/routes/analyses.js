// FILE: backend/routes/analyses.js
// Stateless analyses. There is no database and no job queue:
//
//   POST /analyses            -> sign the product snapshot into a job token,
//                                return it as `analysisId`.
//   GET  /analyses/:id/stream -> verify the job token, run the orchestrator
//                                synchronously, stream SSE for the whole run.
//   GET  /analyses            -> [] (no history without persistence)
//   GET  /analyses/:id        -> 410 (reports are not retrievable after the
//                                stream closes; the client keeps them)
import express from 'express';
import { authMiddleware, verifyToken, signJobToken, verifyJobToken } from '../middleware/auth.js';
import { analysisLimiter } from '../middleware/rateLimit.js';
import { runAnalysis } from '../services/orchestrator.js';

const router = express.Router();

router.post('/', authMiddleware, analysisLimiter, async (req, res) => {
  const { product } = req.body || {};
  if (!product || !product.name || !product.category) {
    return res.status(400).json({ ok: false, error: 'INVALID_PARAMS', message: 'product { name, category, ... } required' });
  }
  // The job token IS the analysisId: it carries the snapshot, scoped to the
  // caller's company, with a 15-minute TTL.
  const analysisId = signJobToken({ companyId: req.companyId, productSnapshot: product });
  return res.json({ ok: true, data: { analysisId } });
});

// EventSource cannot set Authorization headers, so the stream accepts the JWT
// as a query param. `:id` is the job token from POST /analyses.
router.get('/:id/stream', async (req, res) => {
  try {
    verifyToken(String(req.query.token || ''));
  } catch (_err) {
    return res.status(401).end();
  }

  let job;
  try {
    job = verifyJobToken(req.params.id);
  } catch (_err) {
    return res.status(404).end();
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  function emit(event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Keepalive ping every 15 s so proxies don't drop the long-lived response.
  const keepalive = setInterval(() => res.write(': ping\n\n'), 15_000);
  req.on('close', () => clearInterval(keepalive));

  try {
    await runAnalysis({ productSnapshot: job.productSnapshot, emit });
  } catch (err) {
    emit('failed', { error: err.message });
  } finally {
    clearInterval(keepalive);
    res.end();
  }
});

// No persistence: no history, no after-the-fact report fetch. The client
// holds the report it received over the stream.
router.get('/', authMiddleware, (_req, res) => {
  return res.json({ ok: true, data: [] });
});

router.get('/:id', authMiddleware, (_req, res) => {
  return res.status(410).json({ ok: false, error: 'GONE', message: 'Reports are not stored; stateless mode' });
});

export default router;
