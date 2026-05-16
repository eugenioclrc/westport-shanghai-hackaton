<script>
  import { ArrowLeft, BatteryCharging, Play, Sparkles } from '@lucide/svelte';
  import api from '../lib/api.js';
  import { screen, currentProduct, currentAnalysisId, resetAgents } from '../lib/store.js';

  const CATEGORIES = [
    ['battery_cell', 'Battery cell'],
    ['battery_pack', 'Battery pack'],
    ['ev', 'EV'],
    ['humanoid_robot', 'Humanoid robot'],
    ['industrial_robot', 'Industrial robot'],
    ['solar_inverter', 'Solar inverter'],
    ['consumer_electronics', 'Consumer electronics'],
    ['other', 'Other'],
  ];

  let form = $currentProduct ? { ...$currentProduct } : {
    name: '',
    category: 'battery_pack',
    target_country: 'DE',
    manufacturer_hq: 'China',
    materials: '',
    electrical: '',
    battery: '',
    existing_certs: '',
    annual_eu_volume: '',
    notes: '',
  };
  let submitting = false;
  let err = null;

  $: canRun = Boolean(form.name && form.category && form.target_country);

  async function run() {
    if (!canRun || submitting) return;
    submitting = true;
    err = null;
    const r = await api.createAnalysis(form);
    if (r && r.ok) {
      currentAnalysisId.set(r.data.analysisId);
      currentProduct.set(form);
      resetAgents();
      screen.set('running');
    } else {
      err = r?.message || 'Could not start analysis';
    }
    submitting = false;
  }
</script>

<div class="screen">
  <div class="app-shell">
    <div class="window-bar">
      <div class="bar-brand">WestPort.ai</div>
      <div class="window-title">New EU readiness scan</div>
      <button class="icon-button" aria-label="Back to cockpit" on:click={() => screen.set('landing')}>
        <ArrowLeft size={17} />
      </button>
    </div>

    <main class="intake">
      <aside class="intake-rail">
        <h1>Product evidence intake</h1>
        <p>
          Add enough detail for the agents to classify the product, map obligations, and find the
          first blockers for European launch.
        </p>
        <div class="rail-facts">
          <div><span>Output</span> Roadmap, gaps, cost, timing</div>
          <div><span>Focus</span> Batteries, EV, robotics, electronics</div>
          <div><span>Positioning</span> Navigator, not legal advice</div>
        </div>
      </aside>

      <form class="form-grid" on:submit|preventDefault={run}>
        <section class="panel form-section">
          <div class="section-title">
            <Sparkles size={18} />
            <div>
              <h2>Launch context</h2>
              <p>What is entering Europe and where will it land first?</p>
            </div>
          </div>

          <label class="field wide">
            <span>Product name <span class="req" aria-hidden="true">*</span></span>
            <input type="text" bind:value={form.name} placeholder="BL-200 NMC811 prismatic battery pack" maxlength="90" required aria-required="true" />
          </label>

          <label class="field">
            <span>Category</span>
            <select bind:value={form.category}>
              {#each CATEGORIES as [key, label]}
                <option value={key}>{label}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Target market</span>
            <select bind:value={form.target_country}>
              <option value="DE">Germany</option>
              <option value="NL">Netherlands</option>
              <option value="FR">France</option>
              <option value="EU">European Union</option>
            </select>
          </label>

          <label class="field">
            <span>Manufacturer HQ</span>
            <input type="text" bind:value={form.manufacturer_hq} placeholder="Hefei, China" maxlength="80" />
          </label>

          <label class="field">
            <span>Annual EU volume</span>
            <input type="text" bind:value={form.annual_eu_volume} placeholder="120,000 cells or 60 MWh" />
          </label>
        </section>

        <section class="panel form-section">
          <div class="section-title">
            <BatteryCharging size={18} />
            <div>
              <h2>Technical evidence</h2>
              <p>Material, electrical, and certification signals used for triage.</p>
            </div>
          </div>

          <label class="field wide">
            <span>Materials and substances</span>
            <textarea bind:value={form.materials} rows="3" placeholder="NMC811 cathode, graphite anode, LiPF6 electrolyte, polyolefin separator"></textarea>
          </label>

          <label class="field">
            <span>Electrical specs</span>
            <textarea bind:value={form.electrical} rows="3" placeholder="3.65 V nominal, 200 Ah, 1C continuous, 3C peak, -20 to 55 C"></textarea>
          </label>

          <label class="field">
            <span>Battery details</span>
            <textarea bind:value={form.battery} rows="3" placeholder="Prismatic 173 x 200 x 72 mm, 4.1 kg, 2000 cycles at 80 percent DoD"></textarea>
          </label>

          <label class="field wide">
            <span>Existing certifications</span>
            <input type="text" bind:value={form.existing_certs} placeholder="UN 38.3, IEC 62133-2, GB/T 31485" />
          </label>

          <label class="field wide">
            <span>Notes</span>
            <textarea bind:value={form.notes} rows="2" placeholder="Target customers, OEM partners, EU entity, importer setup, support model"></textarea>
          </label>
        </section>

        {#if err}
          <div class="error wide" role="alert">{err}</div>
        {/if}

        <div class="sticky-action wide">
          <div>
            <strong>Ready for agent triage</strong>
            <span>Three specialist agents will map obligations and cite evidence.</span>
          </div>
          <button class="button primary" disabled={!canRun || submitting} type="submit">
            <Play size={17} />
            {submitting ? 'Starting scan' : 'Run 90-sec EU readiness scan'}
          </button>
        </div>
      </form>
    </main>
  </div>
</div>

<style>
  .intake {
    display: grid;
    grid-template-columns: 310px minmax(0, 1fr);
    gap: 22px;
    padding: 26px;
  }

  .intake-rail {
    padding: 12px 4px;
  }

  .field span.req {
    color: var(--danger);
    font-weight: 700;
  }

  h1 {
    margin: 0;
    font-size: 2.375rem;
    line-height: 1.06;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .intake-rail p {
    margin: 16px 0 0;
    color: var(--muted);
    line-height: 1.5;
  }

  .rail-facts {
    display: grid;
    gap: 10px;
    margin-top: 24px;
  }

  .rail-facts div {
    border-top: 1px solid var(--border);
    padding-top: 10px;
    color: var(--text);
    font-size: 0.8125rem;
  }

  .rail-facts span {
    display: block;
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .form-grid {
    display: grid;
    gap: 14px;
  }

  .form-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 16px;
  }

  .section-title {
    grid-column: 1 / -1;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .section-title h2 {
    margin: 0;
    font-size: 1.125rem;
  }

  .section-title p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  .wide {
    grid-column: 1 / -1;
  }

  .error {
    border: 1px solid rgba(199, 51, 47, 0.24);
    border-radius: var(--radius);
    background: var(--red-soft);
    color: var(--red);
    padding: 12px 14px;
    font-size: 0.8125rem;
  }

  .sticky-action {
    position: sticky;
    bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    border: 1px solid var(--border-strong);
    border-radius: 14px;
    background: var(--panel-strong);
    box-shadow: 0 -2px 18px rgba(20, 26, 42, 0.08);
    padding: 14px;
  }

  .sticky-action strong,
  .sticky-action span {
    display: block;
  }

  .sticky-action span {
    margin-top: 2px;
    color: var(--muted);
    font-size: 0.8125rem;
  }

  @media (max-width: 900px) {
    .intake {
      grid-template-columns: 1fr;
      padding: 18px;
    }

    .intake-rail {
      padding: 0;
    }
  }

  @media (max-width: 620px) {
    .form-section {
      grid-template-columns: 1fr;
    }

    .sticky-action {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
