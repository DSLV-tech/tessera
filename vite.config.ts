import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  base: './',
  // Il service worker ha senso solo nella build multi-file servita su http(s):
  // nel bundle single-file (aperto da file://) non esiste un sw.js da registrare.
  define: { __PWA__: JSON.stringify(mode !== 'singlefile') },
  plugins: [react(), ...(mode === 'singlefile' ? [viteSingleFile()] : [])],
  build: {
    outDir: mode === 'singlefile' ? 'dist-single' : 'dist',
    ...(mode === 'singlefile' ? { cssCodeSplit: false, assetsInlineLimit: 100_000_000 } : {}),
  },
}));
