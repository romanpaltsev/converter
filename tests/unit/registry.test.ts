import { describe, expect, test } from 'vitest';
import { FIXED_OUTPUT_MODES, INPUT_FORMATS, OUTPUT_FORMATS, TOOLS, relatedTools } from '../../src/tools/registry';

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

  test('сжатие, размер и метаданные: любой вход, по умолчанию «Исходный», перелинковка задана вручную', () => {
    const editors = TOOLS.filter((t) => t.mode !== 'convert' && t.mode !== 'to-pdf' && t.mode !== 'from-pdf');
    expect(editors.map((t) => t.id)).toEqual(['compress-image', 'resize-image', 'remove-metadata', 'exif-viewer']);
    for (const tool of editors) {
      expect(tool.inputFormats).toEqual(Object.keys(INPUT_FORMATS));
      expect(tool.defaultOutput).toBe('original');
      // метаданные удаляются и читаются без перекодирования — формат не выбирается
      expect(tool.outputs).toEqual(FIXED_OUTPUT_MODES.includes(tool.mode) ? ['original'] : ['original', 'jpeg', 'png', 'webp']);
      for (const id of tool.related ?? []) expect(TOOLS.map((t) => t.id)).toContain(id);
    }
  });

  test('PDF в картинки: вход — PDF, выход — JPG, PNG или WebP', () => {
    const fromPdf = TOOLS.filter((t) => t.mode === 'from-pdf');
    expect(fromPdf.map((t) => [t.id, t.slugs.ru, t.defaultOutput])).toEqual([
      ['pdf-to-jpg', 'pdf-v-jpg', 'jpeg'],
      ['pdf-to-png', 'pdf-v-png', 'png'],
    ]);
    for (const tool of fromPdf) {
      expect(tool.inputFormats).toEqual(['pdf']);
      expect(tool.outputs).toEqual(['jpeg', 'png', 'webp']);
    }
  });

  test('изображения в PDF: слаги «x-v-pdf» / «x-to-pdf», формат не выбирается, перелинковка вручную', () => {
    const pdf = TOOLS.filter((t) => t.mode === 'to-pdf');
    expect(pdf.map((t) => t.id)).toEqual(['jpg-to-pdf', 'png-to-pdf', 'heic-to-pdf']);
    for (const tool of pdf) {
      expect(tool.slugs.ru).toMatch(/^[a-z]+-v-pdf$/);
      expect(tool.slugs.en).toBe(tool.id);
      expect(tool.outputs).toEqual(['original']);
      expect(tool.related?.length).toBeGreaterThan(0);
      for (const id of tool.related ?? []) expect(TOOLS.map((t) => t.id)).toContain(id);
    }
  });

  test('перелинковка: обратная пара, тот же вход, тот же выход', () => {
    const table = Object.fromEntries(TOOLS.map((tool) => [tool.id, relatedTools(tool).map((t) => t.id)]));
    expect(table).toEqual({
      'compress-image': ['resize-image', 'remove-metadata', 'heic-to-jpg', 'jpg-to-webp'],
      'resize-image': ['compress-image', 'remove-metadata', 'heic-to-jpg', 'jpg-to-webp'],
      'remove-metadata': ['exif-viewer', 'compress-image', 'resize-image', 'heic-to-jpg'],
      'exif-viewer': ['remove-metadata', 'compress-image', 'resize-image', 'heic-to-jpg'],
      'jpg-to-pdf': ['png-to-pdf', 'heic-to-pdf', 'compress-image', 'jpg-to-png'],
      'png-to-pdf': ['jpg-to-pdf', 'heic-to-pdf', 'png-to-jpg', 'compress-image'],
      'heic-to-pdf': ['jpg-to-pdf', 'png-to-pdf', 'heic-to-jpg', 'heic-to-png'],
      'pdf-to-jpg': ['pdf-to-png', 'jpg-to-pdf', 'png-to-pdf', 'compress-image'],
      'pdf-to-png': ['pdf-to-jpg', 'png-to-pdf', 'jpg-to-pdf', 'png-to-jpg'],
      'heic-to-jpg': ['heic-to-png', 'heic-to-webp', 'avif-to-jpg', 'png-to-jpg'],
      'heic-to-png': ['heic-to-jpg', 'heic-to-webp', 'avif-to-png', 'jpg-to-png'],
      'heic-to-webp': ['heic-to-jpg', 'heic-to-png', 'jpg-to-webp', 'png-to-webp'],
      'avif-to-jpg': ['jpg-to-avif', 'avif-to-png', 'heic-to-jpg', 'png-to-jpg'],
      'avif-to-png': ['png-to-avif', 'avif-to-jpg', 'heic-to-png', 'jpg-to-png'],
      'jpg-to-png': ['png-to-jpg', 'jpg-to-webp', 'jpg-to-ico', 'jpg-to-avif'],
      'jpg-to-webp': ['webp-to-jpg', 'jpg-to-png', 'jpg-to-ico', 'jpg-to-avif'],
      'jpg-to-ico': ['jpg-to-png', 'jpg-to-webp', 'jpg-to-avif', 'png-to-ico'],
      'jpg-to-avif': ['avif-to-jpg', 'jpg-to-png', 'jpg-to-webp', 'jpg-to-ico'],
      'png-to-jpg': ['jpg-to-png', 'png-to-webp', 'png-to-ico', 'png-to-avif'],
      'png-to-webp': ['webp-to-png', 'png-to-jpg', 'png-to-ico', 'png-to-avif'],
      'png-to-ico': ['png-to-jpg', 'png-to-webp', 'png-to-avif', 'jpg-to-ico'],
      'png-to-avif': ['avif-to-png', 'png-to-jpg', 'png-to-webp', 'png-to-ico'],
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
