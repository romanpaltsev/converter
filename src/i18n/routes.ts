// Явная таблица соответствия страниц между языками: из неё строятся canonical, hreflang,
// переключатель языка, перелинковка и карта сайта. Слаги на разных языках разные.

import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config/site';
import { CATEGORY_SLUGS, TOOLS, TOOL_CATEGORIES, type ToolCategory } from '../tools/registry';

export type PageId = 'home' | 'licenses' | 'contacts' | `tool:${string}` | `category:${ToolCategory}`;

export interface PageRoute {
  id: PageId;
  paths: Record<Locale, string>;
}

export const PAGES: PageRoute[] = [
  { id: 'home', paths: { ru: '/', en: '/en/' } },
  ...TOOL_CATEGORIES.map((category): PageRoute => ({ id: `category:${category}`, paths: { ru: `/${CATEGORY_SLUGS[category].ru}`, en: `/en/${CATEGORY_SLUGS[category].en}` } })),
  ...TOOLS.map((tool): PageRoute => ({ id: `tool:${tool.id}`, paths: { ru: `/${tool.slugs.ru}`, en: `/en/${tool.slugs.en}` } })),
  { id: 'licenses', paths: { ru: '/licenses', en: '/en/licenses' } },
  { id: 'contacts', paths: { ru: '/contacts', en: '/en/contacts' } },
];

export function getPage(id: PageId): PageRoute {
  const page = PAGES.find((p) => p.id === id);
  if (!page) throw new Error(`Неизвестная страница: ${id}`);
  return page;
}

export function pagePath(id: PageId, locale: Locale): string {
  return getPage(id).paths[locale];
}

export function toolPageId(toolId: string): PageId {
  return `tool:${toolId}`;
}

export function categoryPageId(category: ToolCategory): PageId {
  return `category:${category}`;
}

/** Абсолютный URL: адрес сайта берётся из SITE_URL (astro.config.mjs → import.meta.env.SITE). */
export function absoluteUrl(site: string, path: string): string {
  return new URL(path, site.endsWith('/') ? site : `${site}/`).href;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/** hreflang для всех языков плюс x-default (→ язык по умолчанию). */
export function alternates(id: PageId, site: string): Alternate[] {
  const page = getPage(id);
  return [
    ...LOCALES.map((locale) => ({ hreflang: locale, href: absoluteUrl(site, page.paths[locale]) })),
    { hreflang: 'x-default', href: absoluteUrl(site, page.paths[DEFAULT_LOCALE]) },
  ];
}

/** Страница по пути из URL (с любым вариантом слеша на конце и с .html). */
export function findPageByPath(pathname: string): { page: PageRoute; locale: Locale } | null {
  const normalize = (p: string) => p.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/+$/, '$1');
  const target = normalize(pathname);
  for (const page of PAGES) {
    for (const locale of LOCALES) {
      if (normalize(page.paths[locale]) === target) return { page, locale };
    }
  }
  return null;
}
