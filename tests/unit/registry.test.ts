import { describe, expect, test } from 'vitest';
import { INPUT_FORMATS, OUTPUT_FORMATS, TOOLS, relatedTools } from '../../src/tools/registry';

describe('реестр инструментов', () => {
  test('слаги конвертеров: ru «x-v-y», en «x-to-y»; входной формат не совпадает с целевым', () => {
    for (const tool of TOOLS.filter((t) => t.mode === 'convert')) {
      expect(tool.slugs.ru).toMatch(/^[a-z]+-v-[a-z]+$/);
      expect(tool.slugs.en).toMatch(/^[a-z]+-to-[a-z]+$/);
      expect(tool.id).toBe(tool.slugs.en);
      expect(tool.inputFormats).not.toContain(tool.defaultOutput);
      expect(tool.outputs).toContain(tool.defaultOutput);
      for (const id of tool.inputFormats) expect(INPUT_FORMATS).toHaveProperty(id);
      for (const id of tool.outputs) expect(OUTPUT_FORMATS).toHaveProperty(id);
    }
  });

  test('сжатие и размер: любой вход, по умолчанию «Исходный», перелинковка задана вручную', () => {
    const editors = TOOLS.filter((t) => t.mode !== 'convert');
    expect(editors.map((t) => t.id)).toEqual(['compress-image', 'resize-image']);
    for (const tool of editors) {
      expect(tool.inputFormats).toEqual(Object.keys(INPUT_FORMATS));
      expect(tool.defaultOutput).toBe('original');
      expect(tool.outputs).toEqual(['original', 'jpeg', 'png', 'webp']);
      for (const id of tool.related ?? []) expect(TOOLS.map((t) => t.id)).toContain(id);
    }
  });

  test('перелинковка: обратная пара, тот же вход, тот же выход', () => {
    const table = Object.fromEntries(TOOLS.map((tool) => [tool.id, relatedTools(tool).map((t) => t.id)]));
    expect(table).toEqual({
      'compress-image': ['resize-image', 'heic-to-jpg', 'png-to-jpg', 'jpg-to-webp'],
      'resize-image': ['compress-image', 'heic-to-jpg', 'jpg-to-webp', 'png-to-jpg'],
      'heic-to-jpg': ['heic-to-png', 'heic-to-webp', 'avif-to-jpg', 'png-to-jpg'],
      'heic-to-png': ['heic-to-jpg', 'heic-to-webp', 'avif-to-png', 'jpg-to-png'],
      'heic-to-webp': ['heic-to-jpg', 'heic-to-png', 'jpg-to-webp', 'png-to-webp'],
      'avif-to-jpg': ['avif-to-png', 'heic-to-jpg', 'png-to-jpg', 'webp-to-jpg'],
      'avif-to-png': ['avif-to-jpg', 'heic-to-png', 'jpg-to-png', 'webp-to-png'],
      'jpg-to-png': ['png-to-jpg', 'jpg-to-webp', 'jpg-to-ico', 'heic-to-png'],
      'jpg-to-webp': ['webp-to-jpg', 'jpg-to-png', 'jpg-to-ico', 'heic-to-webp'],
      'jpg-to-ico': ['jpg-to-png', 'jpg-to-webp', 'png-to-ico'],
      'png-to-jpg': ['jpg-to-png', 'png-to-webp', 'png-to-ico', 'heic-to-jpg'],
      'png-to-webp': ['webp-to-png', 'png-to-jpg', 'png-to-ico', 'heic-to-webp'],
      'png-to-ico': ['png-to-jpg', 'png-to-webp', 'jpg-to-ico'],
      'webp-to-jpg': ['jpg-to-webp', 'webp-to-png', 'heic-to-jpg', 'avif-to-jpg'],
      'webp-to-png': ['png-to-webp', 'webp-to-jpg', 'heic-to-png', 'avif-to-png'],
      'gif-to-jpg': ['gif-to-png', 'heic-to-jpg', 'avif-to-jpg', 'png-to-jpg'],
      'gif-to-png': ['gif-to-jpg', 'heic-to-png', 'avif-to-png', 'jpg-to-png'],
      'bmp-to-jpg': ['bmp-to-png', 'heic-to-jpg', 'avif-to-jpg', 'png-to-jpg'],
      'bmp-to-png': ['bmp-to-jpg', 'heic-to-png', 'avif-to-png', 'jpg-to-png'],
      'tiff-to-jpg': ['tiff-to-png', 'heic-to-jpg', 'avif-to-jpg', 'png-to-jpg'],
      'tiff-to-png': ['tiff-to-jpg', 'heic-to-png', 'avif-to-png', 'jpg-to-png'],
      'jxl-to-jpg': ['jxl-to-png', 'heic-to-jpg', 'avif-to-jpg', 'png-to-jpg'],
      'jxl-to-png': ['jxl-to-jpg', 'heic-to-png', 'avif-to-png', 'jpg-to-png'],
    });
  });

  test('у каждой страницы есть хотя бы одна ссылка на другую', () => {
    for (const tool of TOOLS) expect(relatedTools(tool).length).toBeGreaterThan(0);
  });
});
