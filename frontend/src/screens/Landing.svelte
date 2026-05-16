<script>
  import { onMount } from 'svelte';
  import {
    ArrowRight,
    BatteryCharging,
    CheckCircle2,
    Clock3,
    FileText,
    Landmark,
    Radar,
    ShieldCheck,
    Sparkles,
  } from '@lucide/svelte';
  import api from '../lib/api.js';
  import { screen, currentProduct, health } from '../lib/store.js';
  import { openSampleReport } from '../lib/sampleReport.js';

  let samples = [];
  let loading = true;
  let selectedCategory = 'battery_pack';
  let selectedMarket = 'Germany';

  const coverage = ['Battery Reg 2023/1542', 'CE', 'RoHS', 'REACH', 'EMC', 'CBAM', 'WEEE', 'AI Act'];
  const steps = [
    {
      n: '1',
      icon: FileText,
      title: 'Drop in a product spec',
      body: 'Materials, battery, electrical specs, target EU market.',
    },
    {
      n: '2',
      icon: Radar,
      title: '3 Claude agents read EU law in parallel',
      body: 'Chemicals · Electrical · Carbon — merged by a Sonnet orchestrator.',
    },
    {
      n: '3',
      icon: CheckCircle2,
      title: 'Get a scored launch roadmap',
      body: 'Blockers, cost, timeline, and a notified-body shortlist.',
    },
  ];
  const metrics = [
    ['~90 sec', 'AI triage runtime'],
    ['~$0.20', 'Token cost per scan'],
    ['€25k–100k', 'What an EU consultant charges'],
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
      <div class="bar-brand">WestPort.ai</div>
      <div class="window-title">EU readiness cockpit</div>
      <div class="toolbar-actions">
        {#if $health}
          <div class="status-chip">
            <span class="status-dot" class:mock={$health.mock}></span>
            {$health.mock ? 'mock mode' : $health.provider} · {$health.corpus_chunks} regs
          </div>
        {/if}
      </div>
    </div>

    <main class="cockpit">
      <section class="intro">
        <div class="brand-row">
          <div class="mark"><ShieldCheck size={22} /></div>
          <div>
            <div class="brand">WestPort.ai</div>
            <div class="tagline">AI EU-compliance navigator for Chinese hardware startups</div>
          </div>
        </div>

        <div class="problem">
          Every hardware product entering the EU faces 600+ pages of CE, RoHS, REACH,
          Battery Regulation 2023/1542, CBAM and WEEE — normally a €25k+ consultant quarter.
        </div>
        <h1>Your EU compliance roadmap, in about 90&nbsp;seconds.</h1>
        <p class="lede">
          A product spec goes in. An audited, citation-backed obligation map comes out —
          scored 0–100, in about 90 seconds.
        </p>

        <ol class="how">
          {#each steps as step}
            <li class="step">
              <div class="step-n num">{step.n}</div>
              <div class="step-ic"><svelte:component this={step.icon} size={17} /></div>
              <div class="step-title">{step.title}</div>
              <div class="step-body">{step.body}</div>
            </li>
          {/each}
        </ol>

        <div class="cta-row">
          <button class="button primary hero-cta" on:click={blank}>
            <Sparkles size={18} />
            Run the 90-sec scan
          </button>
          {#if featured}
            <button class="button" on:click={() => pick(featured)}>
              <BatteryCharging size={18} />
              Use battery pack demo
            </button>
          {/if}
          <button class="button sample-link" on:click={openSampleReport}>
            <FileText size={18} />
            See a sample report
          </button>
        </div>

        <div class="proof-row" role="group" aria-label="Cost and speed versus a traditional EU consultant">
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
          <div class="segmented" role="radiogroup" aria-label="Product vertical">
            <button role="radio" aria-checked={selectedCategory === 'battery_pack'} class:active={selectedCategory === 'battery_pack'} on:click={() => selectedCategory = 'battery_pack'}>Battery pack</button>
            <button role="radio" aria-checked={selectedCategory === 'ev'} class:active={selectedCategory === 'ev'} on:click={() => selectedCategory = 'ev'}>EV</button>
            <button role="radio" aria-checked={selectedCategory === 'industrial_robot'} class:active={selectedCategory === 'industrial_robot'} on:click={() => selectedCategory = 'industrial_robot'}>Robotics</button>
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
            <div class="score-tag">Sample</div>
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
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 18px 22px 12px 8px;
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 22px;
  }

  .mark {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: white;
    background: linear-gradient(165deg, #1b2233, #0c1b30);
    box-shadow: var(--shadow-soft);
  }

  .brand {
    font-size: 1.125rem;
    font-weight: 750;
  }

  .tagline {
    margin-top: 2px;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .problem {
    max-width: 600px;
    margin: 0 0 16px;
    padding-left: 13px;
    border-left: 2px solid var(--accent-on);
    color: var(--muted);
    font-size: 0.84375rem;
    font-weight: 600;
    line-height: 1.5;
  }

  h1 {
    max-width: 720px;
    margin: 0;
    font-size: clamp(34px, 5.4vw, 60px);
    line-height: 1.05;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .lede {
    max-width: 600px;
    margin: 16px 0 0;
    color: var(--muted);
    font-size: 1.0625rem;
    line-height: 1.5;
  }

  .how {
    list-style: none;
    margin: 26px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--panel-strong);
    overflow: hidden;
  }

  .step {
    padding: 16px 18px;
    display: grid;
    grid-template-columns: 26px auto;
    align-items: center;
    column-gap: 10px;
    row-gap: 7px;
  }

  .step + .step {
    border-left: 1px solid var(--border);
  }

  .step-n {
    grid-row: 1;
    grid-column: 1;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-family: var(--display);
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--accent-on);
    background: var(--accent-soft);
  }

  .step-ic {
    grid-row: 1;
    grid-column: 2;
    justify-self: start;
    color: var(--faint);
  }

  .step-title {
    grid-row: 2;
    grid-column: 1 / -1;
    font-weight: 650;
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .step-body {
    grid-row: 3;
    grid-column: 1 / -1;
    color: var(--muted);
    font-size: 0.78125rem;
    line-height: 1.45;
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
    font-family: var(--display);
    font-size: 1.625rem;
    font-weight: 560;
    letter-spacing: -0.01em;
  }

  .metric-label {
    margin-top: 2px;
    color: var(--muted);
    font-size: 0.75rem;
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
    font-size: 0.75rem;
    font-weight: 700;
  }

  h2 {
    margin: 3px 0 0;
    font-size: 1.1875rem;
    font-weight: 760;
  }

  .control-group {
    margin-top: 18px;
    display: grid;
    gap: 8px;
  }

  .control-group > span {
    color: var(--muted);
    font-size: 0.75rem;
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
    min-height: 40px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--muted);
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .segmented button.active {
    color: var(--text);
    background: var(--bg-solid);
    box-shadow: 0 1px 3px rgba(20, 26, 42, 0.12);
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
    font-size: 1.0625rem;
    font-weight: 760;
  }

  .score-tag {
    align-self: flex-start;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-solid);
    padding: 4px 10px;
    color: var(--faint);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    font-size: 0.8125rem;
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
    background: var(--bg-solid);
    padding: 6px 10px;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .samples {
    grid-column: 1 / -1;
    border-top: 1px solid var(--border);
    padding-top: 18px;
  }

  .sample-grid {
    display: grid;
    grid-template-columns: 1fr;
    margin-top: 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-solid);
    overflow: hidden;
  }

  .sample-row {
    border: 0;
    border-radius: 0;
    background: none;
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 20px;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    text-align: left;
    transition: background 160ms ease;
  }

  .sample-row + .sample-row {
    border-top: 1px solid var(--border);
  }

  .sample-row:hover {
    background: #f3f5f9;
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
    font-size: 0.75rem;
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

    .how {
      grid-template-columns: 1fr;
    }

    .step + .step {
      border-left: 0;
      border-top: 1px solid var(--border);
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
