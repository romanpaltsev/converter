// Декодер BMP на TypeScript, без WASM. Поддерживаются заголовки OS/2 (12 байт) и Windows (40–124 байта),
// 1/4/8 бит с палитрой, 16/24/32 бита, маски каналов (BI_BITFIELDS, BI_ALPHABITFIELDS), сжатие RLE8/RLE4,
// изображения сверху вниз (отрицательная высота) и встроенный ICC-профиль заголовка V5.
// BMP со встроенным JPEG/PNG (BI_JPEG, BI_PNG) не встречается на практике — понятная ошибка.

import { isPlausibleIcc } from '../../color/profiles';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession } from '../types';

const MAX_PIXELS = 16384 * 16384;

const BI_RGB = 0;
const BI_RLE8 = 1;
const BI_RLE4 = 2;
const BI_BITFIELDS = 3;
const BI_ALPHABITFIELDS = 6;
/** Тип цветового пространства V5: профиль встроен в файл. */
const PROFILE_EMBEDDED = 0x4d424544; // 'MBED'

export interface BmpHeader {
  width: number;
  height: number;
  topDown: boolean;
  bitCount: number;
  compression: number;
  headerSize: number;
  dataOffset: number;
  paletteOffset: number;
  paletteEntrySize: 3 | 4;
  colorsUsed: number;
  /** Маски R, G, B, A (для 16 и 32 бит); null — стандартная раскладка. */
  masks: [number, number, number, number] | null;
  icc: { offset: number; size: number } | null;
}

function fail(message: string): never {
  throw new ConvertError('decode-failed', `BMP: ${message}`);
}

export function readBmpHeader(bytes: Uint8Array): BmpHeader {
  if (bytes.length < 26 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) fail('нет заголовка');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dataOffset = view.getUint32(10, true);
  const headerSize = view.getUint32(14, true);
  if (headerSize === 12) {
    // BITMAPCOREHEADER (OS/2): 16-битные размеры, палитра по 3 байта
    return {
      width: view.getUint16(18, true),
      height: view.getUint16(20, true),
      topDown: false,
      bitCount: view.getUint16(24, true),
      compression: BI_RGB,
      headerSize,
      dataOffset,
      paletteOffset: 14 + 12,
      paletteEntrySize: 3,
      colorsUsed: 0,
      masks: null,
      icc: null,
    };
  }
  if (headerSize < 40 || bytes.length < 14 + 40) fail(`неизвестный заголовок (${headerSize} байт)`);
  const width = view.getInt32(18, true);
  const rawHeight = view.getInt32(22, true);
  const bitCount = view.getUint16(28, true);
  const compression = view.getUint32(30, true);
  const colorsUsed = view.getUint32(46, true);
  let masks: BmpHeader['masks'] = null;
  let paletteOffset = 14 + headerSize;
  const hasMasks = compression === BI_BITFIELDS || compression === BI_ALPHABITFIELDS;
  if (hasMasks) {
    // маски — в самом заголовке (V2 и новее) или сразу после 40-байтного заголовка
    const count = compression === BI_ALPHABITFIELDS || headerSize >= 56 ? 4 : 3;
    const at = 14 + 40;
    if (bytes.length < at + count * 4) fail('нет масок каналов');
    masks = [view.getUint32(at, true), view.getUint32(at + 4, true), view.getUint32(at + 8, true), count === 4 ? view.getUint32(at + 12, true) : 0];
    if (headerSize === 40) paletteOffset += count * 4;
  } else if (headerSize >= 56 && bitCount === 32 && bytes.length >= 14 + 56) {
    // V3+ без BITFIELDS: альфа-маска всё равно может быть задана
    const alphaMask = view.getUint32(14 + 52, true);
    if (alphaMask) masks = [0xff0000, 0xff00, 0xff, alphaMask];
  }
  let icc: BmpHeader['icc'] = null;
  if (headerSize >= 124 && bytes.length >= 14 + 124 && view.getUint32(14 + 56, true) === PROFILE_EMBEDDED) {
    icc = { offset: 14 + view.getUint32(14 + 112, true), size: view.getUint32(14 + 116, true) };
  }
  return {
    width,
    height: Math.abs(rawHeight),
    topDown: rawHeight < 0,
    bitCount,
    compression,
    headerSize,
    dataOffset,
    paletteOffset,
    paletteEntrySize: 4,
    colorsUsed,
    masks,
    icc,
  };
}

/** Сдвиг и число бит маски: значение канала = (пиксель & mask) >>> shift, затем приводится к 0–255. */
function maskInfo(mask: number): { shift: number; max: number } {
  if (mask === 0) return { shift: 0, max: 0 };
  let shift = 0;
  while (((mask >>> shift) & 1) === 0) shift++;
  return { shift, max: mask >>> shift };
}

/** Пиксели RGBA. written — по каким точкам были данные (у RLE пропуски прозрачны, как в браузерах). */
export function decodeBmp(bytes: Uint8Array): { rgba: Uint8Array; width: number; height: number; hasAlpha: boolean; icc: Uint8Array | null } {
  const h = readBmpHeader(bytes);
  const { width, height } = h;
  if (width <= 0 || height <= 0) fail(`неверный размер ${width}×${height}`);
  if (width * height > MAX_PIXELS) throw new ConvertError('unsupported-variant', `BMP: ${width}×${height}`);
  if (![1, 4, 8, 16, 24, 32].includes(h.bitCount)) throw new ConvertError('unsupported-variant', `BMP: ${h.bitCount} бит`);
  const supported = [BI_RGB, BI_RLE8, BI_RLE4, BI_BITFIELDS, BI_ALPHABITFIELDS];
  if (!supported.includes(h.compression)) throw new ConvertError('unsupported-variant', `BMP: сжатие ${h.compression}`);

  const rgba = new Uint8Array(width * height * 4);
  // строка в файле → строка изображения: обычно BMP хранится снизу вверх
  const rowOf = (fileRow: number) => (h.topDown ? fileRow : height - 1 - fileRow);

  // палитра (BGR или BGRx)
  let palette: Uint8Array | null = null;
  if (h.bitCount <= 8) {
    const count = Math.min(h.colorsUsed || 1 << h.bitCount, 1 << h.bitCount);
    palette = new Uint8Array(256 * 3);
    for (let i = 0; i < count; i++) {
      const at = h.paletteOffset + i * h.paletteEntrySize;
      if (at + 3 > bytes.length) break;
      palette[i * 3] = bytes[at + 2]!;
      palette[i * 3 + 1] = bytes[at + 1]!;
      palette[i * 3 + 2] = bytes[at]!;
    }
  }
  const setIndex = (x: number, y: number, index: number) => {
    const o = (y * width + x) * 4;
    rgba[o] = palette![index * 3]!;
    rgba[o + 1] = palette![index * 3 + 1]!;
    rgba[o + 2] = palette![index * 3 + 2]!;
    rgba[o + 3] = 255;
  };

  let hasAlpha = false;
  if (h.compression === BI_RLE8 || h.compression === BI_RLE4) {
    if (h.topDown || !palette) fail('RLE бывает только снизу вверх и с палитрой');
    hasAlpha = decodeRle(bytes, h, width, height, h.compression === BI_RLE4 ? 4 : 8, (x, row, index) => setIndex(x, rowOf(row), index));
  } else {
    const stride = Math.floor((width * h.bitCount + 31) / 32) * 4;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const masks =
      h.masks ?? (h.bitCount === 16 ? [0x7c00, 0x3e0, 0x1f, 0] : h.bitCount === 32 ? [0xff0000, 0xff00, 0xff, 0] : null);
    const channels = masks?.map(maskInfo);
    let anyAlpha = false;
    for (let row = 0; row < height; row++) {
      const start = h.dataOffset + row * stride;
      if (start + stride > bytes.length) {
        hasAlpha = true; // обрезанный файл: оставшиеся строки прозрачны
        break;
      }
      const y = rowOf(row);
      let o = y * width * 4;
      for (let x = 0; x < width; x++, o += 4) {
        if (h.bitCount <= 8) {
          const bit = x * h.bitCount;
          const byte = bytes[start + (bit >> 3)]!;
          const index = (byte >> (8 - h.bitCount - (bit & 7))) & ((1 << h.bitCount) - 1);
          setIndex(x, y, index);
        } else if (h.bitCount === 24) {
          const i = start + x * 3;
          rgba[o] = bytes[i + 2]!;
          rgba[o + 1] = bytes[i + 1]!;
          rgba[o + 2] = bytes[i]!;
          rgba[o + 3] = 255;
        } else {
          const pixel = h.bitCount === 16 ? view.getUint16(start + x * 2, true) : view.getUint32(start + x * 4, true);
          for (let c = 0; c < 3; c++) {
            const { shift, max } = channels![c]!;
            rgba[o + c] = max ? Math.round((((pixel & masks![c]!) >>> shift) * 255) / max) : 0;
          }
          const alpha = channels![3]!;
          if (alpha.max) {
            const a = Math.round((((pixel & masks![3]!) >>> alpha.shift) * 255) / alpha.max);
            rgba[o + 3] = a;
            if (a !== 0) anyAlpha = true;
          } else {
            rgba[o + 3] = 255;
          }
        }
      }
    }
    // альфа-канал из одних нулей — это «не используется» (так пишут многие программы): изображение непрозрачное
    if (channels?.[3]?.max) {
      if (!anyAlpha) for (let i = 3; i < rgba.length; i += 4) rgba[i] = 255;
      else hasAlpha = true;
    }
  }

  let icc: Uint8Array | null = null;
  if (h.icc && h.icc.size > 0 && h.icc.offset + h.icc.size <= bytes.length) {
    const profile = bytes.slice(h.icc.offset, h.icc.offset + h.icc.size);
    if (isPlausibleIcc(profile)) icc = profile;
  }
  return { rgba, width, height, hasAlpha, icc };
}

/** RLE8/RLE4: пары «повтор + индекс», экранированные коды конца строки, файла, смещения и неупакованных серий. */
function decodeRle(
  bytes: Uint8Array,
  h: BmpHeader,
  width: number,
  height: number,
  bits: 4 | 8,
  put: (x: number, row: number, index: number) => void,
): boolean {
  let pos = h.dataOffset;
  let x = 0;
  let row = 0;
  let written = 0;
  const nibble = (byte: number, i: number) => (bits === 8 ? byte : i % 2 === 0 ? byte >> 4 : byte & 0x0f);
  while (pos + 1 < bytes.length && row < height) {
    const count = bytes[pos]!;
    const value = bytes[pos + 1]!;
    pos += 2;
    if (count > 0) {
      for (let i = 0; i < count; i++, x++) {
        if (x < width) {
          put(x, row, nibble(value, i));
          written++;
        }
      }
      continue;
    }
    if (value === 0) {
      x = 0; // конец строки
      row++;
    } else if (value === 1) {
      break; // конец изображения
    } else if (value === 2) {
      x += bytes[pos] ?? 0; // смещение
      row += bytes[pos + 1] ?? 0;
      pos += 2;
    } else {
      // неупакованная серия из value точек, выровненная до 2 байт
      const length = bits === 8 ? value : Math.ceil(value / 2);
      for (let i = 0; i < value; i++, x++) {
        const byte = bytes[pos + (bits === 8 ? i : i >> 1)] ?? 0;
        if (x < width) {
          put(x, row, nibble(byte, i));
          written++;
        }
      }
      pos += length + (length % 2);
    }
  }
  return written < width * height; // пропущенные точки остались прозрачными
}

class BmpSession implements DecoderSession {
  readonly width: number;
  readonly height: number;

  constructor(private readonly bytes: Uint8Array) {
    const header = readBmpHeader(bytes);
    this.width = header.width;
    this.height = header.height;
  }

  async decode(): Promise<DecodedImage> {
    const image = decodeBmp(this.bytes);
    return {
      width: image.width,
      height: image.height,
      rgba: image.rgba,
      hasAlpha: image.hasAlpha,
      orientation: 1,
      icc: image.icc,
      nclx: null,
      exif: null,
      warnings: [],
      release: () => {},
    };
  }

  close(): void {}
}

export async function loadBmpDecoder(): Promise<Decoder> {
  return { module: 'bmp', open: (bytes) => new BmpSession(bytes), heapBytes: () => 0 };
}
