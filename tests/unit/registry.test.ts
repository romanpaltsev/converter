import { describe, expect, test } from 'vitest';
import { INPUT_FORMATS, OUTPUT_FORMATS, TOOLS, relatedTools } from '../../src/tools/registry';

describe('реестр инструментов', () => {
  test('слаги: ru «x-v-y», en «x-to-y»; входной формат не совпадает с целевым', () => {
    for (const tool of TOOLS) {
      expect(tool.slugs.ru).toMatch(/^[a-z]+-v-[a-z]+$/);
      expect(tool.slugs.en).toMatch(/^[a-z]+-to-[a-z]+$/);
      expect(tool.id).toBe(tool.slugs.en);
      expect(tool.inputFormats).not.toContain(tool.defaultOutput);
      expect(tool.outputs).toContain(tool.defaultOutput);
      for (const id of tool.inputFormats) expect(INPUT_FORMATS).toHaveProperty(id);
      for (const id of tool.outputs) expect(OUTPUT_FORMATS).toHaveProperty(id);
    }
  });

  test('перелинковка: обратная пара, тот же вход, тот же выход', () => {
    const table = Object.fromEntries(TOOLS.map((tool) => [tool.id, relatedTools(tool).map((t) => t.id)]));
    expect(table).toEqual({
      'heic-to-jpg': ['heic-to-png', 'png-to-jpg', 'webp-to-jpg'],
      'heic-to-png': ['heic-to-jpg', 'jpg-to-png', 'webp-to-png'],
      'jpg-to-png': ['png-to-jpg', 'heic-to-png', 'webp-to-png'],
      'png-to-jpg': ['jpg-to-png', 'heic-to-jpg', 'webp-to-jpg'],
      'webp-to-jpg': ['webp-to-png', 'heic-to-jpg', 'png-to-jpg'],
      'webp-to-png': ['webp-to-jpg', 'heic-to-png', 'jpg-to-png'],
    });
  });

  test('у каждой страницы есть хотя бы одна ссылка на другую', () => {
    for (const tool of TOOLS) expect(relatedTools(tool).length).toBeGreaterThan(0);
  });
});
