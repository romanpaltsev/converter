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
      'heic-to-jpg': ['heic-to-png', 'heic-to-webp', 'avif-to-jpg', 'png-to-jpg'],
      'heic-to-png': ['heic-to-jpg', 'heic-to-webp', 'avif-to-png', 'jpg-to-png'],
      'heic-to-webp': ['heic-to-jpg', 'heic-to-png', 'jpg-to-webp', 'png-to-webp'],
      'avif-to-jpg': ['avif-to-png', 'heic-to-jpg', 'png-to-jpg', 'webp-to-jpg'],
      'avif-to-png': ['avif-to-jpg', 'heic-to-png', 'jpg-to-png', 'webp-to-png'],
      'jpg-to-png': ['png-to-jpg', 'jpg-to-webp', 'heic-to-png', 'avif-to-png'],
      'jpg-to-webp': ['webp-to-jpg', 'jpg-to-png', 'heic-to-webp', 'png-to-webp'],
      'png-to-jpg': ['jpg-to-png', 'png-to-webp', 'heic-to-jpg', 'avif-to-jpg'],
      'png-to-webp': ['webp-to-png', 'png-to-jpg', 'heic-to-webp', 'jpg-to-webp'],
      'webp-to-jpg': ['jpg-to-webp', 'webp-to-png', 'heic-to-jpg', 'avif-to-jpg'],
      'webp-to-png': ['png-to-webp', 'webp-to-jpg', 'heic-to-png', 'avif-to-png'],
    });
  });

  test('у каждой страницы есть хотя бы одна ссылка на другую', () => {
    for (const tool of TOOLS) expect(relatedTools(tool).length).toBeGreaterThan(0);
  });
});
