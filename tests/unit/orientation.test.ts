import { describe, expect, test } from 'vitest';
import { applyOrientation } from '../../src/converter/pipeline/orientation';
import type { Pixels } from '../../src/converter/pipeline/preview';

// Исходник 3×2, в красном канале — номер пикселя:
//   0 1 2
//   3 4 5
function source(offset = 0): Pixels {
  const buffer = new Uint8Array(offset + 3 * 2 * 4);
  const data = buffer.subarray(offset);
  for (let i = 0; i < 6; i++) {
    data[i * 4] = i;
    data[i * 4 + 3] = 255;
  }
  return { data, width: 3, height: 2 };
}

const grid = (p: Pixels) => Array.from({ length: p.height }, (_, y) => Array.from({ length: p.width }, (_, x) => p.data[(y * p.width + x) * 4]));

describe('applyOrientation', () => {
  test.each([
    [2, [[2, 1, 0], [5, 4, 3]]],
    [3, [[5, 4, 3], [2, 1, 0]]],
    [4, [[3, 4, 5], [0, 1, 2]]],
    [5, [[0, 3], [1, 4], [2, 5]]],
    [6, [[3, 0], [4, 1], [5, 2]]],
    [7, [[5, 2], [4, 1], [3, 0]]],
    [8, [[2, 5], [1, 4], [0, 3]]],
  ])('Orientation %i', (orientation, expected) => {
    expect(grid(applyOrientation(source(), orientation))).toEqual(expected);
  });

  test('альфа и остальные каналы переносятся вместе с пикселем', () => {
    const image = source();
    image.data.set([10, 20, 30, 40], 0);
    const rotated = applyOrientation(image, 6);
    expect([...rotated.data.subarray(4, 8)]).toEqual([10, 20, 30, 40]); // пиксель 0 — второй в первой строке
  });

  test('буфер, не выровненный на 4 байта', () => {
    expect(grid(applyOrientation(source(1), 6))).toEqual([[3, 0], [4, 1], [5, 2]]);
  });

  test.each([1, 0, 9, Number.NaN])('Orientation %s — без изменений', (orientation) => {
    const image = source();
    expect(applyOrientation(image, orientation)).toBe(image);
  });
});
