import { describe, expect, test } from 'vitest';
import { resizeRgba, targetSize } from '../../src/converter/pipeline/resize';

/** Изображение width × height, цвет точки — color(x, y). */
function image(width: number, height: number, color: (x: number, y: number) => [number, number, number, number]) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) data.set(color(x, y), (y * width + x) * 4);
  return { data, width, height };
}

const pixel = (img: { data: Uint8Array; width: number }, x: number, y: number) => [...img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];

describe('targetSize', () => {
  test('по длинной стороне — пропорции сохраняются, увеличения нет', () => {
    expect(targetSize(4032, 3024, { mode: 'long-side', size: 1920 })).toEqual({ width: 1920, height: 1440 });
    expect(targetSize(3024, 4032, { mode: 'long-side', size: 1920 })).toEqual({ width: 1440, height: 1920 });
    expect(targetSize(800, 600, { mode: 'long-side', size: 1920 })).toEqual({ width: 800, height: 600 });
  });

  test('в процентах', () => {
    expect(targetSize(4032, 3024, { mode: 'percent', percent: 50 })).toEqual({ width: 2016, height: 1512 });
    expect(targetSize(3, 3, { mode: 'percent', percent: 1 })).toEqual({ width: 1, height: 1 });
    expect(targetSize(1000, 500, { mode: 'percent', percent: 100 })).toEqual({ width: 1000, height: 500 });
  });

  test('ширина × высота: с пропорциями — вписать, без — растянуть, пустая сторона — без ограничения', () => {
    expect(targetSize(4000, 3000, { mode: 'box', width: 1000, height: 1000, keepAspect: true })).toEqual({ width: 1000, height: 750 });
    expect(targetSize(4000, 3000, { mode: 'box', width: 1000, height: 1000, keepAspect: false })).toEqual({ width: 1000, height: 1000 });
    expect(targetSize(4000, 3000, { mode: 'box', width: null, height: 600, keepAspect: true })).toEqual({ width: 800, height: 600 });
    expect(targetSize(4000, 3000, { mode: 'box', width: 800, height: null, keepAspect: false })).toEqual({ width: 800, height: 3000 });
    expect(targetSize(4000, 3000, { mode: 'box', width: null, height: null, keepAspect: true })).toEqual({ width: 4000, height: 3000 });
    // больше исходника — сторона не растёт
    expect(targetSize(400, 300, { mode: 'box', width: 1000, height: 200, keepAspect: false })).toEqual({ width: 400, height: 200 });
  });
});

describe('resizeRgba', () => {
  test('однотонное изображение остаётся однотонным (нет «звона» и сдвига цвета)', () => {
    const src = image(301, 199, () => [200, 100, 50, 255]);
    for (const [w, h] of [[150, 99], [37, 25], [1, 1], [300, 199]] as const) {
      const out = resizeRgba(src, w, h, false);
      expect(out).toMatchObject({ width: w, height: h });
      for (let i = 0; i < out.data.length; i += 4) expect([...out.data.subarray(i, i + 4)]).toEqual([200, 100, 50, 255]);
    }
  });

  test('квадранты остаются на своих местах, в том числе при сильном уменьшении (усреднение блоками)', () => {
    const quad = (x: number, y: number, w: number, h: number): [number, number, number, number] =>
      x < w / 2 ? (y < h / 2 ? [255, 0, 0, 255] : [0, 0, 255, 255]) : y < h / 2 ? [0, 255, 0, 255] : [255, 255, 0, 255];
    const src = image(1200, 800, (x, y) => quad(x, y, 1200, 800));
    for (const [w, h] of [[600, 400], [120, 80]] as const) {
      const out = resizeRgba(src, w, h, false);
      expect(pixel(out, w / 4, h / 4)).toEqual([255, 0, 0, 255]);
      expect(pixel(out, (3 * w) / 4, h / 4)).toEqual([0, 255, 0, 255]);
      expect(pixel(out, w / 4, (3 * h) / 4)).toEqual([0, 0, 255, 255]);
      expect(pixel(out, (3 * w) / 4, (3 * h) / 4)).toEqual([255, 255, 0, 255]);
    }
  });

  test('прозрачность: цвет прозрачных точек не попадает в результат (нет тёмной каймы)', () => {
    // красный круг на прозрачном ЧЁРНОМ фоне
    const src = image(400, 400, (x, y) => ((x - 200) ** 2 + (y - 200) ** 2 < 150 ** 2 ? [255, 0, 0, 255] : [0, 0, 0, 0]));
    const out = resizeRgba(src, 50, 50, true);
    expect(pixel(out, 0, 0)[3]).toBe(0);
    expect(pixel(out, 25, 25)).toEqual([255, 0, 0, 255]);
    for (let i = 0; i < out.data.length; i += 4) {
      // у полупрозрачных точек края цвет — чистый красный, а не смесь с чёрным фоном
      if (out.data[i + 3]! > 20) expect(out.data[i]!).toBeGreaterThan(240);
    }
  });

  test('без изменения размера возвращается тот же буфер', () => {
    const src = image(10, 10, () => [1, 2, 3, 255]);
    expect(resizeRgba(src, 10, 10, false)).toBe(src);
  });
});
