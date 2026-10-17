import { describe, expect, test } from 'vitest';
import { type ExifData, TAG, TiffError, longEntry, parseTiff, readNumber, writeTiff } from '../../src/converter/metadata/tiff';
import { readExif } from './helpers/exif';
import { fixture } from './helpers/fixtures';

const find = (list: ExifData['ifd0'], tag: number) => list.find((e) => e.tag === tag);
const text = (value: Uint8Array) => new TextDecoder().decode(value).replace(/\0+$/, '');

describe.each([
  ['big-endian.tiff', false],
  ['little-endian.tiff', true],
])('parseTiff: %s', (name, littleEndian) => {
  const data = parseTiff(fixture(`exif/${name}`));

  test('порядок байтов определён', () => expect(data.littleEndian).toBe(littleEndian));

  test('IFD0, Exif и GPS прочитаны, указатели убраны', () => {
    expect(text(find(data.ifd0, 0x010f)!.value)).toBe('Apple');
    expect(readNumber(find(data.ifd0, TAG.Orientation)!, littleEndian)).toBe(6);
    expect(text(find(data.exif, TAG.DateTimeOriginal)!.value)).toBe('2024:07:15 14:23:05');
    expect(data.gps.length).toBeGreaterThan(3);
    expect(find(data.ifd0, TAG.ExifIFD)).toBeUndefined();
    expect(find(data.ifd0, TAG.GPSIFD)).toBeUndefined();
  });

  test('запись и повторное чтение дают те же теги', () => {
    const again = parseTiff(writeTiff(data));
    for (const key of ['ifd0', 'exif', 'gps', 'interop'] as const) {
      const sort = (l: ExifData['ifd0']) => [...l].sort((a, b) => a.tag - b.tag);
      expect(sort(again[key])).toEqual(sort(data[key]));
    }
  });

  test('результат читается независимым парсером (exifr)', async () => {
    const parsed = await readExif(writeTiff(data));
    expect(parsed.ifd0?.Model).toBe('iPhone 15 Pro');
    expect(parsed.exif?.OffsetTimeOriginal).toBe('+03:00');
    expect(parsed.gps?.latitude).toBeCloseTo(55.7539, 4);
    expect(parsed.gps?.longitude).toBeCloseTo(37.6208, 4);
  });
});

describe('writeTiff', () => {
  test('пустой Exif/GPS IFD не пишется', () => {
    const out = writeTiff({ littleEndian: false, ifd0: [longEntry(0x0100, 10, false)], exif: [], gps: [], interop: [] });
    const again = parseTiff(out);
    expect(again.ifd0).toHaveLength(1);
    expect(again.exif).toHaveLength(0);
    expect(out.length).toBe(8 + 2 + 12 + 4);
  });

  test('длинные значения выравниваются по чётному смещению', () => {
    const odd = { tag: 0x010f, type: 2, count: 5, value: new TextEncoder().encode('Appl\0') };
    const next = { tag: 0x0110, type: 2, count: 6, value: new TextEncoder().encode('Model\0') };
    const out = writeTiff({ littleEndian: true, ifd0: [odd, next], exif: [], gps: [], interop: [] });
    const view = new DataView(out.buffer);
    const offsetOf = (index: number) => view.getUint32(8 + 2 + index * 12 + 8, true);
    expect(offsetOf(0) % 2).toBe(0);
    expect(offsetOf(1) % 2).toBe(0);
    expect(text(parseTiff(out).ifd0[1]!.value)).toBe('Model');
  });
});

describe('parseTiff: повреждённые данные', () => {
  test('нет заголовка', () => expect(() => parseTiff(new TextEncoder().encode('not a tiff at all'))).toThrow(TiffError));
  test('слишком коротко', () => expect(() => parseTiff(Uint8Array.of(0x4d, 0x4d, 0))).toThrow(TiffError));

  test('ссылка за пределы данных — тег пропускается, остальное читается', () => {
    const good = writeTiff({
      littleEndian: false,
      ifd0: [
        { tag: 0x010f, type: 2, count: 20, value: new TextEncoder().encode('A very long make 123\0').subarray(0, 20) },
        longEntry(0x0100, 7, false),
      ],
      exif: [],
      gps: [],
      interop: [],
    });
    // записи отсортированы по тегу: 0x0100 (внутри записи), затем 0x010f (по смещению) — ломаем смещение второго
    new DataView(good.buffer).setUint32(8 + 2 + 12 + 8, 0x7fffffff);
    const parsed = parseTiff(good);
    expect(parsed.ifd0.map((e) => e.tag)).toEqual([0x0100]);
  });

  test('IFD, ссылающийся сам на себя, не зацикливает', () => {
    const out = writeTiff({ littleEndian: false, ifd0: [longEntry(0x0100, 1, false)], exif: [], gps: [], interop: [] });
    const looped = new Uint8Array(out.length + 12);
    looped.set(out);
    // добавляем в IFD0 указатель на Exif IFD, равный самому IFD0
    const view = new DataView(looped.buffer);
    view.setUint16(8, 2);
    view.setUint16(8 + 2 + 12, TAG.ExifIFD);
    view.setUint16(8 + 2 + 12 + 2, 4);
    view.setUint32(8 + 2 + 12 + 4, 1);
    view.setUint32(8 + 2 + 12 + 8, 8);
    expect(() => parseTiff(looped)).not.toThrow();
  });
});
