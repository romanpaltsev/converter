// Раскладка структуры TIFF (EXIF): где лежат IFD, их записи и значения. В отличие от tiff.ts, который копирует
// значения тегов, этот модуль нужен для правок на месте и точного разбора: затереть GPS, не трогая остальное
// (MakerNote со своими смещениями остаётся рабочим), найти миниатюру IFD1, пересобрать TIFF-файл.

import { TAG, TYPE, TiffError } from './tiff';

/** Размер одного значения по типу TIFF (включая IFD из TIFF 6 и UTF-8 из EXIF 3.0). */
const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4, 129: 1 };
const MAX_ENTRIES_PER_IFD = 1000;

export interface LayoutEntry {
  tag: number;
  type: number;
  count: number;
  /** Смещение записи (12 байт) в буфере. */
  entryOffset: number;
  /** Где лежит значение: внутри записи (до 4 байт) или по смещению; длина в байтах. */
  valueOffset: number;
  valueLength: number;
}

export interface LayoutIfd {
  offset: number;
  /** Байт под таблицей: счётчик, записи и указатель на следующий IFD. */
  size: number;
  entries: LayoutEntry[];
  /** Смещение следующего IFD (0 — его нет). */
  next: number;
}

export interface TiffLayout {
  littleEndian: boolean;
  ifd0: LayoutIfd | null;
  exif: LayoutIfd | null;
  gps: LayoutIfd | null;
  interop: LayoutIfd | null;
  /** IFD1 — миниатюра EXIF (JPEG внутри блока). */
  ifd1: LayoutIfd | null;
}

export function byteOrder(bytes: Uint8Array): boolean {
  if (bytes.length < 8) throw new TiffError('TIFF: слишком коротко');
  const littleEndian = bytes[0] === 0x49 && bytes[1] === 0x49;
  if (!littleEndian && !(bytes[0] === 0x4d && bytes[1] === 0x4d)) throw new TiffError('TIFF: нет маркера порядка байтов');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(2, littleEndian) !== 42) throw new TiffError('TIFF: неверная сигнатура');
  return littleEndian;
}

/** IFD по смещению или null, если смещение за пределами буфера. Битые записи пропускаются, как в tiff.ts. */
export function readIfdAt(bytes: Uint8Array, offset: number, littleEndian: boolean): LayoutIfd | null {
  if (offset < 8 || offset + 2 > bytes.length) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const declared = view.getUint16(offset, littleEndian);
  const count = Math.min(declared, MAX_ENTRIES_PER_IFD, Math.floor((bytes.length - offset - 2) / 12));
  const entries: LayoutEntry[] = [];
  for (let i = 0; i < count; i++) {
    const p = offset + 2 + i * 12;
    const type = view.getUint16(p + 2, littleEndian);
    const valueCount = view.getUint32(p + 4, littleEndian);
    const typeSize = TYPE_SIZES[type];
    if (typeSize === undefined) continue;
    const valueLength = typeSize * valueCount;
    const valueOffset = valueLength > 4 ? view.getUint32(p + 8, littleEndian) : p + 8;
    if (valueLength > bytes.length || valueOffset + valueLength > bytes.length) continue;
    entries.push({ tag: view.getUint16(p, littleEndian), type, count: valueCount, entryOffset: p, valueOffset, valueLength });
  }
  const nextAt = offset + 2 + declared * 12;
  const next = nextAt + 4 <= bytes.length ? view.getUint32(nextAt, littleEndian) : 0;
  return { offset, size: 2 + declared * 12 + 4, entries, next };
}

/** Числа значения SHORT/LONG (например, смещения полос); у других типов — пусто. */
export function entryNumbers(bytes: Uint8Array, entry: LayoutEntry, littleEndian: boolean): number[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: number[] = [];
  if (entry.type === TYPE.SHORT) for (let i = 0; i < entry.count; i++) out.push(view.getUint16(entry.valueOffset + i * 2, littleEndian));
  else if (entry.type === TYPE.LONG || entry.type === TYPE.IFD) for (let i = 0; i < entry.count; i++) out.push(view.getUint32(entry.valueOffset + i * 4, littleEndian));
  return out;
}

const pointer = (bytes: Uint8Array, ifd: LayoutIfd | null, tag: number, littleEndian: boolean): number | null => {
  const entry = ifd?.entries.find((e) => e.tag === tag);
  return entry ? (entryNumbers(bytes, entry, littleEndian)[0] ?? null) : null;
};

export function readLayout(bytes: Uint8Array): TiffLayout {
  const littleEndian = byteOrder(bytes);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ifd0 = readIfdAt(bytes, view.getUint32(4, littleEndian), littleEndian);
  const at = (offset: number | null) => (offset === null ? null : readIfdAt(bytes, offset, littleEndian));
  const exif = at(pointer(bytes, ifd0, TAG.ExifIFD, littleEndian));
  const ifd1 = ifd0 && ifd0.next !== 0 && ifd0.next !== ifd0.offset ? at(ifd0.next) : null;
  return {
    littleEndian,
    ifd0,
    exif,
    gps: at(pointer(bytes, ifd0, TAG.GPSIFD, littleEndian)),
    interop: at(pointer(bytes, exif, TAG.InteropIFD, littleEndian)),
    ifd1,
  };
}

/** JPEG-миниатюра из IFD1 (смещение и длина внутри буфера) или null. */
export function thumbnailRange(bytes: Uint8Array, layout: TiffLayout): { offset: number; length: number } | null {
  const offset = pointer(bytes, layout.ifd1, TAG.JPEGInterchangeFormat, layout.littleEndian);
  const length = pointer(bytes, layout.ifd1, TAG.JPEGInterchangeFormatLength, layout.littleEndian);
  if (offset === null || !length || offset + length > bytes.length) return null;
  return { offset, length };
}

type Range = [start: number, end: number];

/** Участки, которые занимает IFD: таблица и значения записей. */
function ifdRanges(ifd: LayoutIfd | null): Range[] {
  if (!ifd) return [];
  const ranges: Range[] = [[ifd.offset, ifd.offset + ifd.size]];
  for (const e of ifd.entries) if (e.valueLength > 4) ranges.push([e.valueOffset, e.valueOffset + e.valueLength]);
  return ranges;
}

/**
 * Копия EXIF без геолокации: записи GPS IFD и их значения затираются нулями на месте (IFD остаётся пустым),
 * всё остальное — байт в байт, поэтому длина не меняется, а MakerNote со своими смещениями продолжает работать.
 * null — GPS не было. Если GPS делит байты с другими тегами (так не пишут, но файл мог быть собран вручную) —
 * TiffError: затирать опасно.
 */
export function blankGps(tiff: Uint8Array): Uint8Array | null {
  const layout = readLayout(tiff);
  const gps = layout.gps;
  if (!gps || gps.entries.length === 0) return null;
  const others = [layout.ifd0, layout.exif, layout.interop, layout.ifd1].flatMap(ifdRanges);
  const thumbnail = thumbnailRange(tiff, layout);
  if (thumbnail) others.push([thumbnail.offset, thumbnail.offset + thumbnail.length]);
  const targets = ifdRanges(gps);
  for (const [start, end] of targets) {
    if (others.some(([a, b]) => start < b && a < end)) throw new TiffError('TIFF: GPS пересекается с другими тегами');
  }
  const out = tiff.slice();
  for (const [start, end] of targets) out.fill(0, start, end);
  return out;
}
