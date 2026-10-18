// Размер и особенности изображения по заголовку — до декодирования и без WASM.
// Функции терпимы к обрезанному началу файла (основной поток читает только первые байты): не хватило данных — null.

export interface JpegFrame {
  /** Маркер SOFn: 0xC0 baseline, 0xC1 extended, 0xC2 progressive, 0xC3 lossless, 0xC9–0xCB арифметическое кодирование… */
  marker: number;
  /** Бит на компонент: у обычного JPEG — 8. */
  precision: number;
  width: number;
  /** 0 — высота задаётся позже маркером DNL (почти не встречается). */
  height: number;
  /** 1 — оттенки серого, 3 — YCbCr/RGB, 4 — CMYK/YCCK. */
  components: number;
}

// SOF0–SOF15, кроме DHT (C4), JPG (C8) и DAC (CC)
const isFrameMarker = (marker: number) => marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

export function readJpegFrame(bytes: Uint8Array): JpegFrame | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 4 <= bytes.length) {
    if (bytes[pos] !== 0xff) {
      pos++; // мусор между сегментами: libjpeg его тоже пропускает
      continue;
    }
    const marker = bytes[pos + 1]!;
    if (marker === 0xff) {
      pos++; // заполняющие байты
      continue;
    }
    if (marker === 0x00) {
      pos += 2; // «FF 00» вне сжатых данных — мусор (libjpeg пропускает так же)
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      pos += 2; // TEM, RST0–7, SOI — без поля длины
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // EOI или SOS раньше SOF — кадра нет
    const length = (bytes[pos + 2]! << 8) | bytes[pos + 3]!;
    if (isFrameMarker(marker)) {
      if (pos + 10 > bytes.length) return null;
      const d = pos + 4;
      return {
        marker,
        precision: bytes[d]!,
        height: (bytes[d + 1]! << 8) | bytes[d + 2]!,
        width: (bytes[d + 3]! << 8) | bytes[d + 4]!,
        components: bytes[d + 5]!,
      };
    }
    if (length < 2) return null;
    pos += 2 + length;
  }
  return null;
}

export interface PngHeader {
  width: number;
  height: number;
  bitDepth: number;
  /** 0 — серый, 2 — RGB, 3 — палитра, 4 — серый + альфа, 6 — RGBA. */
  colorType: number;
  interlaced: boolean;
}

/** IHDR всегда первый чанк: сигнатура (8) + длина (4) + тип (4) + 13 байт данных. */
export function readPngHeader(bytes: Uint8Array): PngHeader | null {
  if (bytes.length < 29) return null;
  if (String.fromCharCode(bytes[12]!, bytes[13]!, bytes[14]!, bytes[15]!) !== 'IHDR') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
    bitDepth: bytes[24]!,
    colorType: bytes[25]!,
    interlaced: bytes[28] === 1,
  };
}

export interface WebpHeader {
  width: number;
  height: number;
  hasAlpha: boolean;
  animated: boolean;
}

const fourcc = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!);

/** Размер холста WebP: из VP8X, а для простых файлов — из заголовка кадра VP8 (с потерями) или VP8L (без потерь). */
export function readWebpHeader(bytes: Uint8Array): WebpHeader | null {
  if (bytes.length < 30 || fourcc(bytes, 0) !== 'RIFF' || fourcc(bytes, 8) !== 'WEBP') return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u24 = (at: number) => bytes[at]! | (bytes[at + 1]! << 8) | (bytes[at + 2]! << 16);
  switch (fourcc(bytes, 12)) {
    case 'VP8X': {
      const flags = bytes[20]!;
      return { width: u24(24) + 1, height: u24(27) + 1, hasAlpha: (flags & 0x10) !== 0, animated: (flags & 0x02) !== 0 };
    }
    case 'VP8 ': // ключевой кадр: 3 байта тега, стартовый код 9D 01 2A, затем 14-битные ширина и высота
      if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
      return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff, hasAlpha: false, animated: false };
    case 'VP8L': {
      if (bytes[20] !== 0x2f) return null; // сигнатура потока без потерь
      const bits = view.getUint32(21, true);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, hasAlpha: ((bits >>> 28) & 1) === 1, animated: false };
    }
    default:
      return null;
  }
}
