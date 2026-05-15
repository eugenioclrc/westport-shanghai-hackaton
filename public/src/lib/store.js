import { writable } from 'svelte/store';

// localStorage-backed writable so the demo survives page reloads on stage.
function persistent(key, initial) {
  let start = initial;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) start = JSON.parse(raw);
  } catch (_) { /* ignore */ }
  const w = writable(start);
  w.subscribe((v) => {
    try {
      if (typeof localStorage === 'undefined') return;
      if (v === null || v === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(v));
    } catch (_) { /* ignore quota / private-mode */ }
  });
  return w;
}

export const screen = persistent('wp:screen', 'landing'); // 'landing' | 'new' | 'running' | 'report' | 'history'
export const currentProduct = persistent('wp:currentProduct', null);
export const currentAnalysisId = persistent('wp:currentAnalysisId', null);
export const agentState = writable({
  chemicals:    { status: 'idle', findings: null, costUsd: 0, progress: null },
  electrical:   { status: 'idle', findings: null, costUsd: 0, progress: null },
  carbon:       { status: 'idle', findings: null, costUsd: 0, progress: null },
  orchestrator: { status: 'idle' },
});
export const lastReport = persistent('wp:lastReport', null);
export const health = writable(null);

export function resetAgents() {
  agentState.set({
    chemicals:    { status: 'idle', findings: null, costUsd: 0, progress: null },
    electrical:   { status: 'idle', findings: null, costUsd: 0, progress: null },
    carbon:       { status: 'idle', findings: null, costUsd: 0, progress: null },
    orchestrator: { status: 'idle' },
  });
}

export function go(s) { screen.set(s); }
