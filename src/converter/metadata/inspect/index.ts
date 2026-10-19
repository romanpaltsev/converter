// «Посмотреть EXIF»: всё, что можно прочитать о файле без декодирования изображения — EXIF, цветовой профиль,
// размер по заголовкам, прочие блоки метаданных. Чистый TS в worker'е, как «Удалить метаданные».

import type { Nclx } from '../../color/nclx';
import { readJpegFrame, readPngHeader, readWebpHeader } from '../../pipeline/headers';
import type { ImageKind } from '../../pipeline/sniff';
import { readOrientation } from '../exif-filter';
import { tiffFromExifChunk, tiffFromHeifExif } from '../heif-exif';
import { type Box, isExifItem, readBoxes, readHeifInfo, readItemData } from '../heif-items';
import { inflateZlib } from '../inflate';
import { JpegError, extractJpegExif, extractJpegIcc } from '../jpeg-segments';
import { readPngChunks } from '../png-chunks';
import { stripMetadata } from '../strip';
import { type ExifData, TAG, TiffError, parseTiff } from '../tiff';
import { entryNumbers, readLayout } from '../tiff-layout';
import { readWebpChunks } from '../webp-chunks';
import { iccDescription, nclxDescription } from './color';
import { EMPTY_SUMMARY, exifThumbnail, summarizeExif, tagRows } from './exif-report';
import type { MetadataReport } from './types';

interface Sources {
  exif: Uint8Array | null;
  icc: Uint8Array | null;
  nclx: Nclx | null;
  /** Размер в файле (до поворота) и нужен ли поворот на 90° для показа. */
  width: number | null;
  height: number | null;
  quarterTurn: boolean | null;
  exifCompressed: boolean;
}

const EMPTY: Sources = { exif: null, icc: null, nclx: null, width: null, height: null, quarterTurn: null, exifCompressed: false };

/** Читатель битов кодового потока JPEG XL (младшие биты первыми). */
class Bits {
  private bit = 0;
  constructor(
    private readonly bytes: Uint8Array,
    private pos: number,
  ) {}

  read(count: number): number {
    let value = 0;
    for (let i = 0; i < count; i++) {
      if (this.pos >= this.bytes.length) throw new RangeError('JXL: обрезанный заголовок');
      value += ((this.bytes[this.pos]! >> this.bit) & 1) * 2 ** i;
      if (++this.bit === 8) {
        this.bit = 0;
        this.pos++;
      }
    }
    return value;
  }

  /** U32 из спецификации: 2 бита выбора, затем смещение + столько-то бит. */
  u32(distributions: [number, number][]): number {
    const [offset, bits] = distributions[this.read(2)]!;
    return offset + this.read(bits);
  }
}

const SIZE_DISTRIBUTIONS: [number, number][] = [
  [1, 9],
  [1, 13],
  [1, 18],
  [1, 30],
];
const RATIOS = [0, 1, 1.2, 4 / 3, 1.5, 16 / 9, 1.25, 2];

/** Размер и ориентация из заголовка кодового потока JPEG XL (SizeHeader и начало ImageMetadata). */
export function readJxlSize(codestream: Uint8Array): { width: number; height: number; orientation: number } | null {
  if (codestream[0] !== 0xff || codestream[1] !== 0x0a) return null;
  try {
    const bits = new Bits(codestream, 2);
    const small = bits.read(1) === 1;
    const height = small ? (bits.read(5) + 1) * 8 : bits.u32(SIZE_DISTRIBUTIONS);
    const ratio = bits.read(3);
    const width = ratio !== 0 ? Math.floor(height * RATIOS[ratio]!) : small ? (bits.read(5) + 1) * 8 : bits.u32(SIZE_DISTRIBUTIONS);
    let orientation = 1;
    if (bits.read(1) === 0 && bits.read(1) === 1) orientation = 1 + bits.read(3); // all_default = 0, extra_fields = 1
    return { width, height, orientation };
  } catch {
    return null;
  }
}

/** Кодовый поток JPEG XL: сам файл или содержимое jxlc/первого jxlp контейнера. */
function jxlCodestream(bytes: Uint8Array, boxes: Box[]): Uint8Array | null {
  if (bytes[0] === 0xff) return bytes;
  const box = boxes.find((b) => b.type === 'jxlc' || b.type === 'jxlp');
  if (!box) return null;
  return bytes.subarray(box.type === 'jxlp' ? box.dataStart + 4 : box.dataStart, box.end);
}

async function inflateIcc(compressed: Uint8Array): Promise<Uint8Array | null> {
  try {
    return await inflateZlib(compressed);
  } catch {
    return null;
  }
}

async function sources(bytes: Uint8Array, kind: ImageKind): Promise<Sources> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (kind) {
    case 'jpeg': {
      const frame = readJpegFrame(bytes);
      let exif: Uint8Array | null = null;
      let icc: Uint8Array | null = null;
      try {
        exif = extractJpegExif(bytes)?.slice() ?? null;
        icc = extractJpegIcc(bytes);
      } catch (error) {
        if (!(error instanceof JpegError)) throw error;
      }
      return { ...EMPTY, exif, icc, width: frame?.width ?? null, height: frame?.height ?? null };
    }
    case 'png': {
      const header = readPngHeader(bytes);
      const result: Sources = { ...EMPTY, width: header?.width ?? null, height: header?.height ?? null };
      for (const chunk of readPngChunks(bytes, { verifyCrc: false })) {
        const { data } = chunk;
        if (chunk.type === 'eXIf') result.exif ??= tiffFromExifChunk(data);
        else if (chunk.type === 'cICP' && data.length >= 4) {
          result.nclx = { colorPrimaries: data[0]!, transferCharacteristics: data[1]!, matrixCoefficients: data[2]!, fullRange: data[3] === 1 };
        } else if (chunk.type === 'iCCP') {
          const nul = data.indexOf(0);
          if (nul > 0 && nul < 80) result.icc = await inflateIcc(data.subarray(nul + 2));
        }
      }
      return result;
    }
    case 'webp': {
      const header = readWebpHeader(bytes);
      const chunks = readWebpChunks(bytes, Math.min(bytes.length, view.getUint32(4, true) + 8));
      const exif = chunks.find((c) => c.type === 'EXIF');
      return {
        ...EMPTY,
        exif: exif ? tiffFromExifChunk(exif.data) : null,
        icc: chunks.find((c) => c.type === 'ICCP')?.data.slice() ?? null,
        width: header?.width ?? null,
        height: header?.height ?? null,
      };
    }
    case 'heic':
    case 'avif': {
      const info = readHeifInfo(bytes);
      const item = info.items.find(isExifItem);
      const block = item ? readItemData(bytes, item) : null;
      return {
        ...EMPTY,
        exif: block ? tiffFromHeifExif(block) : null,
        icc: info.icc,
        nclx: info.nclx,
        width: info.width,
        height: info.height,
        // у HEIF поворот задаёт irot, а EXIF Orientation — только для справки
        quarterTurn: info.rotation % 180 !== 0,
      };
    }
    case 'jxl': {
      const boxes = bytes[0] === 0xff ? [] : readBoxes(bytes, 0, bytes.length);
      const exifBox = boxes.find((b) => b.type === 'Exif');
      const compressed = boxes.some((b) => b.type === 'brob' && String.fromCharCode(...bytes.subarray(b.dataStart, b.dataStart + 4)) === 'Exif');
      const codestream = jxlCodestream(bytes, boxes);
      const size = codestream ? readJxlSize(codestream) : null;
      return {
        ...EMPTY,
        exif: exifBox ? tiffFromHeifExif(bytes.subarray(exifBox.dataStart, exifBox.end)) : null,
        exifCompressed: compressed,
        width: size?.width ?? null,
        height: size?.height ?? null,
        // ориентацию JPEG XL хранит в заголовке кодового потока
        quarterTurn: size ? size.orientation >= 5 : null,
      };
    }
    case 'gif':
      return { ...EMPTY, width: view.getUint16(6, true), height: view.getUint16(8, true) };
    case 'bmp': {
      if (bytes.length < 26) return EMPTY;
      const core = view.getUint32(14, true) === 12;
      const width = core ? view.getUint16(18, true) : Math.abs(view.getInt32(18, true));
      const height = core ? view.getUint16(20, true) : Math.abs(view.getInt32(22, true));
      return { ...EMPTY, width, height };
    }
    case 'tiff': {
      // TIFF сам устроен как EXIF: теги первой страницы — это и есть метаданные
      const layout = readLayout(bytes);
      const number = (tag: number) => {
        const entry = layout.ifd0?.entries.find((e) => e.tag === tag);
        return entry ? (entryNumbers(bytes, entry, layout.littleEndian)[0] ?? null) : null;
      };
      const icc = layout.ifd0?.entries.find((e) => e.tag === TAG.ICCProfile);
      return {
        ...EMPTY,
        exif: bytes,
        icc: icc ? bytes.slice(icc.valueOffset, icc.valueOffset + icc.valueLength) : null,
        width: number(TAG.ImageWidth),
        height: number(TAG.ImageLength),
      };
    }
  }
}

export async function inspectFile(bytes: Uint8Array, kind: ImageKind): Promise<MetadataReport> {
  const src = await sources(bytes, kind);
  let data: ExifData | null = null;
  if (src.exif) {
    try {
      data = parseTiff(src.exif);
    } catch (error) {
      if (!(error instanceof TiffError)) throw error;
    }
  }
  const orientation = data ? readOrientation(src.exif) : 1;
  // что ещё есть в файле — ровно то, что удалил бы режим «Все метаданные»; битый файл — без этого списка
  let contents: MetadataReport['contents'] = [];
  try {
    contents = stripMetadata(bytes, kind, 'all').removed;
  } catch {
    contents = [];
  }
  const quarterTurn = src.quarterTurn ?? orientation >= 5;
  const [width, height] = quarterTurn ? [src.height, src.width] : [src.width, src.height];
  return {
    width,
    height,
    orientation,
    summary: data ? summarizeExif(data) : EMPTY_SUMMARY,
    colorProfile: (src.icc && iccDescription(src.icc)) ?? (src.nclx ? nclxDescription(src.nclx) : null),
    contents,
    tags: data ? tagRows(data) : [],
    thumbnail: src.exif && data ? exifThumbnail(src.exif) : null,
    exifCompressed: src.exifCompressed,
  };
}
