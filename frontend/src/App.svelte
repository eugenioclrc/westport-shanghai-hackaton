<script>
  import { screen } from './lib/store.js';
  import Landing from './screens/Landing.svelte';
  import NewAnalysis from './screens/NewAnalysis.svelte';
  import Running from './screens/Running.svelte';
  import Report from './screens/Report.svelte';
</script>

<div class="app">
  {#if $screen === 'landing'}<Landing />
  {:else if $screen === 'new'}<NewAnalysis />
  {:else if $screen === 'running'}<Running />
  {:else if $screen === 'report'}<Report />
  {/if}
</div>

<style>
  .app { min-height: 100vh; }
</style>
