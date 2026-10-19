// «Посмотреть EXIF»: что worker сообщает о файле. Значения — без перевода (даты как в EXIF, числа как есть):
// форматирует интерфейс на языке страницы.

import type { IfdKind } from '../exif-tags';
import type { RemovedKind } from '../strip/types';

export interface ExposureInfo {
  fNumber: number | null;
  /** Выдержка дробью (числитель, знаменатель), как в EXIF. */
  exposureTime: [number, number] | null;
  iso: number | null;
  /** Фокусное расстояние, мм, и эквивалент для 35-мм кадра. */
  focalLength: number | null;
  focalLength35: number | null;
}

export interface LocationInfo {
  /** Десятичные градусы: север и восток — положительные. */
  latitude: number;
  longitude: number;
  /** Метры над уровнем моря (ниже — отрицательные). */
  altitude: number | null;
}

export interface ExifSummary {
  /** Дата съёмки как в EXIF («2024:07:15 14:23:05») и смещение часового пояса («+03:00»). */
  taken: { date: string; offset: string | null } | null;
  camera: string | null;
  lens: string | null;
  exposure: ExposureInfo | null;
  location: LocationInfo | null;
  software: string | null;
  author: string | null;
  copyright: string | null;
  serial: string | null;
}

export interface TagRow {
  ifd: IfdKind;
  tag: number;
  name: string;
  /** Значение текстом; null — двоичные данные или длинный массив (size — их размер в байтах). */
  value: string | null;
  size: number;
}

export interface MetadataReport {
  /** Размер изображения на экране (с учётом поворота); null — не удалось определить без декодирования. */
  width: number | null;
  height: number | null;
  orientation: number;
  summary: ExifSummary;
  /** Название цветового профиля (из ICC или по параметрам nclx). */
  colorProfile: string | null;
  /** Что вообще есть в файле — как итог «Удалить метаданные» в режиме «Все метаданные». */
  contents: RemovedKind[];
  tags: TagRow[];
  /** Встроенная миниатюра EXIF (JPEG) — бывает, что на ней снимок до обрезки. */
  thumbnail: Uint8Array | null;
  /** EXIF сжат brotli (JPEG XL) — прочитать его нельзя. */
  exifCompressed: boolean;
}
