import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SINGLE_FILE=1 builds one self-contained index.html (all JS/CSS inlined) for hosting inside
// Mana; otherwise a normal build. On GitHub Pages the site lives under /<repo>/.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: process.env.SINGLE_FILE ? [viteSingleFile()] : [],
  build: process.env.SINGLE_FILE ? { outDir: 'dist-single' } : {},
});
