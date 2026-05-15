<script>
  import { onMount } from 'svelte';
  import api from '../lib/api.js';
  import { screen, currentProduct, health } from '../lib/store.js';
  import Icon from '../lib/Icon.svelte';

  let samples = [];
  let loading = true;

  onMount(async () => {
    await api.ensureLogin();
    const h = await api.getHealth();
    if (h && h.ok) health.set(h.data);
    const s = await api.listSamples();
    if (s && s.ok) samples = s.data;
    loading = false;
  });

  function pick(sample) {
    currentProduct.set(sample.spec);
    screen.set('new');
  }

  function blank() {
    currentProduct.set(null);
    screen.set('new');
  }

  function history() {
    screen.set('history');
  }
</script>

<div class="screen">
  <header>
    <div class="brand">
      <div class="logo">
        <span class="logo-w">W</span>
      </div>
      <div>
        <div class="brand-name">WestPort<span class="dot-ai">.ai</span></div>
        <div class="brand-tag">EU compliance control tower</div>
      </div>
    </div>
    {#if $health}
      <div class="status mono">
        <span class="status-dot" class:mock={$health.mock}></span>
        {$health.mock ? 'mock' : $health.provider} · {$health.corpus_chunks} regs
      </div>
    {/if}
  </header>

  <section class="hero">
    <div class="eyebrow">EU compliance control tower · Built for Chinese hardware exporters</div>
    <h1 class="serif">
      Ship your hardware to <em>Europe</em><br/>
      in <em>weeks</em>, not <em>quarters</em>.
    </h1>
    <p class="lede">
      Drop in a product spec. Three specialist agents read live EU regulations in parallel,
      cite the exact article, and return a prioritized roadmap, cost estimate, and
      notified-body shortlist — in about 90 seconds.
    </p>

    <div class="regs">
      <span class="reg-chip">RoHS</span>
      <span class="reg-chip">REACH</span>
      <span class="reg-chip">CE</span>
      <span class="reg-chip">EMC</span>
      <span class="reg-chip">Battery Reg 2023/1542</span>
      <span class="reg-chip">CBAM</span>
      <span class="reg-chip">Machinery</span>
      <span class="reg-chip">AI Act</span>
    </div>

    <div class="cta-row">
      <button class="primary" on:click={blank}>
        <Icon name="spark" size={18} stroke="#0B0C0F" strokeWidth={2.4}/>
        Run new analysis
      </button>
      <button class="ghost" on:click={history}>
        <Icon name="history" size={16} stroke="var(--text)"/>
        History
      </button>
    </div>

    <div class="cost-line">
      <span class="num">€0.20</span> per analysis ·
      <span class="strike">€25,000</span> typical EU consultant engagement ·
      <span class="hl">same week, not next quarter</span>
    </div>
    <div class="model-line mono">
      Runs on <strong>DeepSeek-Chat</strong> · <strong>Qwen-Max</strong> · OpenRouter Fusion · Claude Sonnet 4.6
    </div>
  </section>

  <section>
    <div class="section-head">
      <h2>Sample products</h2>
      <div class="muted">Try with real-style Chinese hardware specs</div>
    </div>
    {#if loading}
      <div class="muted">Loading samples…</div>
    {:else}
      <div class="sample-grid">
        {#each samples as s}
          <button class="sample" on:click={() => pick(s)}>
            <div class="sample-cat">{s.category.replace('_', ' ')}</div>
            <div class="sample-name">{s.name}</div>
            <div class="sample-meta mono">{s.target_country} · {s.spec.manufacturer_hq}</div>
            <div class="sample-cta">
              Analyze <Icon name="arrowR" size={14} stroke="var(--accent)" />
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </section>

  <section class="how">
    <div class="how-step">
      <div class="how-num">01</div>
      <div>
        <div class="how-title">Drop in spec</div>
        <div class="how-sub">Materials, electrical specs, battery details, target country.</div>
      </div>
    </div>
    <div class="how-step">
      <div class="how-num">02</div>
      <div>
        <div class="how-title">Three agents read regulations</div>
        <div class="how-sub">Chemicals · Electrical · Carbon — in parallel, citing real articles.</div>
      </div>
    </div>
    <div class="how-step">
      <div class="how-num">03</div>
      <div>
        <div class="how-title">Get a roadmap</div>
        <div class="how-sub">Compliance score, cost estimate, weeks to first EU shipment, notified-body shortlist.</div>
      </div>
    </div>
  </section>

  <footer>
    <div class="muted">Built for Shanghai Hackathon · May 2026</div>
    <div class="muted serif">
      AI-generated compliance triage. Not legal advice.
    </div>
  </footer>
</div>

<style>
  .screen { max-width: 720px; margin: 0 auto; padding: 28px 22px 56px; }

  header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 36px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .logo {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #2EC4B6 0%, #1F8B82 100%);
    display: grid; place-items: center;
    color: #0B0C0F; font-weight: 800; font-size: 18px;
  }
  .brand-name { font-weight: 700; font-size: 18px; letter-spacing: -0.015em; }
  .dot-ai { color: var(--accent); font-weight: 700; }
  .brand-tag { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .status {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 10px;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
  .status-dot.mock { background: var(--warm); }

  .hero { margin-bottom: 40px; }
  .eyebrow {
    font-size: 11.5px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.14em;
    margin-bottom: 16px;
  }
  h1 {
    font-size: 48px; line-height: 1.05; letter-spacing: -0.025em; margin: 0;
    font-weight: 400;
  }
  h1 em {
    font-style: italic;
    color: var(--accent);
  }
  .lede {
    margin-top: 18px; color: var(--muted); font-size: 16px; line-height: 1.5;
    max-width: 580px;
  }
  .hl { color: var(--text); font-weight: 500; }
  .cta-row { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
  button {
    border: none; padding: 12px 18px; border-radius: 999px;
    font-size: 14.5px; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    transition: transform .12s ease;
  }
  button:active { transform: scale(0.98); }
  .primary {
    background: var(--accent); color: #0B0C0F;
    box-shadow: 0 10px 30px rgba(46,196,182,0.22);
  }
  .ghost {
    background: var(--surface); color: var(--text); border: 1px solid var(--border-strong);
  }
  .cost-line {
    margin-top: 18px;
    font-size: 13.5px; color: var(--muted);
  }
  .cost-line .num { color: var(--accent); font-weight: 700; font-size: 16px; }
  .cost-line .strike { text-decoration: line-through; color: var(--faint); }
  .cost-line .hl { color: var(--warm); font-weight: 600; }

  .model-line {
    margin-top: 10px;
    font-size: 12px; color: var(--faint);
    letter-spacing: 0.01em;
  }
  .model-line strong { color: var(--text); font-weight: 600; }

  .regs {
    margin-top: 22px;
    display: flex; flex-wrap: wrap; gap: 6px;
    max-width: 580px;
  }
  .reg-chip {
    font-family: 'Geist Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 9px;
  }

  section { margin-bottom: 36px; }
  .section-head { margin-bottom: 14px; }
  h2 { font-size: 18px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.015em; }
  .muted { color: var(--muted); font-size: 13px; }

  .sample-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sample {
    text-align: left; background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 16px; cursor: pointer;
    display: flex; flex-direction: column; gap: 6px;
    transition: border-color .15s, transform .12s;
  }
  .sample:hover { border-color: var(--accent); }
  .sample-cat {
    display: inline-block; align-self: flex-start;
    font-size: 10.5px; color: var(--accent);
    background: rgba(46,196,182,0.08);
    border: 1px solid rgba(46,196,182,0.22);
    border-radius: 999px;
    padding: 2px 8px;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .sample-name { font-weight: 600; font-size: 15px; }
  .sample-meta { color: var(--muted); font-size: 12px; }
  .sample-cta {
    margin-top: 8px;
    display: inline-flex; align-items: center; gap: 4px;
    color: var(--accent);
    font-size: 13px; font-weight: 500;
  }

  .how { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .how-step {
    display: flex; gap: 12px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 14px;
  }
  .how-num {
    font-family: 'Geist Mono', monospace; font-size: 11px;
    color: var(--muted); margin-top: 2px;
  }
  .how-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
  .how-sub { font-size: 12.5px; color: var(--muted); line-height: 1.4; }

  footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px;
  }

  @media (max-width: 600px) {
    .screen { padding: 20px 16px 40px; }
    h1 { font-size: 34px; }
    .sample-grid { grid-template-columns: 1fr; }
    .how { grid-template-columns: 1fr; }
  }
</style>
