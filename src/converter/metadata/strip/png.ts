// Удаление метаданных из PNG без перекодирования: остаются только чанки изображения и цвета (белый список),
// анимация APNG сохраняется. EXIF (eXIf) правится по режиму, текстовые чанки и XMP удаляются.

import { buildPngChunk, readPngChunks } from '../png-chunks';
import { tiffFromExifChunk } from '../heif-exif';
import { editExif } from './exif';
import { type RemovedKind, RemovedSet, type StripMode, type StripResult } from './types';

/** Чанки изображения, прозрачности, цвета и анимации — без них картинка покажется иначе. */
const IMAGE_CHUNKS = new Set([
  'IHDR',
  'PLTE',
  'IDAT',
  'IEND',
  'tRNS',
  'cHRM',
  'gAMA',
  'iCCP',
  'sBIT',
  'sRGB',
  'cICP',
  'mDCV',
  'cLLI',
  'bKGD',
  'hIST',
  'pHYs',
  'sPLT',
  'sCAL',
  'acTL',
  'fcTL',
  'fdAT',
]);
const TEXT_CHUNKS = new Set(['tEXt', 'zTXt', 'iTXt']);
/** Текст, в котором бывают координаты: XMP и EXIF/IPTC, записанные ImageMagick и ExifTool в виде текста. */
const LOCATION_TEXT = /^(XML:com\.adobe\.xmp|Raw profile type (exif|APP1|xmp|iptc|8bim))$/i;

const keyword = (data: Uint8Array) => {
  const end = data.indexOf(0);
  return String.fromCharCode(...data.subarray(0, end < 0 ? Math.min(data.length, 79) : end));
};

export function stripPng(png: Uint8Array, mode: StripMode): StripResult {
  const chunks = readPngChunks(png, { verifyCrc: false });
  const removed = new RemovedSet();
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  let changed = false;
  let exifSeen = false;
  for (const chunk of chunks) {
    const original = png.subarray(chunk.offset, chunk.offset + 12 + chunk.data.length);
    const drop = (kind: RemovedKind) => {
      removed.add(kind);
      changed = true;
    };
    if (chunk.type === 'eXIf') {
      const tiff = exifSeen ? null : tiffFromExifChunk(chunk.data);
      exifSeen = true;
      if (!tiff) {
        drop('exif');
        continue;
      }
      const edit = editExif(tiff, mode);
      removed.add(...edit.removed);
      if (edit.tiff === tiff) parts.push(original);
      else {
        changed = true;
        if (edit.tiff) parts.push(buildPngChunk('eXIf', edit.tiff));
      }
      continue;
    }
    if (TEXT_CHUNKS.has(chunk.type)) {
      const name = keyword(chunk.data);
      const isXmp = name === 'XML:com.adobe.xmp';
      if (mode === 'location' && !LOCATION_TEXT.test(name)) parts.push(original);
      else if (mode === 'keep-dates' && name === 'Creation Time') parts.push(original);
      else drop(isXmp ? 'xmp' : 'text');
      continue;
    }
    if (chunk.type === 'tIME') {
      // время последнего изменения файла
      if (mode === 'all') drop('dates');
      else parts.push(original);
      continue;
    }
    if (chunk.type === 'caBX') {
      drop('c2pa');
      continue;
    }
    // критические чанки (заглавная первая буква) удалять нельзя: без них файл не прочитать
    const critical = chunk.type.charCodeAt(0) < 0x61;
    if (IMAGE_CHUNKS.has(chunk.type) || critical || mode === 'location') parts.push(original);
    else drop('other');
  }
  // данные после IEND (бывают приклеенные архивы и служебные хвосты программ)
  const last = chunks.at(-1);
  if (last && last.offset + 12 + last.data.length < png.length) {
    removed.add('other');
    changed = true;
  }
  if (!changed) return { bytes: png, changed: false, removed: removed.list(), warnings: [] };
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return { bytes: out, changed: true, removed: removed.list(), warnings: [] };
}
