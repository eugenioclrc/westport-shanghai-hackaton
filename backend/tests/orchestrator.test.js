// FILE: backend/tests/orchestrator.test.js
// Stateless: no DB. Drive runAnalysis with a collecting emitter and assert the
// SSE event sequence + final report shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LLM_MOCK = '1';

const { runAnalysis } = await import('../services/orchestrator.js');

test('runAnalysis end-to-end in mock mode produces a complete report', async () => {
  const product = {
    name: 'TestCo BL-100',
    category: 'battery_cell',
    target_country: 'EU',
    manufacturer_hq: 'Hefei, China',
    materials: 'NMC811 cathode',
    electrical: '3.65V / 100Ah',
    battery: 'Prismatic',
    existing_certs: 'UN 38.3',
    annual_eu_volume: '10,000',
    notes: '',
  };

  const events = [];
  const emit = (e, d) => events.push({ e, d });
  const result = await runAnalysis({ productSnapshot: product, emit });

  assert.equal(result.ok, true);

  const seen = new Set(events.map((x) => x.e));
  assert.ok(seen.has('agent_start'));
  assert.ok(seen.has('agent_done'));
  assert.ok(seen.has('orchestrator_start'));
  assert.ok(seen.has('complete'));

  const completed = events.find((x) => x.e === 'complete').d;
  assert.ok(completed.score >= 0 && completed.score <= 100);
  assert.ok(completed.cost > 0);
  assert.ok(completed.weeks > 0);
  assert.equal(completed.agent_reports.length, 3);

  // Three specialists each emit exactly one agent_done.
  const doneAgents = events.filter((x) => x.e === 'agent_done').map((x) => x.d.agent);
  assert.deepEqual(new Set(doneAgents), new Set(['chemicals', 'electrical', 'carbon']));
});
