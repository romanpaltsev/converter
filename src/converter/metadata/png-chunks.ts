// Вставка ICC-профиля (iCCP) и EXIF (eXIf) в PNG сразу после IHDR — это удовлетворяет
// требованиям PNG 3: iCCP до PLTE/IDAT, eXIf до IDAT.

import { crc32 } from './crc32';
import { zlibStore } from './zlib-store';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const ICC_PROFILE_NAME = 'ICC profile';

export interface PngChunk {
  type: string;
  /** Смещение начала чанка (поля длины) в файле. */
  offset: number;
  data: Uint8Array;
  crc: number;
  crcValid: boolean;
}

export class PngError extends Error {}

export function readPngChunks(png: Uint8Array): PngChunk[] {
  if (!SIGNATURE.every((b, i) => png[i] === b)) throw new PngError('PNG: неверная сигнатура');
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: PngChunk[] = [];
  let pos = 8;
  while (pos + 12 <= png.length) {
    const length = view.getUint32(pos);
    if (pos + 12 + length > png.length) throw new PngError('PNG: битая длина чанка');
    const typeBytes = png.subarray(pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + length);
    const crc = view.getUint32(pos + 8 + length);
    const type = String.fromCharCode(...typeBytes);
    chunks.push({ type, offset: pos, data, crc, crcValid: crc === crc32(typeBytes, data) });
    pos += 12 + length;
    if (type === 'IEND') break;
  }
  return chunks;
}

export function buildPngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  const typeBytes = out.subarray(4, 8);
  for (let i = 0; i < 4; i++) typeBytes[i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(typeBytes, data));
  return out;
}

export function buildIccpData(icc: Uint8Array): Uint8Array {
  const compressed = zlibStore(icc);
  // имя профиля (Latin-1, 1–79 байт) + NUL + метод сжатия 0 + поток zlib
  const out = new Uint8Array(ICC_PROFILE_NAME.length + 2 + compressed.length);
  for (let i = 0; i < ICC_PROFILE_NAME.length; i++) out[i] = ICC_PROFILE_NAME.charCodeAt(i);
  out.set(compressed, ICC_PROFILE_NAME.length + 2);
  return out;
}

export interface PngMetadata {
  /** Структура TIFF (начинается с «MM» или «II»). */
  exif: Uint8Array | null;
  icc: Uint8Array | null;
}

// При встраивании своего профиля конфликтующие описания цвета убираем:
// sRGB/iCCP не должны сосуществовать, cICP имеет приоритет над iCCP, gAMA/cHRM устарели при наличии профиля.
const COLOR_CHUNKS = new Set(['iCCP', 'sRGB', 'gAMA', 'cHRM', 'cICP']);

export function insertPngMetadata(png: Uint8Array, meta: PngMetadata): Uint8Array {
  const chunks = readPngChunks(png);
  if (chunks[0]?.type !== 'IHDR') throw new PngError('PNG: первым должен быть IHDR');
  const extra: Uint8Array[] = [];
  if (meta.icc) extra.push(buildPngChunk('iCCP', buildIccpData(meta.icc)));
  if (meta.exif) extra.push(buildPngChunk('eXIf', meta.exif));

  const keep = chunks.filter((c) => {
    if (meta.icc && COLOR_CHUNKS.has(c.type)) return false;
    if (meta.exif && c.type === 'eXIf') return false;
    return true;
  });
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  keep.forEach((c, i) => {
    parts.push(png.subarray(c.offset, c.offset + 12 + c.data.length));
    if (i === 0) parts.push(...extra); // сразу после IHDR
  });
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}
