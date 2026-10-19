// Удаление метаданных из HEIC и AVIF без перекодирования: данные элементов Exif и XMP перезаписываются на месте —
// размер файла и все смещения (iloc) остаются прежними, а вместо старых байтов — новый EXIF и нули.
// Элементы остаются в файле (пустые и правильные), поэтому ничего не нужно пересчитывать.

import { isTiffHeader } from '../heif-exif';
import { HeifError, isExifItem, isXmpItem, readBoxes, readHeifInfo, readItemData, writeItemData } from '../heif-items';
import { byteOrder } from '../tiff-layout';
import { editExif, emptyTiff } from './exif';
import { RemovedSet, type StripMode, type StripResult } from './types';

/** Пустой пакет XMP: читатели видят правильный, но пустой XMP. Остаток заполняется пробелами (так разрешает XMP). */
const EMPTY_XMP = '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"/>';
const XMP_END = '<?xpacket end="w"?>';
/** Бокс uuid с Content Credentials (C2PA) в файлах ISOBMFF. */
const C2PA_UUID = 'd8fec3d61b0e483c92975828877ec481';

function emptyXmp(length: number): Uint8Array {
  const head = new TextEncoder().encode(EMPTY_XMP);
  const tail = new TextEncoder().encode(XMP_END);
  if (head.length + tail.length > length) return new Uint8Array(length); // места нет даже на пустой пакет — нули
  const out = new Uint8Array(length).fill(0x20);
  out.set(head);
  out.set(tail, length - tail.length);
  return out;
}

/** Где в блоке Exif начинается TIFF: 4 байта смещения, затем обычно «Exif\0\0» и TIFF. */
function tiffStart(payload: Uint8Array): number | null {
  if (payload.length >= 4) {
    const start = 4 + new DataView(payload.buffer, payload.byteOffset, 4).getUint32(0);
    if (isTiffHeader(payload, start)) return start;
  }
  for (let at = 0; at < Math.min(payload.length, 64); at++) if (isTiffHeader(payload, at)) return at;
  return null;
}

export function stripHeif(bytes: Uint8Array, mode: StripMode): StripResult {
  const info = readHeifInfo(bytes);
  const removed = new RemovedSet();
  let out: Uint8Array | null = null;
  const target = () => (out ??= bytes.slice());

  for (const item of info.items) {
    if (!isExifItem(item) && !isXmpItem(item)) continue;
    // данные не в этом файле: затереть нечего — и сказать «удалено» нельзя
    if (!item.extents) throw new HeifError(`HEIF: данные элемента ${item.id} не в файле`);
    const payload = readItemData(bytes, item)!;
    if (isXmpItem(item)) {
      removed.add('xmp');
      writeItemData(target(), item, emptyXmp(payload.length));
      continue;
    }
    const start = tiffStart(payload);
    if (start === null) {
      // нечитаемый блок — затираем целиком
      removed.add('exif');
      writeItemData(target(), item, new Uint8Array(payload.length));
      continue;
    }
    const tiff = payload.subarray(start);
    const edit = editExif(tiff, mode);
    removed.add(...edit.removed);
    if (edit.tiff === tiff) continue;
    const littleEndian = byteOrder(tiff);
    // новый EXIF короче старого (из него только убирали); не влез — пустой TIFF, чтобы элемент остался правильным
    const room = payload.length - start;
    const replacement = [edit.tiff, emptyTiff(littleEndian)].find((t) => t && t.length <= room) ?? null;
    const next = payload.slice();
    next.fill(0, start);
    if (replacement) next.set(replacement, start);
    writeItemData(target(), item, next);
  }

  // Content Credentials (C2PA) — подпись прежнего файла: после правки она всё равно недействительна
  for (const box of readBoxes(bytes, 0, bytes.length)) {
    if (box.type !== 'uuid' || box.end - box.dataStart < 16) continue;
    const uuid = [...bytes.subarray(box.dataStart, box.dataStart + 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (uuid !== C2PA_UUID) continue;
    removed.add('c2pa');
    target().fill(0, box.dataStart + 16, box.end);
  }

  if (!out) return { bytes, changed: false, removed: removed.list(), warnings: [] };
  return { bytes: out, changed: true, removed: removed.list(), warnings: [] };
}
