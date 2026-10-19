// Проверка входного файла до декодирования: формат по сигнатуре и подходит ли он для выбранного выхода.
// Один и тот же код работает в основном потоке (по началу файла, без загрузки WASM) и в worker'е (по всему файлу).

import { readJpegFrame } from './headers';
import { type SniffKind, sniff } from './sniff';
import type { DecoderId, EncoderId, ErrorCode, OutputTarget } from './types';

/** Чем читается формат. Форматы без декодера пока не поддерживаются. */
export const DECODER_BY_KIND: Partial<Record<SniffKind, DecoderId>> = {
  heic: 'heic',
  avif: 'avif',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  bmp: 'bmp',
  tiff: 'tiff',
};

/** Виды JPEG, которые читает MozJPEG из jSquash: baseline, extended и progressive (арифметическое кодирование — нет). */
const JPEG_FRAMES = new Set([0xc0, 0xc1, 0xc2]);

/** Вход и выход в одном формате: конвертировать нечего. */
const SAME_FORMAT: Partial<Record<SniffKind, { encoder: EncoderId; error: ErrorCode }>> = {
  jpeg: { encoder: 'jpeg', error: 'already-jpeg' },
  png: { encoder: 'png', error: 'already-png' },
  webp: { encoder: 'webp', error: 'already-webp' },
};

/**
 * Выход «Исходный формат»: тот же формат; у кого кодировщика нет — HEIC, AVIF и TIFF (фото и сканы: важнее размер)
 * в JPG, GIF (палитра, прозрачность) и BMP (без потерь) в PNG.
 */
export const ORIGINAL_ENCODER: Partial<Record<SniffKind, EncoderId>> = {
  heic: 'jpeg',
  avif: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'png',
  bmp: 'png',
  tiff: 'jpeg',
};

export type InputCheck = { ok: true; decoder: DecoderId; encoder: EncoderId } | { ok: false; code: ErrorCode };

/**
 * output — выбранный выходной формат или 'original' (формат входа); allowSameFormat — вход и выход могут совпадать
 * (сжатие и изменение размера). На страницах-конвертерах совпадение — ошибка «Файл уже в формате …».
 */
export function checkInput(bytes: Uint8Array, output: OutputTarget, allowSameFormat = false): InputCheck {
  const { kind } = sniff(bytes);
  if (kind === 'unknown') return { ok: false, code: 'not-image' };
  const encoder = output === 'original' ? ORIGINAL_ENCODER[kind] : output;
  const same = SAME_FORMAT[kind];
  if (same && !allowSameFormat && same.encoder === encoder) return { ok: false, code: same.error };
  const decoder = DECODER_BY_KIND[kind];
  if (!decoder || !encoder) return { ok: false, code: 'unsupported-image' };
  if (kind === 'jpeg') {
    // заголовок кадра бывает после большого EXIF — тогда в начале файла его нет, и проверит worker
    const frame = readJpegFrame(bytes);
    if (frame?.components === 4) return { ok: false, code: 'cmyk-unsupported' };
    if (frame && (frame.precision !== 8 || !JPEG_FRAMES.has(frame.marker) || frame.height === 0)) {
      return { ok: false, code: 'unsupported-variant' };
    }
  }
  return { ok: true, decoder, encoder };
}
