// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://converter.hotbar.pro',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'preserve', inlineStylesheets: 'never' },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    build: { assetsInlineLimit: 0 },
    worker: { format: 'es' },
    optimizeDeps: { exclude: ['@jsquash/jpeg', '@jsquash/png'] },
  },
});
