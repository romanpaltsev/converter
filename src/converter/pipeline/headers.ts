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
