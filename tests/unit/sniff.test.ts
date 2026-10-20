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

  test('видео MP4 (isom) — не изображение, а видео (из него — звук)', () => {
    expect(sniff(ftyp('isom', ['isom', 'iso2', 'mp41']))).toEqual({ kind: 'mp4' });
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
  test('GIF', () => expect(sniff(new TextEncoder().encode('GIF89a......'))).toEqual({ kind: 'gif' }));
  test('WebP', () => expect(sniff(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toEqual({ kind: 'webp' }));
  test('TIFF', () => expect(sniff(Uint8Array.of(0x4d, 0x4d, 0, 42, 0, 0, 0, 8))).toEqual({ kind: 'tiff' }));
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

describe('sniff: аудио и видео', () => {
  test.each([
    ['tone.mp3', 'mp3'],
    ['tone.wav', 'wav'],
    ['tone.flac', 'flac'],
    ['tone.ogg', 'ogg'],
    ['tone.opus', 'opus'],
    ['tone.aac', 'aac'],
    ['tone.m4a', 'm4a'],
    ['clip.mp4', 'mp4'],
    ['clip.mov', 'mov'],
    ['clip.webm', 'webm'],
    ['garbage.mp3', 'mp3'],
  ])('%s → %s', (name, kind) => {
    expect(sniff(fixture(name).subarray(0, SNIFF_BYTES))).toEqual({ kind });
  });

  test('ISO BMFF: бренд M4A важнее совместимого isom, «qt  » — MOV, неизвестный (CR3) — не поддерживается', () => {
    expect(sniff(ftyp('M4A ', ['M4A ', 'mp42', 'isom']))).toEqual({ kind: 'm4a' });
    expect(sniff(ftyp('isom', ['isom', 'M4A ']))).toEqual({ kind: 'm4a' });
    expect(sniff(ftyp('mp42', ['mp42', 'isom', 'avc1']))).toEqual({ kind: 'mp4' });
    expect(sniff(ftyp('3gp4', ['3gp4']))).toEqual({ kind: 'mp4' });
    expect(sniff(ftyp('qt  ', ['qt  ']))).toEqual({ kind: 'mov' });
    expect(sniff(ftyp('crx ', ['crx ', 'isom']))).toEqual({ kind: 'mp4' });
    expect(sniff(ftyp('crx ', ['crx ']))).toEqual({ kind: 'unknown' });
  });

  test('кадр MPEG без ID3: Layer III — MP3, слой 00 — ADTS (AAC); JPEG и JPEG XL с FF не путаются', () => {
    expect(sniff(new Uint8Array([0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0]))).toEqual({ kind: 'mp3' });
    expect(sniff(new Uint8Array([0xff, 0xf1, 0x50, 0x80, 0, 0, 0, 0]))).toEqual({ kind: 'aac' });
    expect(sniff(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]))).toEqual({ kind: 'jpeg' });
    expect(sniff(new Uint8Array([0xff, 0x0a, 0, 0, 0, 0, 0, 0]))).toEqual({ kind: 'jxl' });
    // битрейт 1111 недопустим — это не кадр MP3
    expect(sniff(new Uint8Array([0xff, 0xfb, 0xf0, 0x64, 0, 0, 0, 0]))).toEqual({ kind: 'unknown' });
  });
});
