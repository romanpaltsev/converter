import { crc32 as nodeCrc32, deflateSync, inflateSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';
import { PngError, buildPngChunk, insertPngMetadata, readPngChunks } from '../../src/converter/metadata/png-chunks';
import { fixture } from './helpers/fixtures';

function fakePng(extraTypes: string[] = []): Uint8Array {
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, 2);
  view.setUint32(4, 2);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8 бит, RGBA
  const raw = new Uint8Array([0, 255, 0, 0, 255, 0, 0, 255, 0, 255, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255]);
  const parts = [
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    buildPngChunk('IHDR', ihdr),
    ...extraTypes.map((t) => buildPngChunk(t, Uint8Array.of(0))),
    buildPngChunk('IDAT', new Uint8Array(deflateSync(raw))),
    buildPngChunk('IEND', new Uint8Array(0)),
  ];
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

const tiff = fixture('exif/little-endian.tiff');
const icc = fixture('../../src/converter/color/icc/sRGB-v2-magic.icc');

describe('insertPngMetadata', () => {
  test('iCCP и eXIf сразу после IHDR, до IDAT', () => {
    const out = insertPngMetadata(fakePng(), { exif: tiff, icc });
    expect(readPngChunks(out).map((c) => c.type)).toEqual(['IHDR', 'iCCP', 'eXIf', 'IDAT', 'IEND']);
  });

  test('CRC всех чанков корректен (сверка с node:zlib)', () => {
    const out = insertPngMetadata(fakePng(), { exif: tiff, icc });
    for (const chunk of readPngChunks(out)) {
      const typeAndData = out.subarray(chunk.offset + 4, chunk.offset + 8 + chunk.data.length);
      expect(chunk.crcValid).toBe(true);
      expect(chunk.crc).toBe(nodeCrc32(typeAndData));
    }
  });

  test('iCCP: имя, метод 0 и профиль в zlib', () => {
    const out = insertPngMetadata(fakePng(), { exif: null, icc });
    const data = readPngChunks(out).find((c) => c.type === 'iCCP')!.data;
    const nul = data.indexOf(0);
    expect(new TextDecoder('latin1').decode(data.subarray(0, nul))).toBe('ICC profile');
    expect(data[nul + 1]).toBe(0);
    expect(new Uint8Array(inflateSync(data.subarray(nul + 2)))).toEqual(icc);
  });

  test('eXIf содержит TIFF без префикса', () => {
    const out = insertPngMetadata(fakePng(), { exif: tiff, icc: null });
    expect(readPngChunks(out).find((c) => c.type === 'eXIf')!.data).toEqual(tiff);
  });

  test('конфликтующие описания цвета удаляются при встраивании профиля', () => {
    const out = insertPngMetadata(fakePng(['sRGB', 'gAMA', 'cHRM', 'iCCP', 'cICP', 'tEXt']), { exif: null, icc });
    expect(readPngChunks(out).map((c) => c.type)).toEqual(['IHDR', 'iCCP', 'tEXt', 'IDAT', 'IEND']);
  });

  test('без метаданных структура не меняется', () => {
    const input = fakePng(['tEXt']);
    expect(insertPngMetadata(input, { exif: null, icc: null })).toEqual(input);
  });

  test('не PNG — ошибка', () => {
    expect(() => insertPngMetadata(new Uint8Array(20), { exif: tiff, icc })).toThrow(PngError);
  });
});

describe('readPngChunks без проверки CRC', () => {
  test('битый CRC не считается ошибкой, если проверка выключена', () => {
    const png = fixture('alpha.png').slice();
    png[png.length - 13] ^= 0xff; // последний байт CRC чанка перед IEND
    expect(readPngChunks(png).some((c) => !c.crcValid)).toBe(true);
    expect(readPngChunks(png, { verifyCrc: false }).every((c) => c.crcValid)).toBe(true);
  });
});
