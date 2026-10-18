// Общие типы конвейера: декодер → RGBA → кодировщик → вставка метаданных.

import type { MetadataMode } from '../metadata/exif-filter';
import type { Nclx } from '../color/nclx';

export type DecoderId = 'heic' | 'jpeg' | 'png' | 'webp';
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
  | 'cmyk-unsupported'
  | 'decode-failed'
  | 'unsupported-variant'
  | 'out-of-memory'
  | 'internal';

/** Предупреждения не мешают конвертации, но показываются в строке файла. */
export type WarningCode =
  | 'hdr-tone'
  | 'exif-unreadable'
  | 'exif-makernote-dropped'
  | 'exif-reduced-to-dates'
  | 'icc-too-large'
  | 'icc-unreadable'
  | 'first-frame-only';

export class ConvertError extends Error {
  /** После ошибки экземпляр WASM-модуля нельзя использовать дальше (нужен новый worker и повторная попытка). */
  readonly fatal: boolean;
  /** Модуль работоспособен, но мог потерять память — worker пересоздаётся без повторной попытки. */
  readonly recycle: boolean;

  constructor(
    readonly code: ErrorCode,
    message?: string,
    options: { fatal?: boolean; recycle?: boolean } = {},
  ) {
    super(message ?? code);
    this.fatal = options.fatal ?? code === 'out-of-memory';
    this.recycle = options.recycle ?? false;
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
  /** EXIF Orientation, которую ещё нужно применить к пикселям (1 — уже как надо). */
  orientation: number;
  /** ICC-профиль исходника (копия) или null. */
  icc: Uint8Array | null;
  /** Цвет в виде nclx (если задан боксом colr) или null. */
  nclx: Nclx | null;
  /** EXIF исходника как структура TIFF (копия) или null. */
  exif: Uint8Array | null;
  /** Предупреждения декодера (например, взят только первый кадр анимации). */
  warnings: WarningCode[];
  release(): void;
}

export interface DecoderSession {
  /** Размер изображения до декодирования — по нему решаем, нужен ли «свежий» worker. */
  readonly width: number;
  readonly height: number;
  decode(): Promise<DecodedImage>;
  close(): void;
}

export interface Decoder {
  /** Имя WASM-модуля: по нему считается память worker'а (у декодера и кодировщика модуль бывает общий). */
  readonly module: string;
  open(bytes: Uint8Array): DecoderSession;
  /** Текущий размер кучи WASM. */
  heapBytes(): number;
}

export interface Encoder {
  readonly module: string;
  readonly mime: string;
  readonly extension: string;
  /** Ограничение на размер EXIF в контейнере (JPEG — 64 КБ). */
  readonly maxExifBytes: number;
  /** Ограничение на размер ICC-профиля (JPEG — 255 сегментов APP2). */
  readonly maxIccBytes: number;
  encode(image: RawImage, options: ConvertOptions): Promise<Uint8Array>;
  embed(file: Uint8Array, meta: { exif: Uint8Array | null; icc: Uint8Array | null }): Uint8Array;
  /** Текущий размер кучи WASM. */
  heapBytes(): number;
}
