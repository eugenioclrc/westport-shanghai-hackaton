// FILE: backend/tests/ragCorpus.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';

const rag = await import('../services/ragCorpus.js');

test('corpus loads with at least 7 regulations and 10+ chunks', () => {
  assert.ok(rag.regulationCount() >= 7, `expected ≥ 7 regulations, got ${rag.regulationCount()}`);
  assert.ok(rag.chunkCount() >= 10, `expected ≥ 10 chunks, got ${rag.chunkCount()}`);
});

test('chemicals bucket includes RoHS + REACH excerpts', () => {
  const chunks = rag.chunksFor('chemicals');
  const regs = new Set(chunks.map((c) => c.regulation_id));
  assert.ok(regs.has('rohs_2011_65'), 'chemicals should include RoHS');
  assert.ok(regs.has('reach_1907_2006'), 'chemicals should include REACH');
});

test('electrical bucket includes LVD and EMC excerpts', () => {
  const chunks = rag.chunksFor('electrical');
  const regs = new Set(chunks.map((c) => c.regulation_id));
  assert.ok(regs.has('lvd_2014_35'));
  assert.ok(regs.has('emc_2014_30'));
});

test('carbon bucket includes Battery Reg carbon chunks and CBAM', () => {
  const chunks = rag.chunksFor('carbon');
  const regs = new Set(chunks.map((c) => c.regulation_id));
  assert.ok(regs.has('battery_2023_1542_carbon'));
  assert.ok(regs.has('cbam_2023_956'));
});

test('chunksAsBlock returns parseable XML-ish blocks for an agent', () => {
  const block = rag.chunksAsBlock('chemicals');
  assert.ok(block.length > 200);
  assert.match(block, /<chunk regulation="rohs_2011_65"/);
});
