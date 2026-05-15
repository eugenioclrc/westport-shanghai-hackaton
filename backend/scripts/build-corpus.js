// FILE: backend/scripts/build-corpus.js
// Validates the hand-curated regulation corpus and prints a summary. (We do
// NOT auto-fetch EUR-Lex during builds — corpus is committed to the repo so
// the demo never depends on the network. If you want to refresh, edit
// backend/corpus/regulations.json by hand.)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_PATH = join(__dirname, '..', 'corpus', 'regulations.json');

const corpus = JSON.parse(readFileSync(CORPUS_PATH, 'utf8'));
const regulations = corpus.regulations || {};

let chunkCount = 0;
let totalChars = 0;
const errors = [];

for (const [id, reg] of Object.entries(regulations)) {
  if (!reg.title) errors.push(`${id}: missing title`);
  if (!reg.url)   errors.push(`${id}: missing URL`);
  if (!Array.isArray(reg.chunks)) errors.push(`${id}: chunks not an array`);
  for (const ch of reg.chunks || []) {
    if (!ch.id || !ch.text) errors.push(`${id}: chunk missing id/text`);
    chunkCount += 1;
    totalChars += (ch.text || '').length;
  }
}

if (errors.length) {
  console.error('[corpus] errors:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}

console.log('[corpus] ok');
console.log('  regulations :', Object.keys(regulations).length);
console.log('  chunks      :', chunkCount);
console.log('  total chars :', totalChars.toLocaleString());
console.log('  avg chunk   :', Math.round(totalChars / Math.max(1, chunkCount)), 'chars');
writeFileSync(CORPUS_PATH, JSON.stringify(corpus, null, 2));
console.log('[corpus] normalized JSON written back to', CORPUS_PATH);
