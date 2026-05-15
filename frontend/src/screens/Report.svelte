<script>
  import { ArrowLeft, Copy, FileText, Plus, ShieldAlert, TimerReset } from '@lucide/svelte';
  import { screen, lastReport, currentProduct, agentState } from '../lib/store.js';
  import ProgressRing from '../lib/ProgressRing.svelte';
  import SeverityPill from '../lib/SeverityPill.svelte';

  $: report = $lastReport;
  $: score = report?.score ?? 0;
  $: ringColor = score >= 75 ? 'var(--green)' : score >= 45 ? 'var(--orange)' : 'var(--red)';
  $: launchStance = score >= 75 ? 'Go with evidence review' : score >= 45 ? 'Proceed after blocker fixes' : 'No-go until core gaps close';
  $: allFindings = (() => {
    const out = [];
    for (const key of ['chemicals', 'electrical', 'carbon']) {
      const findings = $agentState[key]?.findings || [];
      for (const item of findings) out.push({ ...item, agent: key });
    }
    return out.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.severity] ?? 9) - (order[b.severity] ?? 9);
    });
  })();

  function backHome() { screen.set('landing'); }
  function runAgain() { screen.set('new'); }

  async function copyBrief() {
    if (!report || !navigator.clipboard) return;
    const lines = [
      `WestPort.ai EU readiness brief`,
      `Product: ${$currentProduct?.name || 'Product'}`,
      `Market: ${$currentProduct?.target_country || 'EU'}`,
      `Score: ${score}/100`,
      `Launch stance: ${launchStance}`,
      `Cost: €${(report.cost || 0).toLocaleString('en-US')}`,
      `Timeline: ${report.weeks || 0} weeks`,
      `Summary: ${report.summary || ''}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
  }
</script>

<div class="screen">
  <div class="app-shell">
    <div class="window-bar">
      <div class="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="window-title">EU readiness roadmap</div>
      <div class="toolbar-actions">
        <button class="icon-button" aria-label="Back to cockpit" on:click={backHome}><ArrowLeft size={17} /></button>
        <button class="icon-button" aria-label="Run another product" on:click={runAgain}><Plus size={17} /></button>
      </div>
    </div>

    {#if !report}
      <main class="empty">
        <h1>No report yet</h1>
        <p>Run a readiness scan to generate a roadmap.</p>
        <button class="button primary" on:click={backHome}>Back to cockpit</button>
      </main>
    {:else}
      <main class="report">
        <section class="summary-panel">
          <div class="score-block">
            <ProgressRing value={score / 100} label={score} stroke={ringColor} size={124} thickness={9} />
            <span>Compliance readiness</span>
          </div>
          <div class="summary-copy">
            <div class="pill">
              <ShieldAlert size={15} />
              {launchStance}
            </div>
            <h1>{$currentProduct?.name || 'Product'}</h1>
            <div class="product-meta">{$currentProduct?.category?.replace('_', ' ')} to {$currentProduct?.target_country || 'EU'} market</div>
            <p>{report.summary}</p>
            <div class="summary-actions">
              <button class="button primary" on:click={runAgain}><Plus size={17} />Run another product</button>
              <button class="button" on:click={copyBrief}><Copy size={17} />Copy launch brief</button>
            </div>
          </div>
        </section>

        <section class="stat-grid">
          <div class="panel stat">
            <span>Total launch cost</span>
            <strong class="num">€{(report.cost || 0).toLocaleString('en-US')}</strong>
            <small>Estimated roadmap spend</small>
          </div>
          <div class="panel stat">
            <span>First EU shipment</span>
            <strong class="num">{report.weeks || 0} weeks</strong>
            <small>If blocker work starts now</small>
          </div>
          <div class="panel stat">
            <span>Triage value</span>
            <strong class="num">€0.20 vs €25k</strong>
            <small>Scope faster before paid counsel</small>
          </div>
        </section>

        <section class="work-grid">
          <div class="panel roadmap">
            <div class="section-head">
              <div>
                <h2>Priority actions</h2>
                <p>What the team should fix first.</p>
              </div>
              <TimerReset size={19} />
            </div>
            <div class="action-list">
              {#each report.actions || [] as action}
                <div class="action">
                  <div class="action-pri num">{String(action.priority).padStart(2, '0')}</div>
                  <div>
                    <div class="action-title">{action.title}</div>
                    <div class="action-meta">
                      <span>{action.regulation}</span>
                      <span class="num">{action.weeks}w</span>
                      <span class="num">€{action.cost_eur.toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="panel bodies">
            <div class="section-head">
              <div>
                <h2>Suggested bodies</h2>
                <p>Starting point for verification.</p>
              </div>
              <FileText size={19} />
            </div>
            <div class="body-list">
              {#each report.notified_bodies || [] as body}
                <div class="body">
                  <strong>{body.name}</strong>
                  <span>{body.country}{body.number ? ` · NB-${body.number}` : ''}</span>
                  <small>{body.scope}</small>
                </div>
              {/each}
            </div>
          </div>
        </section>

        {#if allFindings.length > 0}
          <section class="panel findings-panel">
            <div class="section-head">
              <div>
                <h2>Evidence log</h2>
                <p>{allFindings.length} findings sorted by launch impact.</p>
              </div>
            </div>
            <div class="findings">
              {#each allFindings as finding}
                <article class="finding">
                  <div class="finding-head">
                    <SeverityPill severity={finding.severity} />
                    <strong>{finding.regulation}</strong>
                    <span>{finding.citation}</span>
                  </div>
                  <p>{finding.requirement}</p>
                  <div><b>Gap:</b> {finding.gap}</div>
                  <div><b>Fix:</b> {finding.recommendation}</div>
                  <small class="mono num">
                    €{finding.estimated_cost_eur.toLocaleString('en-US')} · {finding.estimated_weeks} weeks · {finding.agent}
                  </small>
                </article>
              {/each}
            </div>
          </section>
        {/if}

        <div class="disclaimer">
          AI-generated compliance triage, not legal advice. Validate critical findings with an accredited lab,
          notified body, or qualified EU compliance counsel before launch.
        </div>
      </main>
    {/if}
  </div>
</div>

<style>
  .report {
    padding: 26px;
  }

  .summary-panel {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 24px;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: var(--shadow-soft);
    padding: 22px;
  }

  .score-block {
    display: grid;
    justify-items: center;
    gap: 8px;
  }

  .score-block span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  h1 {
    margin: 10px 0 0;
    font-size: clamp(30px, 5vw, 54px);
    line-height: 1.02;
  }

  .product-meta {
    margin-top: 6px;
    color: var(--muted);
    font-size: 14px;
  }

  .summary-copy p {
    max-width: 820px;
    margin: 14px 0 0;
    color: var(--muted);
    line-height: 1.55;
    font-size: 16px;
  }

  .summary-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .stat {
    padding: 16px;
  }

  .stat span,
  .stat small {
    display: block;
    color: var(--muted);
    font-size: 12px;
  }

  .stat strong {
    display: block;
    margin: 7px 0 4px;
    font-size: 25px;
  }

  .work-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(290px, 0.75fr);
    gap: 14px;
    margin-top: 14px;
  }

  .roadmap,
  .bodies,
  .findings-panel {
    padding: 16px;
  }

  .section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
  }

  .section-head p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 13px;
  }

  .action-list,
  .body-list,
  .findings {
    display: grid;
    gap: 9px;
  }

  .action {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.68);
    padding: 12px;
  }

  .action-pri {
    color: var(--accent);
    font-weight: 800;
  }

  .action-title {
    font-weight: 720;
  }

  .action-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 5px;
    color: var(--muted);
    font-size: 12px;
  }

  .body {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.68);
    padding: 12px;
  }

  .body strong,
  .body span,
  .body small {
    display: block;
  }

  .body span {
    margin-top: 4px;
    color: var(--accent);
    font-size: 12px;
    font-weight: 700;
  }

  .body small {
    margin-top: 4px;
    color: var(--muted);
    line-height: 1.4;
  }

  .findings-panel {
    margin-top: 14px;
  }

  .finding {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.68);
    padding: 12px;
  }

  .finding-head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .finding-head span {
    color: var(--muted);
    font-size: 12px;
  }

  .finding p,
  .finding div {
    margin: 8px 0 0;
    color: var(--text);
    font-size: 13px;
    line-height: 1.45;
  }

  .finding small {
    display: block;
    margin-top: 9px;
    color: var(--muted);
    font-size: 11px;
  }

  .disclaimer {
    margin-top: 18px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .empty {
    padding: 80px 26px;
    text-align: center;
  }

  .empty p {
    color: var(--muted);
  }

  @media (max-width: 840px) {
    .summary-panel,
    .work-grid {
      grid-template-columns: 1fr;
    }

    .stat-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .report {
      padding: 18px;
    }

    .summary-panel {
      padding: 16px;
    }

    .summary-actions .button {
      width: 100%;
    }
  }
</style>
