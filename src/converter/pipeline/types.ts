// Общие типы конвейера: декодер → RGBA → кодировщик → вставка метаданных.

import type { MetadataMode } from '../metadata/exif-filter';
import type { Nclx } from '../color/nclx';

export type DecoderId = 'heic';
export type EncoderId = 'jpeg' | 'png';

export interface ConvertOptions {
  encoder: EncoderId;
  /** Качество JPEG 1–100; для PNG не используется. */
  quality: number;
  metadata: MetadataMode;
}

/** Коды ошибок; тексты для пользователя — в словарях интерфейса. */
export type ErrorCode =
  | 'not-image'
  | 'avif-unsupported'
  | 'already-jpeg'
  | 'already-png'
  | 'unsupported-image'
  | 'decode-failed'
  | 'unsupported-variant'
  | 'out-of-memory'
  | 'internal';

/** Предупреждения не мешают конвертации, но показываются в строке файла. */
export type WarningCode = 'hdr-tone' | 'exif-unreadable' | 'exif-makernote-dropped' | 'exif-reduced-to-dates' | 'icc-too-large';

export class ConvertError extends Error {
  constructor(
    readonly code: ErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** Пиксели для кодировщика: RGBA, 8 бит на канал, без выравнивания строк (stride = width * 4). */
export interface RawImage {
  width: number;
  height: number;
  rgba: Uint8Array;
  hasAlpha: boolean;
}

/** Изображение после декодирования. Буфер rgba может указывать в память WASM и живёт до release(). */
export interface DecodedImage extends RawImage {
  /** ICC-профиль исходника (копия) или null. */
  icc: Uint8Array | null;
  /** Цвет в виде nclx (если задан боксом colr) или null. */
  nclx: Nclx | null;
  /** EXIF исходника как структура TIFF (копия) или null. */
  exif: Uint8Array | null;
  release(): void;
}

export interface DecoderSession {
  /** Размер изображения до декодирования — по нему решаем, нужен ли «свежий» worker. */
  readonly width: number;
  readonly height: number;
  decode(): DecodedImage;
  close(): void;
}

export interface Decoder {
  open(bytes: Uint8Array): DecoderSession;
  /** Текущий размер кучи WASM (для замеров памяти). */
  heapBytes(): number;
}

export interface Encoder {
  readonly mime: string;
  readonly extension: string;
  /** Ограничение на размер EXIF в контейнере (JPEG — 64 КБ). */
  readonly maxExifBytes: number;
  encode(image: RawImage, options: ConvertOptions): Promise<Uint8Array>;
  embed(file: Uint8Array, meta: { exif: Uint8Array | null; icc: Uint8Array | null }): Uint8Array;
  /** Текущий размер кучи WASM (для замеров памяти). */
  heapBytes(): number;
}
