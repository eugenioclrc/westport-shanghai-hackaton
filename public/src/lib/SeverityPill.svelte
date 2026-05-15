<script>
  export let severity = 'medium';
  const labels = { high: 'BLOCKER', medium: 'GAP', low: 'NICE-TO-HAVE' };
</script>

<span class="pill sev-{severity}">{labels[severity] || severity.toUpperCase()}</span>

<style>
  .pill {
    display: inline-block; padding: 2px 8px; border-radius: 999px;
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em;
    border: 1px solid transparent;
  }
  .sev-high   { background: rgba(255, 133, 133, 0.12); color: var(--high); border-color: rgba(255, 133, 133, 0.30); }
  .sev-medium { background: rgba(255, 195, 113, 0.12); color: var(--medium); border-color: rgba(255, 195, 113, 0.32); }
  .sev-low    { background: rgba(132, 181, 255, 0.12); color: var(--low); border-color: rgba(132, 181, 255, 0.30); }
</style>
