// FILE: api/index.js
// Vercel serverless entrypoint. The Express app is itself a (req, res) handler,
// so we re-export it. `backend/index.js` skips `app.listen()` when
// process.env.VERCEL is set, letting Vercel own the HTTP lifecycle.
//
// All API routes are rewritten to this function via vercel.json; static
// frontend assets are served directly by Vercel from `public/`.
import app from '../backend/index.js';

export default app;
