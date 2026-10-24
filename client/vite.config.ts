import { defineConfig } from 'vite';

// On GitHub Pages the site lives under /<repo>/; locally it's at /.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
});
