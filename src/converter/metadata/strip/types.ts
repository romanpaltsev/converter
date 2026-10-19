// «Удалить метаданные»: режимы и итог по файлу.

import type { WarningCode } from '../../pipeline/types';

/**
 * all — всё, кроме ориентации и цветового профиля (без них снимок покажется иначе);
 * keep-dates — всё, кроме дат съёмки; location — только то, что указывает на место: GPS, а также XMP и IPTC целиком
 * (в них тоже бывают координаты и названия мест).
 */
export type StripMode = 'all' | 'keep-dates' | 'location';

export const STRIP_MODES: StripMode[] = ['all', 'keep-dates', 'location'];

/** Что нашлось и удалено — для строки файла («Удалено: геолокация, камера…»). */
export type RemovedKind =
  | 'location'
  | 'camera'
  | 'dates'
  | 'settings'
  | 'serial'
  | 'author'
  | 'software'
  | 'makernote'
  | 'thumbnail'
  /** EXIF, в котором нет ничего из перечисленного (или он не читается). */
  | 'exif'
  | 'xmp'
  | 'iptc'
  | 'comment'
  | 'text'
  /** Дополнительные изображения после основного: карта HDR, глубина, превью (MPF и данные после конца JPEG). */
  | 'extra-images'
  | 'c2pa'
  | 'other';

/** Порядок в строке файла: сначала самое личное. */
export const REMOVED_ORDER: RemovedKind[] = [
  'location',
  'camera',
  'serial',
  'author',
  'dates',
  'settings',
  'software',
  'makernote',
  'thumbnail',
  'exif',
  'xmp',
  'iptc',
  'comment',
  'text',
  'extra-images',
  'c2pa',
  'other',
];

/** Вариант формата, который нельзя безопасно пересобрать без перекодирования (BigTIFF, RAW, старый JPEG в TIFF). */
export class StripUnsupported extends Error {}

export interface StripResult {
  /** Файл без метаданных; тот же массив, если удалять было нечего. */
  bytes: Uint8Array;
  changed: boolean;
  removed: RemovedKind[];
  warnings: WarningCode[];
}

/** Собирает найденное в порядке REMOVED_ORDER. */
export class RemovedSet {
  private readonly kinds = new Set<RemovedKind>();

  add(...kinds: RemovedKind[]): void {
    for (const kind of kinds) this.kinds.add(kind);
  }

  get size(): number {
    return this.kinds.size;
  }

  list(): RemovedKind[] {
    return REMOVED_ORDER.filter((kind) => this.kinds.has(kind));
  }
}
