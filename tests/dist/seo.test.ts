import { describe, expect, test } from 'vitest';
import { CONTACT_EMAIL, LOCALES } from '../../src/config/site';
import { PAGES, pagePath, toolPageId } from '../../src/i18n/routes';
import { TOOLS } from '../../src/tools/registry';
import { INDEXING, SITE, TOOL_PAGES, htmlFiles, readHtml, readText, urlPathFor } from './helpers';

const pages = htmlFiles();
const notFound = pages.filter((f) => /(^|\/)404\.html$/.test(f));
const regular = pages.filter((f) => !notFound.includes(f));

describe('сборка: страницы', () => {
  test('собраны все страницы из таблицы маршрутов и 404 на обоих языках', () => {
    const built = new Set(regular.map(urlPathFor));
    for (const page of PAGES) for (const locale of LOCALES) expect(built).toContain(page.paths[locale]);
    expect(notFound.sort()).toEqual(['404.html', 'en/404.html']);
    expect(regular).toHaveLength(PAGES.length * LOCALES.length);
  });

  test.each(pages)('%s: lang, title, description, один H1', (file) => {
    const { doc } = readHtml(file);
    const lang = doc.querySelector('html')?.getAttribute('lang');
    expect(lang).toBe(file.startsWith('en/') ? 'en' : 'ru');
    expect(doc.querySelector('title')?.text.trim()).toBeTruthy();
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
  });

  test('title и description уникальны', () => {
    const titles = regular.map((f) => readHtml(f).doc.querySelector('title')!.text);
    const descriptions = regular.map((f) => readHtml(f).doc.querySelector('meta[name="description"]')!.getAttribute('content'));
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  test.each(regular)('%s: canonical и hreflang (ru, en, x-default), взаимные', (file) => {
    const { doc } = readHtml(file);
    const path = urlPathFor(file);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(SITE + path);
    const alternates = Object.fromEntries(doc.querySelectorAll('link[rel="alternate"]').map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    expect(Object.keys(alternates).sort()).toEqual(['en', 'ru', 'x-default']);
    expect(alternates['x-default']).toBe(alternates.ru);
    const self = file.startsWith('en/') ? alternates.en : alternates.ru;
    expect(self).toBe(SITE + path);
    // страница на другом языке ссылается обратно
    const other = file.startsWith('en/') ? alternates.ru! : alternates.en!;
    const otherFile = regular.find((f) => SITE + urlPathFor(f) === other)!;
    const back = readHtml(otherFile).doc.querySelectorAll('link[rel="alternate"]').map((l) => l.getAttribute('href'));
    expect(back).toContain(SITE + path);
  });

  test.each(regular)('%s: переключатель языка ведёт на ту же страницу', (file) => {
    const { doc } = readHtml(file);
    const link = doc.querySelector('nav.lang a');
    const alternates = Object.fromEntries(doc.querySelectorAll('link[rel="alternate"]').map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]));
    const target = file.startsWith('en/') ? alternates.ru : alternates.en;
    expect(SITE + link?.getAttribute('href')).toBe(target);
  });

  test.each(pages)('%s: robots noindex в тестовом режиме, 404 — всегда', (file) => {
    const robots = readHtml(file).doc.querySelector('meta[name="robots"]')?.getAttribute('content');
    if (!INDEXING || notFound.includes(file)) expect(robots).toBe('noindex, nofollow');
    else expect(robots).toBeUndefined();
  });

  test.each(notFound)('%s: без canonical и hreflang', (file) => {
    const { doc } = readHtml(file);
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
    expect(doc.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
  });
});

describe('сборка: контакты', () => {
  test.each(LOCALES)('%s: почта ссылкой mailto', (locale) => {
    const { doc } = readHtml(`${pagePath('contacts', locale).slice(1)}.html`);
    expect(doc.querySelector(`main a[href="mailto:${CONTACT_EMAIL}"]`)?.text).toBe(CONTACT_EMAIL);
  });

  test.each(pages)('%s: в подвале ссылка на «Контакты» своего языка', (file) => {
    const hrefs = readHtml(file).doc.querySelectorAll('footer a').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain(pagePath('contacts', file.startsWith('en/') ? 'en' : 'ru'));
  });
});

describe('сборка: шапка и подвал', () => {
  test.each(pages)('%s: один переключатель языка — в шапке; в подвале все инструменты своего языка', (file) => {
    const { doc } = readHtml(file);
    expect(doc.querySelectorAll('nav.lang')).toHaveLength(1);
    expect(doc.querySelector('header nav.lang')).not.toBeNull();
    const locale = file.startsWith('en/') ? 'en' : 'ru';
    const hrefs = doc.querySelectorAll('footer a').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual([...TOOLS.map((tool) => pagePath(toolPageId(tool.id), locale)), pagePath('licenses', locale), pagePath('contacts', locale)]);
  });
});

describe('сборка: JSON-LD', () => {
  const types = (file: string) =>
    readHtml(file)
      .doc.querySelectorAll('script[type="application/ld+json"]')
      .map((s) => JSON.parse(s.text) as Record<string, unknown>);

  test.each(TOOL_PAGES)('%s: WebApplication, FAQPage, BreadcrumbList', (file) => {
    const data = types(file);
    expect(data.map((d) => d['@type']).sort()).toEqual(['BreadcrumbList', 'FAQPage', 'WebApplication']);
    const faq = data.find((d) => d['@type'] === 'FAQPage') as { mainEntity: unknown[] };
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(6);
    const app = data.find((d) => d['@type'] === 'WebApplication') as { url: string };
    expect(app.url).toBe(SITE + urlPathFor(file));
  });

  test('JSON-LD не ломает разметку (нет «</» внутри)', () => {
    for (const file of pages) {
      for (const script of readHtml(file).doc.querySelectorAll('script[type="application/ld+json"]')) expect(script.text).not.toContain('</');
    }
  });
});

describe('сборка: sitemap и robots.txt', () => {
  test('sitemap содержит все страницы с альтернативами и без 404', () => {
    expect(readText('sitemap-index.xml')).toContain(`${SITE}/sitemap-0.xml`);
    const xml = readText('sitemap-0.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.sort()).toEqual(regular.map((f) => SITE + urlPathFor(f)).sort());
    expect(xml).not.toContain('404');
    for (const url of xml.split('<url>').slice(1)) {
      const langs = [...url.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]).sort();
      expect(langs).toEqual(['en', 'ru', 'x-default']);
    }
  });

  test('robots.txt соответствует флагу индексации', () => {
    const robots = readText('robots.txt');
    if (INDEXING) {
      expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
      expect(robots).not.toContain('Disallow: /');
    } else {
      expect(robots).toBe('User-agent: *\nDisallow: /\n');
    }
  });
});
