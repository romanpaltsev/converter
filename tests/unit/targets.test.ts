import { describe, expect, test } from 'vitest';
import type { SniffKind } from '../../src/converter/pipeline/sniff';
import { IMAGE_TARGETS, defaultTarget, ownTarget, settingsKey, sharedTargets, targetsFor, visibleSettings } from '../../src/converter/widget/targets';

const settings = { quality: 90, lossless: false, keepMetadata: false };

describe('форматы результата у файла', () => {
  test('картинка — во все форматы, кроме своего; HEIC, GIF, BMP, TIFF, JPEG XL — во все пять', () => {
    expect(targetsFor('jpeg')).toEqual(['png', 'webp', 'avif', 'ico']);
    expect(targetsFor('png')).toEqual(['jpeg', 'webp', 'avif', 'ico']);
    expect(targetsFor('webp')).toEqual(['jpeg', 'png', 'avif', 'ico']);
    expect(targetsFor('avif')).toEqual(['jpeg', 'png', 'webp', 'ico']);
    for (const kind of ['heic', 'gif', 'bmp', 'tiff', 'jxl'] as SniffKind[]) {
      expect(targetsFor(kind)).toEqual([...IMAGE_TARGETS]);
      expect(ownTarget(kind)).toBeNull();
    }
  });

  test('нечитаемый файл и PDF — выбирать нечего', () => {
    expect(targetsFor('unknown')).toEqual([]);
    expect(targetsFor('pdf')).toEqual([]);
  });

  test('предустановка страницы — если подходит файлу; файл уже в этом формате или главная без предустановки — ждёт выбора', () => {
    expect(defaultTarget('heic', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('png', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('jpeg', 'jpeg')).toBeNull();
    expect(defaultTarget('avif', 'avif')).toBeNull();
    expect(defaultTarget('heic', null)).toBeNull();
    expect(defaultTarget('unknown', 'jpeg')).toBeNull();
  });

  test('«Все файлы в …»: форматы, подходящие хотя бы одному файлу, в порядке меню', () => {
    expect(sharedTargets(['jpeg'])).toEqual(['png', 'webp', 'avif', 'ico']);
    expect(sharedTargets(['jpeg', 'png'])).toEqual([...IMAGE_TARGETS]);
    expect(sharedTargets([])).toEqual([]);
  });
});

describe('видимые настройки', () => {
  test('качество — у JPG, AVIF и WebP с потерями; «Без потерь» — у WebP', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'jpeg' }], false)).toEqual({ quality: true, lossless: false, metadata: true, pngWarning: false, icoHint: false, avifHint: false });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], true)).toMatchObject({ quality: false, lossless: true });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], false)).toMatchObject({ quality: true, lossless: true });
    expect(visibleSettings([{ kind: 'jpeg', target: 'avif' }], false)).toMatchObject({ quality: true, avifHint: true });
  });

  test('PNG — предупреждение о размере, ICO — пояснение и без метаданных; смесь форматов — всё нужное', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'png' }], false)).toMatchObject({ quality: false, pngWarning: true, metadata: true });
    expect(visibleSettings([{ kind: 'png', target: 'ico' }], false)).toEqual({ quality: false, lossless: false, metadata: false, pngWarning: false, icoHint: true, avifHint: false });
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
});

describe('ключ настроек готового файла', () => {
  test('учитывает только то, что влияет на формат', () => {
    const png = { kind: 'heic', target: 'png' } as const;
    expect(settingsKey(png, settings)).toBe(settingsKey(png, { ...settings, quality: 50, lossless: true }));
    expect(settingsKey(png, settings)).not.toBe(settingsKey(png, { ...settings, keepMetadata: true }));
    const ico = { kind: 'png', target: 'ico' } as const;
    expect(settingsKey(ico, settings)).toBe(settingsKey(ico, { quality: 10, lossless: true, keepMetadata: true }));
    const jpeg = { kind: 'heic', target: 'jpeg' } as const;
    expect(settingsKey(jpeg, settings)).not.toBe(settingsKey(jpeg, { ...settings, quality: 80 }));
    expect(settingsKey(jpeg, settings)).toBe(settingsKey(jpeg, { ...settings, lossless: true }));
    const webp = { kind: 'heic', target: 'webp' } as const;
    // без потерь качество не важно
    expect(settingsKey(webp, { ...settings, lossless: true })).toBe(settingsKey(webp, { ...settings, lossless: true, quality: 40 }));
    expect(settingsKey(webp, settings)).not.toBe(settingsKey(webp, { ...settings, lossless: true }));
  });
});
