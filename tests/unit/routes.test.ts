import { describe, expect, test } from 'vitest';
import { LOCALES } from '../../src/config/site';
import { PAGES, alternates, findPageByPath, pagePath } from '../../src/i18n/routes';
import { TOOLS } from '../../src/tools/registry';

const SITE = 'https://example.test';

describe('таблица маршрутов', () => {
  test('адреса из SPEC', () => {
    expect(pagePath('home', 'ru')).toBe('/');
    expect(pagePath('home', 'en')).toBe('/en/');
    expect(pagePath('tool:heic-to-jpg', 'ru')).toBe('/heic-v-jpg');
    expect(pagePath('tool:heic-to-jpg', 'en')).toBe('/en/heic-to-jpg');
    expect(pagePath('tool:heic-to-png', 'ru')).toBe('/heic-v-png');
    expect(pagePath('tool:heic-to-png', 'en')).toBe('/en/heic-to-png');
    expect(pagePath('licenses', 'ru')).toBe('/licenses');
    expect(pagePath('licenses', 'en')).toBe('/en/licenses');
  });

  test('у каждой страницы есть адрес на каждом языке, адреса уникальны', () => {
    const all = PAGES.flatMap((page) => LOCALES.map((locale) => page.paths[locale]));
    expect(all.every(Boolean)).toBe(true);
    expect(new Set(all).size).toBe(all.length);
    for (const page of PAGES) expect(page.paths.en.startsWith('/en/')).toBe(true);
  });

  test('слаги инструментов не совпадают с языковым префиксом', () => {
    for (const tool of TOOLS) expect(LOCALES).not.toContain(tool.slugs.ru);
  });

  test('hreflang: ru, en и x-default → русская версия', () => {
    expect(alternates('tool:heic-to-jpg', SITE)).toEqual([
      { hreflang: 'ru', href: `${SITE}/heic-v-jpg` },
      { hreflang: 'en', href: `${SITE}/en/heic-to-jpg` },
      { hreflang: 'x-default', href: `${SITE}/heic-v-jpg` },
    ]);
  });

  test.each([
    ['/', 'home', 'ru'],
    ['/index.html', 'home', 'ru'],
    ['/en/', 'home', 'en'],
    ['/en', 'home', 'en'],
    ['/en/index.html', 'home', 'en'],
    ['/heic-v-jpg', 'tool:heic-to-jpg', 'ru'],
    ['/heic-v-jpg/', 'tool:heic-to-jpg', 'ru'],
    ['/heic-v-jpg.html', 'tool:heic-to-jpg', 'ru'],
    ['/en/heic-to-png', 'tool:heic-to-png', 'en'],
    ['/en/licenses.html', 'licenses', 'en'],
  ])('findPageByPath(%s) → %s/%s', (path, id, locale) => {
    const found = findPageByPath(path);
    expect(found?.page.id).toBe(id);
    expect(found?.locale).toBe(locale);
  });

  test('неизвестный путь', () => {
    expect(findPageByPath('/nope')).toBeNull();
    expect(findPageByPath('/en/404.html')).toBeNull();
  });
});
