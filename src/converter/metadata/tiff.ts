// Минимальный парсер и писатель структуры TIFF, в которой хранится EXIF.
// Значения тегов не интерпретируются: байты копируются как есть, в исходном порядке байтов,
// поэтому результат пишется с тем же порядком байтов (MM или II), что и исходник.

export const TAG = {
  ImageWidth: 0x0100,
  ImageLength: 0x0101,
  Compression: 0x0103,
  StripOffsets: 0x0111,
  Orientation: 0x0112,
  StripByteCounts: 0x0117,
  DateTime: 0x0132,
  TileOffsets: 0x0144,
  TileByteCounts: 0x0145,
  SubIFDs: 0x014a,
  JPEGInterchangeFormat: 0x0201,
  JPEGInterchangeFormatLength: 0x0202,
  XMP: 0x02bc,
  ICCProfile: 0x8773,
  ExifIFD: 0x8769,
  GPSIFD: 0x8825,
  ExifVersion: 0x9000,
  DateTimeOriginal: 0x9003,
  DateTimeDigitized: 0x9004,
  OffsetTime: 0x9010,
  OffsetTimeOriginal: 0x9011,
  OffsetTimeDigitized: 0x9012,
  MakerNote: 0x927c,
  SubSecTimeOriginal: 0x9291,
  PixelXDimension: 0xa002,
  PixelYDimension: 0xa003,
  InteropIFD: 0xa005,
  Padding: 0xea1c,
} as const;

export const TYPE = { BYTE: 1, ASCII: 2, SHORT: 3, LONG: 4, UNDEFINED: 7, IFD: 13 } as const;

/** Размер одного значения для каждого типа TIFF (включая IFD из TIFF 6 и UTF-8 из EXIF 3.0). */
const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4, 129: 1 };

const MAX_ENTRIES_PER_IFD = 1000;

export interface TiffEntry {
  tag: number;
  type: number;
  count: number;
  /** Сырые байты значения в порядке байтов исходного файла. */
  value: Uint8Array;
}

export interface ExifData {
  littleEndian: boolean;
  ifd0: TiffEntry[];
  exif: TiffEntry[];
  gps: TiffEntry[];
  interop: TiffEntry[];
}

export class TiffError extends Error {}

const POINTER_TAGS = new Set<number>([TAG.ExifIFD, TAG.GPSIFD, TAG.InteropIFD]);

export function parseTiff(bytes: Uint8Array): ExifData {
  if (bytes.length < 8) throw new TiffError('TIFF: слишком коротко');
  const littleEndian = bytes[0] === 0x49 && bytes[1] === 0x49;
  const bigEndian = bytes[0] === 0x4d && bytes[1] === 0x4d;
  if (!littleEndian && !bigEndian) throw new TiffError('TIFF: нет маркера порядка байтов');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(2, littleEndian) !== 42) throw new TiffError('TIFF: неверная сигнатура');

  const visited = new Set<number>();

  const readIfd = (offset: number): TiffEntry[] => {
    if (offset < 8 || offset + 2 > bytes.length || visited.has(offset)) return [];
    visited.add(offset);
    const declared = view.getUint16(offset, littleEndian);
    // если IFD обрезан, читаем только целые записи
    const count = Math.min(declared, MAX_ENTRIES_PER_IFD, Math.floor((bytes.length - offset - 2) / 12));
    const entries: TiffEntry[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < count; i++) {
      const p = offset + 2 + i * 12;
      const tag = view.getUint16(p, littleEndian);
      const type = view.getUint16(p + 2, littleEndian);
      const valueCount = view.getUint32(p + 4, littleEndian);
      const typeSize = TYPE_SIZES[type];
      if (typeSize === undefined || seen.has(tag)) continue;
      const size = typeSize * valueCount;
      let start = p + 8;
      if (size > 4) start = view.getUint32(p + 8, littleEndian);
      if (size > bytes.length || start + size > bytes.length) continue; // битая ссылка — пропускаем тег
      seen.add(tag);
      entries.push({ tag, type, count: valueCount, value: bytes.slice(start, start + size) });
    }
    return entries;
  };

  const pointerOf = (entries: TiffEntry[], tag: number): number | null => {
    const entry = entries.find((e) => e.tag === tag);
    if (!entry || (entry.type !== TYPE.LONG && entry.type !== TYPE.IFD) || entry.value.length < 4) return null;
    return new DataView(entry.value.buffer, entry.value.byteOffset, 4).getUint32(0, littleEndian);
  };

  const ifd0 = readIfd(view.getUint32(4, littleEndian));
  const exifOffset = pointerOf(ifd0, TAG.ExifIFD);
  const gpsOffset = pointerOf(ifd0, TAG.GPSIFD);
  const exif = exifOffset === null ? [] : readIfd(exifOffset);
  const interopOffset = pointerOf(exif, TAG.InteropIFD);
  const gps = gpsOffset === null ? [] : readIfd(gpsOffset);
  const interop = interopOffset === null ? [] : readIfd(interopOffset);
  // указатели на под-IFD писатель пересчитывает сам; IFD1 (миниатюра) не читаем вовсе
  const withoutPointers = (list: TiffEntry[]) => list.filter((e) => !POINTER_TAGS.has(e.tag));
  return {
    littleEndian,
    ifd0: withoutPointers(ifd0),
    exif: withoutPointers(exif),
    gps: withoutPointers(gps),
    interop: withoutPointers(interop),
  };
}

const align2 = (n: number) => n + (n & 1);

function ifdSize(entries: TiffEntry[]): number {
  let size = 2 + entries.length * 12 + 4;
  for (const e of entries) if (e.value.length > 4) size += align2(e.value.length);
  return size;
}

/** Запись LONG-указателя на под-IFD; значение заполняется после раскладки. */
function pointerEntry(tag: number): TiffEntry {
  return { tag, type: TYPE.LONG, count: 1, value: new Uint8Array(4) };
}

export function writeTiff(data: ExifData): Uint8Array {
  const le = data.littleEndian;
  const interop = [...data.interop];
  const gps = [...data.gps];
  const exif = [...data.exif];
  if (interop.length > 0) exif.push(pointerEntry(TAG.InteropIFD));
  const ifd0 = [...data.ifd0];
  if (exif.length > 0) ifd0.push(pointerEntry(TAG.ExifIFD));
  if (gps.length > 0) ifd0.push(pointerEntry(TAG.GPSIFD));
  for (const list of [ifd0, exif, gps, interop]) list.sort((a, b) => a.tag - b.tag);

  // раскладка: заголовок, IFD0, Exif IFD, Interop IFD, GPS IFD — каждый со своей областью данных
  const offsets = new Map<TiffEntry[], number>();
  let cursor = 8;
  for (const list of [ifd0, exif, interop, gps]) {
    if (list.length === 0) continue;
    offsets.set(list, cursor);
    cursor += ifdSize(list);
  }

  const out = new Uint8Array(cursor);
  const view = new DataView(out.buffer);
  out[0] = out[1] = le ? 0x49 : 0x4d;
  view.setUint16(2, 42, le);
  view.setUint32(4, 8, le);

  const setPointer = (list: TiffEntry[], tag: number, target: TiffEntry[]) => {
    const entry = list.find((e) => e.tag === tag);
    const offset = offsets.get(target);
    if (entry && offset !== undefined) new DataView(entry.value.buffer).setUint32(0, offset, le);
  };
  setPointer(ifd0, TAG.ExifIFD, exif);
  setPointer(ifd0, TAG.GPSIFD, gps);
  setPointer(exif, TAG.InteropIFD, interop);

  for (const [list, start] of offsets) {
    view.setUint16(start, list.length, le);
    let dataPtr = start + 2 + list.length * 12 + 4;
    list.forEach((e, i) => {
      const p = start + 2 + i * 12;
      view.setUint16(p, e.tag, le);
      view.setUint16(p + 2, e.type, le);
      view.setUint32(p + 4, e.count, le);
      if (e.value.length <= 4) {
        out.set(e.value, p + 8); // короткие значения хранятся прямо в записи, выровненные влево
      } else {
        view.setUint32(p + 8, dataPtr, le);
        out.set(e.value, dataPtr);
        dataPtr += align2(e.value.length);
      }
    });
    view.setUint32(start + 2 + list.length * 12, 0, le); // следующего IFD нет
  }
  return out;
}

export function shortEntry(tag: number, value: number, littleEndian: boolean): TiffEntry {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, littleEndian);
  return { tag, type: TYPE.SHORT, count: 1, value: bytes };
}

export function longEntry(tag: number, value: number, littleEndian: boolean): TiffEntry {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, littleEndian);
  return { tag, type: TYPE.LONG, count: 1, value: bytes };
}

/** Числовое значение SHORT/LONG-тега (для проверок и тестов). */
export function readNumber(entry: TiffEntry, littleEndian: boolean): number | null {
  const view = new DataView(entry.value.buffer, entry.value.byteOffset, entry.value.byteLength);
  if (entry.type === TYPE.SHORT && entry.value.length >= 2) return view.getUint16(0, littleEndian);
  if (entry.type === TYPE.LONG && entry.value.length >= 4) return view.getUint32(0, littleEndian);
  return null;
}
