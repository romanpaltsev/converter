import { crc32 as nodeCrc32, inflateSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { crc32 } from '../../src/converter/metadata/crc32';
import { zlibStore } from '../../src/converter/metadata/zlib-store';

function random(size: number, seed = 1): Uint8Array {
  const out = new Uint8Array(size);
  let x = seed;
  for (let i = 0; i < size; i++) {
    x = (x * 1103515245 + 12345) >>> 0;
    out[i] = x >>> 24;
  }
  return out;
}

describe('crc32', () => {
  test.each([0, 1, 13, 1000, 70000])('совпадает с node:zlib для %i байт', (size) => {
    const data = random(size, size + 7);
    expect(crc32(data)).toBe(nodeCrc32(data));
  });

  test('несколько фрагментов = один массив', () => {
    const data = random(5000);
    expect(crc32(data.subarray(0, 4), data.subarray(4, 3000), data.subarray(3000))).toBe(nodeCrc32(data));
  });

  test('известное значение для "IEND"', () => {
    expect(crc32(new TextEncoder().encode('IEND'))).toBe(0xae426082);
  });
});

describe('zlibStore', () => {
  test.each([0, 1, 536, 65535, 65536, 200_000])('inflate восстанавливает %i байт', (size) => {
    const data = random(size, 3);
    const stored = zlibStore(data);
    expect(new Uint8Array(inflateSync(stored))).toEqual(data);
  });

  test('заголовок zlib корректен', () => {
    const stored = zlibStore(random(10));
    expect(((stored[0]! << 8) | stored[1]!) % 31).toBe(0);
    expect(stored[0]! & 0x0f).toBe(8); // метод deflate
  });
});
