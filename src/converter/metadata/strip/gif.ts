// Удаление метаданных из GIF без перекодирования: блоки копируются как есть, кроме комментариев и расширений
// приложений с метаданными (XMP). Анимация (NETSCAPE2.0) и цветовой профиль (ICCRGBG1012) сохраняются.

import { RemovedSet, type StripMode, type StripResult } from './types';

export class GifError extends Error {}

const KEEP_APPLICATIONS = new Set(['NETSCAPE2.0', 'ANIMEXTS1.0', 'ICCRGBG1012']);

/** Позиция после цепочки подблоков (каждый — байт длины и данные, конец — нулевой байт). */
function skipSubBlocks(gif: Uint8Array, pos: number): number {
  while (pos < gif.length) {
    const size = gif[pos]!;
    pos += 1 + size;
    if (size === 0) return pos;
  }
  throw new GifError('GIF: обрезанные данные');
}

export function stripGif(gif: Uint8Array, mode: StripMode): StripResult {
  if (gif.length < 13) throw new GifError('GIF: слишком коротко');
  const flags = gif[10]!;
  let pos = 13 + (flags & 0x80 ? 3 * 2 ** ((flags & 7) + 1) : 0); // заголовок, экран и глобальная палитра
  const parts: Uint8Array[] = [gif.subarray(0, pos)];
  const removed = new RemovedSet();
  let changed = false;
  for (;;) {
    if (pos >= gif.length) throw new GifError('GIF: нет завершающего блока');
    const start = pos;
    const introducer = gif[pos]!;
    if (introducer === 0x3b) {
      parts.push(gif.subarray(pos, pos + 1));
      pos += 1;
      break;
    }
    if (introducer === 0x2c) {
      // кадр: дескриптор (10 байт), локальная палитра, минимальный размер кода LZW и данные
      const local = gif[pos + 9]!;
      pos += 10 + (local & 0x80 ? 3 * 2 ** ((local & 7) + 1) : 0) + 1;
      pos = skipSubBlocks(gif, pos);
      parts.push(gif.subarray(start, pos));
      continue;
    }
    if (introducer !== 0x21) throw new GifError(`GIF: неизвестный блок 0x${introducer.toString(16)}`);
    const label = gif[pos + 1]!;
    pos = skipSubBlocks(gif, pos + 2);
    let kind: 'comment' | 'xmp' | 'other' | null = null;
    if (label === 0xfe) kind = mode === 'location' ? null : 'comment';
    else if (label === 0xff) {
      // первый подблок расширения приложения — 8 байт имени и 3 байта кода
      const name = String.fromCharCode(...gif.subarray(start + 3, start + 3 + Math.min(11, gif[start + 2]!)));
      if (name === 'XMP DataXMP') kind = 'xmp';
      else if (!KEEP_APPLICATIONS.has(name) && mode !== 'location') kind = 'other';
    }
    if (kind) {
      removed.add(kind);
      changed = true;
    } else parts.push(gif.subarray(start, pos));
  }
  // данные после завершающего блока
  if (pos < gif.length) {
    removed.add('other');
    changed = true;
  }
  if (!changed) return { bytes: gif, changed: false, removed: [], warnings: [] };
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return { bytes: out, changed: true, removed: removed.list(), warnings: [] };
}
