<script>
  import { onMount } from 'svelte';
  import { ArrowLeft, ArrowRight, Clock3, Plus } from '@lucide/svelte';
  import api from '../lib/api.js';
  import { screen, lastReport, currentAnalysisId } from '../lib/store.js';

  let items = [];
  let loading = true;

  onMount(async () => {
    const r = await api.listAnalyses();
    if (r && r.ok) items = r.data;
    loading = false;
  });

  async function openItem(id) {
    const r = await api.getAnalysis(id);
    if (r && r.ok && r.data?.report) {
      lastReport.set({
        analysisId: r.data.id,
        score: r.data.compliance_score,
        summary: r.data.summary,
        weeks: r.data.weeks_to_launch,
        cost: r.data.total_cost_eur,
        ...r.data.report,
      });
      currentAnalysisId.set(r.data.id);
      screen.set('report');
    }
  }

  function fmtDate(s) {
    return new Date(s * 1000).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>

<div class="screen">
  <div class="app-shell">
    <div class="window-bar">
      <div class="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="window-title">Previous readiness scans</div>
      <button class="icon-button" aria-label="Back to cockpit" on:click={() => screen.set('landing')}>
        <ArrowLeft size={17} />
      </button>
    </div>

    <main class="history">
      <div class="history-head">
        <div>
          <div class="eyebrow">Saved reports</div>
          <h1>Analysis history</h1>
          <p>Reopen completed roadmaps or start a new product scan.</p>
        </div>
        <button class="button primary" on:click={() => screen.set('new')}>
          <Plus size={17} />
          New scan
        </button>
      </div>

      {#if loading}
        <div class="panel loading"><Clock3 size={18} /> Loading reports</div>
      {:else if items.length === 0}
        <div class="panel empty">
          <h2>No analyses yet</h2>
          <p>Run the battery pack demo to create the first launch roadmap.</p>
          <button class="button primary" on:click={() => screen.set('new')}>Run first scan</button>
        </div>
      {:else}
        <div class="list">
          {#each items as item}
            <button class="history-row" on:click={() => openItem(item.id)} disabled={item.status !== 'complete'}>
              <div class="row-main">
                <div class="summary">{item.summary || 'Analysis in progress'}</div>
                <div class="meta">
                  <span>{fmtDate(item.started_at)}</span>
                  {#if item.status === 'complete'}
                    <strong class="num">{item.compliance_score}/100</strong>
                    <span class="num">€{item.total_cost_eur?.toLocaleString('en-US')}</span>
                    <span class="num">{item.weeks_to_launch} weeks</span>
                  {:else}
                    <strong>{item.status}</strong>
                  {/if}
                </div>
              </div>
              {#if item.status === 'complete'}
                <ArrowRight size={18} />
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .history {
    padding: 26px;
  }

  .history-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 18px;
  }

  .eyebrow {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  h1 {
    margin: 5px 0 0;
    font-size: clamp(32px, 5vw, 56px);
    line-height: 1.04;
  }

  p {
    margin: 8px 0 0;
    color: var(--muted);
  }

  .list {
    display: grid;
    gap: 9px;
  }

  .history-row,
  .loading,
  .empty {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.72);
    padding: 14px;
  }

  .history-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 24px;
    gap: 12px;
    align-items: center;
    text-align: left;
    transition: border-color 160ms ease, background 160ms ease, transform 120ms ease;
  }

  .history-row:hover {
    border-color: rgba(0, 113, 227, 0.34);
    background: rgba(255, 255, 255, 0.92);
  }

  .history-row:active {
    transform: translateY(1px);
  }

  .history-row:disabled {
    opacity: 0.62;
  }

  .row-main {
    min-width: 0;
  }

  .summary {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 720;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .meta strong {
    color: var(--accent);
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
  }

  .empty {
    text-align: center;
    padding: 56px 20px;
  }

  .empty h2 {
    margin: 0;
  }

  .empty .button {
    margin-top: 16px;
  }

  @media (max-width: 620px) {
    .history {
      padding: 18px;
    }

    .history-head {
      align-items: stretch;
      flex-direction: column;
    }

    .history-head .button {
      width: 100%;
    }
  }
</style>
