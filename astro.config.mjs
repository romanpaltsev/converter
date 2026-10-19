// @ts-check
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import { defineConfig, envField } from 'astro/config';
import { alternates, findPageByPath } from './src/i18n/routes.ts';

// Переменные из .env (если есть) — для SITE_URL, который нужен уже здесь, в конфиге.
if (existsSync('.env')) process.loadEnvFile('.env');

/** Адрес сайта: переезд на финальный домен — смена одной переменной SITE_URL. */
const SITE_URL = (process.env.SITE_URL || 'https://converter.hotbar.pro').replace(/\/+$/, '');

/**
 * pdf.js («PDF в JPG/PNG») загружает стандартные шрифты, CMap, ICC и WASM-декодеры по адресам каталогов —
 * кладём их рядом со сборкой. Версия в пути: под /_astro/ nginx кэширует на год, а новая версия — новый адрес.
 * @returns {import('astro').AstroIntegration}
 */
function pdfjsAssets() {
  const source = new URL('./node_modules/pdfjs-dist/', import.meta.url);
  const { version } = JSON.parse(readFileSync(new URL('package.json', source), 'utf8'));
  const target = `_astro/pdfjs/${version}/`;
  const dirs = ['standard_fonts', 'cmaps', 'iccs', 'wasm'];
  // скрипты PDF (QuickJS) не нужны: JavaScript внутри PDF не выполняем
  const filter = (/** @type {string} */ file) => !/quickjs/.test(file);
  return {
    name: 'pdfjs-assets',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        for (const name of dirs) await cp(new URL(`${name}/`, source), new URL(`${target}${name}/`, dir), { recursive: true, filter });
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(`/${target}`, (request, response, next) => {
          const path = decodeURIComponent((request.url ?? '').split('?')[0] ?? '');
          const file = new URL(`.${path}`, source);
          const name = path.split('/')[1] ?? '';
          if (!dirs.includes(name) || !filter(path) || !existsSync(fileURLToPath(file))) return next();
          createReadStream(file).pipe(response);
        });
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // Адреса строим сами из таблицы маршрутов: /heic-v-jpg без слеша, /en/ со слешем.
  trailingSlash: 'ignore',
  build: { format: 'preserve', inlineStylesheets: 'never' },
  compressHTML: true,
  devToolbar: { enabled: false },
  i18n: {
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: false },
  },
  env: {
    schema: {
      PUBLIC_INDEXING: envField.boolean({ context: 'server', access: 'public', default: false }),
      ADS_ENABLED: envField.boolean({ context: 'server', access: 'public', default: false }),
      PRO_ENABLED: envField.boolean({ context: 'server', access: 'public', default: false }),
    },
  },
  integrations: [
    pdfjsAssets(),
    sitemap({
      filter: (page) => !/\/404(\.html)?\/?$/.test(new URL(page).pathname),
      // Встроенная i18n-опция не поддерживает разные слаги на разных языках —
      // адрес и альтернативы берём из своей таблицы маршрутов.
      serialize(item) {
        const found = findPageByPath(new URL(item.url).pathname);
        if (!found) return item;
        const links = alternates(found.page.id, SITE_URL).map((a) => ({ lang: a.hreflang, url: a.href }));
        return { ...item, url: links.find((l) => l.lang === found.locale)?.url ?? item.url, links };
      },
    }),
  ],
  vite: {
    // Никаких инлайн-скриптов и data:-ресурсов — строгий CSP без 'unsafe-inline'.
    build: { assetsInlineLimit: 0 },
    // Module worker с ленивыми import(): формат es обязателен (Vite 8 не собирает iife с чанками).
    worker: { format: 'es' },
    optimizeDeps: { exclude: ['@jsquash/jpeg', '@jsquash/png'] },
  },
});
