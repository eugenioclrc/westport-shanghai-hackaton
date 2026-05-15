<script>
  export let name;
  export let size = 18;
  export let stroke = 'currentColor';
  export let strokeWidth = 1.6;
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'arrowR'}<polyline points="9 18 15 12 9 6" />
  {:else if name === 'arrowL'}<polyline points="15 18 9 12 15 6" />
  {:else if name === 'check'}<polyline points="20 6 9 17 4 12" />
  {:else if name === 'x'}<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  {:else if name === 'flag'}<path d="M4 21V4h12l-2 4 2 4H4" /><line x1="4" y1="21" x2="4" y2="4" />
  {:else if name === 'shield'}<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
  {:else if name === 'spark'}<path d="M5 12l4 4 10-10" /><path d="M3 17l3 3" /><path d="M19 6l2 2" />
  {:else if name === 'globe'}<circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  {:else if name === 'doc'}<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
  {:else if name === 'chip'}<rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" />
  {:else if name === 'spark2'}<polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
  {:else if name === 'clock'}<circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
  {:else if name === 'euro'}<path d="M19 5c-2-2-7-2-10 2-2 3-2 7 0 10 3 4 8 4 10 2" /><line x1="3" y1="10" x2="13" y2="10" /><line x1="3" y1="14" x2="13" y2="14" />
  {:else if name === 'history'}<polyline points="3 12 8 12 8 7" /><path d="M3 12a9 9 0 109-9" />
  {:else if name === 'beaker'}<path d="M9 3v6L4 19a2 2 0 002 2h12a2 2 0 002-2L15 9V3" /><line x1="9" y1="3" x2="15" y2="3" />
  {:else if name === 'bolt'}<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  {:else if name === 'leaf'}<path d="M3 21c8 0 18-3 18-18C13 3 3 13 3 21z" /><path d="M3 21l9-9" />
  {:else if name === 'chevR'}<polyline points="9 18 15 12 9 6" />
  {:else if name === 'plus'}<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  {:else}<circle cx="12" cy="12" r="9" />
  {/if}
</svg>
