import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type HTMLElement, parse } from 'node-html-parser';
import { CATEGORY_SLUGS, TOOLS, TOOL_CATEGORIES, categoryInputs } from '../../src/tools/registry';

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));
export const SITE = (process.env.SITE_URL || 'https://converter.hotbar.pro').replace(/\/+$/, '');
export const INDEXING = process.env.PUBLIC_INDEXING === 'true';

if (!existsSync(DIST)) throw new Error('Нет dist/ — сначала npm run build');

export function htmlFiles(dir = DIST): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === '_astro' ? [] : htmlFiles(full);
    return name.endsWith('.html') ? [relative(DIST, full)] : [];
  });
}

export function readHtml(file: string): { raw: string; doc: HTMLElement } {
  const raw = readFileSync(join(DIST, file), 'utf8');
  return { raw, doc: parse(raw, { comment: false }) };
}

export function readText(file: string): string {
  return readFileSync(join(DIST, file), 'utf8');
}

/** Файлы страниц-конвертеров в dist (на всех языках). */
export const TOOL_PAGES = TOOLS.flatMap((tool) => [`${tool.slugs.ru}.html`, `en/${tool.slugs.en}.html`]);
/** Главная — универсальный конвертер (формат выбирается у каждого файла). */
export const HOME_PAGES = ['index.html', 'en/index.html'];
/** Страницы разделов («Конвертер аудио»…); у всех, кроме «Обработки фото», — универсальный конвертер. */
export const CATEGORY_PAGES = TOOL_CATEGORIES.flatMap((category) => [`${CATEGORY_SLUGS[category].ru}.html`, `en/${CATEGORY_SLUGS[category].en}.html`]);
const CATEGORY_WIDGET_PAGES = TOOL_CATEGORIES.filter((category) => categoryInputs(category) !== null).flatMap((category) => [`${CATEGORY_SLUGS[category].ru}.html`, `en/${CATEGORY_SLUGS[category].en}.html`]);
/** Страницы с виджетом конвертера, то есть с клиентским JS. */
export const WIDGET_PAGES = [...TOOL_PAGES, ...HOME_PAGES, ...CATEGORY_WIDGET_PAGES];

/** Адрес страницы, который отдаёт nginx для файла из dist. */
export function urlPathFor(file: string): string {
  return '/' + file.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
}
