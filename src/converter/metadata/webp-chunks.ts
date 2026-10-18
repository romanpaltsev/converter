// Чанки контейнера WebP (RIFF): чтение метаданных входа.

import { tiffFromExifChunk } from './heif-exif';

export interface WebpChunk {
  type: string;
  /** Смещение заголовка чанка (FourCC) в файле. */
  offset: number;
  data: Uint8Array;
}

export class WebpError extends Error {}

const fourcc = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!);

/** Чанки после заголовка RIFF. Размер в заголовке RIFF не проверяем: некоторые программы пишут его неверно. */
export function readWebpChunks(webp: Uint8Array): WebpChunk[] {
  if (webp.length < 12 || fourcc(webp, 0) !== 'RIFF' || fourcc(webp, 8) !== 'WEBP') throw new WebpError('WebP: неверная сигнатура');
  const view = new DataView(webp.buffer, webp.byteOffset, webp.byteLength);
  const chunks: WebpChunk[] = [];
  let pos = 12;
  while (pos + 8 <= webp.length) {
    const size = view.getUint32(pos + 4, true);
    const end = pos + 8 + size;
    if (end > webp.length) throw new WebpError('WebP: битая длина чанка');
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
