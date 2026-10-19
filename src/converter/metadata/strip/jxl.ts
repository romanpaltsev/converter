// Удаление метаданных из JPEG XL без перекодирования: из контейнера убираются боксы Exif, xml (XMP), jumb
// (Content Credentials), их сжатые Brotli варианты (brob) и jbrd — данные для восстановления исходного JPEG
// (в них лежат его прочие сегменты). У «голого» кодового потока (FF 0A) метаданных нет. Смещений в контейнере
// JPEG XL нет, поэтому боксы можно убирать и заменять свободно.

import type { WarningCode } from '../../pipeline/types';
import { isTiffHeader } from '../heif-exif';
import { readBoxes } from '../heif-items';
import { editExif } from './exif';
import { RemovedSet, type StripMode, type StripResult } from './types';

function box(type: string, ...parts: Uint8Array[]): Uint8Array {
  const size = 8 + parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(size);
  new DataView(out.buffer).setUint32(0, size);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  let pos = 8;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

const ascii = (bytes: Uint8Array, at: number) => String.fromCharCode(...bytes.subarray(at, at + 4));

export function stripJxl(bytes: Uint8Array, mode: StripMode): StripResult {
  if (bytes[0] === 0xff && bytes[1] === 0x0a) return { bytes, changed: false, removed: [], warnings: [] };
  const removed = new RemovedSet();
  const warnings: WarningCode[] = [];
  const parts: Uint8Array[] = [];
  let changed = false;
  for (const b of readBoxes(bytes, 0, bytes.length)) {
    const original = bytes.subarray(b.start, b.end);
    const payload = bytes.subarray(b.dataStart, b.end);
    if (b.type === 'Exif') {
      // 4 байта смещения до TIFF, затем TIFF (как в HEIF)
      const start = payload.length >= 4 ? 4 + new DataView(payload.buffer, payload.byteOffset, 4).getUint32(0) : -1;
      if (!isTiffHeader(payload, start)) {
        removed.add('exif');
        changed = true;
        continue;
      }
      const tiff = payload.subarray(start);
      const edit = editExif(tiff, mode);
      removed.add(...edit.removed);
      if (edit.tiff === tiff) parts.push(original);
      else {
        changed = true;
        if (edit.tiff) parts.push(box('Exif', payload.subarray(0, start), edit.tiff));
      }
      continue;
    }
    const inner = b.type === 'brob' && payload.length >= 4 ? ascii(payload, 0) : null;
    const kind = b.type === 'xml ' || inner === 'xml ' ? 'xmp' : b.type === 'jumb' || inner === 'jumb' ? 'c2pa' : inner === 'Exif' ? 'exif' : b.type === 'jbrd' ? 'other' : null;
    if (!kind) {
      parts.push(original);
      continue;
    }
    // сжатый EXIF не прочитать (нет Brotli) — выборочно не поправить, удаляется целиком
    if (kind === 'exif' && mode !== 'all') warnings.push('exif-compressed-removed');
    removed.add(kind);
    changed = true;
  }
  if (!changed) return { bytes, changed: false, removed: removed.list(), warnings };
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return { bytes: out, changed: true, removed: removed.list(), warnings };
}
