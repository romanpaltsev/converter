import { describe, expect, test } from 'vitest';
import { decodeBmp } from '../../src/converter/pipeline/decoders/bmp';
import { sniff } from '../../src/converter/pipeline/sniff';
import { fixture, iccFixture } from './helpers/fixtures';

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

/** BMP с 40-байтным заголовком; pixels — данные строк (уже с выравниванием до 4 байт). */
function craftBmp(opts: { width: number; height: number; bitCount: number; compression?: number; palette?: number[][]; pixels: number[] }): Uint8Array {
  const palette = opts.palette ?? [];
  const offset = 14 + 40 + palette.length * 4;
  const bytes = new Uint8Array(offset + opts.pixels.length);
  const view = new DataView(bytes.buffer);
  bytes.set([0x42, 0x4d]);
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, offset, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, opts.width, true);
  view.setInt32(22, opts.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, opts.bitCount, true);
  view.setUint32(30, opts.compression ?? 0, true);
  view.setUint32(46, palette.length, true);
  palette.forEach(([r, g, b], i) => bytes.set([b!, g!, r!, 0], 54 + i * 4));
  bytes.set(opts.pixels, offset);
  return bytes;
}

describe('BMP', () => {
  test('сигнатура', () => expect(sniff(fixture('basic.bmp'))).toEqual({ kind: 'bmp' }));

  test('24 бита, палитра 4 бита, RLE8, 16 бит 565 — квадранты на месте, без прозрачности', () => {
    for (const name of ['basic.bmp', 'palette4.bmp', 'rle8.bmp']) {
      const img = decodeBmp(fixture(name));
      expect(img, name).toMatchObject({ width: 400, height: 300, hasAlpha: false });
      expect(quadrants(img), name).toEqual(QUADRANTS);
    }
    // 565: 5–6 бит на канал — цвета близки, но не точны
    const rgb565 = decodeBmp(fixture('rgb565.bmp'));
    expect(rgb565).toMatchObject({ width: 400, height: 300, hasAlpha: false });
    quadrants(rgb565).forEach((pixel, i) => pixel.forEach((v, c) => expect(Math.abs(v - QUADRANTS[i]![c]!)).toBeLessThanOrEqual(8)));
  });

  test('1 бит', () => {
    const img = decodeBmp(fixture('mono.bmp'));
    expect(img).toMatchObject({ width: 64, height: 32 });
    expect(at(img, 10, 10)).toEqual([0, 0, 0, 255]);
    expect(at(img, 50, 10)).toEqual([255, 255, 255, 255]);
  });

  test('32 бита с альфой (V5, маски)', () => {
    const img = decodeBmp(fixture('alpha.bmp'));
    expect(img).toMatchObject({ width: 200, height: 150, hasAlpha: true });
    expect(at(img, 2, 2)[3]).toBe(0);
    expect(at(img, 100, 75)).toEqual([224, 0, 0, 255]);
  });

  test('встроенный ICC-профиль V5 переносится байт в байт', () => {
    const img = decodeBmp(fixture('p3.bmp'));
    expect(img.icc).toEqual(iccFixture('DisplayP3Compat-v2-magic.icc'));
  });

  test('сверху вниз (отрицательная высота) и 32 бита BI_RGB с нулевой альфой — непрозрачно', () => {
    // 2 × 2: верхняя строка красная, нижняя синяя; файл хранит строки сверху вниз
    const red = [0, 0, 255, 0];
    const blue = [255, 0, 0, 0];
    const img = decodeBmp(craftBmp({ width: 2, height: -2, bitCount: 32, pixels: [...red, ...red, ...blue, ...blue] }));
    expect(img).toMatchObject({ width: 2, height: 2, hasAlpha: false });
    expect(at(img, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(at(img, 1, 1)).toEqual([0, 0, 255, 255]);
  });

  test('RLE4 с пропуском (delta) — пропущенные точки прозрачны', () => {
    // 4 × 2, снизу вверх. Нижняя строка: 4 точки цвета 1; конец строки; верхняя: смещение на 2, 2 точки цвета 2; конец.
    const pixels = [4, 0x11, 0, 0, 0, 2, 2, 0, 2, 0x22, 0, 1];
    const img = decodeBmp(craftBmp({ width: 4, height: 2, bitCount: 4, compression: 2, palette: [[0, 0, 0], [255, 0, 0], [0, 255, 0]], pixels }));
    expect(img.hasAlpha).toBe(true);
    expect(at(img, 0, 1)).toEqual([255, 0, 0, 255]); // нижняя строка
    expect(at(img, 0, 0)[3]).toBe(0); // пропуск
    expect(at(img, 2, 0)).toEqual([0, 255, 0, 255]);
  });

  test('неподдерживаемое и испорченное — понятные ошибки', () => {
    expect(() => decodeBmp(craftBmp({ width: 1, height: 1, bitCount: 24, compression: 4, pixels: [0, 0, 0, 0] }))).toThrow(/сжатие 4/);
    expect(() => decodeBmp(craftBmp({ width: 0, height: 1, bitCount: 24, pixels: [] }))).toThrow(/неверный размер/);
    expect(() => decodeBmp(new TextEncoder().encode('BM' + ' '.repeat(30)))).toThrow();
  });
});
