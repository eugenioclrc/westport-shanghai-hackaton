// FILE: config.js
const ENV = process.env.ENV || 'dev';

const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
const openrouterKey = process.env.OPENROUTER_API_KEY || '';
const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
// DashScope is Alibaba Cloud's Qwen API endpoint. Accept both env names.
const qwenKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || '';
const orbitKey = process.env.ORBIT_API_KEY || '';

// Provider priority (auto-detect if LLM_PROVIDER not set):
//   1. LLM_PROVIDER env  (anthropic | openrouter | deepseek | qwen | orbit)
//   2. DEEPSEEK_API_KEY  -> deepseek           (Shanghai-friendly default)
//   3. DASHSCOPE_API_KEY -> qwen
//   4. ORBIT_API_KEY     -> orbit
//   5. OPENROUTER_API_KEY -> openrouter
//   6. ANTHROPIC_API_KEY  -> anthropic
//   7. fall through to mock
let provider = (process.env.LLM_PROVIDER || '').toLowerCase();
if (!provider) {
  if (deepseekKey) provider = 'deepseek';
  else if (qwenKey) provider = 'qwen';
  else if (orbitKey) provider = 'orbit';
  else if (openrouterKey) provider = 'openrouter';
  else if (anthropicKey) provider = 'anthropic';
  else provider = 'anthropic';
}

const providerKey = {
  anthropic: anthropicKey,
  openrouter: openrouterKey,
  deepseek: deepseekKey,
  qwen: qwenKey,
  orbit: orbitKey,
}[provider] || '';

const mock = process.env.LLM_MOCK === '1' || !providerKey;

// Model defaults per provider. Override with LLM_MODEL_AGENT / LLM_MODEL_ORCHESTRATOR.
const defaults = {
  anthropic: {
    agent: 'claude-haiku-4-5-20251001',
    orchestrator: 'claude-sonnet-4-6',
  },
  openrouter: {
    // openrouter/fusion = auto-routing meta-model across 300+ providers
    agent: 'openrouter/fusion',
    orchestrator: 'openrouter/fusion',
  },
  deepseek: {
    // DeepSeek-Chat handles tool use deterministically and ships from Hangzhou
    agent: 'deepseek-chat',
    orchestrator: 'deepseek-chat',
  },
  qwen: {
    // Qwen-Plus for agents (fast), Qwen-Max for orchestrator (highest reasoning)
    agent: 'qwen-plus',
    orchestrator: 'qwen-max',
  },
  orbit: {
    // Orbit relay is OpenAI-compatible. gpt-5.4 is shown in Orbit examples.
    agent: 'gpt-5.4',
    orchestrator: 'gpt-5.4',
  },
};

export const CONFIG = {
  env: ENV,
  isProd: ENV === 'prod',
  baseUrl: ENV === 'prod' ? 'https://api.westport.ai' : 'http://localhost:3000',
  llm: {
    provider,
    // legacy field kept so existing llmClient.js Anthropic branch reads ANTHROPIC_API_KEY
    apiKey: anthropicKey,
    // per-provider key used by the OAI-compatible client
    providerKey,
    // optional override for OpenAI-compatible gateways (e.g. Orbit relay).
    // If empty, each provider default URL is used.
    baseUrl: process.env.LLM_BASE_URL || process.env.ORBIT_BASE_URL || '',
    // kept for any caller still using these names
    openrouterKey,
    deepseekKey,
    qwenKey,
    orbitKey,
    mock,
    models: {
      agent: process.env.LLM_MODEL_AGENT || defaults[provider].agent,
      orchestrator: process.env.LLM_MODEL_ORCHESTRATOR || defaults[provider].orchestrator,
    },
    maxTokens: 2400,
    temperature: 0.2,
  },
  agent: {
    timeoutMs: 45_000,
    maxConcurrency: 3,
  },
  server: {
    port: process.env.PORT ?? 3000,
    jwtSecret: process.env.JWT_SECRET ?? 'westport_dev_secret_CHANGE_IN_PROD',
  },
};

// Refuse to boot in prod if JWT_SECRET is still the dev default. Demo / dev
// keeps the fake fallback so the hackathon judges don't trip over config.
if (CONFIG.isProd && CONFIG.server.jwtSecret === 'westport_dev_secret_CHANGE_IN_PROD') {
  // eslint-disable-next-line no-console
  console.error('[westport] FATAL: JWT_SECRET is still the dev default in prod. Set JWT_SECRET env var.');
  throw new Error('JWT_SECRET_REQUIRED_IN_PROD');
}

export default CONFIG;
