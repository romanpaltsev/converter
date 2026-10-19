// Удаление метаданных из JPEG без перекодирования: сегменты заголовка пересобираются, сжатые данные копируются
// как есть. После конца основного изображения (EOI) отрезается всё: там лежат дополнительные изображения
// MPF (карта HDR, глубина), видео «живых фото» и служебные хвосты камер.

import { JpegError, type JpegSegment, isExifSegment, isIccSegment, readJpegSegments } from '../jpeg-segments';
import { editExif } from './exif';
import { RemovedSet, type StripMode, type StripResult } from './types';

const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"
const XMP_PREFIX = 'http://ns.adobe.com/xap/1.0/\0';
const XMP_EXTENSION_PREFIX = 'http://ns.adobe.com/xmp/extension/\0';

const text = (data: Uint8Array, length: number) => String.fromCharCode(...data.subarray(0, Math.min(length, data.length)));
const startsWith = (data: Uint8Array, prefix: string) => text(data, prefix.length) === prefix;

/** Сегмент с данными заново: маркер, длина, данные. */
function segment(marker: number, ...parts: ArrayLike<number>[]): Uint8Array {
  const length = 2 + parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(2 + length);
  out.set([0xff, marker, length >> 8, length & 0xff]);
  let pos = 4;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

/**
 * Конец основного изображения: позиция после EOI. Сжатые данные идут после каждого SOS до следующего маркера
 * (0xFF 0x00 и RST внутри них — не маркеры); между сканами progressive-JPEG — сегменты с длиной. null — EOI нет
 * (файл обрезан).
 */
export function findEoi(jpeg: Uint8Array, sosOffset: number): number | null {
  let pos = sosOffset;
  while (pos + 1 < jpeg.length) {
    if (jpeg[pos] !== 0xff) return null;
    let marker = jpeg[pos + 1]!;
    while (marker === 0xff && pos + 2 < jpeg.length) marker = jpeg[++pos + 1]!; // заполняющие 0xFF
    if (marker === 0xd9) return pos + 2;
    if (marker >= 0xd0 && marker <= 0xd7) {
      pos += 2;
      continue;
    }
    if (pos + 4 > jpeg.length) return null;
    pos += 2 + ((jpeg[pos + 2]! << 8) | jpeg[pos + 3]!);
    if (marker !== 0xda) continue;
    // сжатые данные скана: ищем следующий настоящий маркер
    for (;;) {
      pos = jpeg.indexOf(0xff, pos);
      if (pos < 0 || pos + 1 >= jpeg.length) return null;
      const next = jpeg[pos + 1]!;
      if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) pos += 2;
      else if (next === 0xff) pos += 1;
      else break;
    }
  }
  return null;
}

/** Куда относится сегмент заголовка (кроме EXIF): null — оставить, иначе что это. */
function classify(s: JpegSegment): 'keep' | 'xmp' | 'iptc' | 'thumbnail' | 'extra-images' | 'c2pa' | 'comment' | 'other' {
  const { marker, data } = s;
  if (marker < 0xe0 || marker > 0xef) return marker === 0xfe ? 'comment' : 'keep'; // таблицы, кадр, DRI…
  if (marker === 0xe0) return startsWith(data, 'JFIF\0') ? 'keep' : startsWith(data, 'JFXX\0') ? 'thumbnail' : 'other';
  if (marker === 0xe1) return startsWith(data, XMP_PREFIX) || startsWith(data, XMP_EXTENSION_PREFIX) ? 'xmp' : 'other';
  if (marker === 0xe2) return isIccSegment(s) ? 'keep' : startsWith(data, 'MPF\0') ? 'extra-images' : 'other';
  if (marker === 0xeb) return text(data, 64).includes('c2pa') ? 'c2pa' : 'other'; // APP11: JUMBF, в нём Content Credentials
  if (marker === 0xed) return startsWith(data, 'Photoshop 3.0\0') ? 'iptc' : 'other';
  if (marker === 0xee) return startsWith(data, 'Adobe') ? 'keep' : 'other'; // APP14 Adobe нужен для цвета
  return 'other';
}

export function stripJpeg(jpeg: Uint8Array, mode: StripMode): StripResult {
  const segments = readJpegSegments(jpeg);
  const sos = segments.at(-1);
  if (sos?.marker !== 0xda) throw new JpegError('JPEG: не найден SOS');
  const removed = new RemovedSet();
  const parts: Uint8Array[] = [jpeg.subarray(0, 2)];
  let changed = false;
  let exifSeen = false;
  for (const s of segments.slice(0, -1)) {
    const original = jpeg.subarray(s.offset, s.offset + s.size);
    if (isExifSegment(s)) {
      // второй блок EXIF камеры не пишут — он лишний в любом режиме
      if (exifSeen) {
        removed.add('exif');
        changed = true;
        continue;
      }
      exifSeen = true;
      const tiff = s.data.subarray(EXIF_HEADER.length);
      const edit = editExif(tiff, mode);
      removed.add(...edit.removed);
      if (edit.tiff === tiff) parts.push(original);
      else {
        changed = true;
        if (edit.tiff) parts.push(segment(0xe1, EXIF_HEADER, edit.tiff));
      }
      continue;
    }
    const kind = classify(s);
    // «только геолокация» не трогает то, где места не бывает: комментарии и служебные данные программ
    const keep = kind === 'keep' || (mode === 'location' && (kind === 'comment' || kind === 'other' || kind === 'thumbnail'));
    if (keep) {
      parts.push(original);
      continue;
    }
    removed.add(kind as Exclude<typeof kind, 'keep'>);
    changed = true;
  }
  const end = findEoi(jpeg, sos.offset) ?? jpeg.length;
  parts.push(jpeg.subarray(sos.offset, end));
  if (end < jpeg.length) {
    removed.add('extra-images');
    changed = true;
  }
  if (!changed) return { bytes: jpeg, changed: false, removed: removed.list(), warnings: [] };
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return { bytes: out, changed: true, removed: removed.list(), warnings: [] };
}
