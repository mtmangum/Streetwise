import { defineConfig } from 'vite';

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
// so assets need to be requested with that repo-name prefix. If you rename
// the repo, update this to match.
export default defineConfig({
  base: '/Streetwise/',
  // Phaser is the game runtime and intentionally ships as one cached vendor
  // payload; this threshold keeps Vite from reporting it as accidental bloat.
  build: { chunkSizeWarningLimit: 1500 }
});
