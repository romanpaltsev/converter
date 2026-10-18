// Проверка входного файла до декодирования: формат по сигнатуре и подходит ли он для выбранного выхода.
// Один и тот же код работает в основном потоке (по началу файла, без загрузки WASM) и в worker'е (по всему файлу).

import { readJpegFrame } from './headers';
import { type SniffKind, sniff } from './sniff';
import type { DecoderId, EncoderId, ErrorCode } from './types';

/** Чем читается формат. Форматы без декодера пока не поддерживаются. */
export const DECODER_BY_KIND: Partial<Record<SniffKind, DecoderId>> = {
  heic: 'heic',
  jpeg: 'jpeg',
  png: 'png',
};

/** Виды JPEG, которые читает MozJPEG из jSquash: baseline, extended и progressive (арифметическое кодирование — нет). */
const JPEG_FRAMES = new Set([0xc0, 0xc1, 0xc2]);

/** Вход и выход в одном формате: конвертировать нечего. */
const SAME_FORMAT: Partial<Record<SniffKind, { encoder: EncoderId; error: ErrorCode }>> = {
  jpeg: { encoder: 'jpeg', error: 'already-jpeg' },
  png: { encoder: 'png', error: 'already-png' },
};

export type InputCheck = { ok: true; decoder: DecoderId } | { ok: false; code: ErrorCode };

export function checkInput(bytes: Uint8Array, output: EncoderId): InputCheck {
  const { kind } = sniff(bytes);
  if (kind === 'unknown') return { ok: false, code: 'not-image' };
  if (kind === 'avif') return { ok: false, code: 'avif-unsupported' };
  const same = SAME_FORMAT[kind];
  if (same?.encoder === output) return { ok: false, code: same.error };
  const decoder = DECODER_BY_KIND[kind];
  if (!decoder) return { ok: false, code: 'unsupported-image' };
  if (kind === 'jpeg') {
    // заголовок кадра бывает после большого EXIF — тогда в начале файла его нет, и проверит worker
    const frame = readJpegFrame(bytes);
    if (frame?.components === 4) return { ok: false, code: 'cmyk-unsupported' };
    if (frame && (frame.precision !== 8 || !JPEG_FRAMES.has(frame.marker) || frame.height === 0)) {
      return { ok: false, code: 'unsupported-variant' };
    }
  }
  return { ok: true, decoder };
}
