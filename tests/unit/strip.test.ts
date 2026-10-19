import exifr from 'exifr';
import { describe, expect, test } from 'vitest';
import { readOrientation } from '../../src/converter/metadata/exif-filter';
import { tiffFromHeifExif } from '../../src/converter/metadata/heif-exif';
import { isExifItem, isXmpItem, readBoxes, readHeifInfo, readItemData } from '../../src/converter/metadata/heif-items';
import { extractJpegExif, extractJpegIcc, readJpegSegments } from '../../src/converter/metadata/jpeg-segments';
import { readPngChunks } from '../../src/converter/metadata/png-chunks';
import { stripMetadata } from '../../src/converter/metadata/strip';
import { editExif, exifContents } from '../../src/converter/metadata/strip/exif';
import { findEoi } from '../../src/converter/metadata/strip/jpeg';
import type { StripMode } from '../../src/converter/metadata/strip/types';
import { TAG, parseTiff } from '../../src/converter/metadata/tiff';
import { blankGps, entryNumbers, readIfdAt, readLayout } from '../../src/converter/metadata/tiff-layout';
import { readWebpChunks } from '../../src/converter/metadata/webp-chunks';
import { type SniffKind, sniff } from '../../src/converter/pipeline/sniff';
import { fixture, iccFixture } from './helpers/fixtures';

const P3 = iccFixture('DisplayP3Compat-v2-magic.icc');

function strip(bytes: Uint8Array, mode: StripMode) {
  return stripMetadata(bytes, sniff(bytes).kind as Exclude<SniffKind, 'unknown'>, mode);
}

/** Всё, что видит независимый читатель (exifr): EXIF, GPS, XMP, IPTC, текстовые чанки PNG. */
async function everything(bytes: Uint8Array): Promise<Record<string, unknown>> {
  const data = await exifr.parse(bytes, {
    tiff: true,
    exif: true,
    gps: true,
    interop: true,
    xmp: true,
    iptc: true,
    icc: false,
    mergeOutput: true,
    translateValues: false,
    reviveValues: false,
  });
  return (data ?? {}) as Record<string, unknown>;
}

const hasGps = (data: Record<string, unknown>) => Object.keys(data).some((key) => key.startsWith('GPS') || key === 'latitude');
const DATE = '2024:07:15 14:23:05';

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

describe('EXIF: что в нём есть и что остаётся', () => {
  test.each(['exif/big-endian.tiff', 'exif/little-endian.tiff'])('%s: группы данных', (name) => {
    expect(exifContents(fixture(name))).toEqual(expect.arrayContaining(['location', 'camera', 'dates']));
  });

  test.each(['exif/big-endian.tiff', 'exif/little-endian.tiff'])('%s: GPS затирается на месте, остальное байт в байт', async (name) => {
    const tiff = fixture(name);
    const blanked = blankGps(tiff)!;
    expect(blanked).toHaveLength(tiff.length);
    const before = parseTiff(tiff);
    const after = parseTiff(blanked);
    expect(after.gps).toEqual([]);
    expect(after.ifd0).toEqual(before.ifd0);
    expect(after.exif).toEqual(before.exif);
    expect(hasGps(await everything(blanked))).toBe(false);
    // байты GPS (таблица и координаты) — нули, остальное не изменилось
    const gps = readLayout(tiff).gps!;
    const changed = [...tiff.keys()].filter((i) => tiff[i] !== blanked[i]);
    expect(changed.length).toBeGreaterThan(0);
    for (const i of changed) expect(blanked[i]).toBe(0);
    expect(changed.every((i) => i >= gps.offset - 1)).toBe(true);
  });

  test('без GPS затирать нечего', () => {
    const tiff = editExif(fixture('exif/little-endian.tiff'), 'keep-dates').tiff!;
    expect(blankGps(tiff)).toBeNull();
  });

  test('режимы: всё — только ориентация; кроме даты — даты и ориентация; геолокация — тот же размер', async () => {
    const tiff = fixture('exif/big-endian.tiff');
    expect(readOrientation(tiff)).toBe(6);
    const all = editExif(tiff, 'all');
    expect(all.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates']));
    expect(parseTiff(all.tiff!).ifd0.map((e) => e.tag)).toEqual([TAG.Orientation]);
    expect(readOrientation(all.tiff)).toBe(6);

    const dates = editExif(tiff, 'keep-dates');
    expect(dates.removed).not.toContain('dates');
    expect(await everything(dates.tiff!)).toMatchObject({ DateTimeOriginal: DATE, Orientation: 6 });
    expect(hasGps(await everything(dates.tiff!))).toBe(false);
    expect((await everything(dates.tiff!)).Make).toBeUndefined();

    const location = editExif(tiff, 'location');
    expect(location.removed).toEqual(['location']);
    expect(location.tiff).toHaveLength(tiff.length);
    expect(await everything(location.tiff!)).toMatchObject({ Make: expect.any(String), DateTimeOriginal: DATE });
  });

  test('нечитаемый EXIF удаляется целиком', () => {
    const bigTiff = new Uint8Array([0x49, 0x49, 0x2b, 0, 8, 0, 0, 0, 16, 0]);
    expect(editExif(bigTiff, 'location')).toEqual({ tiff: null, removed: ['exif'] });
  });
});

describe('JPEG', () => {
  test('всё: ни GPS, ни камеры, ни дат, ни XMP; ICC и сжатые данные — байт в байт', async () => {
    const jpeg = fixture('exif-gps.jpg');
    const result = strip(jpeg, 'all');
    expect(result.changed).toBe(true);
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'serial', 'dates', 'xmp']));
    expect(result.bytes.length).toBeLessThan(jpeg.length);
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).not.toHaveProperty('Make');
    expect(data).not.toHaveProperty('DateTimeOriginal');
    expect(data).not.toHaveProperty('subject'); // из XMP
    expect(extractJpegIcc(result.bytes)).toEqual(P3);
    const sos = (bytes: Uint8Array) => readJpegSegments(bytes).at(-1)!.offset;
    expect(result.bytes.subarray(sos(result.bytes))).toEqual(jpeg.subarray(sos(jpeg)));
  });

  test('кроме даты: даты на месте, остального нет', async () => {
    const result = strip(fixture('exif-gps.jpg'), 'keep-dates');
    expect(result.removed).not.toContain('dates');
    const data = await everything(result.bytes);
    expect(data).toMatchObject({ DateTimeOriginal: DATE });
    expect(hasGps(data)).toBe(false);
    expect(data).not.toHaveProperty('Model');
  });

  test('только геолокация: камера и даты остаются, EXIF той же длины, XMP удалён', async () => {
    const jpeg = fixture('exif-gps.jpg');
    const result = strip(jpeg, 'location');
    expect(result.removed).toEqual(['location', 'xmp']);
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).toMatchObject({ Make: expect.any(String), Model: expect.any(String), DateTimeOriginal: DATE });
    expect(extractJpegExif(result.bytes)).toHaveLength(extractJpegExif(jpeg)!.length);
  });

  test('ориентация сохраняется: снимок не перекодируется', async () => {
    for (const mode of ['all', 'keep-dates', 'location'] as const) {
      expect(await everything(strip(fixture('rotated.jpg'), mode).bytes)).toMatchObject({ Orientation: 6 });
    }
  });

  test('без метаданных — файл не меняется', () => {
    const jpeg = fixture('photo.jpg');
    expect(strip(jpeg, 'all')).toEqual({ bytes: jpeg, changed: false, removed: [], warnings: [] });
  });

  test('данные после конца изображения отрезаются; у progressive конец находится через все сканы', () => {
    const jpeg = fixture('progressive.jpg');
    expect(findEoi(jpeg, readJpegSegments(jpeg).at(-1)!.offset)).toBe(jpeg.length);
    const withTail = concat(jpeg, new TextEncoder().encode('MOTION-PHOTO-VIDEO'));
    const result = strip(withTail, 'location');
    expect(result.removed).toEqual(['extra-images']);
    expect(result.bytes).toEqual(jpeg);
  });
});

describe('PNG', () => {
  const types = (png: Uint8Array) => readPngChunks(png).map((c) => c.type);

  test('всё: остаются только чанки изображения и цвета', async () => {
    const png = fixture('exif-gps.png');
    const result = strip(png, 'all');
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates', 'xmp', 'text']));
    expect(types(result.bytes)).not.toEqual(expect.arrayContaining(['eXIf']));
    expect(types(result.bytes).filter((t) => /^(tEXt|zTXt|iTXt|eXIf)$/.test(t))).toEqual([]);
    expect(types(result.bytes)).toContain('iCCP');
    const idat = (bytes: Uint8Array) => readPngChunks(bytes).filter((c) => c.type === 'IDAT').map((c) => [...c.data]);
    expect(idat(result.bytes)).toEqual(idat(png));
    // CRC пересобранного файла верны
    expect(readPngChunks(result.bytes).every((c) => c.crcValid)).toBe(true);
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).not.toHaveProperty('Make');
  });

  test('только геолокация: eXIf той же длины, текст без XMP остаётся', async () => {
    const png = fixture('exif-gps.png');
    const result = strip(png, 'location');
    expect(result.removed).toEqual(['location', 'xmp']);
    const exif = (bytes: Uint8Array) => readPngChunks(bytes).find((c) => c.type === 'eXIf')!.data;
    expect(exif(result.bytes)).toHaveLength(exif(png).length);
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).toMatchObject({ Make: expect.any(String), DateTimeOriginal: DATE, Comment: expect.any(String) });
  });

  test('кроме даты: в eXIf только даты и ориентация', async () => {
    const data = await everything(strip(fixture('exif-gps.png'), 'keep-dates').bytes);
    expect(data).toMatchObject({ DateTimeOriginal: DATE });
    expect(data).not.toHaveProperty('Model');
    expect(hasGps(data)).toBe(false);
  });

  test('APNG: анимация сохраняется, удаляется только подпись программы', () => {
    const result = strip(fixture('animated.png'), 'all');
    expect(result.removed).toEqual(['text']);
    expect(types(result.bytes)).toEqual(['IHDR', 'acTL', 'PLTE', 'tRNS', 'fcTL', 'IDAT', 'fcTL', 'fdAT', 'IEND']);
    expect(types(strip(fixture('rotated.png'), 'all').bytes)).toContain('eXIf'); // ориентация 6
  });
});

describe('WebP', () => {
  const chunks = (webp: Uint8Array) => readWebpChunks(webp).map((c) => c.type);
  const riffConsistent = (webp: Uint8Array) => new DataView(webp.buffer, webp.byteOffset).getUint32(4, true) === webp.length - 8;

  test('всё: без EXIF, флаги VP8X и размер RIFF поправлены, ICC на месте', () => {
    const result = strip(fixture('exif-gps.webp'), 'all');
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates']));
    expect(chunks(result.bytes)).toEqual(['VP8X', 'ICCP', 'VP8 ']);
    expect(result.bytes[20]! & 0x08).toBe(0); // флаг EXIF
    expect(result.bytes[20]! & 0x20).toBe(0x20); // флаг ICC
    expect(riffConsistent(result.bytes)).toBe(true);
    expect(readWebpChunks(result.bytes).find((c) => c.type === 'ICCP')!.data).toEqual(P3);
  });

  test('только геолокация: EXIF той же длины без GPS, камера остаётся', async () => {
    const webp = fixture('exif-gps.webp');
    const result = strip(webp, 'location');
    expect(result.removed).toEqual(['location', 'xmp']);
    const exif = readWebpChunks(result.bytes).find((c) => c.type === 'EXIF')!.data;
    expect(exif).toHaveLength(readWebpChunks(webp).find((c) => c.type === 'EXIF')!.data.length);
    expect(hasGps(await everything(exif))).toBe(false);
    expect(await everything(exif)).toMatchObject({ Make: expect.any(String) });
    expect(riffConsistent(result.bytes)).toBe(true);
  });

  test('EXIF с префиксом «Exif\\0\\0»: ориентация остаётся; простой WebP не меняется', async () => {
    const result = strip(fixture('exif-prefixed.webp'), 'all');
    const exif = readWebpChunks(result.bytes).find((c) => c.type === 'EXIF');
    if (exif) expect(readOrientation(exif.data)).toBe(6);
    else expect(result.changed).toBe(false);
    expect(strip(fixture('basic.webp'), 'all').changed).toBe(false);
  });
});

describe('HEIC и AVIF: правка на месте', () => {
  test.each(['exif-gps.heic', 'exif-gps.avif'])('%s, всё: размер тот же, EXIF и XMP пусты, остальные байты не тронуты', async (name) => {
    const heif = fixture(name);
    const result = strip(heif, 'all');
    expect(result.changed).toBe(true);
    expect(result.bytes).toHaveLength(heif.length);
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates', 'xmp']));
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).not.toHaveProperty('Make');
    expect(data).not.toHaveProperty('subject');
    // изменились только байты элементов Exif и XMP
    const info = readHeifInfo(heif);
    const metadata = info.items.filter((item) => isExifItem(item) || isXmpItem(item)).flatMap((item) => item.extents!);
    for (let i = 0; i < heif.length; i++) {
      if (heif[i] !== result.bytes[i]) expect(metadata.some((e) => i >= e.offset && i < e.offset + e.length)).toBe(true);
    }
    // EXIF остался правильным TIFF
    const exif = info.items.find(isExifItem)!;
    expect(() => parseTiff(tiffFromHeifExif(readItemData(result.bytes, exif)!)!)).not.toThrow();
  });

  test('только геолокация: камера и даты остаются', async () => {
    const data = await everything(strip(fixture('exif-gps.heic'), 'location').bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).toMatchObject({ Make: expect.any(String), DateTimeOriginal: DATE });
  });

  test('кроме даты', async () => {
    const data = await everything(strip(fixture('exif-gps.heic'), 'keep-dates').bytes);
    expect(data).toMatchObject({ DateTimeOriginal: DATE });
    expect(data).not.toHaveProperty('Model');
  });

  test('без метаданных — не меняется', () => {
    expect(strip(fixture('basic.heic'), 'all').changed).toBe(false);
  });
});

describe('JPEG XL', () => {
  const types = (jxl: Uint8Array) => readBoxes(jxl, 0, jxl.length).map((b) => b.type);

  test('всё: боксов Exif и XMP нет, кодовый поток не тронут', () => {
    const jxl = fixture('exif-gps.jxl');
    const result = strip(jxl, 'all');
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates']));
    expect(types(result.bytes)).not.toEqual(expect.arrayContaining(['Exif']));
    expect(types(result.bytes).filter((t) => t === 'xml ' || t === 'brob')).toEqual([]);
  });

  test('кроме даты: несжатый Exif — только даты; сжатый brob — удалён целиком с предупреждением', async () => {
    const dates = strip(fixture('exif-gps.jxl'), 'keep-dates');
    const box = readBoxes(dates.bytes, 0, dates.bytes.length).find((b) => b.type === 'Exif')!;
    const exif = await everything(tiffFromHeifExif(dates.bytes.subarray(box.dataStart, box.end))!);
    expect(exif).toMatchObject({ DateTimeOriginal: DATE });
    expect(hasGps(exif)).toBe(false);

    const brotli = strip(fixture('exif-brotli.jxl'), 'keep-dates');
    expect(brotli.warnings).toEqual(['exif-compressed-removed']);
    expect(brotli.removed).toContain('exif');
    expect(strip(fixture('exif-brotli.jxl'), 'all').warnings).toEqual([]);
  });

  test('«голый» кодовый поток не меняется', () => {
    expect(strip(fixture('codestream.jxl'), 'all').changed).toBe(false);
  });
});

describe('TIFF: пересборка', () => {
  const strips = (tiff: Uint8Array) => {
    const le = tiff[0] === 0x49;
    const ifd = readIfdAt(tiff, new DataView(tiff.buffer, tiff.byteOffset).getUint32(4, le), le)!;
    const offsets = entryNumbers(tiff, ifd.entries.find((e) => e.tag === TAG.StripOffsets || e.tag === TAG.TileOffsets)!, le);
    const counts = entryNumbers(tiff, ifd.entries.find((e) => e.tag === TAG.StripByteCounts || e.tag === TAG.TileByteCounts)!, le);
    return { ifd, data: concat(...offsets.map((o, i) => tiff.subarray(o, o + counts[i]!))) };
  };

  test('всё: только теги изображения, ICC и ориентация; данные полос — байт в байт', async () => {
    const tiff = fixture('exif-gps.tif');
    const result = strip(tiff, 'all');
    expect(result.removed).toEqual(expect.arrayContaining(['location', 'camera', 'dates']));
    const data = await everything(result.bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).not.toHaveProperty('Make');
    expect(data).not.toHaveProperty('DateTimeOriginal');
    expect(data).toMatchObject({ ImageWidth: 400, ImageHeight: 300 });
    expect(strips(result.bytes).data).toEqual(strips(tiff).data);
    expect(strips(result.bytes).ifd.entries.some((e) => e.tag === TAG.ICCProfile)).toBe(true);
  });

  test('только геолокация: камера, Exif и даты остаются', async () => {
    const data = await everything(strip(fixture('exif-gps.tif'), 'location').bytes);
    expect(hasGps(data)).toBe(false);
    expect(data).toMatchObject({ Make: expect.any(String), DateTimeOriginal: DATE });
  });

  test('кроме даты', async () => {
    const data = await everything(strip(fixture('exif-gps.tif'), 'keep-dates').bytes);
    expect(data).toMatchObject({ DateTimeOriginal: DATE });
    expect(data).not.toHaveProperty('Model');
  });

  test('ориентация, тайлы и многостраничный файл сохраняются', async () => {
    expect(await everything(strip(fixture('rotated.tif'), 'all').bytes)).toMatchObject({ Orientation: 6 });
    const tiled = fixture('tiled.tif');
    expect(strips(strip(tiled, 'all').bytes).data).toEqual(strips(tiled).data);
    const multipage = strip(fixture('multipage.tif'), 'all').bytes;
    const le = multipage[0] === 0x49;
    const first = readIfdAt(multipage, new DataView(multipage.buffer).getUint32(4, le), le)!;
    expect(first.next).not.toBe(0);
  });
});

describe('GIF и BMP', () => {
  /** basic.gif с комментарием и XMP после глобальной палитры. */
  function gifWithMetadata(): Uint8Array {
    const gif = fixture('basic.gif');
    const flags = gif[10]!;
    const at = 13 + (flags & 0x80 ? 3 * 2 ** ((flags & 7) + 1) : 0);
    const comment = new Uint8Array([0x21, 0xfe, 5, ...new TextEncoder().encode('hello'), 0]);
    const xmp = new Uint8Array([0x21, 0xff, 11, ...new TextEncoder().encode('XMP DataXMP'), 3, 0x3c, 0x78, 0x3e, 0]);
    return concat(gif.subarray(0, at), comment, xmp, gif.subarray(at));
  }

  test('всё: комментарий и XMP удалены — получается исходный GIF', () => {
    const result = strip(gifWithMetadata(), 'all');
    expect(result.removed).toEqual(['xmp', 'comment']);
    expect(result.bytes).toEqual(fixture('basic.gif'));
  });

  test('только геолокация: комментарий остаётся, XMP — нет', () => {
    const result = strip(gifWithMetadata(), 'location');
    expect(result.removed).toEqual(['xmp']);
    expect(result.bytes.length).toBe(fixture('basic.gif').length + 9);
  });

  test('анимация и BMP не меняются', () => {
    expect(strip(fixture('animated.gif'), 'all').changed).toBe(false);
    expect(strip(fixture('basic.bmp'), 'all').changed).toBe(false);
  });
});
