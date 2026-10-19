import { describe, expect, test } from 'vitest';
import { isJxl, jxlExif } from '../../src/converter/pipeline/decoders/jxl';
import { TAG, parseTiff } from '../../src/converter/metadata/tiff';
import { sniff } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

describe('JPEG XL: сигнатуры и бокс Exif', () => {
  test('контейнер и «голый» кодовый поток', () => {
    for (const name of ['basic.jxl', 'codestream.jxl', 'alpha.jxl', 'exif-gps.jxl']) {
      expect(sniff(fixture(name)), name).toEqual({ kind: 'jxl' });
      expect(isJxl(fixture(name)), name).toBe(true);
    }
    expect(isJxl(fixture('photo.jpg'))).toBe(false);
  });

  test('несжатый бокс Exif → TIFF с датами и GPS', () => {
    const tiff = jxlExif(fixture('exif-gps.jxl'))!;
    const data = parseTiff(tiff);
    expect(data.exif.map((e) => e.tag)).toContain(TAG.DateTimeOriginal);
    expect(data.gps.length).toBeGreaterThan(0);
  });

  test('Exif, сжатый brotli (brob), и кодовый поток без контейнера — метаданных нет, без ошибок', () => {
    expect(jxlExif(fixture('exif-brotli.jxl'))).toBeNull();
    expect(jxlExif(fixture('codestream.jxl'))).toBeNull();
    expect(jxlExif(Uint8Array.of(0, 0, 0, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a, 0xff, 0xff, 0xff, 0xff))).toBeNull();
  });
});
