## And the link to the vercel

https://westport-shanghai-hackaton.vercel.app/

# WestPort.ai

> AI-powered EU compliance for Chinese hardware startups. Drop in your product
> spec -> three specialist agents read EU regulations in parallel -> get a
> prioritized compliance roadmap with cost estimate, timeline, and
> notified-body shortlist in about 90 seconds.

Built for the **Shanghai International Hackathon 2026** (May 16, 1:00 PM
deadline).

## What it does

Chinese NEV / battery / robotics / solar startups are expanding into Europe
faster than ever - China's total outbound direct investment was **$174.4B in
2025**, with deal value in Europe at **$13.8B**. The catch: every EV battery
cell needs CE, RoHS, REACH, the EU Battery Regulation 2023/1542 (Digital
Product Passport + carbon footprint + due diligence + recyclate %), CBAM,
the Machinery Regulation, WEEE... 600+ pages of English-legal regulation that
takes a €25k-100k EU consultant quarter to navigate.

WestPort.ai compresses that into **about a 90-second AI run that costs ~$0.20 in
tokens**:

1. **Drop in a product spec** (materials, electrical specs, battery details,
   target country).
2. **Three specialist Claude Haiku 4.5 agents read in parallel** - Chemicals
   (RoHS, REACH, Battery Reg substances), Electrical (CE, LVD, EMC, RED,
   Machinery, AI Act), Carbon (Battery Reg 2023/1542, CBAM, WEEE).
3. **A Claude Sonnet 4.6 orchestrator** merges the three reports, dedupes
   findings, scores compliance 0-100, prioritizes the top 8-10 actions, and
   shortlists EU notified bodies (TÜV SÜD, DEKRA, Bureau Veritas, SGS...).
4. **The Svelte web UI streams progress** via Server-Sent Events and renders a
   board-ready PDF-style roadmap.

## ICP

- **Customer:** Chinese hardware startups, Seed-Series B, $500K-$50M ARR,
  10-500 employees.
- **Target market:** EU first; US/Canada/UK on the roadmap.
- **Buyer:** VP International, Compliance Officer, founder.
- **Wedge sector:** EV battery cell + pack (highest M&A activity, 2026).

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Node 20+ / Express 5 / better-sqlite3 11 / JWT |
| AI | `@anthropic-ai/sdk` 0.32.1 - Haiku 4.5 (agents) + Sonnet 4.6 (orchestrator) |
| Streaming | Server-Sent Events (`text/event-stream`) over Express |
| RAG | Pre-baked JSON corpus of 24 hand-curated EU-regulation excerpts |
| Frontend | Svelte + Vite, compiled to static assets served by Express |
| Pkg mgr | pnpm 9.1.0 |

39 source files. No Taro / mini-program build needed.

## Quick start

```bash
pnpm install
pnpm build
pnpm seed
pnpm start                  # API + compiled web app on :3000
# open http://localhost:3000/
```

The demo works out of the box in **mock mode** - three agents return curated
realistic JSON, no API key needed. To run real LLM inference, pick a provider:

```bash
# Option A - DeepSeek (Hangzhou, default for Shanghai demos)
export DEEPSEEK_API_KEY=sk-...
pnpm start

# Option B - Qwen / Tongyi Qianwen via Alibaba DashScope
export DASHSCOPE_API_KEY=sk-...        # also accepts QWEN_API_KEY
pnpm start

# Option C - OpenRouter Fusion (auto-router across 300+ models)
export OPENROUTER_API_KEY=sk-or-...
pnpm start

# Option D - Anthropic Claude Haiku 4.5 + Sonnet 4.6
export ANTHROPIC_API_KEY=sk-ant-...
pnpm start

# Option E - Orbit Space API Relay (OpenAI-compatible)
export ORBIT_API_KEY=sk-orbit-...
pnpm start

# Force a specific provider / model
export LLM_PROVIDER=deepseek            # anthropic | openrouter | deepseek | qwen | orbit
export LLM_MODEL_AGENT=deepseek-chat
export LLM_MODEL_ORCHESTRATOR=deepseek-chat

# Optional: override any OpenAI-compatible base URL
export LLM_BASE_URL=https://api.orbitai.global/v1
```

WestPort.ai is provider-agnostic. The OpenAI-compatible providers go through an
OpenAI-compatible `/chat/completions` call (Anthropic uses its SDK
equivalent) with strict function-calling, so the same tool schema enforces
deterministic JSON output everywhere - judges can run the demo on
**DeepSeek-Chat or Qwen-Max** without changing a line of agent code, and the
status pill on the landing page shows the live provider.

## Deploy to Vercel

The backend runs as a single Vercel serverless function (`api/index.js` wraps
the Express app); the Svelte frontend is built to `public/` and served as
static assets. SQLite is replaced by **Turso** (libSQL) because Vercel's
filesystem is ephemeral — a local `.sqlite` file would not persist.

```bash
# 1. Create a Turso database and grab credentials
turso db create westport
turso db show westport --url            # -> TURSO_DATABASE_URL
turso db tokens create westport         # -> TURSO_AUTH_TOKEN

# 2. Push the schema once (idempotent: all CREATE ... IF NOT EXISTS)
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm db:push

# 3. Seed demo company + sample products
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... pnpm seed

# 4. Deploy
vercel --prod
```

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `TURSO_DATABASE_URL` | yes | `libsql://...` from `turso db show` |
| `TURSO_AUTH_TOKEN` | yes | from `turso db tokens create` |
| `JWT_SECRET` | yes | app refuses to boot in prod with the dev default |
| `ENV` | yes | set to `prod` |
| one LLM key | optional | `ANTHROPIC_API_KEY` / `DEEPSEEK_API_KEY` / etc. Omit + set `LLM_MOCK=1` for a key-free demo |

Notes:

- `vercel.json` sets `maxDuration: 300` for the analysis function. A full
  multi-agent run can take 1–3 min, so this requires a **Vercel Pro** plan
  with Fluid Compute. On Hobby (60 s cap) long live analyses are truncated —
  run with `LLM_MOCK=1` for a reliable demo there.
- No Turso env locally → the app falls back to the bundled file DB and
  auto-migrates on boot, so `pnpm start` works exactly as before.

## Project structure

```
westport-ai/
├── config.js                    ENV + model + API key
├── package.json
├── backend/
│   ├── schema.sql               6 tables: companies, users, products,
│   │                            analyses, agent_runs, audit_log
│   ├── db.js                    better-sqlite3 singleton, WAL
│   ├── index.js                 Express bootstrap, CORS, static, routers
│   ├── seed.js                  3 demo companies + 2 sample products
│   ├── middleware/              auth (JWT), adminOnly, rateLimit
│   ├── services/
│   │   ├── llmClient.js         Anthropic SDK wrapper + mock responses
│   │   ├── ragCorpus.js         Loads + buckets the regulation corpus
│   │   ├── agents.js            3 specialist agents w/ tool-use JSON output
│   │   └── orchestrator.js      Parallel runner + Sonnet merge + SSE emitter
│   ├── routes/                  auth, companies, products, analyses
│   ├── corpus/regulations.json  24 hand-curated EU-regulation excerpts
│   ├── scripts/build-corpus.js  Validates + normalises the corpus
│   └── tests/                   node:test - agents / orchestrator / ragCorpus
├── frontend/                    Vite + Svelte source app
│   ├── index.html
│   └── src/
│       ├── App.svelte           Screen router
│       ├── screens/
│       │   ├── Landing.svelte
│       │   ├── NewAnalysis.svelte
│       │   ├── Running.svelte
│       │   ├── Report.svelte
│       │   └── History.svelte
│       └── lib/
│           ├── api.js           fetch wrapper
│           ├── sse.js           EventSource wrapper
│           ├── store.js         Svelte writables
│           ├── Icon.svelte
│           ├── AgentStreamCard.svelte
│           ├── ProgressRing.svelte
│           ├── Sparkline.svelte
│           ├── SeverityPill.svelte
│           └── StatTile.svelte
└── public/                      Vite build output served by Express
    ├── index.html
    └── assets/
```

## API

| Method | Path | Auth | What |
| --- | --- | --- | --- |
| GET  | `/health` | none | env + LLM provider + corpus stats |
| POST | `/auth/login` | none | issue guest JWT scoped to first company |
| GET  | `/auth/me` | JWT | current user + company |
| GET  | `/companies` | JWT | list companies |
| GET  | `/products` | JWT | products for current company |
| GET  | `/products/samples` | JWT | demo sample products |
| POST | `/products` | JWT | upload a custom product spec |
| POST | `/analyses` | JWT | start an analysis, return `analysisId` |
| GET  | `/analyses/:id/stream?token=...` | query-token | SSE: `agent_start`, `agent_done`, `orchestrator_start`, `complete`, `failed` |
| GET  | `/analyses` | JWT | history list |
| GET  | `/analyses/:id` | JWT | full analysis with report |

EventSource cannot set the `Authorization` header, so the stream endpoint
accepts the same JWT as a query parameter. The token is short-lived and
company-scoped - acceptable for a demo.

## Agents

| Agent | Model | Regulations | Output |
| --- | --- | --- | --- |
| `chemicals`    | Haiku 4.5 | RoHS, REACH, Battery Reg Art. 6 | findings: substance flags, missing FMDs, SCIP notifications |
| `electrical`   | Haiku 4.5 | LVD, EMC, RED, Machinery, AI Act | findings: CE module path, harmonised standards, EU test labs |
| `carbon`       | Haiku 4.5 | Battery Reg 7+8+48+77, CBAM, WEEE | findings: PEF LCA, DPP fields, recyclate %, CBAM declarant |
| `orchestrator` | Sonnet 4.6 | n/a - reads all 3 agent reports | score 0-100, top 8 actions, notified-body shortlist, summary |

Each agent uses Anthropic's `tool_use` with a strict JSON schema so the
output is deterministic. The findings always cite a specific article / annex
from the regulation excerpts we injected into the system prompt - never
hallucinated.

## EU regulation corpus

`backend/corpus/regulations.json` is hand-curated, not vector-retrieved. Why:
the agent -> regulation mapping is fixed at three buckets, the corpus is small
(<1 MB), and a deliberate corpus is easier for judges to audit. To refresh
the excerpts, edit the file by hand and run `pnpm corpus:build` (validates +
normalises).

11 regulations · 24 chunks · ~6,000 words:

- RoHS 2011/65/EU · REACH 1907/2006 · Battery Reg 2023/1542 (substances)
- LVD 2014/35/EU · EMC 2014/30/EU · RED 2014/53/EU
- Machinery Regulation 2023/1230 · AI Act 2024/1689
- Battery Reg 2023/1542 (carbon + DPP + due diligence) · CBAM 2023/956 · WEEE 2012/19/EU

## Tests

```bash
pnpm test
```

9 tests passing:

- `ragCorpus.test.js` - corpus loads, three buckets resolve to expected regs
- `agents.test.js`   - each agent emits valid findings in mock mode
- `orchestrator.test.js` - end-to-end mock run persists a complete report

Tests use in-memory SQLite + `LLM_MOCK=1` so they run in <100 ms with no
external dependencies.

## Unit economics

| | WestPort.ai | EU compliance consultant |
| --- | --- | --- |
| Per-analysis cost | **€0.20** in tokens (Haiku + Sonnet, ~25k tokens) | €25,000-100,000 / quarter |
| Time to roadmap | **about 90 seconds** | 2-6 weeks |
| Reproducibility | 100% (same spec -> same roadmap) | depends on consultant |
| Coverage | Always reads the latest excerpts in the corpus | depends on consultant |

## Roadmap

- **Now**: EU compliance for battery / EV / robotics / solar inverters.
- **Q3 2026**: US (TSCA, CPSC, FCC), Canada (IC), UK (UKCA).
- **Q4 2026**: PDF spec upload (CAD bills of material, datasheets).
- **2027**: Sales channel module (EU distributor + retailer matchmaker),
  partner-portal integrations with notified bodies.

## License

Built for Shanghai International Hackathon 2026 - internal use only.
