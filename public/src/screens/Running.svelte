<script>
  import { onMount, onDestroy } from 'svelte';
  import api from '../lib/api.js';
  import { streamAnalysis } from '../lib/sse.js';
  import { screen, currentProduct, currentAnalysisId, agentState, lastReport } from '../lib/store.js';
  import AgentStreamCard from '../lib/AgentStreamCard.svelte';
  import Icon from '../lib/Icon.svelte';

  let stream = null;
  let elapsed = 0;
  let timer = null;
  let orchActive = false;
  let error = null;

  onMount(() => {
    const id = $currentAnalysisId;
    const token = api.getToken();
    if (!id || !token) {
      screen.set('landing');
      return;
    }

    timer = setInterval(() => { elapsed += 1; }, 1000);

    stream = streamAnalysis({
      analysisId: id,
      token,
      onEvent: (event, data) => {
        if (event === 'agent_start') {
          agentState.update((s) => ({ ...s, [data.agent]: { ...s[data.agent], status: 'running', progress: 'Loading regulation excerpts…' } }));
        } else if (event === 'agent_progress') {
          agentState.update((s) => ({ ...s, [data.agent]: { ...s[data.agent], progress: data.message } }));
        } else if (event === 'agent_done') {
          agentState.update((s) => ({
            ...s,
            [data.agent]: { status: 'complete', findings: data.findings, costUsd: data.costUsd, progress: null },
          }));
        } else if (event === 'agent_failed') {
          agentState.update((s) => ({
            ...s,
            [data.agent]: { status: 'failed', findings: null, costUsd: 0 },
          }));
        } else if (event === 'orchestrator_start') {
          orchActive = true;
        } else if (event === 'complete') {
          lastReport.set(data);
          if (stream) stream.close();
          if (timer) clearInterval(timer);
          screen.set('report');
        } else if (event === 'failed') {
          error = data.error || 'Analysis failed';
        }
      },
    });
  });

  onDestroy(() => {
    if (stream) stream.close();
    if (timer) clearInterval(timer);
  });

  function abort() {
    if (stream) stream.close();
    screen.set('landing');
  }
</script>

<div class="screen">
  <div class="topbar">
    <button class="iconbtn" on:click={abort}>
      <Icon name="x" size={16} stroke="var(--text)" />
    </button>
    <div class="topbar-title">Running compliance analysis</div>
    <div class="elapsed mono num">{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}</div>
  </div>

  <div class="hero">
    <div class="hero-icon">
      <div class="hero-pulse"></div>
      <Icon name="spark" size={30} stroke="var(--accent)" strokeWidth={2}/>
    </div>
    <h1>Scanning EU obligations</h1>
    <p class="sub">Three specialist agents working in parallel. Orchestrator merge on completion. ETA 12–30s.</p>
  </div>

  <div class="agents">
    <AgentStreamCard
      title="Chemicals agent"
      subtitle="RoHS · REACH · Battery Reg substances"
      icon="beaker"
      accent="#84B5FF"
      status={$agentState.chemicals.status}
      findings={$agentState.chemicals.findings}
      costUsd={$agentState.chemicals.costUsd}
      progress={$agentState.chemicals.progress}
      runningLabel="Checking substance restrictions…"
      idleLabel="Queued · substances"
    />
    <AgentStreamCard
      title="Electrical agent"
      subtitle="CE · LVD · EMC · RED · Machinery · AI Act"
      icon="bolt"
      accent="#FFC371"
      status={$agentState.electrical.status}
      findings={$agentState.electrical.findings}
      costUsd={$agentState.electrical.costUsd}
      progress={$agentState.electrical.progress}
      runningLabel="Mapping CE pathway…"
      idleLabel="Queued · CE / EMC"
    />
    <AgentStreamCard
      title="Carbon agent"
      subtitle="Battery Reg 2023/1542 · CBAM · WEEE · DPP"
      icon="leaf"
      accent="#2EC4B6"
      status={$agentState.carbon.status}
      findings={$agentState.carbon.findings}
      costUsd={$agentState.carbon.costUsd}
      progress={$agentState.carbon.progress}
      runningLabel="Estimating DPP &amp; CBAM readiness…"
      idleLabel="Queued · carbon / DPP"
    />
  </div>

  {#if orchActive}
    <div class="orch">
      <div class="orch-dot"></div>
      <span>Prioritizing launch blockers into roadmap…</span>
    </div>
  {/if}

  {#if error}
    <div class="err">
      <strong>Analysis failed:</strong> {error}
      <button on:click={abort}>Back</button>
    </div>
  {/if}
</div>

<style>
  .screen { max-width: 720px; margin: 0 auto; padding: 22px 22px 56px; }
  .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .topbar-title { flex: 1; text-align: center; font-size: 15px; color: var(--muted); }
  .elapsed {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 13px;
    color: var(--accent);
  }
  .iconbtn {
    width: 36px; height: 36px; border-radius: 999px;
    background: var(--surface); border: 1px solid var(--border);
    display: grid; place-items: center; cursor: pointer;
  }

  .hero {
    text-align: center; margin-bottom: 28px;
    display: flex; flex-direction: column; align-items: center;
  }
  .hero-icon {
    width: 72px; height: 72px; border-radius: 999px;
    background: rgba(46,196,182,0.10);
    border: 1px solid rgba(46,196,182,0.30);
    display: grid; place-items: center;
    margin-bottom: 14px;
    position: relative;
  }
  .hero-pulse {
    position: absolute; inset: 0; border-radius: 999px;
    border: 1px solid var(--accent);
    animation: pulse 2s ease-out infinite;
  }
  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.015em; margin: 0; }
  .sub { margin: 6px 0 0; color: var(--muted); font-size: 13.5px; }

  .agents { display: flex; flex-direction: column; gap: 12px; }
  .orch {
    margin-top: 20px;
    display: flex; align-items: center; gap: 10px; justify-content: center;
    color: var(--muted); font-size: 13px;
    background: rgba(46,196,182,0.04);
    border: 1px solid rgba(46,196,182,0.18);
    border-radius: 12px;
    padding: 12px 14px;
  }
  .orch-dot {
    width: 8px; height: 8px; border-radius: 999px; background: var(--accent);
    box-shadow: 0 0 0 0 rgba(46,196,182,0.5);
    animation: pulse2 1.6s ease-out infinite;
  }
  @keyframes pulse2 {
    0%,100% { box-shadow: 0 0 0 0 rgba(46,196,182,0.45); }
    50%     { box-shadow: 0 0 0 8px rgba(46,196,182,0); }
  }
  .err {
    margin-top: 20px;
    background: rgba(255,133,133,0.06);
    border: 1px solid rgba(255,133,133,0.30);
    color: var(--danger);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
  }
  .err button {
    margin-left: 10px;
    background: transparent; border: 1px solid var(--danger); color: var(--danger);
    padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer;
  }
</style>
