<script>
  import { onDestroy, onMount } from 'svelte';
  import { Activity, X } from '@lucide/svelte';
  import api from '../lib/api.js';
  import { streamAnalysis } from '../lib/sse.js';
  import { screen, currentAnalysisId, agentState, lastReport } from '../lib/store.js';
  import AgentStreamCard from '../lib/AgentStreamCard.svelte';

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
          agentState.update((s) => ({ ...s, [data.agent]: { ...s[data.agent], status: 'running', progress: 'Loading regulation excerpts' } }));
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
  <div class="app-shell">
    <div class="window-bar">
      <div class="bar-brand">WestPort.ai</div>
      <div class="window-title">Live agent triage</div>
      <button class="icon-button" aria-label="Stop analysis" on:click={abort}>
        <X size={17} />
      </button>
    </div>

    <main class="running">
      <section class="run-hero">
        <div class="pulse-icon">
          <Activity size={28} />
        </div>
        <div>
          <div class="eyebrow">EU readiness scan running</div>
          <h1>Three agents are turning the spec into launch decisions.</h1>
          <p>Chemicals, CE pathway, and carbon obligations are checked in parallel, then merged into one roadmap.</p>
        </div>
        <div class="timer num">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
      </section>

      <section class="agent-board">
        <AgentStreamCard
          title="Chemicals agent"
          subtitle="RoHS, REACH, Battery substances"
          icon="beaker"
          accent="#0071e3"
          status={$agentState.chemicals.status}
          findings={$agentState.chemicals.findings}
          costUsd={$agentState.chemicals.costUsd}
          progress={$agentState.chemicals.progress}
          runningLabel="Checking substance restrictions"
          idleLabel="Queued for substances"
        />
        <AgentStreamCard
          title="Electrical agent"
          subtitle="CE, LVD, EMC, Machinery, AI Act"
          icon="bolt"
          accent="#b65f00"
          status={$agentState.electrical.status}
          findings={$agentState.electrical.findings}
          costUsd={$agentState.electrical.costUsd}
          progress={$agentState.electrical.progress}
          runningLabel="Mapping CE pathway"
          idleLabel="Queued for CE review"
        />
        <AgentStreamCard
          title="Carbon agent"
          subtitle="Battery passport, CBAM, WEEE"
          icon="leaf"
          accent="#1f8a5b"
          status={$agentState.carbon.status}
          findings={$agentState.carbon.findings}
          costUsd={$agentState.carbon.costUsd}
          progress={$agentState.carbon.progress}
          runningLabel="Checking carbon and DPP readiness"
          idleLabel="Queued for carbon review"
        />
      </section>

      {#if orchActive}
        <div class="panel orchestrator">
          <span class="status-dot"></span>
          Prioritizing launch blockers into one market-entry roadmap
        </div>
      {/if}

      {#if error}
        <div class="error-box">
          <strong>Analysis failed</strong>
          <span>{error}</span>
          <button class="button" on:click={abort}>Back to cockpit</button>
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .running {
    padding: 28px;
  }

  .run-hero {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    gap: 18px;
    align-items: center;
    margin-bottom: 22px;
  }

  .pulse-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid rgba(0, 113, 227, 0.16);
    animation: breathe 1.8s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.035); }
  }

  .eyebrow {
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 700;
  }

  h1 {
    margin: 5px 0 0;
    font-size: clamp(28px, 4vw, 46px);
    line-height: 1.05;
  }

  p {
    max-width: 700px;
    margin: 10px 0 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .timer {
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-solid);
    padding: 8px 14px;
    color: var(--accent-on);
    font-weight: 700;
  }

  .agent-board {
    display: grid;
    gap: 10px;
  }

  .orchestrator {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 13px;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    border: 1px solid rgba(199, 51, 47, 0.24);
    border-radius: var(--radius);
    background: var(--red-soft);
    color: var(--red);
    padding: 12px;
  }

  .error-box span {
    flex: 1;
  }

  @media (max-width: 720px) {
    .running {
      padding: 18px;
    }

    .run-hero {
      grid-template-columns: 1fr;
    }

    .pulse-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
    }
  }
</style>
