// Удаление метаданных из TIFF без перекодирования: файл собирается заново. У каждой страницы остаются теги
// изображения (белый список) и данные полос или тайлов, скопированные как есть; порядок байтов сохраняется.
// В режиме «только геолокация» остаются все теги, кроме GPS, GeoTIFF, XMP и IPTC.

import { isAppleMakerNote } from '../exif-filter';
import { tagInfo } from '../exif-tags';
import { TAG, TYPE, type TiffEntry, parseTiff } from '../tiff';
import { type LayoutEntry, type LayoutIfd, byteOrder, entryNumbers, readIfdAt } from '../tiff-layout';
import { exifContents } from './exif';
import { type RemovedKind, RemovedSet, type StripMode, type StripResult, StripUnsupported } from './types';

/** Теги, которые описывают само изображение: без них файл не прочитать или он покажется иначе. */
const IMAGE_TAGS = new Set([
  0x00fe, 0x00ff, 0x0100, 0x0101, 0x0102, 0x0103, 0x0106, 0x0107, 0x0108, 0x0109, 0x010a, 0x0111, 0x0112, 0x0115, 0x0116,
  0x0117, 0x0118, 0x0119, 0x011a, 0x011b, 0x011c, 0x0122, 0x0123, 0x0124, 0x0125, 0x0128, 0x0129, 0x012d, 0x013d, 0x013e,
  0x013f, 0x0140, 0x0141, 0x0142, 0x0143, 0x0144, 0x0145, 0x014c, 0x014d, 0x014e, 0x0150, 0x0152, 0x0153, 0x0154, 0x0155,
  0x0156, 0x015b, 0x0211, 0x0212, 0x0213, 0x0214, TAG.ICCProfile,
]);
/** Теги со смещениями внутрь файла: пересчитываются (полосы и тайлы) или не переносятся (остальные). */
const STRIP_OFFSETS = TAG.StripOffsets;
const TILE_OFFSETS = TAG.TileOffsets;
const POINTER_TAGS = new Set<number>([TAG.ExifIFD, TAG.GPSIFD, TAG.SubIFDs, TAG.JPEGInterchangeFormat, TAG.JPEGInterchangeFormatLength, 0x0120, 0x0121]);
/** Блоки других форматов в IFD0: XMP, IPTC и ресурсы Photoshop (в них тоже бывает место съёмки). */
const BLOCK_TAGS: Record<number, RemovedKind> = { [TAG.XMP]: 'xmp', 0x83bb: 'iptc', 0x8649: 'iptc' };
const MAX_PAGES = 1000;

interface OutEntry {
  tag: number;
  type: number;
  count: number;
  /** Сырые байты значения в порядке байтов файла. */
  value: Uint8Array;
}

/** Растущий буфер результата. */
class Output {
  bytes = new Uint8Array(1 << 16);
  length = 0;

  constructor(private readonly littleEndian: boolean) {}

  private ensure(extra: number): void {
    if (this.length + extra <= this.bytes.length) return;
    let size = this.bytes.length;
    while (size < this.length + extra) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.bytes.subarray(0, this.length));
    this.bytes = next;
  }

  /** Добавляет данные с чётного смещения (выравнивание TIFF) и возвращает это смещение. */
  append(data: Uint8Array | number): number {
    const size = typeof data === 'number' ? data : data.length;
    this.ensure(size + 1);
    if (this.length & 1) this.bytes[this.length++] = 0;
    const at = this.length;
    if (typeof data !== 'number') this.bytes.set(data, at);
    this.length += size;
    return at;
  }

  u16(at: number, value: number): void {
    new DataView(this.bytes.buffer).setUint16(at, value, this.littleEndian);
  }

  u32(at: number, value: number): void {
    new DataView(this.bytes.buffer).setUint32(at, value, this.littleEndian);
  }

  result(): Uint8Array {
    return this.bytes.slice(0, this.length);
  }
}

/** Пишет IFD (таблицу и значения); возвращает смещение таблицы и позиции полей значений по тегам. */
function writeIfd(out: Output, entries: OutEntry[]): { offset: number; fields: Map<number, number> } {
  const sorted = [...entries].sort((a, b) => a.tag - b.tag);
  const offset = out.append(2 + sorted.length * 12 + 4);
  out.u16(offset, sorted.length);
  const fields = new Map<number, number>();
  sorted.forEach((e, i) => {
    const p = offset + 2 + i * 12;
    out.u16(p, e.tag);
    out.u16(p + 2, e.type);
    out.u32(p + 4, e.count);
    fields.set(e.tag, p + 8);
    if (e.value.length <= 4) out.bytes.set(e.value, p + 8);
    else out.u32(p + 8, out.append(e.value));
  });
  out.u32(offset + 2 + sorted.length * 12, 0); // следующий IFD — проставится позже
  return { offset, fields };
}

const raw = (bytes: Uint8Array, e: LayoutEntry) => bytes.slice(e.valueOffset, e.valueOffset + e.valueLength);
const fromParsed = (e: TiffEntry): OutEntry => ({ tag: e.tag, type: e.type, count: e.count, value: e.value });

function isLocationTag(tag: number): boolean {
  return tag === TAG.GPSIFD || tagInfo('ifd0', tag).group === 'location';
}

export function stripTiff(bytes: Uint8Array, mode: StripMode): StripResult {
  const littleEndian = byteOrder(bytes); // BigTIFF (43) сюда не доходит: TiffError
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pages: LayoutIfd[] = [];
  const visited = new Set<number>();
  for (let offset = view.getUint32(4, littleEndian); offset !== 0 && pages.length < MAX_PAGES && !visited.has(offset); ) {
    visited.add(offset);
    const ifd = readIfdAt(bytes, offset, littleEndian);
    if (!ifd) break;
    pages.push(ifd);
    offset = ifd.next;
  }
  if (pages.length === 0) throw new StripUnsupported('TIFF: нет ни одной страницы');
  // RAW (DNG и похожие) и «старый» JPEG внутри TIFF ссылаются на данные так, что без декодера их не пересобрать
  for (const page of pages) {
    const has = (tag: number) => page.entries.some((e) => e.tag === tag);
    const compression = page.entries.find((e) => e.tag === TAG.Compression);
    if (has(0xc612) || (compression && entryNumbers(bytes, compression, littleEndian)[0] === 6)) {
      throw new StripUnsupported('TIFF: RAW или старый JPEG');
    }
  }

  const removed = new RemovedSet();
  // что есть в первой странице и её Exif/GPS — с поправкой на режим (остальное добавится по ходу)
  const contents = exifContents(bytes);
  if (mode === 'all') removed.add(...contents);
  else if (mode === 'keep-dates') removed.add(...contents.filter((kind) => kind !== 'dates'));
  else if (contents.includes('location')) removed.add('location');
  const parsed = parseTiff(bytes); // Exif и Interop первой страницы — для режимов, где они остаются
  const out = new Output(littleEndian);
  out.append(8);
  out.bytes.set(littleEndian ? [0x49, 0x49] : [0x4d, 0x4d]);
  out.u16(2, 42);
  let previousNext = 4; // куда записать смещение следующей страницы

  pages.forEach((page, index) => {
    const entries: OutEntry[] = [];
    for (const e of page.entries) {
      if (e.tag === STRIP_OFFSETS || e.tag === TILE_OFFSETS) continue; // запишутся заново
      const block = BLOCK_TAGS[e.tag];
      if (IMAGE_TAGS.has(e.tag)) entries.push({ tag: e.tag, type: e.type, count: e.count, value: raw(bytes, e) });
      else if (POINTER_TAGS.has(e.tag)) {
        if (e.tag === TAG.SubIFDs) removed.add('extra-images'); // уменьшенные копии и прочие вложенные изображения
      } else if (block) removed.add(block);
      else if (mode === 'keep-dates' && e.tag === TAG.DateTime) entries.push({ tag: e.tag, type: e.type, count: e.count, value: raw(bytes, e) });
      else if (mode === 'location' && !isLocationTag(e.tag)) entries.push({ tag: e.tag, type: e.type, count: e.count, value: raw(bytes, e) });
      else if (index > 0) {
        // метаданные второй и следующих страниц exifContents не видит
        const { group } = tagInfo('ifd0', e.tag);
        if (group !== 'image') removed.add(group === 'other' ? 'exif' : group);
      }
    }

    // данные полос или тайлов: копируются как есть, смещения — новые
    const offsetsEntry = page.entries.find((e) => e.tag === STRIP_OFFSETS || e.tag === TILE_OFFSETS);
    const countsEntry = page.entries.find((e) => e.tag === (offsetsEntry?.tag === TILE_OFFSETS ? TAG.TileByteCounts : TAG.StripByteCounts));
    if (!offsetsEntry || !countsEntry) throw new StripUnsupported('TIFF: у страницы нет данных изображения');
    const sources = entryNumbers(bytes, offsetsEntry, littleEndian);
    const lengths = entryNumbers(bytes, countsEntry, littleEndian);
    if (sources.length === 0 || sources.length !== lengths.length) throw new StripUnsupported('TIFF: число полос не совпадает');
    entries.push({ tag: offsetsEntry.tag, type: TYPE.LONG, count: sources.length, value: new Uint8Array(sources.length * 4) });

    // Exif первой страницы: даты (keep-dates) или всё без чужого MakerNote (location — его смещения сломались бы)
    let exif: OutEntry[] = [];
    let interop: OutEntry[] = [];
    if (index === 0 && mode === 'keep-dates') {
      const dates = parsed.exif.filter((e) => tagInfo('exif', e.tag).group === 'dates');
      const version = parsed.exif.find((e) => e.tag === TAG.ExifVersion);
      exif = dates.length > 0 ? [...dates, ...(version ? [version] : [])].map(fromParsed) : [];
    } else if (index === 0 && mode === 'location') {
      exif = parsed.exif.filter((e) => e.tag !== TAG.MakerNote || isAppleMakerNote(e)).map(fromParsed);
      if (exif.length < parsed.exif.length) removed.add('makernote');
      interop = parsed.interop.map(fromParsed);
    }
    if (exif.length > 0) entries.push({ tag: TAG.ExifIFD, type: TYPE.LONG, count: 1, value: new Uint8Array(4) });
    if (interop.length > 0) exif.push({ tag: TAG.InteropIFD, type: TYPE.LONG, count: 1, value: new Uint8Array(4) });

    const ifd = writeIfd(out, entries);
    out.u32(previousNext, ifd.offset);
    previousNext = ifd.offset + 2 + entries.length * 12;
    if (exif.length > 0) {
      const exifIfd = writeIfd(out, exif);
      out.u32(ifd.fields.get(TAG.ExifIFD)!, exifIfd.offset);
      if (interop.length > 0) out.u32(exifIfd.fields.get(TAG.InteropIFD)!, writeIfd(out, interop).offset);
    }
    // поле значения смещений: внутри записи (одна полоса) или по ссылке
    const field = ifd.fields.get(offsetsEntry.tag)!;
    const table = sources.length === 1 ? field : new DataView(out.bytes.buffer).getUint32(field, littleEndian);
    sources.forEach((source, i) => {
      const length = lengths[i]!;
      if (source + length > bytes.length) throw new StripUnsupported('TIFF: данные изображения за пределами файла');
      const at = out.append(bytes.subarray(source, source + length));
      out.u32(table + i * 4, at);
    });
  });

  const result = out.result();
  // пересобранный файл без единого удалённого тега почти всегда совпадает по смыслу с исходным — отдаём исходный
  if (removed.size === 0) return { bytes, changed: false, removed: [], warnings: [] };
  return { bytes: result, changed: true, removed: removed.list(), warnings: [] };
}
