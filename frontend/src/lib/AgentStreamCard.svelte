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
      <div class="progress mono">{progress}</div>
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
      <div class="cost mono">cost ≈ ${costUsd.toFixed(4)} USD</div>
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
  .card.status-running { border-color: var(--accent-local); background: rgba(0, 113, 227, 0.05); }
  .card.status-complete { border-color: var(--border-strong); }
  .card.status-failed { border-color: rgba(199, 51, 47, 0.28); background: var(--red-soft); }

  .head { display: flex; align-items: center; gap: 12px; }
  .ic {
    width: 36px; height: 36px; border-radius: 8px;
    background: rgba(0, 113, 227, 0.08);
    display: grid; place-items: center;
    flex-shrink: 0;
  }
  .title { flex: 1; min-width: 0; }
  .name { font-weight: 600; font-size: 14.5px; }
  .sub { color: var(--muted); font-size: 12.5px; margin-top: 2px; }
  .state {
    display: flex; align-items: center; gap: 6px;
    color: var(--muted); font-size: 12px;
    white-space: nowrap;
  }
  .dot {
    width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,0.18);
  }
  .dot.running {
    background: var(--accent-local);
    box-shadow: 0 0 0 0 var(--accent-local);
    animation: pulse 1.6s ease-out infinite;
  }
  .dot.complete { background: var(--accent-local); }
  .dot.failed { background: var(--danger); }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.32); }
    100% { box-shadow: 0 0 0 8px rgba(0, 113, 227, 0); }
  }

  .progress {
    margin-top: 10px;
    font-size: 12px;
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
    font-size: 12.5px; color: var(--muted);
  }
  .cost { margin-top: 6px; font-size: 11px; color: var(--faint); }
</style>
