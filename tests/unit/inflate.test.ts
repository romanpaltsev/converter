import { deflateRawSync, deflateSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { InflateError, inflateZlib } from '../../src/converter/metadata/inflate';

const data = Uint8Array.from({ length: 50_000 }, (_, i) => (i * 7) % 251);

describe('inflateZlib', () => {
  test('распаковывает поток zlib, как node:zlib', async () => {
    expect(await inflateZlib(new Uint8Array(deflateSync(data)))).toEqual(data);
  });

  test('больше лимита — ошибка', async () => {
    await expect(inflateZlib(new Uint8Array(deflateSync(data)), 10_000)).rejects.toBeInstanceOf(InflateError);
  });

  test('«сырой» deflate без обёртки zlib и мусор — ошибка', async () => {
    await expect(inflateZlib(new Uint8Array(deflateRawSync(data)))).rejects.toBeInstanceOf(InflateError);
    await expect(inflateZlib(new TextEncoder().encode('не zlib'))).rejects.toBeInstanceOf(InflateError);
  });
});
