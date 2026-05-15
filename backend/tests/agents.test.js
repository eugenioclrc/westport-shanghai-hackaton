// FILE: backend/tests/agents.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.LLM_MOCK = '1';

const agents = await import('../services/agents.js');

test('chemicals agent returns findings for a battery cell product', async () => {
  const result = await agents.runAgent('chemicals', {
    name: 'Test cell',
    category: 'battery_cell',
    materials: 'NMC, graphite',
    target_country: 'EU',
  });
  assert.ok(Array.isArray(result.parsed.findings));
  assert.ok(result.parsed.findings.length >= 1);
  const f = result.parsed.findings[0];
  assert.ok(['high', 'medium', 'low'].includes(f.severity));
  assert.ok(typeof f.regulation === 'string');
  assert.ok(typeof f.estimated_cost_eur === 'number');
});

test('electrical agent returns CE-related findings', async () => {
  const result = await agents.runAgent('electrical', {
    name: 'Robot',
    category: 'humanoid_robot',
    target_country: 'EU',
  });
  const regs = result.parsed.findings.map((f) => f.regulation);
  assert.ok(regs.some((r) => /CE|LVD|EMC/i.test(r)));
});

test('carbon agent surfaces Battery Reg + CBAM gaps', async () => {
  const result = await agents.runAgent('carbon', {
    name: 'Battery pack',
    category: 'battery_pack',
    target_country: 'EU',
  });
  const regs = result.parsed.findings.map((f) => f.regulation).join(' ');
  assert.match(regs, /Battery|CBAM/);
});
