<script>
  export let severity = 'medium';
  const labels = { high: 'BLOCKER', medium: 'GAP', low: 'NICE-TO-HAVE' };
</script>

<span class="pill sev-{severity}">{labels[severity] || severity.toUpperCase()}</span>

<style>
  .pill {
    display: inline-block; padding: 3px 9px; border-radius: 999px;
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.02em;
    border: 1px solid transparent;
  }
  .sev-high {
    color: var(--high);
    background: #f8e6e6;
    background: color-mix(in srgb, var(--high) 12%, white);
    border-color: #edc1c0;
    border-color: color-mix(in srgb, var(--high) 30%, white);
  }
  .sev-medium {
    color: var(--medium);
    background: #f4ebe0;
    background: color-mix(in srgb, var(--medium) 12%, white);
    border-color: #e4ccb3;
    border-color: color-mix(in srgb, var(--medium) 30%, white);
  }
  .sev-low {
    color: var(--low);
    background: #ebeafa;
    background: color-mix(in srgb, var(--low) 12%, white);
    border-color: #cccbf3;
    border-color: color-mix(in srgb, var(--low) 30%, white);
  }
</style>
