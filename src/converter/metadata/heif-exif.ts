// Блок Exif в HEIF хранится как 4-байтовое смещение (big-endian) до заголовка TIFF, затем данные.
// Обычно это «Exif\0\0» + TIFF (смещение 6, так пишут Apple и ExifTool) или сразу TIFF (смещение 0, heif-enc).

function isTiffHeader(bytes: Uint8Array, at: number): boolean {
  if (at < 0 || at + 8 > bytes.length) return false;
  const [a, b, c, d] = [bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]];
  return (a === 0x49 && b === 0x49 && c === 0x2a && d === 0x00) || (a === 0x4d && b === 0x4d && c === 0x00 && d === 0x2a);
}

/** TIFF из блока Exif контейнера HEIF; null, если структура не распознана. */
export function tiffFromHeifExif(block: Uint8Array): Uint8Array | null {
  if (block.length >= 4) {
    const offset = new DataView(block.buffer, block.byteOffset, 4).getUint32(0);
    const start = 4 + offset;
    if (isTiffHeader(block, start)) return block.slice(start);
  }
  // запасной путь: смещение записано неверно — ищем заголовок TIFF в начале блока
  for (let at = 0; at < Math.min(block.length, 64); at++) {
    if (isTiffHeader(block, at)) return block.slice(at);
  }
  return null;
}
