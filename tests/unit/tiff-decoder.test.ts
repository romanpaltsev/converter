import { describe, expect, test } from 'vitest';
import { decodeTiff, tiffExif } from '../../src/converter/pipeline/decoders/tiff';
import { readOrientation } from '../../src/converter/metadata/exif-filter';
import { TAG, parseTiff } from '../../src/converter/metadata/tiff';
import { sniff } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

const at = (img: { rgba: Uint8Array; width: number }, x: number, y: number) => [...img.rgba.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];

const QUADRANTS = [
  [224, 0, 0, 255],
  [0, 176, 0, 255],
  [0, 0, 224, 255],
  [224, 224, 0, 255],
];

function quadrants(img: { rgba: Uint8Array; width: number; height: number }) {
  const { width: w, height: h } = img;
  return [at(img, w / 4, h / 4), at(img, (3 * w) / 4, h / 4), at(img, w / 4, (3 * h) / 4), at(img, (3 * w) / 4, (3 * h) / 4)];
}

/** Цвета совпадают с допуском (JPEG внутри TIFF). */
function expectNear(actual: number[][], expected: number[][], tolerance: number) {
  actual.forEach((pixel, i) => pixel.forEach((v, c) => expect(Math.abs(v - expected[i]![c]!), `${i}/${c}: ${v}`).toBeLessThanOrEqual(tolerance)));
}

describe('TIFF', () => {
  test('сигнатура II и MM', () => {
    expect(sniff(fixture('basic.tif'))).toEqual({ kind: 'tiff' });
    expect(sniff(fixture('raw.tif'))).toEqual({ kind: 'tiff' });
  });

  test('сжатия: LZW, Deflate + предиктор, PackBits, без сжатия (MM), тайлы, 16 бит MM — пиксели одинаковые', () => {
    for (const name of ['basic.tif', 'deflate.tif', 'packbits.tif', 'raw.tif', 'tiled.tif', '16bit.tif']) {
      const img = decodeTiff(fixture(name));
      expect(img, name).toMatchObject({ width: 400, height: 300, hasAlpha: false, pages: 1 });
      expect(quadrants(img), name).toEqual(QUADRANTS);
    }
    // тайлы 128×128 на 400×300: правый нижний угол (за краем последнего тайла) — на месте
    const tiled = decodeTiff(fixture('tiled.tif'));
    expect(at(tiled, 399, 299)).toEqual(QUADRANTS[3]);
    expect(Buffer.compare(tiled.rgba, decodeTiff(fixture('basic.tif')).rgba)).toBe(0);
  });

  test('JPEG внутри TIFF', () => {
    expectNear(quadrants(decodeTiff(fixture('jpeg.tif'))), QUADRANTS, 6);
  });

  test('оттенки серого, 1 бит CCITT G4, палитра', () => {
    const gray = decodeTiff(fixture('gray.tif'));
    const [r, g, b] = at(gray, 100, 75);
    expect(r).toBe(g);
    expect(g).toBe(b);
    const mono = decodeTiff(fixture('mono-g4.tif'));
    expect(mono).toMatchObject({ width: 64, height: 32 });
    expect(at(mono, 10, 10)).toEqual([0, 0, 0, 255]);
    expect(at(mono, 50, 10)).toEqual([255, 255, 255, 255]);
    expect(quadrants(decodeTiff(fixture('palette.tif')))).toEqual(QUADRANTS);
  });

  test('альфа: обычная и предумноженная (16 бит) — одинаковый результат, прозрачный фон', () => {
    for (const name of ['alpha.tif', 'alpha-assoc.tif']) {
      const img = decodeTiff(fixture(name));
      expect(img, name).toMatchObject({ width: 200, height: 150, hasAlpha: true });
      expect(at(img, 2, 2)[3], name).toBe(0);
      expect(at(img, 100, 75), name).toEqual([224, 0, 0, 255]);
    }
  });

  test('многостраничный — первая страница и число страниц', () => {
    const img = decodeTiff(fixture('multipage.tif'));
    expect(img.pages).toBe(2);
    expect(quadrants(img)).toEqual(QUADRANTS);
  });

  test('CMYK — понятная ошибка', () => {
    expect(() => decodeTiff(fixture('cmyk.tif'))).toThrow(expect.objectContaining({ code: 'cmyk-unsupported' }));
  });

  test('EXIF: даты, GPS и камера переносятся, служебные теги структуры — нет; ориентация', () => {
    const exif = tiffExif(fixture('exif-gps.tif'))!;
    const data = parseTiff(exif);
    const ifd0 = data.ifd0.map((e) => e.tag);
    expect(ifd0).toContain(0x010f); // Make
    expect(ifd0).not.toContain(TAG.StripOffsets);
    expect(ifd0).not.toContain(0x0103); // Compression
    expect(ifd0).not.toContain(TAG.ICCProfile);
    expect(data.exif.map((e) => e.tag)).toContain(TAG.DateTimeOriginal);
    expect(data.gps.length).toBeGreaterThan(0);
    expect(readOrientation(tiffExif(fixture('rotated.tif')))).toBe(6);
  });

  test('RAW (DNG) — не конвертируем миниатюру, а честно отказываем', () => {
    // минимальный TIFF с тегом DNGVersion (50706) в IFD0
    const bytes = new Uint8Array(64);
    const view = new DataView(bytes.buffer);
    bytes.set([0x49, 0x49, 42, 0]);
    view.setUint32(4, 8, true);
    view.setUint16(8, 3, true);
    const entry = (i: number, tag: number, type: number, value: number) => {
      const p = 10 + i * 12;
      view.setUint16(p, tag, true);
      view.setUint16(p + 2, type, true);
      view.setUint32(p + 4, type === 1 ? 4 : 1, true);
      view.setUint32(p + 8, value, true);
    };
    entry(0, 256, 3, 16);
    entry(1, 257, 3, 16);
    entry(2, 50706, 1, 0x00000401);
    expect(() => decodeTiff(bytes)).toThrow(expect.objectContaining({ code: 'unsupported-variant' }));
  });
});
