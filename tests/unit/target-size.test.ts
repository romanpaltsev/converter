import { describe, expect, test } from 'vitest';
import { TARGET_MAX_QUALITY, TARGET_MIN_QUALITY, encodeToTarget } from '../../src/converter/pipeline/target-size';

/** «Кодировщик», у которого размер файла растёт с качеством: size(q) байт. */
function fakeEncoder(size: (quality: number) => number) {
  const calls: number[] = [];
  const encodeAt = async (quality: number) => {
    calls.push(quality);
    return new Uint8Array(Math.round(size(quality)));
  };
  return { encodeAt, calls };
}

const photo = (q: number) => 20_000 + q * q * 60; // как у JPEG: к высокому качеству размер растёт быстрее

describe('encodeToTarget', () => {
  test('цель достижима с первой пробы — одно кодирование', async () => {
    const { encodeAt, calls } = fakeEncoder(photo);
    const result = await encodeToTarget(encodeAt, photo(85) + 10);
    expect(result).toMatchObject({ quality: 85, reached: true, attempts: 1 });
    expect(calls).toEqual([85]);
  });

  test('наибольшее качество, при котором файл не больше цели (или близко к нему)', async () => {
    for (const target of [60_000, 150_000, 300_000, 450_000]) {
      const { encodeAt, calls } = fakeEncoder(photo);
      const result = await encodeToTarget(encodeAt, target);
      expect(result.reached).toBe(true);
      expect(result.bytes.length).toBeLessThanOrEqual(target);
      // либо файл уже близок к цели, либо качество на единицу выше уже не влезает
      const closeEnough = result.bytes.length >= target * 0.9;
      expect(closeEnough || photo(result.quality + 1) > target).toBe(true);
      expect(calls.length).toBeLessThanOrEqual(7);
    }
  });

  test('цель недостижима — файл с минимальным качеством и reached = false', async () => {
    const { encodeAt, calls } = fakeEncoder(photo);
    const result = await encodeToTarget(encodeAt, 1000);
    expect(result.reached).toBe(false);
    expect(result.quality).toBe(TARGET_MIN_QUALITY);
    expect(result.bytes.length).toBe(Math.round(photo(TARGET_MIN_QUALITY)));
    expect(calls.length).toBeLessThanOrEqual(8);
  });

  test('огромная цель — максимальное качество из диапазона', async () => {
    const { encodeAt } = fakeEncoder(photo);
    const result = await encodeToTarget(encodeAt, 10_000_000);
    expect(result.reached).toBe(true);
    expect(result.quality).toBe(TARGET_MAX_QUALITY);
  });
});
