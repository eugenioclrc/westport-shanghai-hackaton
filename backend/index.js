// FILE: backend/index.js
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authMiddleware } from './middleware/auth.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { CONFIG } from '../config.js';
import { chunkCount, regulationCount } from './services/ragCorpus.js';

import authRouter from './routes/auth.js';
import companiesRouter from './routes/companies.js';
import productsRouter from './routes/products.js';
import analysesRouter from './routes/analyses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  cors({
    origin: CONFIG.isProd ? 'https://westport.ai' : '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(globalLimiter);

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    data: {
      env: CONFIG.env,
      provider: CONFIG.llm.provider,
      mock: CONFIG.llm.mock,
      model_agent: CONFIG.llm.models.agent,
      model_orchestrator: CONFIG.llm.models.orchestrator,
      regulations: regulationCount(),
      corpus_chunks: chunkCount(),
      time: Date.now(),
    },
  })
);

// Serve the H5 demo from /public BEFORE the guarded routers so '/' hits index.html.
app.use(
  express.static(join(__dirname, '..', 'public'), {
    setHeaders(res) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    },
  })
);

app.use('/auth', authRouter);
// /analyses is mounted directly because GET /:id/stream uses query-token auth.
app.use('/analyses', analysesRouter);

const guarded = express.Router();
guarded.use(authMiddleware);
guarded.use('/companies', companiesRouter);
guarded.use('/products', productsRouter);
app.use(guarded);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'NOT_FOUND', message: `${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  // Server-side: log full error context. Client-side: only expose the message
  // for non-5xx errors. 5xx responses get a generic message in prod so we don't
  // leak stack traces / internals to an attacker.
  // eslint-disable-next-line no-console
  console.error('[westport] unhandled error', err);
  const safeMessage =
    status >= 500 && CONFIG.isProd
      ? 'Internal server error'
      : err.message || 'Unexpected error';
  res.status(status).json({
    ok: false,
    error: err.code || 'INTERNAL',
    message: safeMessage,
  });
});

// On Vercel the app is imported as a serverless handler (see api/index.js) and
// must NOT bind a port — Vercel manages the HTTP lifecycle. Only listen when
// running as a standalone process (local dev, `pnpm start`, tests).
if (!process.env.VERCEL) {
  const port = Number(CONFIG.server.port) || 3000;
  app.listen(port, () => {
    console.log(`[westport] API listening on :${port}`);
    console.log(`  env=${CONFIG.env} provider=${CONFIG.llm.provider} mock=${CONFIG.llm.mock}`);
    console.log(`  regulations=${regulationCount()} chunks=${chunkCount()}`);
    if (CONFIG.llm.mock) {
      console.log('  ⚠ LLM_MOCK enabled — agents will return canned responses.');
    }
  });
}

export default app;
