// Общие типы конвейера: декодер → RGBA → кодировщик → вставка метаданных.

import type { MetadataMode } from '../metadata/exif-filter';
import type { Nclx } from '../color/nclx';
import type { ResizeSpec } from './resize';

export type DecoderId = 'heic' | 'avif' | 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'tiff' | 'jxl';
export type EncoderId = 'jpeg' | 'png' | 'webp' | 'ico' | 'avif';
/** Выбор формата в интерфейсе: конкретный кодировщик или «как у исходника» (страницы сжатия и размера). */
export type OutputTarget = EncoderId | 'original';

/** Расширение результата по кодировщику (имя файла выделяется до конвертации, чтобы суффиксы _2 шли по очереди). */
export const ENCODER_EXTENSIONS: Record<EncoderId, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', ico: 'ico', avif: 'avif' };

/** WebP вмещает изображения не больше 16 383 точек по стороне. */
export const WEBP_MAX_DIMENSION = 16383;

export interface ConvertOptions {
  encoder: EncoderId;
  /** Качество 1–100 для JPEG и WebP с потерями; для PNG не используется. */
  quality: number;
  /** WebP без потерь; для других форматов не используется. */
  lossless: boolean;
  metadata: MetadataMode;
  /**
   * Целевой размер файла в байтах (страница «Сжать фото»): качество подбирается так, чтобы файл с метаданными
   * не превышал его. null — качество с ползунка. Для форматов без качества (PNG, WebP без потерь) не используется.
   */
  targetBytes: number | null;
  /** Вход и выход могут совпадать по формату (сжатие и изменение размера, а не конвертация). */
  allowSameFormat: boolean;
  /** Уменьшение (страница «Изменить размер»); null — размер не меняется. */
  resize: ResizeSpec | null;
}

/** Коды ошибок; тексты для пользователя — в словарях интерфейса. */
export type ErrorCode =
  | 'not-image'
  | 'already-jpeg'
  | 'already-png'
  | 'already-webp'
  | 'already-avif'
  | 'too-large-for-webp'
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
  | 'first-frame-only'
  | 'first-page-only'
  | 'target-not-reached'
  | 'target-lossless'
  /** Ставит виджет, а не worker: при сжатии результат не меньше исходника. */
  | 'not-smaller'
  /** Заданный размер не меньше исходника — изображение не увеличиваем. */
  | 'not-resized'
  /** «Удалить метаданные»: EXIF сжат Brotli (JPEG XL) — его не прочитать, поэтому он удалён целиком, даже дата. */
  | 'exif-compressed-removed';

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

/** Метаданные результата: EXIF (структура TIFF) и ICC. */
export interface EncodeMeta {
  exif: Uint8Array | null;
  icc: Uint8Array | null;
}

export interface Encoder {
  readonly module: string;
  readonly mime: string;
  readonly extension: string;
  /** Ограничение на размер EXIF в контейнере (JPEG — 64 КБ). */
  readonly maxExifBytes: number;
  /** Ограничение на размер ICC-профиля (JPEG — 255 сегментов APP2). */
  readonly maxIccBytes: number;
  /**
   * Кодирование. meta нужна только тем, кто пишет метаданные при кодировании (AVIF: их раскладывает libheif);
   * остальные вставляют их после — в embed.
   */
  encode(image: RawImage, options: ConvertOptions, meta?: EncodeMeta): Promise<Uint8Array>;
  embed(file: Uint8Array, meta: EncodeMeta): Uint8Array;
  /** Текущий размер кучи WASM. */
  heapBytes(): number;
}
