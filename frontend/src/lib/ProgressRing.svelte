<script>
  export let value = 0;       // 0..1
  export let size = 88;
  export let thickness = 6;
  export let stroke = 'var(--accent)';
  export let track = 'rgba(29,29,31,0.08)';
  export let label = null;

  $: r = (size - thickness) / 2;
  $: circumference = 2 * Math.PI * r;
  $: dash = Math.max(0, Math.min(1, value)) * circumference;
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="ring">
  <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} stroke-width={thickness} />
  <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={stroke} stroke-width={thickness} stroke-linecap="round"
    stroke-dasharray="{dash} {circumference - dash}"
    transform="rotate(-90 {size/2} {size/2})" />
  {#if label !== null}
    <text x="50%" y="54%" text-anchor="middle" font-size="{size * 0.28}" fill="var(--text)" font-weight="700" class="num">{label}</text>
  {/if}
</svg>

<style>
  .ring { display: block; }
  text { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; }
</style>
