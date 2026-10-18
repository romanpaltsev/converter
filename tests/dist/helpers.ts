import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type HTMLElement, parse } from 'node-html-parser';
import { TOOLS } from '../../src/tools/registry';

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

/** Адрес страницы, который отдаёт nginx для файла из dist. */
export function urlPathFor(file: string): string {
  return '/' + file.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
}
