<script>
  export let label;
  export let value;
  export let sub = null;
  export let tone = 'default'; // 'default' | 'accent' | 'warm' | 'danger'
</script>

<div class="stat tone-{tone}">
  <div class="label">{label}</div>
  <div class="val num">{value}</div>
  {#if sub}<div class="sub">{sub}</div>{/if}
</div>

<style>
  .stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
  }
  .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .val { font-size: 24px; font-weight: 700; letter-spacing: -0.015em; margin-top: 6px; }
  .sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .tone-accent .val { color: var(--accent); }
  .tone-warm .val { color: var(--warm); }
  .tone-danger .val { color: var(--danger); }
</style>
