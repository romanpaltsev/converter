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

  test('клиентский JS только на страницах с конвертером (инструменты и главная), WASM в HTML не подключается', () => {
    expect(pages.filter((file) => WIDGET_PAGES.includes(file)).sort()).toEqual([...WIDGET_PAGES].sort());
    for (const file of pages) {
      const { raw, doc } = readHtml(file);
      const scripts = doc.querySelectorAll('script[src]');
      if (WIDGET_PAGES.includes(file)) expect(scripts.length, file).toBe(1);
      else expect(scripts, `на ${file} не должно быть JS`).toHaveLength(0);
      expect(raw).not.toMatch(/\.wasm/);
    }
  });
});
