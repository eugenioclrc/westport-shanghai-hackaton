// FILE: config.js
const ENV = process.env.ENV || 'dev';

// Single provider: OpenRouter (Fusion auto-routing, OpenAI-compatible API).
// Set OPENROUTER_API_KEY in the environment. If it is missing, the backend
// falls back to deterministic mock responses so the UI still demos.
const openrouterKey = process.env.OPENROUTER_API_KEY || '';
const anthropicKey = ''; // kept only so legacy CONFIG.llm.apiKey reads ''.

const provider = 'openrouter';
const providerKey = openrouterKey;

const mock = process.env.LLM_MOCK === '1' || !providerKey;

// Model defaults (OpenRouter model IDs). Override with LLM_MODEL_AGENT /
// LLM_MODEL_ORCHESTRATOR. DeepSeek V3.1 is strong at forced tool calls, cheap,
// and available in-region (incl. mainland China). `openrouter/auto` is a safe
// fallback if a specific model is unavailable.
const defaults = {
  agent: 'deepseek/deepseek-chat-v3.1',
  orchestrator: 'deepseek/deepseek-chat-v3.1',
};

export const CONFIG = {
  env: ENV,
  isProd: ENV === 'prod',
  baseUrl: ENV === 'prod' ? 'https://api.westport.ai' : 'http://localhost:3000',
  llm: {
    provider,
    // legacy field kept so the llmClient Anthropic branch compiles (unused).
    apiKey: anthropicKey,
    // OpenRouter API key used by the OpenAI-compatible client.
    providerKey,
    // optional override for the OpenAI-compatible base URL.
    baseUrl: process.env.LLM_BASE_URL || '',
    openrouterKey,
    mock,
    models: {
      agent: process.env.LLM_MODEL_AGENT || defaults.agent,
      orchestrator: process.env.LLM_MODEL_ORCHESTRATOR || defaults.orchestrator,
    },
    maxTokens: 2400,
    temperature: 0.2,
  },
  agent: {
    timeoutMs: 45_000,
    maxConcurrency: 3,
  },
  server: {
    port: process.env.PORT || 3000,
    // `||` (not `??`) so an empty JWT_SECRET= line in .env still falls back.
    jwtSecret: process.env.JWT_SECRET || 'westport_dev_secret_CHANGE_IN_PROD',
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
