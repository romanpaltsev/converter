// Чанки контейнера WebP (RIFF): чтение метаданных входа и запись ICCP/EXIF в результат кодировщика.

import { readWebpHeader } from '../pipeline/headers';
import { tiffFromExifChunk } from './heif-exif';

export interface WebpChunk {
  type: string;
  /** Смещение заголовка чанка (FourCC) в файле. */
  offset: number;
  data: Uint8Array;
}

export class WebpError extends Error {}

const fourcc = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!);

/**
 * Чанки после заголовка RIFF до limit (по умолчанию — до конца файла). Размер в заголовке RIFF сам по себе
 * не проверяем: некоторые программы пишут его неверно.
 */
export function readWebpChunks(webp: Uint8Array, limit = webp.length): WebpChunk[] {
  if (webp.length < 12 || fourcc(webp, 0) !== 'RIFF' || fourcc(webp, 8) !== 'WEBP') throw new WebpError('WebP: неверная сигнатура');
  const view = new DataView(webp.buffer, webp.byteOffset, webp.byteLength);
  const chunks: WebpChunk[] = [];
  let pos = 12;
  while (pos + 8 <= limit) {
    const size = view.getUint32(pos + 4, true);
    const end = pos + 8 + size;
    if (end > limit) throw new WebpError('WebP: битая длина чанка');
    chunks.push({ type: fourcc(webp, pos), offset: pos, data: webp.subarray(pos + 8, end) });
    pos = end + (size & 1); // данные чанка выравниваются до чётной длины
  }
  return chunks;
}

export interface WebpMetadata {
  icc: Uint8Array | null;
  /** Структура TIFF (без префикса «Exif\0\0»). */
  exif: Uint8Array | null;
}

/** ICC и EXIF входного файла (копии). XMP не нужен: его не переносим. */
export function readWebpMetadata(webp: Uint8Array): WebpMetadata {
  const chunks = readWebpChunks(webp);
  const icc = chunks.find((c) => c.type === 'ICCP')?.data.slice() ?? null;
  const exif = chunks.find((c) => c.type === 'EXIF');
  return { icc, exif: exif ? tiffFromExifChunk(exif.data) : null };
}

function buildChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + data.length + (data.length & 1)); // нулевой байт выравнивания до чётной длины
  for (let i = 0; i < 4; i++) out[i] = type.charCodeAt(i);
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
}

/**
 * Встраивает ICC-профиль и EXIF в WebP от кодировщика (VP8, VP8L или VP8X + ALPH + VP8): файл пересобирается
 * в расширенном формате VP8X → ICCP → ALPH → VP8/VP8L → EXIF. EXIF пишется без префикса «Exif\0\0», как у ExifTool.
 */
export function insertWebpMetadata(webp: Uint8Array, meta: { exif: Uint8Array | null; icc: Uint8Array | null }): Uint8Array {
  if (!meta.exif && !meta.icc) return webp;
  const header = readWebpHeader(webp);
  if (!header) throw new WebpError('WebP: нет заголовка изображения');
  const image = readWebpChunks(webp).filter((c) => c.type === 'ALPH' || c.type === 'VP8 ' || c.type === 'VP8L');
  const hasAlpha = header.hasAlpha || image.some((c) => c.type === 'ALPH');

  const vp8x = new Uint8Array(10);
  vp8x[0] = (meta.icc ? 0x20 : 0) | (hasAlpha ? 0x10 : 0) | (meta.exif ? 0x08 : 0);
  const width = header.width - 1;
  const height = header.height - 1;
  vp8x.set([width & 0xff, (width >> 8) & 0xff, width >> 16, height & 0xff, (height >> 8) & 0xff, height >> 16], 4);

  const parts = [buildChunk('VP8X', vp8x)];
  if (meta.icc) parts.push(buildChunk('ICCP', meta.icc));
  for (const chunk of image) parts.push(buildChunk(chunk.type, chunk.data));
  if (meta.exif) parts.push(buildChunk('EXIF', meta.exif));

  const size = parts.reduce((sum, p) => sum + p.length, 4);
  const out = new Uint8Array(8 + size);
  out.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]); // «RIFF», размер, «WEBP»
  new DataView(out.buffer).setUint32(4, size, true);
  let pos = 12;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}
