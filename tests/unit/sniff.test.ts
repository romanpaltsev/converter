import { describe, expect, test } from 'vitest';
import { SNIFF_BYTES, readFtypBrands, sniff } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

function ftyp(major: string, compatible: string[]): Uint8Array {
  const size = 16 + compatible.length * 4;
  const bytes = new Uint8Array(size + 8); // + начало следующего бокса
  new DataView(bytes.buffer).setUint32(0, size);
  const put = (s: string, at: number) => [...s].forEach((c, i) => (bytes[at + i] = c.charCodeAt(0)));
  put('ftyp', 4);
  put(major, 8);
  compatible.forEach((b, i) => put(b, 16 + i * 4));
  put('meta', size + 4);
  return bytes;
}

describe('sniff: HEIF-бренды', () => {
  test.each(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs'])('основной бренд %s → heic', (brand) => {
    expect(sniff(ftyp(brand, ['mif1']))).toEqual({ kind: 'heic' });
  });

  test.each(['mif1', 'msf1'])('общий бренд %s без кодека → пробуем как heic', (brand) => {
    expect(sniff(ftyp(brand, [brand, 'miaf']))).toEqual({ kind: 'heic' });
  });

  test('бренд HEVC среди совместимых', () => {
    expect(sniff(ftyp('mif1', ['mif1', 'MiHE', 'miaf', 'heic']))).toEqual({ kind: 'heic' });
  });

  test.each(['avif', 'avis'])('%s → avif, даже рядом с mif1', (brand) => {
    expect(sniff(ftyp(brand, ['avif', 'mif1', 'miaf', 'MA1B']))).toEqual({ kind: 'avif' });
  });

  test('видео MP4 (isom) — не изображение', () => {
    expect(sniff(ftyp('isom', ['isom', 'iso2', 'mp41']))).toEqual({ kind: 'unknown' });
  });

  test('список брендов читается целиком', () => {
    expect(readFtypBrands(ftyp('heic', ['mif1', 'heic', 'miaf']))).toEqual(['heic', 'mif1', 'heic', 'miaf']);
  });

  test('битый размер ftyp', () => {
    const bytes = ftyp('heic', []);
    new DataView(bytes.buffer).setUint32(0, 9);
    expect(sniff(bytes)).toEqual({ kind: 'unknown' });
  });
});

describe('sniff: другие форматы', () => {
  test('JPEG', () => expect(sniff(Uint8Array.of(0xff, 0xd8, 0xff, 0xe0, 0, 0x10))).toEqual({ kind: 'jpeg' }));
  test('PNG', () => expect(sniff(Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toEqual({ kind: 'png' }));
  test('GIF', () => expect(sniff(new TextEncoder().encode('GIF89a......'))).toEqual({ kind: 'other-image', format: 'gif' }));
  test('WebP', () => expect(sniff(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toEqual({ kind: 'webp' }));
  test('TIFF', () => expect(sniff(Uint8Array.of(0x4d, 0x4d, 0, 42, 0, 0, 0, 8))).toEqual({ kind: 'other-image', format: 'tiff' }));
  test('пусто и мусор', () => {
    expect(sniff(new Uint8Array(0))).toEqual({ kind: 'unknown' });
    expect(sniff(new TextEncoder().encode('hello world, это не картинка'))).toEqual({ kind: 'unknown' });
  });
});

describe('sniff: фикстуры', () => {
  const head = (name: string) => fixture(name).subarray(0, SNIFF_BYTES);
  test.each(['basic.heic', 'exif-gps.heic', 'rotated.heic', '10bit.heic', 'multi.heic', 'sequence.heic', 'grid-24mp.heic'])(
    '%s → heic',
    (name) => expect(sniff(head(name))).toEqual({ kind: 'heic' }),
  );
  test('photo.avif → avif', () => expect(sniff(head('photo.avif'))).toEqual({ kind: 'avif' }));
  test('photo.jpg → jpeg', () => expect(sniff(head('photo.jpg'))).toEqual({ kind: 'jpeg' }));
  test('not-heic.heic (PNG) → png', () => expect(sniff(head('not-heic.heic'))).toEqual({ kind: 'png' }));
  test('garbage.heic → unknown', () => expect(sniff(head('garbage.heic'))).toEqual({ kind: 'unknown' }));
});
