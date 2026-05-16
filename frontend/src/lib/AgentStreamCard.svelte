<script>
  import Icon from './Icon.svelte';
  import SeverityPill from './SeverityPill.svelte';

  export let title;
  export let subtitle;
  export let icon = 'doc';
  export let status = 'idle'; // 'idle' | 'running' | 'complete' | 'failed'
  export let findings = null;
  export let costUsd = 0;
  export let accent = 'var(--accent)';
  export let runningLabel = 'Reading regulations';
  export let idleLabel = 'Queued';
  export let progress = null;

  $: counts = findings
    ? findings.reduce((acc, f) => { acc[f.severity] = (acc[f.severity] || 0) + 1; return acc; }, {})
    : null;
</script>

<div class="card status-{status}" style="--accent-local: {accent}">
  <div class="head">
    <div class="ic">
      <Icon name={icon} size={18} stroke={accent} />
    </div>
    <div class="title">
      <div class="name">{title}</div>
      <div class="sub">{subtitle}</div>
    </div>
    <div class="state">
      {#if status === 'idle'}
        <div class="dot idle"></div>
        <span>{idleLabel}</span>
      {:else if status === 'running'}
        <div class="dot running"></div>
        <span>{runningLabel}</span>
      {:else if status === 'complete'}
        <div class="dot complete"></div>
        <span>{findings?.length ?? 0} finding{findings?.length === 1 ? '' : 's'}</span>
      {:else if status === 'failed'}
        <div class="dot failed"></div>
        <span>Failed</span>
      {/if}
    </div>
  </div>

  {#if status === 'idle'}
    <div class="bar bar-pulse"></div>
  {:else if status === 'running'}
    {#if progress}
      <div class="progress">{progress}</div>
    {/if}
    <div class="bar"><div class="bar-fill"></div></div>
  {/if}

  {#if status === 'complete' && counts}
    <div class="counts">
      {#if counts.high}<SeverityPill severity="high" />×{counts.high}{/if}
      {#if counts.medium}<SeverityPill severity="medium" />×{counts.medium}{/if}
      {#if counts.low}<SeverityPill severity="low" />×{counts.low}{/if}
    </div>
    {#if costUsd}
      <div class="cost">cost ≈ ${costUsd.toFixed(4)} USD</div>
    {/if}
  {/if}
</div>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    transition: border-color .25s, background .25s;
  }
  .card.status-running { border-color: var(--accent-local); background: #f4f7fb; background: color-mix(in srgb, var(--accent-local) 5%, white); }
  .card.status-complete { border-color: var(--border-strong); }
  .card.status-failed { border-color: rgba(199, 51, 47, 0.28); background: var(--red-soft); }

  .head { display: flex; align-items: center; gap: 12px; }
  .ic {
    width: 38px; height: 38px; border-radius: 9px;
    background: #eef2f8;
    background: color-mix(in srgb, var(--accent-local) 10%, white);
    display: grid; place-items: center;
    flex-shrink: 0;
  }
  .title { flex: 1; min-width: 0; }
  .name { font-weight: 600; font-size: 0.90625rem; }
  .sub { color: var(--muted); font-size: 0.78125rem; margin-top: 2px; }
  .state {
    display: flex; align-items: center; gap: 6px;
    color: var(--muted); font-size: 0.75rem;
    white-space: nowrap;
  }
  .dot {
    position: relative;
    width: 8px; height: 8px; border-radius: 999px; background: var(--border-strong);
  }
  .dot.running { background: var(--accent-local); }
  .dot.running::after {
    content: "";
    position: absolute; inset: 0; border-radius: 999px;
    background: var(--accent-local);
    animation: ring 1.6s ease-out infinite;
  }
  .dot.complete { background: var(--accent-local); }
  .dot.failed { background: var(--danger); }
  @keyframes ring {
    0% { transform: scale(1); opacity: 0.45; }
    100% { transform: scale(3.2); opacity: 0; }
  }

  .progress {
    margin-top: 10px;
    font-size: 0.75rem;
    color: var(--accent-local);
    letter-spacing: 0.01em;
  }
  .bar {
    margin-top: 10px;
    height: 4px; border-radius: 999px; background: rgba(29,29,31,0.07);
    overflow: hidden;
  }
  .bar-fill {
    height: 100%; width: 40%;
    background: var(--accent-local);
    animation: slide 1.4s linear infinite;
  }
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }
  .bar-pulse {
    position: relative;
    background: linear-gradient(
      90deg,
      rgba(29,29,31,0.04) 0%,
      rgba(29,29,31,0.10) 50%,
      rgba(29,29,31,0.04) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .counts {
    margin-top: 12px; display: flex; gap: 8px; align-items: center;
    font-size: 0.78125rem; color: var(--muted);
  }
  .cost { margin-top: 6px; font-size: 0.75rem; color: var(--faint); }
</style>
