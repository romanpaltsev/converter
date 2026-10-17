import { describe, expect, test } from 'vitest';
import { downscale } from '../../src/converter/pipeline/preview';

function quadrants(width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  const colors = [
    [224, 0, 0],
    [0, 176, 0],
    [0, 0, 224],
    [224, 224, 0],
  ];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = colors[(y < height / 2 ? 0 : 2) + (x < width / 2 ? 0 : 1)]!;
      data.set([r!, g!, b!, 255], (y * width + x) * 4);
    }
  }
  return data;
}

const pixel = (img: { data: Uint8Array; width: number }, x: number, y: number) => [...img.data.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];

describe('downscale (превью без canvas)', () => {
  test('короткая сторона 96, пропорции сохраняются', () => {
    const small = downscale({ data: quadrants(600, 400), width: 600, height: 400 });
    expect([small.width, small.height]).toEqual([144, 96]);
    expect(small.data.length).toBe(144 * 96 * 4);
  });

  test('цвета квадрантов на своих местах', () => {
    const small = downscale({ data: quadrants(800, 600), width: 800, height: 600 });
    expect(pixel(small, 10, 10)).toEqual([224, 0, 0, 255]);
    expect(pixel(small, small.width - 10, 10)).toEqual([0, 176, 0, 255]);
    expect(pixel(small, 10, small.height - 10)).toEqual([0, 0, 224, 255]);
    expect(pixel(small, small.width - 10, small.height - 10)).toEqual([224, 224, 0, 255]);
  });

  test('маленькое изображение не увеличивается', () => {
    const small = downscale({ data: quadrants(40, 30), width: 40, height: 30 });
    expect([small.width, small.height]).toEqual([40, 30]);
  });

  test('прозрачные пиксели не окрашивают соседние', () => {
    const data = new Uint8Array(200 * 200 * 4);
    for (let i = 0; i < data.length; i += 4) {
      const opaque = (i / 4) % 2 === 0;
      data.set(opaque ? [255, 0, 0, 255] : [0, 0, 255, 0], i); // красный и прозрачный «синий»
    }
    const small = downscale({ data, width: 200, height: 200 });
    const [r, g, b, a] = pixel(small, 20, 20);
    expect([r, g, b]).toEqual([255, 0, 0]);
    expect(a).toBeGreaterThan(100);
    expect(a).toBeLessThan(160);
  });
});
