import { defineConfig } from 'vite';

// Builds the Fork SDK (src/sdk.ts) as one self-contained ES module for the Mana app:
//   npx vite build --config vite.sdk.config.ts  ->  ../mana/sdk/fork-sdk.js
export default defineConfig({
  build: {
    lib: { entry: 'src/sdk.ts', formats: ['es'], fileName: () => 'fork-sdk.js' },
    outDir: '../mana/sdk',
    emptyOutDir: true,
    minify: true,
  },
});
