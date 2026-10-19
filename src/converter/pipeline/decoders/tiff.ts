// Декодер TIFF. Разбор IFD и распаковка полос/тайлов — UTIF.js (utif2): LZW, Deflate, PackBits, JPEG (с JPEGTables),
// CCITT G3/G4, горизонтальный предиктор; 16-битные данные он приводит к little-endian. Остальное — здесь:
// обход полос и тайлов, перевод отсчётов в RGBA 8 бит (порядок байтов, 1–16 бит, float32, палитра, предумноженная
// альфа), ICC и EXIF из IFD0, выбор страницы. toRGBA8 из UTIF не используем: он обращается к window (в worker'е
// его нет) и игнорирует тип альфы. Берётся первая полноразмерная страница; у многостраничного файла — предупреждение.
// RAW-снимки (DNG, CR2, NEF, ARW) тоже начинаются как TIFF — для них понятная ошибка, а не конвертация миниатюры.

import UTIF from 'utif2';
import { isPlausibleIcc } from '../../color/profiles';
import { readOrientation } from '../../metadata/exif-filter';
import { type TiffEntry, TiffError, parseTiff, writeTiff } from '../../metadata/tiff';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type WarningCode } from '../types';

const MAX_PIXELS = 16384 * 16384;

/** IFD в представлении UTIF: теги — свойства вида t256 (массивы значений), плюс вложенные IFD. */
interface Ifd {
  [tag: `t${number}`]: number[] | Uint8Array | string[] | undefined;
  subIFD?: Ifd[];
  isLE?: boolean;
}

/** Внутренняя функция UTIF, которой распаковывается одна полоса или тайл (в типах пакета её нет). */
type Decompress = (
  img: Ifd,
  ifds: Ifd[],
  data: Uint8Array,
  offset: number,
  length: number,
  compression: number,
  target: Uint8Array,
  targetOffset: number,
  fillOrder: number,
  width: number,
  height: number,
) => void;

const utif = UTIF as unknown as { decode: ((buffer: ArrayBuffer, options: object) => Ifd[]) & { _decompress: Decompress } };

/** Поддерживаемые сжатия: нет, CCITT RLE/G3/G4, LZW, старый и новый JPEG, Deflate (два кода), PackBits. */
const COMPRESSIONS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 32946, 32773]);
/** Фотометрия RAW: мозаика Байера и линейный RAW из DNG. */
const RAW_PHOTOMETRIC = new Set([32803, 34892]);
/** DNGVersion и срез CR2 — тоже признаки RAW. */
const RAW_TAGS = ['t50706', 't50752'] as const;

/** Описательные теги IFD0, которые имеет смысл переносить как EXIF; служебные теги структуры файла — нет. */
const DESCRIPTIVE_IFD0 = new Set([
  0x010e, // ImageDescription
  0x010f, // Make
  0x0110, // Model
  0x0112, // Orientation
  0x011a, // XResolution
  0x011b, // YResolution
  0x0128, // ResolutionUnit
  0x0131, // Software
  0x0132, // DateTime
  0x013b, // Artist
  0x013c, // HostComputer
  0x8298, // Copyright
]);

const num = (ifd: Ifd, tag: number, fallback: number): number => {
  const value = ifd[`t${tag}`];
  return Array.isArray(value) && typeof value[0] === 'number' ? value[0] : fallback;
};
const nums = (ifd: Ifd, tag: number): number[] | null => {
  const value = ifd[`t${tag}`];
  return Array.isArray(value) && typeof value[0] === 'number' ? (value as number[]) : null;
};

/** Уменьшенная копия (NewSubfileType, бит 0) — превью, а не страница. */
const isReduced = (ifd: Ifd) => (num(ifd, 254, 0) & 1) === 1;
const hasImage = (ifd: Ifd) => nums(ifd, 256) !== null && nums(ifd, 257) !== null;

function isRaw(ifds: Ifd[]): boolean {
  const all = (list: Ifd[]): Ifd[] => list.flatMap((ifd) => [ifd, ...all(ifd.subIFD ?? [])]);
  return all(ifds).some((ifd) => RAW_PHOTOMETRIC.has(num(ifd, 262, -1)) || RAW_TAGS.some((tag) => ifd[tag] !== undefined));
}

export interface TiffStructure {
  ifds: Ifd[];
  page: Ifd;
  width: number;
  height: number;
  pages: number;
  littleEndian: boolean;
}

export function readTiff(bytes: Uint8Array): TiffStructure {
  // UTIF читает данные через data.buffer без учёта byteOffset — нужен буфер, начинающийся с файла
  const buffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? (bytes.buffer as ArrayBuffer) : bytes.slice().buffer;
  let ifds: Ifd[];
  try {
    ifds = utif.decode(buffer, { parseMN: false, debug: false });
  } catch (error) {
    throw new ConvertError('decode-failed', `TIFF: ${String(error)}`);
  }
  if (isRaw(ifds)) throw new ConvertError('unsupported-variant', 'TIFF: RAW-снимок');
  const pages = ifds.filter((ifd) => hasImage(ifd) && !isReduced(ifd));
  const page = pages[0];
  if (!page) throw new ConvertError('decode-failed', 'TIFF: нет изображения');
  return { ifds, page, width: num(page, 256, 0), height: num(page, 257, 0), pages: pages.length, littleEndian: bytes[0] === 0x49 };
}

/** Распакованные отсчёты страницы: строки по bpl байт (16 бит — уже little-endian). */
function decompress(bytes: Uint8Array, tiff: TiffStructure, bitsPerPixel: number): Uint8Array {
  const { page, ifds, width, height } = tiff;
  const compression = num(page, 259, 1);
  if (!COMPRESSIONS.has(compression)) throw new ConvertError('unsupported-variant', `TIFF: сжатие ${compression}`);
  if (num(page, 317, 1) === 3) throw new ConvertError('unsupported-variant', 'TIFF: предиктор с плавающей точкой');
  const data = bytes.byteOffset === 0 ? bytes : bytes.slice();
  const fillOrder = num(page, 266, 1);
  page.isLE = tiff.littleEndian;
  const bpl = Math.ceil((width * bitsPerPixel) / 8);
  const raw = new Uint8Array(bpl * height);
  const run = (offset: number, length: number, target: Uint8Array, targetOffset: number, w: number, h: number) => {
    try {
      utif.decode._decompress(page, ifds, data, offset, Math.min(length, data.length - offset), compression, target, targetOffset, fillOrder, w, h);
    } catch (error) {
      throw new ConvertError('decode-failed', `TIFF: ${String(error)}`);
    }
  };

  const tileWidth = num(page, 322, 0);
  if (tileWidth > 0) {
    const tileHeight = num(page, 323, 0);
    const offsets = nums(page, 324) ?? [];
    const counts = nums(page, 325) ?? [];
    const across = Math.ceil(width / tileWidth);
    const tileBpl = Math.ceil((tileWidth * bitsPerPixel) / 8);
    const tile = new Uint8Array(tileBpl * tileHeight);
    for (let i = 0; i < offsets.length; i++) {
      const tx = (i % across) * tileWidth;
      const ty = Math.floor(i / across) * tileHeight;
      if (ty >= height) break;
      tile.fill(0);
      run(offsets[i]!, counts[i] ?? 0, tile, 0, tileWidth, tileHeight);
      // крайние тайлы выходят за изображение: копируем только видимую часть
      const xByte = (tx * bitsPerPixel) / 8;
      const copy = Math.min(tileBpl, bpl - xByte);
      for (let r = 0; r < tileHeight && ty + r < height; r++) {
        raw.set(tile.subarray(r * tileBpl, r * tileBpl + copy), (ty + r) * bpl + xByte);
      }
    }
  } else {
    const offsets = nums(page, 273) ?? [];
    const counts = nums(page, 279) ?? [bpl * height];
    const rowsPerStrip = Math.min(num(page, 278, height), height);
    for (let i = 0; i < offsets.length; i++) {
      const y = i * rowsPerStrip;
      if (y >= height) break;
      run(offsets[i]!, counts[i] ?? 0, raw, y * bpl, width, Math.min(rowsPerStrip, height - y));
    }
  }
  return raw;
}

/** Отсчёты → RGBA 8 бит. */
export function decodeTiff(bytes: Uint8Array): { rgba: Uint8Array; width: number; height: number; hasAlpha: boolean; pages: number; tiff: TiffStructure } {
  const tiff = readTiff(bytes);
  const { page, width, height } = tiff;
  if (width <= 0 || height <= 0) throw new ConvertError('decode-failed', `TIFF: неверный размер ${width}×${height}`);
  if (width * height > MAX_PIXELS) throw new ConvertError('unsupported-variant', `TIFF: ${width}×${height}`);
  if (num(page, 284, 1) === 2) throw new ConvertError('unsupported-variant', 'TIFF: раздельные плоскости каналов');
  let photometric = num(page, 262, num(page, 258, 1) === 1 ? 0 : 2);
  const compression = num(page, 259, 1);
  const bps = num(page, 258, 1);
  const spp = num(page, 277, 1);
  const sampleFormat = num(page, 339, 1);
  if (photometric === 5) throw new ConvertError('cmyk-unsupported');
  // JPEG внутри TIFF распаковывается сразу в RGB (YCbCr → RGB делает декодер JPEG)
  if (photometric === 6 && (compression === 6 || compression === 7)) photometric = 2;
  if (![0, 1, 2, 3].includes(photometric)) throw new ConvertError('unsupported-variant', `TIFF: фотометрия ${photometric}`);
  const float = sampleFormat === 3;
  if (float ? bps !== 32 : ![1, 2, 4, 8, 16].includes(bps)) throw new ConvertError('unsupported-variant', `TIFF: ${bps} бит`);

  const raw = decompress(bytes, tiff, bps * spp);
  const bpl = Math.ceil((width * bps * spp) / 8);
  const floats = float ? new DataView(raw.buffer, raw.byteOffset, raw.byteLength) : null;
  // отсчёт канала c точки x строки y, приведённый к 0–255
  const max = (1 << Math.min(bps, 16)) - 1;
  const sample = (y: number, x: number, c: number): number => {
    const i = x * spp + c;
    if (bps === 8) return raw[y * bpl + i]!;
    if (bps === 16) {
      const o = y * bpl + i * 2;
      return Math.round((raw[o]! | (raw[o + 1]! << 8)) / 257);
    }
    if (floats) {
      const v = floats.getFloat32(y * bpl + i * 4, tiff.littleEndian);
      return v <= 0 ? 0 : v >= 1 ? 255 : Math.round(v * 255);
    }
    const bit = i * bps;
    const v = (raw[y * bpl + (bit >> 3)]! >> (8 - bps - (bit & 7))) & max;
    return Math.round((v * 255) / max);
  };

  const extra = nums(page, 338);
  const colorSamples = photometric === 2 ? 3 : 1;
  // альфа: первый дополнительный канал, если он помечен как альфа (1 — предумноженная, 2 — обычная)
  const alphaKind = spp > colorSamples && extra ? extra[0]! : 0;
  const hasAlphaChannel = alphaKind === 1 || alphaKind === 2;
  const colormap = photometric === 3 ? nums(page, 320) : null;
  if (photometric === 3 && (!colormap || bps > 8)) throw new ConvertError('decode-failed', 'TIFF: нет палитры');

  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    let o = y * width * 4;
    for (let x = 0; x < width; x++, o += 4) {
      if (photometric === 3) {
        // индекс палитры — сырое значение, а не приведённое к 0–255
        const bit = x * spp * bps;
        const index = bps === 8 ? raw[y * bpl + x * spp]! : (raw[y * bpl + (bit >> 3)]! >> (8 - bps - (bit & 7))) & max;
        const n = 1 << bps;
        rgba[o] = colormap![index]! >> 8;
        rgba[o + 1] = colormap![n + index]! >> 8;
        rgba[o + 2] = colormap![2 * n + index]! >> 8;
      } else if (photometric === 2) {
        rgba[o] = sample(y, x, 0);
        rgba[o + 1] = sample(y, x, 1);
        rgba[o + 2] = sample(y, x, 2);
      } else {
        const v = sample(y, x, 0);
        rgba[o] = rgba[o + 1] = rgba[o + 2] = photometric === 0 ? 255 - v : v;
      }
      if (hasAlphaChannel) {
        const a = sample(y, x, colorSamples);
        rgba[o + 3] = a;
        if (alphaKind === 1 && a > 0 && a < 255) {
          // предумноженная альфа → обычная
          for (let c = 0; c < 3; c++) rgba[o + c] = Math.min(255, Math.round((rgba[o + c]! * 255) / a));
        }
      } else {
        rgba[o + 3] = 255;
      }
    }
  }
  return { rgba, width, height, hasAlpha: hasAlphaChannel, pages: tiff.pages, tiff };
}

/** ICC-профиль страницы (тег 34675) или null. */
function readIcc(page: Ifd): Uint8Array | null {
  const value = page.t34675;
  if (!(value instanceof Uint8Array) && !Array.isArray(value)) return null;
  const icc = Uint8Array.from(value as ArrayLike<number>);
  return isPlausibleIcc(icc) ? icc : null;
}

/**
 * EXIF из самого TIFF: описательные теги IFD0 и под-IFD Exif и GPS. Служебные теги структуры (полосы, сжатие,
 * размеры) в EXIF результата не попадают. null — если переносить нечего.
 */
export function tiffExif(bytes: Uint8Array): Uint8Array | null {
  try {
    const data = parseTiff(bytes);
    const ifd0: TiffEntry[] = data.ifd0.filter((e) => DESCRIPTIVE_IFD0.has(e.tag));
    if (ifd0.length === 0 && data.exif.length === 0 && data.gps.length === 0) return null;
    return writeTiff({ ...data, ifd0 });
  } catch (error) {
    if (error instanceof TiffError) return null;
    throw error;
  }
}

class TiffSession implements DecoderSession {
  readonly width: number;
  readonly height: number;

  constructor(private readonly bytes: Uint8Array) {
    const tiff = readTiff(bytes);
    this.width = tiff.width;
    this.height = tiff.height;
  }

  async decode(): Promise<DecodedImage> {
    const image = decodeTiff(this.bytes);
    const warnings: WarningCode[] = image.pages > 1 ? ['first-page-only'] : [];
    const exif = tiffExif(this.bytes);
    return {
      width: image.width,
      height: image.height,
      rgba: image.rgba,
      hasAlpha: image.hasAlpha,
      orientation: readOrientation(exif),
      icc: readIcc(image.tiff.page),
      nclx: null,
      exif,
      warnings,
      release: () => {},
    };
  }

  close(): void {}
}

export async function loadTiffDecoder(): Promise<Decoder> {
  return { module: 'tiff', open: (bytes) => new TiffSession(bytes), heapBytes: () => 0 };
}
