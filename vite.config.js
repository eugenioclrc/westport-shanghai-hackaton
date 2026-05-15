import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  publicDir: false,
  plugins: [svelte()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/products': 'http://localhost:3000',
      '/analyses': 'http://localhost:3000',
    },
  },
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
});
