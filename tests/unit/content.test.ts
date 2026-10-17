import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { parse } from 'yaml';
import { buildContentMd } from '../../scripts/content-md';
import { LOCALES } from '../../src/config/site';
import { UI } from '../../src/i18n/ui';
import { TOOLS } from '../../src/tools/registry';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const yaml = (path: string) => parse(readFileSync(ROOT + path, 'utf8'));

describe('тексты', () => {
  test('CONTENT.md актуален (иначе: npm run content)', () => {
    expect(readFileSync(ROOT + 'CONTENT.md', 'utf8')).toBe(buildContentMd());
  });

  test.each(TOOLS.flatMap((tool) => LOCALES.map((locale) => [tool.id, locale] as const)))('%s/%s: структура страницы-конвертера', (id, locale) => {
    const tool = TOOLS.find((t) => t.id === id)!;
    const c = yaml(`src/content/tools/${locale}/${tool.content}.yaml`);
    expect(c.howTo.steps).toHaveLength(3);
    expect(c.why.items).toHaveLength(4);
    expect(c.faq.items.length).toBeGreaterThanOrEqual(6);
    expect(c.faq.items.length).toBeLessThanOrEqual(8);
    expect([...c.title].length).toBeLessThanOrEqual(70);
    expect([...c.description].length).toBeLessThanOrEqual(170);
  });

  test('у каждого языка свои тексты (не копия)', () => {
    for (const tool of TOOLS) {
      const ru = yaml(`src/content/tools/ru/${tool.content}.yaml`);
      const en = yaml(`src/content/tools/en/${tool.content}.yaml`);
      expect(ru.title).not.toBe(en.title);
      expect(ru.faq.items[0].a).not.toBe(en.faq.items[0].a);
    }
  });

  test('уникальные title и description на всех страницах', () => {
    const files = LOCALES.flatMap((locale) => [
      ...readdirSync(ROOT + `src/content/tools/${locale}`).map((f) => `src/content/tools/${locale}/${f}`),
      ...readdirSync(ROOT + `src/content/pages/${locale}`).map((f) => `src/content/pages/${locale}/${f}`),
    ]);
    const titles = files.map((f) => yaml(f).title);
    const descriptions = files.map((f) => yaml(f).description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  test('без обещания «файлы меньше за счёт MozJPEG» (решение владельца)', () => {
    const all = LOCALES.flatMap((l) => TOOLS.map((t) => readFileSync(ROOT + `src/content/tools/${l}/${t.content}.yaml`, 'utf8'))).join('\n');
    expect(all).not.toMatch(/MozJPEG[^\n]*(меньше|smaller)/i);
  });

  test('строки интерфейса заполнены на всех языках', () => {
    const walk = (value: unknown): string[] => (typeof value === 'string' ? [value] : Object.values(value as object).flatMap(walk));
    for (const locale of LOCALES) for (const s of walk(UI[locale])) expect(s.trim()).not.toBe('');
  });
});
