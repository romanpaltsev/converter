import { describe, expect, test } from 'vitest';
import { WIDGET_PAGES, htmlFiles, readHtml } from './helpers';

const pages = htmlFiles();
const DATA_TYPES = new Set(['application/ld+json', 'application/json']);

describe('сборка: совместимость со строгим CSP', () => {
  test.each(pages)('%s: нет инлайн-скриптов, <style> и style=', (file) => {
    const { raw, doc } = readHtml(file);
    for (const script of doc.querySelectorAll('script')) {
      const type = script.getAttribute('type') ?? '';
      if (DATA_TYPES.has(type)) continue; // блоки данных браузер не исполняет
      expect(script.getAttribute('src'), `инлайн-скрипт в ${file}`).toBeTruthy();
    }
    expect(doc.querySelectorAll('style')).toHaveLength(0);
    expect(raw).not.toMatch(/\sstyle\s*=/i);
    expect(raw).not.toMatch(/\son[a-z]+\s*=/i); // обработчики в атрибутах тоже инлайн-код
  });

  test.each(pages)('%s: ресурсы только со своего домена', (file) => {
    const { doc } = readHtml(file);
    const resources = [
      ...doc.querySelectorAll('script[src]').map((e) => e.getAttribute('src')!),
      ...doc.querySelectorAll('link[rel="stylesheet"], link[rel="icon"], link[rel="preload"], link[rel="modulepreload"]').map((e) => e.getAttribute('href')!),
      ...doc.querySelectorAll('img[src], source[src], iframe[src]').map((e) => e.getAttribute('src')!),
    ];
    for (const url of resources) expect(url, `${file}: ${url}`).toMatch(/^\/(?!\/)/);
  });

  test('JS: на каждой странице — скрипт темы в <head>, на страницах с конвертером — ещё модуль виджета; WASM в HTML не подключается', () => {
    expect(pages.filter((file) => WIDGET_PAGES.includes(file)).sort()).toEqual([...WIDGET_PAGES].sort());
    for (const file of pages) {
      const { raw, doc } = readHtml(file);
      // тема — обычный (не module, без defer/async) скрипт до стилей: ставит data-theme до первой отрисовки
      const head = doc.querySelector('head')!;
      const theme = head.querySelector('script[src]');
      expect(theme?.getAttribute('src'), file).toMatch(/^\/_astro\/theme\.[\w-]+\.js$/);
      for (const attr of ['type', 'defer', 'async']) expect(theme!.hasAttribute(attr), `${file}: ${attr}`).toBe(false);
      const order = head.querySelectorAll('script[src], link[rel="stylesheet"]');
      expect(order[0], file).toBe(theme);
      const others = doc.querySelectorAll('script[src]').filter((script) => script !== theme);
      expect(
        others.map((script) => script.getAttribute('type')),
        `${file}: кроме темы — только модуль виджета и только на страницах с конвертером`,
      ).toEqual(WIDGET_PAGES.includes(file) ? ['module'] : []);
      expect(raw).not.toMatch(/\.wasm/);
    }
  });
});
