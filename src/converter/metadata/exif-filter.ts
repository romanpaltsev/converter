// Фильтрация EXIF по режиму метаданных.
// Подробности и обоснование правил — в CLAUDE.md, раздел «Метаданные».

import { type ExifData, type TiffEntry, TAG, TiffError, longEntry, parseTiff, shortEntry, writeTiff } from './tiff';

export type MetadataMode = 'dates' | 'all';

/** Теги даты съёмки, которые сохраняются в режиме по умолчанию. */
const DATE_TAGS_IFD0 = new Set<number>([TAG.DateTime]);
const DATE_TAGS_EXIF = new Set<number>([
  TAG.DateTimeOriginal,
  TAG.DateTimeDigitized,
  TAG.OffsetTime,
  TAG.OffsetTimeOriginal,
  TAG.OffsetTimeDigitized,
  TAG.SubSecTimeOriginal,
]);

/**
 * Теги IFD0, которые не переносятся даже в режиме «все метаданные»: они ссылаются на данные
 * исходного файла (полосы, тайлы, миниатюра), дублируют размер, XMP и ICC (ICC встраивается отдельно).
 */
const DROP_IFD0 = new Set<number>([
  TAG.ImageWidth,
  TAG.ImageLength,
  TAG.StripOffsets,
  TAG.StripByteCounts,
  TAG.TileOffsets,
  TAG.TileByteCounts,
  TAG.SubIFDs,
  TAG.JPEGInterchangeFormat,
  TAG.JPEGInterchangeFormatLength,
  TAG.XMP,
  TAG.ICCProfile,
  TAG.Orientation,
]);

const APPLE_MAKERNOTE_PREFIX = 'Apple iOS\0';

/** MakerNote Apple использует смещения относительно своего начала, поэтому его можно копировать как есть. */
export function isAppleMakerNote(entry: TiffEntry): boolean {
  if (entry.value.length < APPLE_MAKERNOTE_PREFIX.length) return false;
  for (let i = 0; i < APPLE_MAKERNOTE_PREFIX.length; i++) {
    if (entry.value[i] !== APPLE_MAKERNOTE_PREFIX.charCodeAt(i)) return false;
  }
  return true;
}

export interface FilterOptions {
  mode: MetadataMode;
  /** Фактический размер результата — для PixelXDimension/PixelYDimension. */
  width: number;
  height: number;
  /** Отбросить MakerNote даже от Apple (когда EXIF не помещается в лимит). */
  dropMakerNote?: boolean;
}

export function filterExif(src: ExifData, options: FilterOptions): ExifData {
  const le = src.littleEndian;
  // пиксели уже повёрнуты декодером, поэтому Orientation всегда 1 — иначе будет двойной поворот
  const orientation = shortEntry(TAG.Orientation, 1, le);

  if (options.mode === 'dates') {
    const exif = src.exif.filter((e) => DATE_TAGS_EXIF.has(e.tag));
    const version = src.exif.find((e) => e.tag === TAG.ExifVersion);
    if (exif.length > 0 && version) exif.push(version); // служебный тег, без него EXIF формально невалиден
    return {
      littleEndian: le,
      ifd0: [...src.ifd0.filter((e) => DATE_TAGS_IFD0.has(e.tag)), orientation],
      exif,
      gps: [],
      interop: [],
    };
  }

  const exif = src.exif.filter((e) => {
    if (e.tag === TAG.Padding || e.tag === TAG.PixelXDimension || e.tag === TAG.PixelYDimension) return false;
    if (e.tag === TAG.MakerNote) return !options.dropMakerNote && isAppleMakerNote(e);
    return true;
  });
  if (src.exif.some((e) => e.tag === TAG.PixelXDimension || e.tag === TAG.PixelYDimension)) {
    exif.push(longEntry(TAG.PixelXDimension, options.width, le), longEntry(TAG.PixelYDimension, options.height, le));
  }
  return {
    littleEndian: le,
    ifd0: [...src.ifd0.filter((e) => !DROP_IFD0.has(e.tag)), orientation],
    exif,
    gps: [...src.gps],
    interop: [...src.interop],
  };
}

export type ExifWarning = 'exif-unreadable' | 'exif-makernote-dropped' | 'exif-reduced-to-dates';

export interface PreparedExif {
  /** Готовая структура TIFF или null, если EXIF в исходнике не было (или он не читается). */
  tiff: Uint8Array | null;
  warnings: ExifWarning[];
}

/**
 * Разбирает EXIF исходника, фильтрует по режиму и собирает заново.
 * maxBytes — ограничение контейнера (в JPEG сегмент APP1 не больше 64 КБ).
 */
export function prepareExif(source: Uint8Array | null, options: FilterOptions & { maxBytes?: number }): PreparedExif {
  if (!source) return { tiff: null, warnings: [] };
  let parsed: ExifData;
  try {
    parsed = parseTiff(source);
  } catch (error) {
    if (error instanceof TiffError) return { tiff: null, warnings: ['exif-unreadable'] };
    throw error;
  }
  const max = options.maxBytes ?? Number.POSITIVE_INFINITY;
  let tiff = writeTiff(filterExif(parsed, options));
  if (tiff.length <= max) return { tiff, warnings: [] };
  tiff = writeTiff(filterExif(parsed, { ...options, dropMakerNote: true }));
  if (tiff.length <= max) return { tiff, warnings: ['exif-makernote-dropped'] };
  tiff = writeTiff(filterExif(parsed, { ...options, mode: 'dates' }));
  return { tiff: tiff.length <= max ? tiff : null, warnings: ['exif-reduced-to-dates'] };
}
