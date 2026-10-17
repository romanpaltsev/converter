import { describe, expect, test } from 'vitest';
import {
  JpegError,
  MAX_ICC_CHUNK_BYTES,
  extractJpegExif,
  extractJpegIcc,
  insertJpegMetadata,
  isExifSegment,
  isIccSegment,
  readJpegSegments,
} from '../../src/converter/metadata/jpeg-segments';
import { fixture } from './helpers/fixtures';

/** Минимальная структура JPEG: SOI, APP0 JFIF, DQT, SOF0, SOS, «данные», EOI. */
function fakeJpeg(extra: Uint8Array[] = []): Uint8Array {
  const seg = (marker: number, payload: number[]) => [0xff, marker, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];
  const parts = [
    [0xff, 0xd8],
    seg(0xe0, [0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]),
    ...extra.map((e) => [...e]),
    seg(0xdb, new Array(65).fill(1)),
    seg(0xc0, [8, 0, 16, 0, 16, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]),
    seg(0xda, [3, 1, 0, 2, 0x11, 3, 0x11, 0, 0x3f, 0]),
    [0x12, 0x34, 0xff, 0x00, 0x56],
    [0xff, 0xd9],
  ];
  return Uint8Array.from(parts.flat());
}

const tiff = fixture('exif/big-endian.tiff');
const icc = fixture('../../src/converter/color/icc/DisplayP3Compat-v2-magic.icc');

describe('insertJpegMetadata', () => {
  test('порядок: SOI, APP0, APP1 Exif, APP2 ICC, затем таблицы', () => {
    const out = insertJpegMetadata(fakeJpeg(), { exif: tiff, icc });
    const markers = readJpegSegments(out).map((s) => s.marker);
    expect(markers).toEqual([0xe0, 0xe1, 0xe2, 0xdb, 0xc0, 0xda]);
    expect(out.subarray(0, 2)).toEqual(Uint8Array.of(0xff, 0xd8));
    expect(out.subarray(-7)).toEqual(Uint8Array.of(0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd9));
  });

  test('EXIF и ICC извлекаются обратно без изменений', () => {
    const out = insertJpegMetadata(fakeJpeg(), { exif: tiff, icc });
    expect(extractJpegExif(out)).toEqual(tiff);
    expect(extractJpegIcc(out)).toEqual(icc);
  });

  test('большой ICC делится на сегменты с номерами', () => {
    const big = new Uint8Array(MAX_ICC_CHUNK_BYTES * 2 + 1000).map((_, i) => i % 251);
    const out = insertJpegMetadata(fakeJpeg(), { exif: null, icc: big });
    const iccSegments = readJpegSegments(out).filter(isIccSegment);
    expect(iccSegments).toHaveLength(3);
    expect(iccSegments.map((s) => [s.data[12], s.data[13]])).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    expect(extractJpegIcc(out)).toEqual(big);
  });

  test('старые EXIF и ICC заменяются', () => {
    const first = insertJpegMetadata(fakeJpeg(), { exif: tiff, icc });
    const other = Uint8Array.of(0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0);
    const second = insertJpegMetadata(first, { exif: other, icc: null });
    const segments = readJpegSegments(second);
    expect(segments.filter(isExifSegment)).toHaveLength(1);
    expect(segments.filter(isIccSegment)).toHaveLength(0);
    expect(extractJpegExif(second)).toEqual(other);
  });

  test('без метаданных файл не меняется по структуре', () => {
    const input = fakeJpeg();
    expect(insertJpegMetadata(input, { exif: null, icc: null })).toEqual(input);
  });

  test('слишком большой EXIF не пишется', () => {
    const out = insertJpegMetadata(fakeJpeg(), { exif: new Uint8Array(70_000), icc: null });
    expect(extractJpegExif(out)).toBeNull();
  });

  test('не JPEG — ошибка', () => {
    expect(() => insertJpegMetadata(new Uint8Array(10), { exif: tiff, icc })).toThrow(JpegError);
  });
});
