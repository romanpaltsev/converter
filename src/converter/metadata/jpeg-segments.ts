// Вставка EXIF (APP1) и ICC-профиля (APP2) в JPEG, который выдаёт MozJPEG.
// Порядок как у камер и ExifTool: SOI, APP0 (JFIF), APP1 Exif, APP2 ICC_PROFILE, затем таблицы и данные.

/** Максимальный размер TIFF в APP1: 65535 − 2 (длина) − 6 («Exif\0\0»). */
export const MAX_EXIF_TIFF_BYTES = 65527;
/** Максимум данных профиля в одном APP2: 65535 − 2 (длина) − 14 («ICC_PROFILE\0» + номер + количество). */
export const MAX_ICC_CHUNK_BYTES = 65519;
const MAX_ICC_CHUNKS = 255;

const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"
const ICC_HEADER = [...'ICC_PROFILE'].map((c) => c.charCodeAt(0)).concat(0);

export interface JpegSegment {
  marker: number;
  /** Смещение маркера (байт 0xFF) в файле. */
  offset: number;
  /** Полная длина сегмента вместе с маркером. */
  size: number;
  /** Данные сегмента без маркера и поля длины. */
  data: Uint8Array;
}

export class JpegError extends Error {}

/** Сегменты заголовка JPEG — от SOI до SOS (не включая сжатые данные). */
export function readJpegSegments(jpeg: Uint8Array): JpegSegment[] {
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8) throw new JpegError('JPEG: нет маркера SOI');
  const segments: JpegSegment[] = [];
  let pos = 2;
  while (pos + 4 <= jpeg.length) {
    if (jpeg[pos] !== 0xff) throw new JpegError(`JPEG: ожидался маркер на смещении ${pos}`);
    const marker = jpeg[pos + 1]!;
    if (marker === 0xff) {
      pos++; // заполняющие байты 0xFF допустимы
      continue;
    }
    const length = (jpeg[pos + 2]! << 8) | jpeg[pos + 3]!;
    if (length < 2 || pos + 2 + length > jpeg.length) throw new JpegError('JPEG: битая длина сегмента');
    segments.push({ marker, offset: pos, size: length + 2, data: jpeg.subarray(pos + 4, pos + 2 + length) });
    if (marker === 0xda) break; // SOS — дальше сжатые данные
    pos += 2 + length;
  }
  return segments;
}

function startsWith(data: Uint8Array, prefix: number[]): boolean {
  return data.length >= prefix.length && prefix.every((b, i) => data[i] === b);
}

export const isExifSegment = (s: JpegSegment) => s.marker === 0xe1 && startsWith(s.data, EXIF_HEADER);
export const isIccSegment = (s: JpegSegment) => s.marker === 0xe2 && startsWith(s.data, ICC_HEADER);

function segment(marker: number, ...parts: ArrayLike<number>[]): Uint8Array {
  const length = 2 + parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(2 + length);
  out[0] = 0xff;
  out[1] = marker;
  out[2] = length >>> 8;
  out[3] = length & 0xff;
  let pos = 4;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

export function buildIccSegments(icc: Uint8Array): Uint8Array[] {
  const count = Math.ceil(icc.length / MAX_ICC_CHUNK_BYTES);
  if (count === 0 || count > MAX_ICC_CHUNKS) return [];
  const result: Uint8Array[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = icc.subarray(i * MAX_ICC_CHUNK_BYTES, (i + 1) * MAX_ICC_CHUNK_BYTES);
    result.push(segment(0xe2, ICC_HEADER, [i + 1, count], chunk));
  }
  return result;
}

export interface JpegMetadata {
  /** Структура TIFF (начинается с «MM» или «II»), без префикса «Exif\0\0». */
  exif: Uint8Array | null;
  icc: Uint8Array | null;
}

export function insertJpegMetadata(jpeg: Uint8Array, meta: JpegMetadata): Uint8Array {
  const segments = readJpegSegments(jpeg);
  const sos = segments[segments.length - 1];
  if (!sos || sos.marker !== 0xda) throw new JpegError('JPEG: не найден SOS');

  const app0 = segments.filter((s) => s.marker === 0xe0);
  // старые EXIF и ICC убираем, остальные сегменты заголовка оставляем в исходном порядке
  const rest = segments.filter((s) => s.marker !== 0xe0 && s.marker !== 0xda && !isExifSegment(s) && !isIccSegment(s));

  const parts: Uint8Array[] = [jpeg.subarray(0, 2)];
  for (const s of app0) parts.push(jpeg.subarray(s.offset, s.offset + s.size));
  if (meta.exif && meta.exif.length <= MAX_EXIF_TIFF_BYTES) parts.push(segment(0xe1, EXIF_HEADER, meta.exif));
  if (meta.icc) parts.push(...buildIccSegments(meta.icc));
  for (const s of rest) parts.push(jpeg.subarray(s.offset, s.offset + s.size));
  parts.push(jpeg.subarray(sos.offset));

  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

/** Собирает ICC-профиль из сегментов APP2 (для проверок и тестов). */
export function extractJpegIcc(jpeg: Uint8Array): Uint8Array | null {
  const chunks = readJpegSegments(jpeg)
    .filter(isIccSegment)
    .map((s) => ({ seq: s.data[12]!, data: s.data.subarray(14) }))
    .sort((a, b) => a.seq - b.seq);
  if (chunks.length === 0) return null;
  const out = new Uint8Array(chunks.reduce((sum, c) => sum + c.data.length, 0));
  let pos = 0;
  for (const c of chunks) {
    out.set(c.data, pos);
    pos += c.data.length;
  }
  return out;
}

/** TIFF из сегмента APP1 Exif (для проверок и тестов). */
export function extractJpegExif(jpeg: Uint8Array): Uint8Array | null {
  const s = readJpegSegments(jpeg).find(isExifSegment);
  return s ? s.data.subarray(EXIF_HEADER.length) : null;
}
