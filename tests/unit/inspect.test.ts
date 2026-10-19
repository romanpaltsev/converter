import { describe, expect, test } from 'vitest';
import { iccDescription, nclxDescription } from '../../src/converter/metadata/inspect/color';
import { exifThumbnail, summarizeExif, tagRows } from '../../src/converter/metadata/inspect/exif-report';
import { inspectFile, readJxlSize } from '../../src/converter/metadata/inspect';
import { TAG, type TiffEntry, parseTiff, shortEntry, writeTiff } from '../../src/converter/metadata/tiff';
import { type ImageKind, sniff } from '../../src/converter/pipeline/sniff';
import { fixture, iccFixture } from './helpers/fixtures';

const inspect = (name: string) => {
  const bytes = fixture(name);
  return inspectFile(bytes, sniff(bytes).kind as ImageKind);
};

/** Сводка синтетических фикстур exif-gps.* (их пишет exiftool, см. tests/fixtures/generate). */
const PHOTO = {
  taken: { date: '2024:07:15 14:23:05', offset: '+03:00' },
  camera: 'Apple iPhone 15 Pro',
  lens: 'iPhone 15 Pro back triple camera 6.765mm f/1.78',
  serial: 'TESTSERIAL0001',
  software: 'Synthetic 1.0',
};

describe('«Посмотреть EXIF»: файлы', () => {
  test.each(['exif-gps.jpg', 'exif-gps.png', 'exif-gps.webp', 'exif-gps.heic', 'exif-gps.avif', 'exif-gps.tif', 'exif-gps.jxl'])(
    '%s: дата, камера, место, профиль',
    async (name) => {
      const report = await inspect(name);
      expect(report.summary).toMatchObject(PHOTO);
      expect(report.summary.location!.latitude).toBeCloseTo(55.7539, 4);
      expect(report.summary.location!.longitude).toBeCloseTo(37.6208, 4);
      expect(report.summary.location!.altitude).toBe(150);
      expect(report.contents).toEqual(expect.arrayContaining(['location', 'camera', 'xmp']));
      expect(report.tags.find((t) => t.name === 'GPSLatitudeRef')?.value).toBe('N');
      if (name !== 'exif-gps.jxl') expect(report.colorProfile).toBe('Display P3'); // у JPEG XL профиль в кодовом потоке
    },
  );

  test.each([
    ['rotated.jpg', 600, 800], // Orientation 6
    ['rotated.heic', 600, 800], // irot
    ['rotated.jxl', 600, 800], // ориентация в заголовке кодового потока
    ['rotated.tif', 300, 400],
    ['basic.gif', 1200, 800],
    ['basic.bmp', 400, 300],
    ['codestream.jxl', 1200, 800],
    ['animated.webp', 640, 480],
  ])('%s: размер на экране %i×%i', async (name, width, height) => {
    expect(await inspect(name)).toMatchObject({ width, height });
  });

  test('цвет по nclx: Display P3, HDR', async () => {
    expect((await inspect('nclx-p3.heic')).colorProfile).toBe('Display P3');
    expect((await inspect('hdr-pq.heic')).colorProfile).toBe('BT.2020 PQ (HDR)');
    expect(nclxDescription({ colorPrimaries: 1, transferCharacteristics: 13, matrixCoefficients: 6, fullRange: true })).toBe('sRGB');
  });

  test('без метаданных — пустой отчёт; сжатый EXIF — пометка', async () => {
    const empty = await inspect('basic.webp');
    expect(empty.tags).toEqual([]);
    expect(empty.contents).toEqual([]);
    expect(empty.summary.taken).toBeNull();
    const brotli = await inspect('exif-brotli.jxl');
    expect(brotli.exifCompressed).toBe(true);
    expect(brotli.tags).toEqual([]);
  });
});

describe('значения тегов', () => {
  const le = true;
  const ascii = (tag: number, text: string): TiffEntry => ({ tag, type: 2, count: text.length + 1, value: new TextEncoder().encode(`${text}\0`) });
  const rational = (tag: number, ...pairs: [number, number][]): TiffEntry => {
    const value = new Uint8Array(pairs.length * 8);
    const view = new DataView(value.buffer);
    pairs.forEach(([n, d], i) => {
      view.setUint32(i * 8, n, le);
      view.setUint32(i * 8 + 4, d, le);
    });
    return { tag, type: 5, count: pairs.length, value };
  };
  const bytes = (tag: number, type: number, data: number[]): TiffEntry => ({ tag, type, count: data.length, value: Uint8Array.from(data) });
  const utf16 = (text: string) => [...text].flatMap((c) => [c.charCodeAt(0) & 0xff, c.charCodeAt(0) >> 8]).concat([0, 0]);

  const data = parseTiff(
    writeTiff({
      littleEndian: le,
      ifd0: [ascii(0x010f, 'NIKON CORPORATION'), ascii(0x0110, 'NIKON Z 6'), bytes(0x9c9d, 1, utf16('Иван')), shortEntry(TAG.Orientation, 6, le)],
      exif: [
        rational(0x829a, [1, 250]),
        rational(0x829d, [28, 10]),
        shortEntry(0x8827, 400, le),
        rational(0x920a, [50, 1]),
        bytes(0x9286, 7, [...new TextEncoder().encode('ASCII\0\0\0'), ...new TextEncoder().encode('hello')]),
        bytes(0x927c, 7, Array.from({ length: 300 }, (_, i) => i & 0xff)),
      ],
      gps: [ascii(1, 'S'), rational(2, [33, 1], [52, 1], [3036, 100]), ascii(3, 'W'), rational(4, [70, 1], [0, 1], [0, 1]), bytes(5, 1, [1]), rational(6, [12, 1])],
      interop: [],
    }),
  );

  test('сводка: камера без повтора производителя, выдержка дробью, южное и западное полушария, ниже уровня моря', () => {
    const summary = summarizeExif(data);
    expect(summary.camera).toBe('NIKON Z 6');
    expect(summary.author).toBe('Иван');
    expect(summary.exposure).toEqual({ fNumber: 2.8, exposureTime: [1, 250], iso: 400, focalLength: 50, focalLength35: null });
    expect(summary.location!.latitude).toBeCloseTo(-(33 + 52 / 60 + 30.36 / 3600), 6);
    expect(summary.location!.longitude).toBe(-70);
    expect(summary.location!.altitude).toBe(-12);
  });

  test('таблица: строки UTF-16 и с заголовком кодировки, дроби, двоичные данные — размером', () => {
    const rows = Object.fromEntries(tagRows(data).map((r) => [r.name, r]));
    expect(rows.XPAuthor!.value).toBe('Иван');
    expect(rows.UserComment!.value).toBe('hello');
    expect(rows.ExposureTime!.value).toBe('1/250');
    expect(rows.FNumber!.value).toBe('2.8');
    expect(rows.GPSLatitude!.value).toBe('33, 52, 30.36');
    expect(rows.MakerNote).toMatchObject({ value: null, size: 300 });
    expect(rows.Orientation!.value).toBe('6');
  });

  test('миниатюра из IFD1', () => {
    const jpeg = fixture('photo.jpg').subarray(0, 600);
    // заголовок, IFD0 без записей со ссылкой на IFD1, IFD1 с двумя записями, затем JPEG
    const tiff = new Uint8Array(8 + 6 + 30 + jpeg.length);
    const view = new DataView(tiff.buffer);
    tiff.set([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0]);
    view.setUint16(8, 0, true);
    view.setUint32(10, 14, true);
    view.setUint16(14, 2, true);
    const entry = (at: number, tag: number, value: number) => {
      view.setUint16(at, tag, true);
      view.setUint16(at + 2, 4, true);
      view.setUint32(at + 4, 1, true);
      view.setUint32(at + 8, value, true);
    };
    entry(16, TAG.JPEGInterchangeFormat, 44);
    entry(28, TAG.JPEGInterchangeFormatLength, jpeg.length);
    tiff.set(jpeg, 44);
    expect(exifThumbnail(tiff)).toEqual(jpeg);
  });
});

describe('цветовые профили и заголовки', () => {
  test('описание ICC: компактные профили — понятными именами', () => {
    expect(iccDescription(iccFixture('DisplayP3Compat-v2-magic.icc'))).toBe('Display P3');
    expect(iccDescription(iccFixture('sRGB-v2-magic.icc'))).toBe('sRGB');
    expect(iccDescription(iccFixture('Rec2020Compat-v2-magic.icc'))).toBe('Rec. 2020');
    expect(iccDescription(new Uint8Array(100))).toBeNull();
  });

  test('описание ICC v4 (mluc): английская запись', () => {
    // заголовок 128 байт, таблица из одного тега desc, тег mluc с двумя записями
    const ru = [...'Профиль'].flatMap((c) => [c.charCodeAt(0) >> 8, c.charCodeAt(0) & 0xff]);
    const en = [...'Wide Gamut'].flatMap((c) => [0, c.charCodeAt(0)]);
    const tagAt = 144;
    const records = 16 + 2 * 12;
    const icc = new Uint8Array(tagAt + records + ru.length + en.length);
    const view = new DataView(icc.buffer);
    icc.set([...'acsp'].map((c) => c.charCodeAt(0)), 36);
    view.setUint32(128, 1);
    icc.set([...'desc'].map((c) => c.charCodeAt(0)), 132);
    view.setUint32(136, tagAt);
    view.setUint32(140, icc.length - tagAt);
    icc.set([...'mluc'].map((c) => c.charCodeAt(0)), tagAt);
    view.setUint32(tagAt + 8, 2);
    view.setUint32(tagAt + 12, 12);
    icc.set([...'ruRU'].map((c) => c.charCodeAt(0)), tagAt + 16);
    view.setUint32(tagAt + 20, ru.length);
    view.setUint32(tagAt + 24, records);
    icc.set([...'enUS'].map((c) => c.charCodeAt(0)), tagAt + 28);
    view.setUint32(tagAt + 32, en.length);
    view.setUint32(tagAt + 36, records + ru.length);
    icc.set(ru, tagAt + records);
    icc.set(en, tagAt + records + ru.length);
    expect(iccDescription(icc)).toBe('Wide Gamut');
  });

  test('JPEG XL: размер и ориентация из заголовка кодового потока', () => {
    expect(readJxlSize(fixture('codestream.jxl'))).toEqual({ width: 1200, height: 800, orientation: 1 });
    expect(readJxlSize(new Uint8Array([0xff, 0x0a]))).toBeNull();
    expect(readJxlSize(fixture('basic.gif'))).toBeNull();
  });
});
