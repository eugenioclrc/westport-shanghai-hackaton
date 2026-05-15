// FILE: backend/services/ragCorpus.js
// Loads the pre-baked EU-regulation corpus. The corpus is hand-curated rather
// than vector-retrieved because the agent→regulation mapping is fixed at three
// hard buckets (chemicals / electrical / carbon). At runtime we just slice the
// relevant chunks for each agent and join them into the system prompt.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_PATH = join(__dirname, '..', 'corpus', 'regulations.json');

let corpus = null;

function load() {
  if (corpus) return corpus;
  if (!existsSync(CORPUS_PATH)) {
    corpus = { regulations: {} };
    return corpus;
  }
  corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'));
  return corpus;
}

// Map of which regulations belong to which agent bucket. The corpus may include
// other regulations the orchestrator still cites in its summary.
const AGENT_BUCKETS = {
  chemicals:  ['reach_1907_2006', 'rohs_2011_65', 'battery_2023_1542_substances'],
  electrical: ['lvd_2014_35', 'emc_2014_30', 'red_2014_53', 'machinery_2023_1230', 'ai_act_2024_1689'],
  carbon:     ['battery_2023_1542_carbon', 'cbam_2023_956', 'weee_2012_19'],
};

export function chunksFor(agent) {
  const c = load();
  const keys = AGENT_BUCKETS[agent] || [];
  const out = [];
  for (const k of keys) {
    const reg = c.regulations?.[k];
    if (!reg) continue;
    for (const ch of (reg.chunks || [])) {
      out.push({
        regulation_id: k,
        regulation_title: reg.title,
        url: reg.url,
        chunk_id: ch.id,
        text: ch.text,
      });
    }
  }
  return out;
}

export function chunkCount() {
  const c = load();
  let n = 0;
  for (const reg of Object.values(c.regulations || {})) {
    n += (reg.chunks || []).length;
  }
  return n;
}

export function regulationCount() {
  const c = load();
  return Object.keys(c.regulations || {}).length;
}

export function chunksAsBlock(agent) {
  const lines = [];
  for (const ch of chunksFor(agent)) {
    lines.push(`<chunk regulation="${ch.regulation_id}" chunk="${ch.chunk_id}">`);
    lines.push(ch.text);
    lines.push(`</chunk>`);
    lines.push('');
  }
  return lines.join('\n');
}

export default { chunksFor, chunkCount, regulationCount, chunksAsBlock };
