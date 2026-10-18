import { describe, expect, test } from 'vitest';
import { WebpError, readWebpChunks, readWebpMetadata } from '../../src/converter/metadata/webp-chunks';
import { readWebpHeader } from '../../src/converter/pipeline/headers';
import { fixture, iccFixture } from './helpers/fixtures';

describe('readWebpHeader', () => {
  test.each([
    ['basic.webp', { width: 1200, height: 800, hasAlpha: false, animated: false }], // простой VP8
    ['lossless-alpha.webp', { width: 800, height: 600, hasAlpha: true, animated: false }], // VP8L с альфой
    ['lossy-alpha.webp', { width: 800, height: 600, hasAlpha: true, animated: false }], // VP8X + ALPH
    ['exif-gps.webp', { width: 1200, height: 800, hasAlpha: false, animated: false }], // VP8X с ICCP и EXIF
    ['rotated.webp', { width: 800, height: 600 }], // хранится повёрнутым
    ['animated.webp', { width: 640, height: 480, animated: true }],
  ])('%s', (name, expected) => expect(readWebpHeader(fixture(name))).toMatchObject(expected));

  test('не WebP и обрезанный файл', () => {
    expect(readWebpHeader(fixture('alpha.png'))).toBeNull();
    expect(readWebpHeader(fixture('basic.webp').subarray(0, 20))).toBeNull();
  });
});

describe('readWebpChunks / readWebpMetadata', () => {
  test('VP8X с ICCP и EXIF: профиль байт в байт, EXIF как TIFF', () => {
    const webp = fixture('exif-gps.webp');
    const types = readWebpChunks(webp).map((c) => c.type);
    expect(types[0]).toBe('VP8X');
    expect(types).toEqual(expect.arrayContaining(['ICCP', 'VP8 ', 'EXIF']));
    const meta = readWebpMetadata(webp);
    expect(meta.icc).toEqual(iccFixture('DisplayP3Compat-v2-magic.icc'));
    expect(String.fromCharCode(...meta.exif!.subarray(0, 2))).toMatch(/^(II|MM)$/);
  });

  test('EXIF с префиксом «Exif\\0\\0» — префикс отрезается', () => {
    const meta = readWebpMetadata(fixture('exif-prefixed.webp'));
    expect(meta.exif).toEqual(fixture('exif/little-endian.tiff'));
  });

  test('простой VP8 без метаданных', () => {
    expect(readWebpChunks(fixture('basic.webp')).map((c) => c.type)).toEqual(['VP8 ']);
    expect(readWebpMetadata(fixture('basic.webp'))).toEqual({ icc: null, exif: null });
  });

  test('битая длина чанка и не WebP — ошибка', () => {
    const broken = fixture('exif-gps.webp').slice();
    new DataView(broken.buffer).setUint32(16, 0x7fffffff, true);
    expect(() => readWebpChunks(broken)).toThrow(WebpError);
    expect(() => readWebpChunks(fixture('alpha.png'))).toThrow(WebpError);
  });
});
