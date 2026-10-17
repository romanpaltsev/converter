import { describe, expect, test } from 'vitest';
import { filterExif, isAppleMakerNote, prepareExif } from '../../src/converter/metadata/exif-filter';
import { type ExifData, TAG, parseTiff, writeTiff } from '../../src/converter/metadata/tiff';
import { readExif } from './helpers/exif';
import { fixture } from './helpers/fixtures';

const PRIVATE_IFD0 = ['Make', 'Model', 'Software'];
const PRIVATE_EXIF = ['SerialNumber', 'LensModel', 'ExifImageWidth', 'ExifImageHeight', 'ColorSpace'];

describe.each(['big-endian.tiff', 'little-endian.tiff'])('режим по умолчанию (%s)', (name) => {
  const source = fixture(`exif/${name}`);

  test('сохраняются только даты, Orientation = 1', async () => {
    const { tiff, warnings } = prepareExif(source, { mode: 'dates', width: 3024, height: 4032 });
    expect(warnings).toEqual([]);
    const exif = await readExif(tiff!);
    expect(exif.ifd0?.Orientation).toBe(1);
    expect(exif.ifd0?.ModifyDate).toBe('2024:07:15 14:23:05');
    expect(exif.exif?.DateTimeOriginal).toBe('2024:07:15 14:23:05');
    expect(exif.exif?.CreateDate).toBe('2024:07:15 14:23:05');
    expect(exif.exif?.OffsetTime).toBe('+03:00');
    expect(exif.exif?.OffsetTimeOriginal).toBe('+03:00');
    expect(exif.exif?.OffsetTimeDigitized).toBe('+03:00');
    expect(exif.exif?.SubSecTimeOriginal).toBe('123');
  });

  test('нет GPS, производителя, модели, серийного номера', async () => {
    const { tiff } = prepareExif(source, { mode: 'dates', width: 3024, height: 4032 });
    const exif = await readExif(tiff!);
    expect(exif.gps).toBeUndefined();
    for (const key of PRIVATE_IFD0) expect(exif.ifd0).not.toHaveProperty(key);
    for (const key of PRIVATE_EXIF) expect(exif.exif).not.toHaveProperty(key);
    const parsed = parseTiff(tiff!);
    expect(parsed.gps).toHaveLength(0);
    // кроме дат остаются только Orientation и служебная ExifVersion
    expect(parsed.ifd0.map((e) => e.tag).sort()).toEqual([TAG.Orientation, TAG.DateTime].sort());
    expect(parsed.exif.map((e) => e.tag)).toContain(TAG.ExifVersion);
  });
});

describe.each(['big-endian.tiff', 'little-endian.tiff'])('режим «все метаданные» (%s)', (name) => {
  const source = fixture(`exif/${name}`);

  test('GPS и камера сохраняются, Orientation = 1, размер пересчитан', async () => {
    const { tiff } = prepareExif(source, { mode: 'all', width: 3024, height: 4032 });
    const exif = await readExif(tiff!);
    expect(exif.ifd0?.Orientation).toBe(1);
    expect(exif.ifd0?.Make).toBe('Apple');
    expect(exif.exif?.SerialNumber).toBe('TESTSERIAL0001');
    expect(exif.exif?.ExifImageWidth).toBe(3024);
    expect(exif.exif?.ExifImageHeight).toBe(4032);
    expect(exif.gps?.latitude).toBeCloseTo(55.7539, 4);
    expect(exif.gps?.longitude).toBeCloseTo(37.6208, 4);
    expect(exif.exif?.DateTimeOriginal).toBe('2024:07:15 14:23:05');
  });
});

describe('MakerNote', () => {
  const base = parseTiff(fixture('exif/big-endian.tiff'));
  const note = (prefix: string, size = 64) => {
    const value = new Uint8Array(size);
    value.set(new TextEncoder().encode(prefix));
    return { tag: TAG.MakerNote, type: 7, count: size, value };
  };
  const withNote = (prefix: string, size?: number): ExifData => ({ ...base, exif: [...base.exif, note(prefix, size)] });
  const hasNote = (data: ExifData) => data.exif.some((e) => e.tag === TAG.MakerNote);

  test('распознаётся MakerNote Apple', () => {
    expect(isAppleMakerNote(note('Apple iOS\0'))).toBe(true);
    expect(isAppleMakerNote(note('SAMSUNG'))).toBe(false);
  });

  test('Apple сохраняется в режиме «все», чужой — нет', () => {
    expect(hasNote(filterExif(withNote('Apple iOS\0'), { mode: 'all', width: 1, height: 1 }))).toBe(true);
    expect(hasNote(filterExif(withNote('Nikon\0'), { mode: 'all', width: 1, height: 1 }))).toBe(false);
  });

  test('в режиме по умолчанию MakerNote удаляется всегда', () => {
    expect(hasNote(filterExif(withNote('Apple iOS\0'), { mode: 'dates', width: 1, height: 1 }))).toBe(false);
  });

  test('если EXIF не помещается в лимит — сначала отбрасывается MakerNote', () => {
    const big = writeTiff(withNote('Apple iOS\0', 70_000));
    const result = prepareExif(big, { mode: 'all', width: 1, height: 1, maxBytes: 65527 });
    expect(result.warnings).toEqual(['exif-makernote-dropped']);
    expect(hasNote(parseTiff(result.tiff!))).toBe(false);
    expect(parseTiff(result.tiff!).gps.length).toBeGreaterThan(0);
  });
});

describe('prepareExif: крайние случаи', () => {
  test('EXIF нет — результата нет', () => {
    expect(prepareExif(null, { mode: 'dates', width: 1, height: 1 })).toEqual({ tiff: null, warnings: [] });
  });

  test('нечитаемый EXIF — предупреждение, конвертация продолжается', () => {
    expect(prepareExif(new TextEncoder().encode('garbage'), { mode: 'all', width: 1, height: 1 })).toEqual({
      tiff: null,
      warnings: ['exif-unreadable'],
    });
  });

  test('если не помогло и отбрасывание MakerNote — остаются только даты', () => {
    const source = parseTiff(fixture('exif/big-endian.tiff'));
    const huge = { tag: 0x9286, type: 7, count: 70_000, value: new Uint8Array(70_000) }; // UserComment
    const big = writeTiff({ ...source, exif: [...source.exif, huge] });
    const result = prepareExif(big, { mode: 'all', width: 1, height: 1, maxBytes: 65527 });
    expect(result.warnings).toEqual(['exif-reduced-to-dates']);
    expect(parseTiff(result.tiff!).gps).toHaveLength(0);
  });
});
