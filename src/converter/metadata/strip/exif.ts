// EXIF при удалении метаданных: что в нём есть и что от него остаётся в каждом режиме.

import { filterExif, isAppleMakerNote, readOrientation } from '../exif-filter';
import { type IfdKind, tagInfo } from '../exif-tags';
import { type ExifData, TAG, TiffError, parseTiff, shortEntry, writeTiff } from '../tiff';
import { type LayoutIfd, blankGps, readLayout, thumbnailRange } from '../tiff-layout';
import type { RemovedKind, StripMode } from './types';

/** Указатели на под-IFD и служебная «набивка» — не данные. */
const SKIP_TAGS = new Set<number>([TAG.ExifIFD, TAG.GPSIFD, TAG.InteropIFD, TAG.Padding, 0xea1d]);
/** Теги IFD0, в которых лежат целые блоки других форматов (бывают в TIFF-файлах). */
const BLOCK_TAGS: Record<number, RemovedKind> = { [TAG.XMP]: 'xmp', 0x83bb: 'iptc', 0x8649: 'iptc' };

/** Что есть в EXIF, кроме устройства изображения (размеры, ориентация, цвет). TiffError — EXIF не читается. */
export function exifContents(tiff: Uint8Array): RemovedKind[] {
  const layout = readLayout(tiff);
  const found = new Set<RemovedKind>();
  const scan = (kind: IfdKind, ifd: LayoutIfd | null) => {
    for (const entry of ifd?.entries ?? []) {
      if (SKIP_TAGS.has(entry.tag)) continue;
      const block = kind === 'ifd0' ? BLOCK_TAGS[entry.tag] : undefined;
      if (block) {
        found.add(block);
        continue;
      }
      if (kind === 'gps' && entry.tag === 0) continue; // одна версия GPS — ещё не координаты
      const { group } = tagInfo(kind, entry.tag);
      if (group !== 'image') found.add(group === 'other' ? 'exif' : group);
    }
  };
  scan('ifd0', layout.ifd0);
  scan('exif', layout.exif);
  scan('gps', layout.gps);
  scan('interop', layout.interop);
  if (thumbnailRange(tiff, layout)) found.add('thumbnail');
  return [...found];
}

/** EXIF только с ориентацией. */
export function orientationTiff(orientation: number, littleEndian: boolean): Uint8Array {
  return writeTiff({ littleEndian, ifd0: [shortEntry(TAG.Orientation, orientation, littleEndian)], exif: [], gps: [], interop: [] });
}

/** Пустой, но правильный TIFF: заголовок и IFD0 без записей (14 байт) — для замены на месте. */
export function emptyTiff(littleEndian: boolean): Uint8Array {
  const out = new Uint8Array(14);
  const view = new DataView(out.buffer);
  out[0] = out[1] = littleEndian ? 0x49 : 0x4d;
  view.setUint16(2, 42, littleEndian);
  view.setUint32(4, 8, littleEndian);
  return out;
}

export interface ExifEdit {
  /** Что записать вместо исходного EXIF: тот же массив — оставить как есть, null — убрать блок целиком. */
  tiff: Uint8Array | null;
  removed: RemovedKind[];
}

/** Без GPS, всё остальное как было. Чужой MakerNote при пересборке сломался бы — тогда он удаляется. */
function withoutGps(tiff: Uint8Array, data: ExifData): Uint8Array {
  try {
    return blankGps(tiff) ?? tiff;
  } catch (error) {
    if (!(error instanceof TiffError)) throw error;
    // GPS делит байты с другими тегами — затирать на месте нельзя, собираем EXIF заново
    const exif = data.exif.filter((e) => e.tag !== TAG.MakerNote || isAppleMakerNote(e));
    return writeTiff({ ...data, exif, gps: [] });
  }
}

export function editExif(tiff: Uint8Array, mode: StripMode): ExifEdit {
  let contents: RemovedKind[];
  let data: ExifData;
  try {
    contents = exifContents(tiff);
    data = parseTiff(tiff);
  } catch (error) {
    if (!(error instanceof TiffError)) throw error;
    // нечитаемый EXIF выборочно не поправить — убираем целиком
    return { tiff: null, removed: ['exif'] };
  }
  if (mode === 'location') return contents.includes('location') ? { tiff: withoutGps(tiff, data), removed: ['location'] } : { tiff, removed: [] };
  // ничего, кроме устройства изображения, — трогать нечего
  if (contents.length === 0) return { tiff, removed: [] };
  // ориентацию оставляем: без неё снимок повернётся (пиксели ведь не перекодируются)
  const orientation = readOrientation(tiff);
  if (mode === 'keep-dates' && contents.includes('dates')) {
    return {
      tiff: writeTiff(filterExif(data, { mode: 'dates', width: 0, height: 0, orientation })),
      removed: contents.filter((kind) => kind !== 'dates'),
    };
  }
  return { tiff: orientation === 1 ? null : orientationTiff(orientation, data.littleEndian), removed: contents };
}
