<script>
  export let values = [];
  export let width = 80;
  export let height = 22;
  export let stroke = 'var(--accent)';
  $: max = Math.max(1, ...values);
  $: pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');
</script>

<svg width={width} height={height} viewBox="0 0 {width} {height}">
  <polyline points={pts} fill="none" stroke={stroke} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
