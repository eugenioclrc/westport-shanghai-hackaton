// FILE: backend/routes/analyses.js
// POST /analyses              start an analysis, return id
// GET  /analyses/:id/stream   SSE: agent_start / agent_done / orchestrator_start / complete / failed
// GET  /analyses              list past analyses for the company
// GET  /analyses/:id          fetch a finished analysis (report JSON)
import express from 'express';
import db from '../db.js';
import { authMiddleware, verifyToken } from '../middleware/auth.js';
import { analysisLimiter } from '../middleware/rateLimit.js';
import { createAnalysis, runAnalysis } from '../services/orchestrator.js';

const router = express.Router();

const getAnalysisStmt = db.prepare('SELECT * FROM analyses WHERE id = ? AND company_id = ?');
const listForCompanyStmt = db.prepare(
  'SELECT id, product_id, status, compliance_score, total_cost_eur, weeks_to_launch, summary, started_at, finished_at FROM analyses WHERE company_id = ? ORDER BY started_at DESC LIMIT 50'
);
const claimQueuedAnalysisStmt = db.prepare(
  "UPDATE analyses SET status = 'running' WHERE id = ? AND company_id = ? AND status = 'queued'"
);

router.post('/', authMiddleware, analysisLimiter, (req, res) => {
  const { product, productId } = req.body || {};
  if (!product || !product.name || !product.category) {
    return res.status(400).json({ ok: false, error: 'INVALID_PARAMS', message: 'product { name, category, ... } required' });
  }
  const id = createAnalysis({
    companyId: req.companyId,
    productId: productId ?? null,
    productSnapshot: product,
  });
  return res.json({ ok: true, data: { analysisId: id } });
});

// EventSource cannot set Authorization headers, so the stream endpoint accepts
// the JWT as a query-string param. The token is short-lived and scoped to a
// company; acceptable for the demo.
router.get('/:id/stream', (req, res) => {
  const token = String(req.query.token || '');
  let companyId;
  try {
    const decoded = verifyToken(token);
    companyId = decoded.companyId;
  } catch (_err) {
    return res.status(401).end();
  }

  const analysis = getAnalysisStmt.get(req.params.id, companyId);
  if (!analysis) return res.status(404).end();

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

  function sendComplete(row) {
    const report = JSON.parse(row.report);
    emit('replay', { status: 'complete', report });
    emit('complete', {
      analysisId: row.id,
      score: row.compliance_score,
      summary: row.summary,
      weeks: row.weeks_to_launch,
      cost: row.total_cost_eur,
      ...report,
    });
    return res.end();
  }

  // Keepalive ping every 15 s
  const keepalive = setInterval(() => res.write(': ping\n\n'), 15_000);
  req.on('close', () => clearInterval(keepalive));

  if (analysis.status === 'complete') {
    return sendComplete(analysis);
  }
  if (analysis.status === 'failed') {
    emit('failed', { error: analysis.error || 'unknown' });
    return res.end();
  }

  // Exactly one stream request claims and executes a queued analysis.
  // Followers attach to the stream and wait for terminal status.
  const claimed = claimQueuedAnalysisStmt.run(req.params.id, companyId).changes === 1;
  if (claimed) {
    const productSnapshot = JSON.parse(analysis.product_snapshot);
    runAnalysis({ analysisId: analysis.id, productSnapshot, emit })
      .then(() => {
        clearInterval(keepalive);
        res.end();
      })
      .catch((err) => {
        emit('failed', { error: err.message });
        clearInterval(keepalive);
        res.end();
      });
    return;
  }

  emit('status', { status: 'running', analysisId: analysis.id });
  const followTimer = setInterval(() => {
    const latest = getAnalysisStmt.get(req.params.id, companyId);
    if (!latest) {
      emit('failed', { error: 'NOT_FOUND' });
      clearInterval(followTimer);
      clearInterval(keepalive);
      return res.end();
    }
    if (latest.status === 'complete') {
      clearInterval(followTimer);
      clearInterval(keepalive);
      return sendComplete(latest);
    }
    if (latest.status === 'failed') {
      emit('failed', { error: latest.error || 'unknown' });
      clearInterval(followTimer);
      clearInterval(keepalive);
      return res.end();
    }
  }, 1000);
  req.on('close', () => clearInterval(followTimer));
});

router.get('/', authMiddleware, (req, res) => {
  return res.json({ ok: true, data: listForCompanyStmt.all(req.companyId) });
});

router.get('/:id', authMiddleware, (req, res) => {
  const row = getAnalysisStmt.get(req.params.id, req.companyId);
  if (!row) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
  return res.json({
    ok: true,
    data: {
      ...row,
      product_snapshot: JSON.parse(row.product_snapshot),
      report: row.report ? JSON.parse(row.report) : null,
    },
  });
});

export default router;
