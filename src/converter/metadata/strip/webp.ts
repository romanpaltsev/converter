// Удаление метаданных из WebP без перекодирования: чанки пересобираются, флаги VP8X обновляются.
// У простого WebP (без VP8X) метаданных не бывает. Анимация (ANIM, ANMF) и цветовой профиль сохраняются.

import { tiffFromExifChunk } from '../heif-exif';
import { readWebpChunks } from '../webp-chunks';
import { editExif } from './exif';
import { RemovedSet, type StripMode, type StripResult } from './types';

const IMAGE_CHUNKS = new Set(['ICCP', 'ANIM', 'ANMF', 'ALPH', 'VP8 ', 'VP8L']);
const FLAG_EXIF = 0x08;
const FLAG_XMP = 0x04;

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + data.length + (data.length & 1)); // выравнивание до чётной длины
  for (let i = 0; i < 4; i++) out[i] = type.charCodeAt(i);
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
}

export function stripWebp(webp: Uint8Array, mode: StripMode): StripResult {
  const riffSize = new DataView(webp.buffer, webp.byteOffset, webp.byteLength).getUint32(4, true);
  // данные после конца RIFF (хвосты программ) отрезаются; неверный размер RIFF — читаем до конца файла
  const end = riffSize + 8 <= webp.length ? riffSize + 8 : webp.length;
  const chunks = readWebpChunks(webp, end);
  const removed = new RemovedSet();
  if (end < webp.length) removed.add('other');
  const vp8x = chunks[0]?.type === 'VP8X' ? chunks[0] : null;
  if (!vp8x) return end < webp.length ? rebuild(chunks.map((c) => chunk(c.type, c.data)), removed) : { bytes: webp, changed: false, removed: [], warnings: [] };

  let changed = end < webp.length;
  let exifSeen = false;
  let hasExif = false;
  const parts: Uint8Array[] = [];
  for (const c of chunks.slice(1)) {
    if (c.type === 'EXIF') {
      // второй блок EXIF лишний в любом режиме
      const tiff = exifSeen ? null : tiffFromExifChunk(c.data);
      exifSeen = true;
      if (!tiff) {
        removed.add('exif');
        changed = true;
        continue;
      }
      const edit = editExif(tiff, mode);
      removed.add(...edit.removed);
      if (edit.tiff !== tiff) changed = true;
      if (edit.tiff) {
        parts.push(chunk('EXIF', edit.tiff));
        hasExif = true;
      }
      continue;
    }
    if (c.type === 'XMP ') {
      removed.add('xmp');
      changed = true;
      continue;
    }
    if (IMAGE_CHUNKS.has(c.type) || mode === 'location') parts.push(chunk(c.type, c.data));
    else {
      removed.add('other');
      changed = true;
    }
  }
  if (!changed) return { bytes: webp, changed: false, removed: removed.list(), warnings: [] };
  const header = vp8x.data.slice();
  header[0] = (header[0]! & ~(FLAG_EXIF | FLAG_XMP)) | (hasExif ? FLAG_EXIF : 0);
  return rebuild([chunk('VP8X', header), ...parts], removed);
}

function rebuild(parts: Uint8Array[], removed: RemovedSet): StripResult {
  const size = parts.reduce((sum, p) => sum + p.length, 4);
  const out = new Uint8Array(8 + size);
  out.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]); // «RIFF», размер, «WEBP»
  new DataView(out.buffer).setUint32(4, size, true);
  let pos = 12;
  for (const part of parts) {
    out.set(part, pos);
    pos += part.length;
  }
  return { bytes: out, changed: true, removed: removed.list(), warnings: [] };
}
