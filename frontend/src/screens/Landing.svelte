<script>
  import { onMount } from 'svelte';
  import {
    ArrowRight,
    BatteryCharging,
    CheckCircle2,
    Clock3,
    FileText,
    History,
    Landmark,
    Radar,
    ShieldCheck,
    Sparkles,
  } from '@lucide/svelte';
  import api from '../lib/api.js';
  import { screen, currentProduct, health } from '../lib/store.js';

  let samples = [];
  let loading = true;
  let selectedCategory = 'battery_pack';
  let selectedMarket = 'Germany';

  const coverage = ['Battery Reg 2023/1542', 'CE', 'RoHS', 'REACH', 'EMC', 'CBAM', 'WEEE', 'AI Act'];
  const metrics = [
    ['90 sec', 'Demo scan target'],
    ['3 agents', 'Chemicals, CE, carbon'],
    ['€0.20', 'Triage cost target'],
  ];

  onMount(async () => {
    await api.ensureLogin();
    const h = await api.getHealth();
    if (h && h.ok) health.set(h.data);
    const s = await api.listSamples();
    if (s && s.ok) samples = s.data;
    loading = false;
  });

  $: featured = samples.find((sample) => sample.spec?.category === selectedCategory) || samples[0];

  function pick(sample) {
    currentProduct.set({
      ...sample.spec,
      target_country: marketCode(selectedMarket),
    });
    screen.set('new');
  }

  function blank() {
    currentProduct.set({
      name: '',
      category: selectedCategory,
      target_country: marketCode(selectedMarket),
      manufacturer_hq: 'China',
      materials: '',
      electrical: '',
      battery: '',
      existing_certs: '',
      annual_eu_volume: '',
      notes: '',
    });
    screen.set('new');
  }

  function marketCode(market) {
    if (market === 'Germany') return 'DE';
    if (market === 'France') return 'FR';
    if (market === 'Netherlands') return 'NL';
    return 'EU';
  }
</script>

<div class="screen">
  <div class="app-shell">
    <div class="window-bar">
      <div class="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="window-title">WestPort.ai EU readiness cockpit</div>
      <div class="toolbar-actions">
        {#if $health}
          <div class="status-chip mono">
            <span class="status-dot" class:mock={$health.mock}></span>
            {$health.mock ? 'mock mode' : $health.provider} · {$health.corpus_chunks} regs
          </div>
        {/if}
        <button class="icon-button" aria-label="View previous reports" on:click={() => screen.set('history')}>
          <History size={17} />
        </button>
      </div>
    </div>

    <main class="cockpit">
      <section class="intro">
        <div class="brand-row">
          <div class="mark"><ShieldCheck size={22} /></div>
          <div>
            <div class="brand">WestPort.ai</div>
            <div class="tagline">Regulatory navigator for Chinese hardware entering Europe</div>
          </div>
        </div>

        <h1>Turn a product spec into a launch roadmap before the pitch timer ends.</h1>
        <p class="lede">
          WestPort reads the spec, maps the relevant EU obligations, and returns launch blockers,
          evidence gaps, cost, timing, and suggested bodies for review.
        </p>

        <div class="cta-row">
          <button class="button primary hero-cta" on:click={blank}>
            <Sparkles size={18} />
            Run 90-sec EU readiness scan
          </button>
          {#if featured}
            <button class="button" on:click={() => pick(featured)}>
              <BatteryCharging size={18} />
              Use battery pack demo
            </button>
          {/if}
        </div>

        <div class="proof-row">
          {#each metrics as [value, label]}
            <div class="metric">
              <div class="metric-value num">{value}</div>
              <div class="metric-label">{label}</div>
            </div>
          {/each}
        </div>
      </section>

      <section class="panel command-panel">
        <div class="panel-head">
          <div>
            <div class="panel-kicker">Scan setup</div>
            <h2>Pick the market entry lane</h2>
          </div>
          <Radar size={20} />
        </div>

        <div class="control-group">
          <span>Product vertical</span>
          <div class="segmented" role="group" aria-label="Product vertical">
            <button class:active={selectedCategory === 'battery_pack'} on:click={() => selectedCategory = 'battery_pack'}>Battery pack</button>
            <button class:active={selectedCategory === 'ev'} on:click={() => selectedCategory = 'ev'}>EV</button>
            <button class:active={selectedCategory === 'industrial_robot'} on:click={() => selectedCategory = 'industrial_robot'}>Robotics</button>
          </div>
        </div>

        <div class="control-group">
          <span>Target market</span>
          <div class="segmented" role="group" aria-label="Target market">
            {#each ['Germany', 'Netherlands', 'France'] as market}
              <button class:active={selectedMarket === market} on:click={() => selectedMarket = market}>{market}</button>
            {/each}
          </div>
        </div>

        <div class="readiness">
          <div class="readiness-top">
            <div>
              <div class="panel-kicker">Expected output</div>
              <div class="readiness-title">EU readiness brief</div>
            </div>
            <div class="score-preview num">72</div>
          </div>
          <div class="readiness-grid">
            <div><Clock3 size={16} /> 6 to 10 week roadmap</div>
            <div><Landmark size={16} /> Notified body shortlist</div>
            <div><FileText size={16} /> Evidence gaps and citations</div>
            <div><CheckCircle2 size={16} /> Go or no-go launch view</div>
          </div>
        </div>

        <div class="coverage">
          {#each coverage as item}
            <span>{item}</span>
          {/each}
        </div>
      </section>

      <section class="samples">
        <div class="section-head">
          <div>
            <div class="panel-kicker">Demo products</div>
            <h2>Start with a realistic Chinese hardware spec</h2>
          </div>
          <button class="button subtle" on:click={() => screen.set('history')}>
            View previous reports
          </button>
        </div>

        {#if loading}
          <div class="sample-loading">Loading product specs</div>
        {:else}
          <div class="sample-grid">
            {#each samples as sample}
              <button class="sample-row" on:click={() => pick(sample)}>
                <div class="sample-icon">
                  {#if sample.spec?.category?.includes('battery')}
                    <BatteryCharging size={18} />
                  {:else}
                    <ShieldCheck size={18} />
                  {/if}
                </div>
                <div class="sample-copy">
                  <div class="sample-name">{sample.name}</div>
                  <div class="sample-meta">{sample.category.replace('_', ' ')} · {sample.target_country} · {sample.spec.manufacturer_hq}</div>
                </div>
                <ArrowRight size={17} />
              </button>
            {/each}
          </div>
        {/if}
      </section>
    </main>
  </div>
</div>

<style>
  .cockpit {
    display: grid;
    grid-template-columns: minmax(0, 1.04fr) minmax(360px, 0.78fr);
    gap: 18px;
    padding: 28px;
  }

  .intro {
    min-height: 460px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 18px 10px 8px;
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .mark {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: white;
    background: linear-gradient(180deg, #1d1d1f, #34343a);
    box-shadow: var(--shadow-soft);
  }

  .brand {
    font-size: 18px;
    font-weight: 750;
  }

  .tagline {
    margin-top: 2px;
    color: var(--muted);
    font-size: 13px;
  }

  h1 {
    max-width: 740px;
    margin: 0;
    font-size: clamp(36px, 6vw, 72px);
    line-height: 0.98;
    font-weight: 780;
  }

  .lede {
    max-width: 630px;
    margin: 20px 0 0;
    color: var(--muted);
    font-size: 18px;
    line-height: 1.5;
  }

  .cta-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 26px;
  }

  .hero-cta {
    min-height: 44px;
    padding-inline: 18px;
  }

  .proof-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    max-width: 620px;
    margin-top: 26px;
  }

  .metric {
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }

  .metric-value {
    font-size: 24px;
    font-weight: 760;
  }

  .metric-label {
    margin-top: 2px;
    color: var(--muted);
    font-size: 12px;
  }

  .command-panel {
    padding: 18px;
    align-self: start;
  }

  .panel-head,
  .section-head,
  .readiness-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .panel-kicker {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  h2 {
    margin: 3px 0 0;
    font-size: 19px;
    font-weight: 760;
  }

  .control-group {
    margin-top: 18px;
    display: grid;
    gap: 8px;
  }

  .control-group > span {
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: rgba(118, 118, 128, 0.12);
  }

  .segmented button {
    min-height: 34px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--muted);
    font-size: 13px;
    font-weight: 650;
  }

  .segmented button.active {
    color: var(--text);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  .readiness {
    margin-top: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--panel-strong);
    padding: 16px;
  }

  .readiness-title {
    margin-top: 3px;
    font-size: 17px;
    font-weight: 760;
  }

  .score-preview {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--green);
    border: 6px solid rgba(31, 138, 91, 0.18);
    font-size: 22px;
    font-weight: 780;
  }

  .readiness-grid {
    display: grid;
    gap: 9px;
    margin-top: 14px;
  }

  .readiness-grid div {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--muted);
    font-size: 13px;
  }

  .coverage {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
  }

  .coverage span {
    border: 1px solid var(--border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.62);
    padding: 5px 8px;
    color: var(--muted);
    font-size: 12px;
  }

  .samples {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border);
    padding-top: 18px;
  }

  .sample-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
  }

  .sample-row {
    min-height: 86px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.68);
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 20px;
    gap: 10px;
    align-items: center;
    padding: 12px;
    text-align: left;
    transition: border-color 160ms ease, transform 120ms ease, background 160ms ease;
  }

  .sample-row:hover {
    border-color: rgba(0, 113, 227, 0.36);
    background: rgba(255, 255, 255, 0.92);
  }

  .sample-row:active {
    transform: translateY(1px);
  }

  .sample-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    color: var(--accent);
    background: var(--accent-soft);
  }

  .sample-copy {
    min-width: 0;
  }

  .sample-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 720;
  }

  .sample-meta,
  .sample-loading {
    margin-top: 3px;
    color: var(--muted);
    font-size: 12px;
  }

  @media (max-width: 920px) {
    .cockpit {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    .intro {
      min-height: auto;
      padding: 4px 0 6px;
    }

    .sample-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .cockpit {
      padding: 16px;
    }

    .proof-row {
      grid-template-columns: 1fr;
    }

    .segmented {
      grid-template-columns: 1fr;
    }

    .button {
      width: 100%;
    }
  }
</style>
