<script>
  import { screen, lastReport, currentProduct, agentState } from '../lib/store.js';
  import ProgressRing from '../lib/ProgressRing.svelte';
  import SeverityPill from '../lib/SeverityPill.svelte';
  import Icon from '../lib/Icon.svelte';

  $: report = $lastReport;
  $: score = report?.score ?? 0;
  $: ringColor = score >= 75 ? 'var(--accent)' : score >= 45 ? 'var(--warm)' : 'var(--danger)';

  // Combine all findings across the three agent reports for an audit log table.
  $: allFindings = (() => {
    const out = [];
    for (const k of ['chemicals', 'electrical', 'carbon']) {
      const f = $agentState[k]?.findings || [];
      for (const item of f) out.push({ ...item, agent: k });
    }
    return out.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
    });
  })();

  function backHome() { screen.set('landing'); }
  function runAgain() { screen.set('new'); }
</script>

<div class="screen">
  {#if !report}
    <div class="empty">
      <p>No report yet.</p>
      <button on:click={backHome}>Back home</button>
    </div>
  {:else}
    <div class="topbar">
      <button class="iconbtn" on:click={backHome}>
        <Icon name="arrowL" size={16} stroke="var(--text)" />
      </button>
      <div class="topbar-title">Compliance roadmap</div>
      <button class="iconbtn" on:click={runAgain}>
        <Icon name="plus" size={16} stroke="var(--text)" />
      </button>
    </div>

    <!-- Hero summary -->
    <div class="hero">
      <div class="hero-left">
        <ProgressRing value={score / 100} label={score} stroke={ringColor} size={120} thickness={9} />
        <div class="score-label">Compliance score</div>
      </div>
      <div class="hero-right">
        <div class="product-name-row">
          <div class="product-name">{$currentProduct?.name || 'Product'}</div>
          <span class="market-chip">🌐 {$currentProduct?.target_country || 'EU'}</span>
        </div>
        <div class="product-meta">{$currentProduct?.category?.replace('_', ' ')} → {$currentProduct?.target_country || 'EU'} market</div>
        <p class="summary serif">{report.summary}</p>
      </div>
    </div>

    <!-- Headline stats -->
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Total cost to launch</div>
        <div class="stat-val num">€{(report.cost || 0).toLocaleString('en-US')}</div>
        <div class="stat-sub">over the roadmap below</div>
      </div>
      <div class="stat">
        <div class="stat-label">Time to first EU shipment</div>
        <div class="stat-val num">{report.weeks || 0}<span class="unit">weeks</span></div>
        <div class="stat-sub">if all actions start now</div>
      </div>
      <div class="stat">
        <div class="stat-label">Triage cost vs EU consultant</div>
        <div class="stat-val num">€0.20<span class="unit">vs €25k</span></div>
        <div class="stat-sub">~125,000× cheaper to scope</div>
      </div>
    </div>

    <!-- Top actions -->
    <section>
      <h2>Top {(report.actions || []).length} prioritized actions</h2>
      <div class="actions">
        {#each report.actions || [] as a}
          <div class="action">
            <div class="action-pri num">{String(a.priority).padStart(2, '0')}</div>
            <div class="action-body">
              <div class="action-title">{a.title}</div>
              <div class="action-meta">
                <span class="regulation">{a.regulation}</span>
                <span class="muted">·</span>
                <span class="muted num">{a.weeks}w</span>
                <span class="muted">·</span>
                <span class="muted num">€{a.cost_eur.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Notified-body shortlist -->
    {#if (report.notified_bodies || []).length > 0}
      <section>
        <h2>Suggested notified bodies</h2>
        <div class="bodies">
          {#each report.notified_bodies as b}
            <div class="body">
              <div class="body-name">{b.name}</div>
              <div class="body-meta">
                <span class="flag">{b.country}</span>
                {#if b.number}<span class="num mono">NB-{b.number}</span>{/if}
                <span class="muted">{b.scope}</span>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Findings log (collapsible-ish) -->
    {#if allFindings.length > 0}
      <section>
        <h2>Full findings ({allFindings.length})</h2>
        <div class="findings">
          {#each allFindings as f}
            <div class="finding">
              <div class="finding-head">
                <SeverityPill severity={f.severity} />
                <span class="finding-reg">{f.regulation}</span>
                <span class="finding-citation muted">{f.citation}</span>
              </div>
              <div class="finding-req">{f.requirement}</div>
              <div class="finding-gap"><span class="lab">Gap:</span> {f.gap}</div>
              <div class="finding-rec"><span class="lab">Fix:</span> {f.recommendation}</div>
              <div class="finding-cost mono">
                <span class="num">€{f.estimated_cost_eur.toLocaleString('en-US')}</span>
                <span class="muted">·</span>
                <span class="num">{f.estimated_weeks} weeks</span>
                <span class="muted">·</span>
                <span class="agent">{f.agent}</span>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <div class="cta-row">
      <button class="primary" on:click={runAgain}>
        <Icon name="plus" size={16} stroke="#0B0C0F" strokeWidth={2.4}/>
        Run another product
      </button>
      <button class="ghost" on:click={backHome}>
        <Icon name="arrowL" size={14} stroke="var(--text)"/>
        Back home
      </button>
    </div>

    <div class="disclaimer">
      AI-generated compliance triage, not legal advice. Cross-check critical findings
      with a notified body, accredited test lab, or qualified EU compliance counsel before launch.
    </div>
  {/if}
</div>

<style>
  .screen { max-width: 880px; margin: 0 auto; padding: 22px 22px 56px; }
  .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .topbar-title { flex: 1; text-align: center; font-size: 15px; color: var(--muted); }
  .iconbtn {
    width: 36px; height: 36px; border-radius: 999px;
    background: var(--surface); border: 1px solid var(--border);
    display: grid; place-items: center; cursor: pointer;
  }

  .hero {
    display: flex; gap: 28px; align-items: center;
    background:
      radial-gradient(120% 80% at 100% 0%, rgba(46,196,182,0.10), transparent 55%),
      var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 24px;
    margin-bottom: 18px;
  }
  .hero-left { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
  .score-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .product-name-row {
    display: flex; align-items: center; gap: 10px;
    flex-wrap: wrap;
  }
  .product-name { font-size: 22px; font-weight: 700; letter-spacing: -0.015em; }
  .market-chip {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--info);
    background: rgba(132,181,255,0.10);
    border: 1px solid rgba(132,181,255,0.28);
    border-radius: 999px;
    padding: 2px 9px;
  }
  .product-meta { color: var(--muted); font-size: 13px; margin-top: 2px; text-transform: lowercase; }
  .summary { font-size: 16px; line-height: 1.5; margin: 12px 0 0; color: var(--text); }

  .stats {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
    margin-bottom: 28px;
  }
  .stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
  }
  .stat-label { font-size: 11.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-val { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-top: 6px; }
  .stat-val .unit { font-size: 12px; color: var(--muted); margin-left: 4px; font-weight: 400; }
  .stat-sub { font-size: 12px; color: var(--faint); margin-top: 4px; }

  section { margin-bottom: 28px; }
  h2 {
    font-size: 13px; font-weight: 500; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.12em;
    margin: 0 0 12px;
  }
  .actions { display: flex; flex-direction: column; gap: 8px; }
  .action {
    display: flex; gap: 16px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
  }
  .action-pri {
    color: var(--accent);
    font-size: 14px; font-weight: 700;
    margin-top: 2px;
  }
  .action-title { font-size: 14.5px; font-weight: 500; }
  .action-meta {
    margin-top: 4px;
    display: flex; gap: 8px; align-items: center;
    font-size: 12px; color: var(--muted);
    flex-wrap: wrap;
  }
  .regulation { color: var(--info); }

  .bodies { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .body {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
  }
  .body-name { font-weight: 500; font-size: 14px; }
  .body-meta {
    display: flex; gap: 8px; align-items: center;
    margin-top: 4px; font-size: 12px; flex-wrap: wrap;
  }
  .flag {
    background: rgba(132,181,255,0.10); color: var(--info);
    padding: 1px 7px; border-radius: 4px; font-weight: 600;
  }

  .findings { display: flex; flex-direction: column; gap: 8px; }
  .finding {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
  }
  .finding-head {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .finding-reg { font-weight: 500; }
  .finding-citation { font-size: 12px; }
  .finding-req { font-size: 13.5px; margin: 4px 0 6px; }
  .finding-gap, .finding-rec { font-size: 13px; line-height: 1.4; margin-top: 2px; }
  .lab { color: var(--muted); font-weight: 600; margin-right: 4px; }
  .finding-cost {
    margin-top: 8px; font-size: 11.5px; color: var(--faint);
    display: flex; gap: 6px; flex-wrap: wrap;
  }
  .agent {
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--accent);
  }

  .cta-row { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
  button { border: none; cursor: pointer; }
  .primary {
    background: var(--accent); color: #0B0C0F;
    padding: 12px 18px; border-radius: 999px;
    font-size: 14.5px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .ghost {
    background: var(--surface); color: var(--text);
    border: 1px solid var(--border-strong);
    padding: 12px 18px; border-radius: 999px;
    font-size: 14.5px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .empty {
    text-align: center; padding: 80px 20px; color: var(--muted);
  }
  .disclaimer {
    margin-top: 28px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--faint);
    letter-spacing: 0.01em;
  }

  @media (max-width: 700px) {
    .hero { flex-direction: column; align-items: stretch; gap: 16px; }
    .stats { grid-template-columns: 1fr; }
    .bodies { grid-template-columns: 1fr; }
  }
</style>
