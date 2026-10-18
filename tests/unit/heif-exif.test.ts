import { describe, expect, test } from 'vitest';
import { tiffFromExifChunk, tiffFromHeifExif } from '../../src/converter/metadata/heif-exif';
import { fixture } from './helpers/fixtures';

const tiff = fixture('exif/big-endian.tiff');

function block(prefix: number[], offset: number): Uint8Array {
  const out = new Uint8Array(4 + prefix.length + tiff.length);
  new DataView(out.buffer).setUint32(0, offset);
  out.set(prefix, 4);
  out.set(tiff, 4 + prefix.length);
  return out;
}

describe('tiffFromHeifExif', () => {
  test('смещение 6 и префикс «Exif\\0\\0» (Apple, ExifTool)', () => {
    expect(tiffFromHeifExif(block([0x45, 0x78, 0x69, 0x66, 0, 0], 6))).toEqual(tiff);
  });

  test('смещение 0 (heif-enc)', () => {
    expect(tiffFromHeifExif(block([], 0))).toEqual(tiff);
  });

  test('неверное смещение — ищем заголовок TIFF', () => {
    expect(tiffFromHeifExif(block([0x45, 0x78, 0x69, 0x66, 0, 0], 0))).toEqual(tiff);
  });

  test('не EXIF — null', () => {
    expect(tiffFromHeifExif(new TextEncoder().encode('\0\0\0\0not exif data here'))).toBeNull();
    expect(tiffFromHeifExif(new Uint8Array(2))).toBeNull();
  });
});

describe('tiffFromExifChunk (eXIf в PNG, EXIF в WebP)', () => {
  test('TIFF без префикса — как есть (копия)', () => {
    const result = tiffFromExifChunk(tiff)!;
    expect(result).toEqual(tiff);
    expect(result.buffer).not.toBe(tiff.buffer);
  });

  test('с префиксом «Exif\\0\\0» — префикс отрезается', () => {
    expect(tiffFromExifChunk(Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff]))).toEqual(tiff);
  });

  test('не TIFF — null', () => {
    expect(tiffFromExifChunk(new TextEncoder().encode('not exif at all'))).toBeNull();
  });
});
