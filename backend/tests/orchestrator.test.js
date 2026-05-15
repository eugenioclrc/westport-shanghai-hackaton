// FILE: backend/tests/orchestrator.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LLM_MOCK = '1';

const orch = await import('../services/orchestrator.js');
const { default: db } = await import('../db.js');

function seedDemoCompany() {
  db.prepare(
    "INSERT OR IGNORE INTO companies (id, name, sector, hq_city, created_at) VALUES ('test_co', 'TestCo', 'battery', 'Hefei', unixepoch())"
  ).run();
}

test('runAnalysis end-to-end in mock mode produces a complete report', async () => {
  seedDemoCompany();
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
  const id = orch.createAnalysis({ companyId: 'test_co', productSnapshot: product });

  const events = [];
  const emit = (e, d) => events.push({ e, d });
  const result = await orch.runAnalysis({ analysisId: id, productSnapshot: product, emit });

  assert.equal(result.ok, true);
  const seen = new Set(events.map((x) => x.e));
  assert.ok(seen.has('agent_start'));
  assert.ok(seen.has('agent_done'));
  assert.ok(seen.has('orchestrator_start'));
  assert.ok(seen.has('complete'));

  const row = db.prepare('SELECT * FROM analyses WHERE id = ?').get(id);
  assert.equal(row.status, 'complete');
  assert.ok(row.compliance_score >= 0 && row.compliance_score <= 100);
  assert.ok(row.total_cost_eur > 0);
  assert.ok(row.weeks_to_launch > 0);

  const runs = db.prepare("SELECT agent, status FROM agent_runs WHERE analysis_id = ?").all(id);
  const byAgent = new Map(runs.map((r) => [r.agent, r.status]));
  assert.equal(byAgent.get('chemicals'), 'complete');
  assert.equal(byAgent.get('electrical'), 'complete');
  assert.equal(byAgent.get('carbon'), 'complete');
  assert.equal(byAgent.get('orchestrator'), 'complete');
});
