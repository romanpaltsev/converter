import { describe, expect, test } from 'vitest';
import type { SniffKind } from '../../src/converter/pipeline/sniff';
import { ALL_TARGETS, defaultTarget, jobFor, ownTarget, settingsKey, sharedTargets, targetsFor, visibleSettings } from '../../src/converter/widget/targets';

const settings = { quality: 90, lossless: false, keepMetadata: false, dpi: 150 };

describe('форматы результата у файла', () => {
  test('картинка — во все форматы и в PDF, кроме своего формата; HEIC, GIF, BMP, TIFF, JPEG XL — во все', () => {
    expect(targetsFor('jpeg')).toEqual(['png', 'webp', 'avif', 'ico', 'pdf']);
    expect(targetsFor('png')).toEqual(['jpeg', 'webp', 'avif', 'ico', 'pdf']);
    expect(targetsFor('webp')).toEqual(['jpeg', 'png', 'avif', 'ico', 'pdf']);
    expect(targetsFor('avif')).toEqual(['jpeg', 'png', 'webp', 'ico', 'pdf']);
    for (const kind of ['heic', 'gif', 'bmp', 'tiff', 'jxl'] as SniffKind[]) {
      expect(targetsFor(kind)).toEqual([...ALL_TARGETS]);
      expect(ownTarget(kind)).toBeNull();
    }
  });

  test('PDF — страницы в JPG, PNG или WebP; нечитаемый файл — выбирать нечего', () => {
    expect(targetsFor('pdf')).toEqual(['jpeg', 'png', 'webp']);
    expect(ownTarget('pdf')).toBe('pdf');
    expect(targetsFor('unknown')).toEqual([]);
  });

  test('что делать с файлом: картинка, свой PDF или страницы PDF', () => {
    expect(jobFor('heic', 'jpeg')).toBe('image');
    expect(jobFor('heic', 'pdf')).toBe('document');
    expect(jobFor('pdf', 'png')).toBe('pages');
  });

  test('предустановка страницы — если подходит файлу; файл уже в этом формате или главная без предустановки — ждёт выбора', () => {
    expect(defaultTarget('heic', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('png', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('jpeg', 'jpeg')).toBeNull();
    expect(defaultTarget('avif', 'avif')).toBeNull();
    expect(defaultTarget('heic', null)).toBeNull();
    expect(defaultTarget('unknown', 'jpeg')).toBeNull();
    // PDF на странице картинок: страницы — в формат страницы; PDF на «JPG → ICO» ждёт (ICO из PDF не бывает)
    expect(defaultTarget('pdf', 'png')).toBe('png');
    expect(defaultTarget('pdf', 'ico')).toBeNull();
    expect(defaultTarget('png', 'pdf')).toBe('pdf');
  });

  test('«Все файлы в …»: форматы, подходящие хотя бы одному файлу, в порядке меню', () => {
    expect(sharedTargets(['jpeg'])).toEqual(['png', 'webp', 'avif', 'ico', 'pdf']);
    expect(sharedTargets(['jpeg', 'png'])).toEqual([...ALL_TARGETS]);
    expect(sharedTargets(['pdf'])).toEqual(['jpeg', 'png', 'webp']);
    expect(sharedTargets([])).toEqual([]);
  });
});

describe('видимые настройки', () => {
  test('качество — у JPG, AVIF и WebP с потерями; «Без потерь» — у WebP', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'jpeg' }], false)).toEqual({
      quality: true,
      lossless: false,
      metadata: true,
      pngWarning: false,
      icoHint: false,
      avifHint: false,
      dpi: false,
      pdfLayout: false,
    });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], true)).toMatchObject({ quality: false, lossless: true });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], false)).toMatchObject({ quality: true, lossless: true });
    expect(visibleSettings([{ kind: 'jpeg', target: 'avif' }], false)).toMatchObject({ quality: true, avifHint: true });
  });

  test('PNG — предупреждение о размере, ICO — пояснение и без метаданных; смесь форматов — всё нужное', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'png' }], false)).toMatchObject({ quality: false, pngWarning: true, metadata: true });
    expect(visibleSettings([{ kind: 'png', target: 'ico' }], false)).toMatchObject({ quality: false, lossless: false, metadata: false, pngWarning: false, icoHint: true });
    expect(
      visibleSettings(
        [
          { kind: 'png', target: 'ico' },
          { kind: 'heic', target: 'jpeg' },
        ],
        false,
      ),
    ).toMatchObject({ quality: true, metadata: true, icoHint: true });
    expect(Object.values(visibleSettings([], false)).some(Boolean)).toBe(false);
  });

  test('PDF: у страниц — разрешение и качество, без метаданных и предупреждения PNG; картинка в PDF — размер страницы', () => {
    expect(visibleSettings([{ kind: 'pdf', target: 'jpeg' }], false)).toMatchObject({ dpi: true, quality: true, metadata: false, pdfLayout: false });
    expect(visibleSettings([{ kind: 'pdf', target: 'png' }], false)).toMatchObject({ dpi: true, quality: false, pngWarning: false });
    expect(visibleSettings([{ kind: 'heic', target: 'pdf' }], false)).toEqual({
      quality: false,
      lossless: false,
      metadata: false,
      pngWarning: false,
      icoHint: false,
      avifHint: false,
      dpi: false,
      pdfLayout: true,
    });
  });
});

describe('ключ настроек готового файла', () => {
  test('учитывает только то, что влияет на формат', () => {
    const png = { kind: 'heic', target: 'png' } as const;
    expect(settingsKey(png, settings)).toBe(settingsKey(png, { ...settings, quality: 50, lossless: true }));
    expect(settingsKey(png, settings)).not.toBe(settingsKey(png, { ...settings, keepMetadata: true }));
    const ico = { kind: 'png', target: 'ico' } as const;
    expect(settingsKey(ico, settings)).toBe(settingsKey(ico, { quality: 10, lossless: true, keepMetadata: true, dpi: 150 }));
    const jpeg = { kind: 'heic', target: 'jpeg' } as const;
    expect(settingsKey(jpeg, settings)).not.toBe(settingsKey(jpeg, { ...settings, quality: 80 }));
    expect(settingsKey(jpeg, settings)).toBe(settingsKey(jpeg, { ...settings, lossless: true }));
    const webp = { kind: 'heic', target: 'webp' } as const;
    // без потерь качество не важно
    expect(settingsKey(webp, { ...settings, lossless: true })).toBe(settingsKey(webp, { ...settings, lossless: true, quality: 40 }));
    expect(settingsKey(webp, settings)).not.toBe(settingsKey(webp, { ...settings, lossless: true }));
    // разрешение важно только страницам PDF, метаданные им — нет
    const pages = { kind: 'pdf', target: 'png' } as const;
    expect(settingsKey(pages, settings)).not.toBe(settingsKey(pages, { ...settings, dpi: 300 }));
    expect(settingsKey(pages, settings)).toBe(settingsKey(pages, { ...settings, keepMetadata: true }));
    expect(settingsKey(jpeg, settings)).toBe(settingsKey(jpeg, { ...settings, dpi: 300 }));
    // картинка в PDF: ничего из общих настроек (размер страницы — при сборке)
    const document = { kind: 'heic', target: 'pdf' } as const;
    expect(settingsKey(document, settings)).toBe(settingsKey(document, { quality: 10, lossless: true, keepMetadata: true, dpi: 300 }));
  });
});
