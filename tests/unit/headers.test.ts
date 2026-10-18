import { describe, expect, test } from 'vitest';
import { readJpegFrame, readPngHeader } from '../../src/converter/pipeline/headers';
import { fixture } from './helpers/fixtures';

/** Минимальный JPEG: SOI, сегмент APPn нужной длины, SOF. */
function jpeg({ marker = 0xc0, precision = 8, width = 640, height = 480, components = 3, appBytes = 16 } = {}): Uint8Array {
  const app = [0xff, 0xe1, (appBytes + 2) >> 8, (appBytes + 2) & 0xff, ...new Array(appBytes).fill(0x41)];
  const sof = [0xff, marker, 0, 8 + 3 * components, precision, height >> 8, height & 0xff, width >> 8, width & 0xff, components];
  return Uint8Array.from([0xff, 0xd8, ...app, ...sof, ...new Array(3 * components).fill(0), 0xff, 0xda]);
}

describe('readJpegFrame', () => {
  test.each([
    ['photo.jpg', { marker: 0xc0, precision: 8, width: 1200, height: 800, components: 3 }],
    ['progressive.jpg', { marker: 0xc2, precision: 8, components: 3 }],
    ['gray.jpg', { components: 1 }],
    ['cmyk.jpg', { components: 4 }],
    ['12bit.jpg', { marker: 0xc1, precision: 12 }],
    ['lossless.jpg', { marker: 0xc3 }],
    ['arith.jpg', { marker: 0xc9 }],
    ['rotated.jpg', { width: 800, height: 600 }], // хранится повёрнутым, поворот — в EXIF
  ])('%s', (name, expected) => expect(readJpegFrame(fixture(name))).toMatchObject(expected));

  test('SOF после большого APP1 находится, а в обрезанном начале файла — нет', () => {
    const bytes = jpeg({ appBytes: 60_000 });
    expect(readJpegFrame(bytes)).toEqual({ marker: 0xc0, precision: 8, width: 640, height: 480, components: 3 });
    expect(readJpegFrame(bytes.subarray(0, 256))).toBeNull();
  });

  test('заполняющие 0xFF и мусор между сегментами пропускаются', () => {
    const bytes = jpeg();
    const padded = Uint8Array.from([...bytes.subarray(0, 2), 0xff, 0xff, 0x00, 0x13, ...bytes.subarray(2)]);
    expect(readJpegFrame(padded)).toMatchObject({ width: 640, height: 480 });
  });

  test('DHT/DAC — не кадр; SOS раньше SOF — кадра нет', () => {
    expect(readJpegFrame(jpeg({ marker: 0xc4 }))).toBeNull();
    expect(readJpegFrame(Uint8Array.from([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toBeNull();
  });

  test('не JPEG и пустой файл', () => {
    expect(readJpegFrame(fixture('not-heic.heic'))).toBeNull();
    expect(readJpegFrame(new Uint8Array(0))).toBeNull();
  });
});

describe('readPngHeader', () => {
  test.each([
    ['alpha.png', { width: 800, height: 600, bitDepth: 8, colorType: 6, interlaced: false }],
    ['palette-trns.png', { colorType: 3 }],
    ['16bit.png', { bitDepth: 16, colorType: 2 }],
    ['gray.png', { colorType: 0 }],
    ['interlaced.png', { interlaced: true }],
    ['animated.png', { width: 640, height: 480 }],
  ])('%s', (name, expected) => expect(readPngHeader(fixture(name))).toMatchObject(expected));

  test('обрезанный файл и не PNG', () => {
    expect(readPngHeader(fixture('alpha.png').subarray(0, 20))).toBeNull();
    expect(readPngHeader(fixture('photo.jpg'))).toBeNull();
  });
});
