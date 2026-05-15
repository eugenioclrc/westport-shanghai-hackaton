<script>
  import { onMount } from 'svelte';
  import api from '../lib/api.js';
  import { screen, lastReport, currentAnalysisId } from '../lib/store.js';
  import Icon from '../lib/Icon.svelte';

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
    return new Date(s * 1000).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="screen">
  <div class="topbar">
    <button class="iconbtn" on:click={() => screen.set('landing')}>
      <Icon name="arrowL" size={16} stroke="var(--text)" />
    </button>
    <div class="topbar-title">Analysis history</div>
    <div></div>
  </div>

  {#if loading}
    <div class="muted">Loading…</div>
  {:else if items.length === 0}
    <div class="empty">
      <p>No analyses yet.</p>
      <button on:click={() => screen.set('new')}>Run your first analysis</button>
    </div>
  {:else}
    <div class="list">
      {#each items as it}
        <button class="row" on:click={() => openItem(it.id)} disabled={it.status !== 'complete'}>
          <div class="row-main">
            <div class="row-summary">{it.summary || '(running)'}</div>
            <div class="row-meta">
              <span class="muted">{fmtDate(it.started_at)}</span>
              {#if it.status === 'complete'}
                <span class="score-pill num">{it.compliance_score}/100</span>
                <span class="muted num">€{it.total_cost_eur?.toLocaleString('en-US')}</span>
                <span class="muted num">{it.weeks_to_launch}w</span>
              {:else}
                <span class="status-pill status-{it.status}">{it.status}</span>
              {/if}
            </div>
          </div>
          {#if it.status === 'complete'}
            <Icon name="arrowR" size={16} stroke="var(--accent)" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .screen { max-width: 720px; margin: 0 auto; padding: 22px 22px 56px; }
  .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .topbar-title { flex: 1; text-align: center; font-size: 15px; color: var(--muted); }
  .iconbtn {
    width: 36px; height: 36px; border-radius: 999px;
    background: var(--surface); border: 1px solid var(--border);
    display: grid; place-items: center; cursor: pointer;
  }
  .muted { color: var(--muted); font-size: 13px; }
  .empty { text-align: center; padding: 60px 20px; }
  .empty button {
    margin-top: 12px;
    background: var(--accent); color: #0B0C0F;
    border: 0; padding: 10px 16px; border-radius: 999px;
    font-weight: 600; cursor: pointer;
  }
  .list { display: flex; flex-direction: column; gap: 8px; }
  .row {
    display: flex; align-items: center; gap: 12px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
    text-align: left;
    cursor: pointer;
  }
  .row:disabled { cursor: default; opacity: 0.6; }
  .row-main { flex: 1; min-width: 0; }
  .row-summary { font-size: 14px; font-weight: 500; }
  .row-meta {
    margin-top: 4px;
    display: flex; gap: 10px; align-items: center;
    font-size: 12px; flex-wrap: wrap;
  }
  .score-pill {
    background: rgba(46,196,182,0.10); color: var(--accent);
    padding: 2px 8px; border-radius: 999px; font-weight: 700;
  }
  .status-pill {
    background: rgba(255,195,113,0.10); color: var(--warm);
    padding: 2px 8px; border-radius: 999px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .status-pill.status-failed { background: rgba(255,133,133,0.10); color: var(--danger); }
</style>
