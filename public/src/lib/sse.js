// Thin EventSource wrapper that subscribes to all the named events our
// analyses stream emits and routes them through user-supplied handlers.
export function streamAnalysis({ analysisId, token, onEvent }) {
  const es = new EventSource(`/analyses/${analysisId}/stream?token=${encodeURIComponent(token)}`);

  const events = ['status', 'agent_start', 'agent_done', 'agent_failed', 'orchestrator_start', 'complete', 'failed', 'replay'];
  for (const e of events) {
    es.addEventListener(e, (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onEvent(e, data);
      } catch (_err) {
        onEvent(e, { raw: ev.data });
      }
    });
  }
  es.onerror = (err) => {
    onEvent('error', { error: 'stream error' });
  };

  return {
    close: () => es.close(),
  };
}
