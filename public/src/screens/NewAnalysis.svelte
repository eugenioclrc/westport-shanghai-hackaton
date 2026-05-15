<script>
  import api from '../lib/api.js';
  import { screen, currentProduct, currentAnalysisId, resetAgents } from '../lib/store.js';
  import Icon from '../lib/Icon.svelte';

  const CATEGORIES = [
    ['battery_cell',          'Battery cell'],
    ['battery_pack',          'Battery pack'],
    ['ev',                    'EV (BEV / PHEV)'],
    ['humanoid_robot',        'Humanoid robot'],
    ['industrial_robot',      'Industrial robot'],
    ['solar_inverter',        'Solar inverter'],
    ['consumer_electronics',  'Consumer electronics'],
    ['other',                 'Other'],
  ];

  let form = $currentProduct ? { ...$currentProduct } : {
    name: '',
    category: 'battery_cell',
    target_country: 'EU',
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

  async function run() {
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

  function back() { screen.set('landing'); }
</script>

<div class="screen">
  <div class="topbar">
    <button class="iconbtn" on:click={back}>
      <Icon name="arrowL" size={16} stroke="var(--text)" />
    </button>
    <div class="topbar-title">Run new compliance analysis</div>
    <div></div>
  </div>

  <div class="form">
    <div class="row">
      <label>
        <span>Product name</span>
        <input type="text" bind:value={form.name} placeholder="e.g. BL-200 NMC811 prismatic cell" maxlength="80" />
      </label>
    </div>

    <div class="row two">
      <label>
        <span>Category</span>
        <select bind:value={form.category}>
          {#each CATEGORIES as [k, label]}
            <option value={k}>{label}</option>
          {/each}
        </select>
      </label>
      <label>
        <span>Target country</span>
        <select bind:value={form.target_country}>
          <option value="EU">EU</option>
          <option value="DE">Germany</option>
          <option value="FR">France</option>
          <option value="NL">Netherlands</option>
        </select>
      </label>
    </div>

    <div class="row">
      <label>
        <span>Manufacturer HQ</span>
        <input type="text" bind:value={form.manufacturer_hq} placeholder="Hefei, China" maxlength="80" />
      </label>
    </div>

    <div class="row">
      <label>
        <span>Materials &amp; substances</span>
        <textarea bind:value={form.materials} rows="3" placeholder="NMC811 cathode, graphite anode, LiPF6 electrolyte, polyolefin separator…"></textarea>
      </label>
    </div>

    <div class="row two">
      <label>
        <span>Electrical specs</span>
        <textarea bind:value={form.electrical} rows="3" placeholder="3.65 V nom., 200 Ah, 1C cont./3C peak, –20 to 55°C"></textarea>
      </label>
      <label>
        <span>Battery details</span>
        <textarea bind:value={form.battery} rows="3" placeholder="Prismatic 173×200×72mm, 4.1 kg, >2000 cycles @ 80% DoD, 180 Wh/kg"></textarea>
      </label>
    </div>

    <div class="row two">
      <label>
        <span>Existing certifications</span>
        <input type="text" bind:value={form.existing_certs} placeholder="GB/T 31485, UN 38.3, IEC 62133-2 (in-house lab)" />
      </label>
      <label>
        <span>Annual EU volume</span>
        <input type="text" bind:value={form.annual_eu_volume} placeholder="120,000 cells (60 MWh)" />
      </label>
    </div>

    <div class="row">
      <label>
        <span>Notes</span>
        <textarea bind:value={form.notes} rows="2" placeholder="Target customers, EU presence, partner OEMs…"></textarea>
      </label>
    </div>

    {#if err}<div class="err">{err}</div>{/if}

    <div class="cta">
      <button class="primary" disabled={submitting || !form.name || !form.category} on:click={run}>
        <Icon name="spark" size={18} stroke="#0B0C0F" strokeWidth={2.4} />
        {submitting ? 'Starting…' : 'Run analysis'}
      </button>
    </div>
    <div class="note">
      Three AI agents will read RoHS, REACH, Battery Reg 2023/1542, CBAM, CE, EMC, Machinery, AI Act
      against your spec. Typical run: 12–30 seconds.
    </div>
  </div>
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
  .form { display: flex; flex-direction: column; gap: 14px; }
  .row label {
    display: flex; flex-direction: column; gap: 6px;
  }
  .row label span {
    font-size: 11.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em;
  }
  .row input, .row textarea, .row select {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 11px 12px;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    font-family: inherit;
    transition: border-color .15s;
  }
  .row textarea { resize: vertical; min-height: 60px; line-height: 1.4; }
  .row input:focus, .row textarea:focus, .row select:focus { border-color: var(--accent); }
  .row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .err {
    background: rgba(255,133,133,0.06);
    border: 1px solid rgba(255,133,133,0.30);
    color: var(--danger);
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
  }
  .cta { margin-top: 8px; }
  .primary {
    width: 100%; height: 52px;
    border: 0; border-radius: 999px;
    background: var(--accent); color: #0B0C0F;
    font-size: 15.5px; font-weight: 600;
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(46,196,182,0.25);
  }
  .primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
  .note { color: var(--muted); font-size: 12px; line-height: 1.5; text-align: center; margin-top: 4px; }

  @media (max-width: 600px) {
    .row.two { grid-template-columns: 1fr; }
  }
</style>
