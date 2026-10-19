// Определение формата по сигнатуре файла, а не по расширению.

export type SniffResult =
  | { kind: 'heic' }
  | { kind: 'avif' }
  | { kind: 'jpeg' }
  | { kind: 'png' }
  | { kind: 'webp' }
  | { kind: 'gif' }
  | { kind: 'bmp' }
  | { kind: 'tiff' }
  | { kind: 'unknown' };

export type SniffKind = SniffResult['kind'];

/** Сколько байт начала файла нужно для определения формата (с запасом на длинный список брендов ftyp). */
export const SNIFF_BYTES = 256;

// Бренды, однозначно указывающие на HEVC (HEIC).
const HEVC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs']);
// Общие бренды HEIF: кодек не указан, пробуем декодировать.
const GENERIC_HEIF_BRANDS = new Set(['mif1', 'msf1']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = '';
  for (let i = start; i < start + length; i++) s += String.fromCharCode(bytes[i] ?? 0);
  return s;
}

/** Бренды из бокса ftyp: основной и совместимые. Пустой массив — это не ISOBMFF. */
export function readFtypBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== 'ftyp') return [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let size = view.getUint32(0);
  let headerSize = 8;
  if (size === 1) {
    // 64-битный размер бокса; для ftyp на практике не встречается
    if (bytes.length < 24) return [];
    size = Number(view.getBigUint64(8));
    headerSize = 16;
  } else if (size === 0) {
    size = bytes.length; // бокс до конца файла
  }
  if (size < headerSize + 8) return [];
  const end = Math.min(size, bytes.length);
  const brands = [ascii(bytes, headerSize, 4)];
  // после основного бренда — minor_version (4 байта), затем совместимые бренды
  for (let pos = headerSize + 8; pos + 4 <= end; pos += 4) brands.push(ascii(bytes, pos, 4));
  return brands;
}

export function sniff(bytes: Uint8Array): SniffResult {
  const brands = readFtypBrands(bytes);
  if (brands.length > 0) {
    if (brands.some((b) => HEVC_BRANDS.has(b))) return { kind: 'heic' };
    if (brands.some((b) => AVIF_BRANDS.has(b))) return { kind: 'avif' };
    if (brands.some((b) => GENERIC_HEIF_BRANDS.has(b))) return { kind: 'heic' };
    return { kind: 'unknown' };
  }
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return { kind: 'jpeg' };
  if (b(0) === 0x89 && ascii(bytes, 1, 3) === 'PNG' && b(4) === 0x0d && b(5) === 0x0a) return { kind: 'png' };
  if (ascii(bytes, 0, 4) === 'GIF8') return { kind: 'gif' };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return { kind: 'webp' };
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 26) return { kind: 'bmp' };
  const tiffHeader = ascii(bytes, 0, 4);
  if (tiffHeader === 'II*\0' || tiffHeader === 'MM\0*') return { kind: 'tiff' };
  return { kind: 'unknown' };
}
