// Декодер GIF (GIF87a/89a) на TypeScript, без WASM: формат простой — палитра до 256 цветов и сжатие LZW.
// Берётся первый кадр, как его показывает браузер: кадр кладётся на прозрачный холст размера логического экрана
// (фон GIF браузеры не рисуют), прозрачный индекс палитры — прозрачный пиксель. У анимации — предупреждение.
// Цвет — sRGB (ICC в GIF почти не встречается), метаданных и поворота нет.

import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type WarningCode } from '../types';

/** Больше не декодируем: холст GIF до 65 535 × 65 535 занял бы 16 ГБ. */
const MAX_PIXELS = 16384 * 16384;

interface GifFrame {
  left: number;
  top: number;
  width: number;
  height: number;
  interlaced: boolean;
  palette: Uint8Array;
  /** Индекс прозрачного цвета или -1. */
  transparent: number;
  minCodeSize: number;
  /** Сжатые данные LZW (подблоки склеены). */
  data: Uint8Array;
}

export interface GifStructure {
  width: number;
  height: number;
  first: GifFrame;
  frames: number;
}

/** Читает подблоки (длина + данные … 0) начиная с pos; возвращает склеенные данные и позицию после терминатора. */
function readSubBlocks(bytes: Uint8Array, pos: number, collect: boolean): { data: Uint8Array; end: number } {
  const parts: Uint8Array[] = [];
  let total = 0;
  while (pos < bytes.length) {
    const size = bytes[pos++]!;
    if (size === 0) break;
    if (collect) {
      const part = bytes.subarray(pos, Math.min(bytes.length, pos + size));
      parts.push(part);
      total += part.length;
    }
    pos += size;
  }
  if (!collect) return { data: new Uint8Array(0), end: pos };
  const data = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    data.set(part, offset);
    offset += part.length;
  }
  return { data, end: pos };
}

/** Разбор структуры: логический экран, первый кадр (с данными) и число кадров. Обрезанный конец файла терпим. */
export function readGif(bytes: Uint8Array): GifStructure {
  const ascii = String.fromCharCode(...bytes.subarray(0, 6));
  if ((ascii !== 'GIF87a' && ascii !== 'GIF89a') || bytes.length < 13) throw new ConvertError('decode-failed', 'GIF: нет заголовка');
  const u16 = (pos: number) => bytes[pos]! | (bytes[pos + 1]! << 8);
  let width = u16(6);
  let height = u16(8);
  const packed = bytes[10]!;
  let pos = 13;
  let globalPalette: Uint8Array = new Uint8Array(0);
  if (packed & 0x80) {
    const size = 3 * (1 << ((packed & 7) + 1));
    globalPalette = bytes.subarray(pos, pos + size);
    pos += size;
  }

  let first: GifFrame | null = null;
  let frames = 0;
  let transparent = -1;
  while (pos < bytes.length) {
    const block = bytes[pos++]!;
    if (block === 0x3b) break; // конец файла
    if (block === 0x21) {
      const label = bytes[pos++]!;
      // Graphic Control Extension: флаг прозрачности и её индекс — для следующего кадра
      if (label === 0xf9 && bytes[pos] === 4) {
        transparent = bytes[pos + 1]! & 1 ? bytes[pos + 4]! : -1;
      }
      pos = readSubBlocks(bytes, pos, false).end;
      continue;
    }
    if (block !== 0x2c) break; // мусор после данных — как браузеры, просто останавливаемся
    if (pos + 9 > bytes.length) break;
    frames++;
    const frame = { left: u16(pos), top: u16(pos + 2), width: u16(pos + 4), height: u16(pos + 6), flags: bytes[pos + 8]! };
    pos += 9;
    let palette = globalPalette;
    if (frame.flags & 0x80) {
      const size = 3 * (1 << ((frame.flags & 7) + 1));
      palette = bytes.subarray(pos, pos + size);
      pos += size;
    }
    const minCodeSize = bytes[pos++]!;
    const blocks = readSubBlocks(bytes, pos, first === null);
    pos = blocks.end;
    if (!first) {
      first = {
        left: frame.left,
        top: frame.top,
        width: frame.width,
        height: frame.height,
        interlaced: (frame.flags & 0x40) !== 0,
        palette,
        transparent,
        minCodeSize,
        data: blocks.data,
      };
    }
    transparent = -1;
    if (frames > 1) break; // второй кадр — уже анимация, дальше не читаем
  }
  if (!first) throw new ConvertError('decode-failed', 'GIF: нет изображения');
  if (first.minCodeSize < 2 || first.minCodeSize > 11) throw new ConvertError('decode-failed', 'GIF: неверный размер кода LZW');
  // логический экран 0 × 0 встречается у самодельных GIF: тогда холст — по кадру
  if (width === 0 || height === 0) {
    width = first.left + first.width;
    height = first.top + first.height;
  }
  return { width, height, first, frames };
}

/**
 * Распаковка LZW в индексы палитры. Возвращает, сколько индексов получено: у обрезанного файла — меньше,
 * остаток кадра останется прозрачным (так же поступают браузеры).
 */
export function decodeLzw(data: Uint8Array, minCodeSize: number, out: Uint8Array): number {
  const clear = 1 << minCodeSize;
  const end = clear + 1;
  const prefix = new Uint16Array(4096);
  const suffix = new Uint8Array(4096);
  const stack = new Uint8Array(4097);
  for (let i = 0; i < clear; i++) suffix[i] = i;
  let codeSize = minCodeSize + 1;
  let next = clear + 2;
  let prev = -1;
  let firstOfPrev = 0;
  let written = 0;
  let bits = 0;
  let bitCount = 0;
  let pos = 0;
  while (written < out.length) {
    while (bitCount < codeSize && pos < data.length) {
      bits |= data[pos++]! << bitCount;
      bitCount += 8;
    }
    if (bitCount < codeSize) break; // данные кончились
    const code = bits & ((1 << codeSize) - 1);
    bits >>>= codeSize;
    bitCount -= codeSize;
    if (code === clear) {
      codeSize = minCodeSize + 1;
      next = clear + 2;
      prev = -1;
      continue;
    }
    if (code === end) break;
    if (prev === -1) {
      if (code >= clear) break; // после сброса допустим только корневой код
      out[written++] = code;
      prev = code;
      firstOfPrev = code;
      continue;
    }
    let cur = code;
    let top = 0;
    if (code >= next) {
      if (code > next) break; // испорченные данные
      // код ещё не в словаре (KwKwK): строка prev + первый символ prev
      stack[top++] = firstOfPrev;
      cur = prev;
    }
    while (cur >= clear) {
      stack[top++] = suffix[cur]!;
      cur = prefix[cur]!;
    }
    stack[top++] = cur;
    while (top > 0 && written < out.length) out[written++] = stack[--top]!;
    if (next < 4096) {
      prefix[next] = prev;
      suffix[next] = cur;
      next++;
      if (next === 1 << codeSize && codeSize < 12) codeSize++;
    }
    prev = code;
    firstOfPrev = cur;
  }
  return written;
}

/** Порядок строк чересстрочного GIF: проходы через 8 (с 0 и с 4), через 4 (с 2), через 2 (с 1). */
function interlacedRows(height: number): Int32Array {
  const rows = new Int32Array(height);
  let i = 0;
  for (const [start, step] of [
    [0, 8],
    [4, 8],
    [2, 4],
    [1, 2],
  ] as const) {
    for (let y = start; y < height; y += step) rows[i++] = y;
  }
  return rows;
}

/** Первый кадр в RGBA на холсте логического экрана. */
export function decodeGif(bytes: Uint8Array): { rgba: Uint8Array; width: number; height: number; hasAlpha: boolean; animated: boolean } {
  const gif = readGif(bytes);
  const { width, height, first: frame } = gif;
  if (width * height > MAX_PIXELS) throw new ConvertError('unsupported-variant', `GIF: ${width}×${height}`);
  const indices = new Uint8Array(frame.width * frame.height);
  const decoded = decodeLzw(frame.data, frame.minCodeSize, indices);
  const rgba = new Uint8Array(width * height * 4); // прозрачный холст
  const rows = frame.interlaced ? interlacedRows(frame.height) : null;
  const colors = frame.palette.length / 3;
  for (let i = 0; i < frame.height; i++) {
    const y = frame.top + (rows ? rows[i]! : i);
    if (y >= height) continue;
    for (let x = 0; x < frame.width; x++) {
      const n = i * frame.width + x;
      if (n >= decoded) break;
      const index = indices[n]!;
      const dx = frame.left + x;
      if (dx >= width || index === frame.transparent || index >= colors) continue;
      const o = (y * width + dx) * 4;
      rgba[o] = frame.palette[index * 3]!;
      rgba[o + 1] = frame.palette[index * 3 + 1]!;
      rgba[o + 2] = frame.palette[index * 3 + 2]!;
      rgba[o + 3] = 255;
    }
  }
  // прозрачность — если есть прозрачный индекс, кадр не закрывает холст или данные обрезаны
  const covers = frame.left === 0 && frame.top === 0 && frame.width >= width && frame.height >= height;
  const hasAlpha = frame.transparent >= 0 || !covers || decoded < indices.length;
  return { rgba, width, height, hasAlpha, animated: gif.frames > 1 };
}

class GifSession implements DecoderSession {
  readonly width: number;
  readonly height: number;

  constructor(private readonly bytes: Uint8Array) {
    const gif = readGif(bytes);
    this.width = gif.width;
    this.height = gif.height;
  }

  async decode(): Promise<DecodedImage> {
    const image = decodeGif(this.bytes);
    const warnings: WarningCode[] = image.animated ? ['first-frame-only'] : [];
    return {
      width: image.width,
      height: image.height,
      rgba: image.rgba,
      hasAlpha: image.hasAlpha,
      orientation: 1,
      icc: null,
      nclx: null,
      exif: null,
      warnings,
      release: () => {},
    };
  }

  close(): void {}
}

export async function loadGifDecoder(): Promise<Decoder> {
  return { module: 'gif', open: (bytes) => new GifSession(bytes), heapBytes: () => 0 };
}
