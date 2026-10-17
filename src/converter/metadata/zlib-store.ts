// Поток zlib без сжатия (deflate stored-блоки) — для чанка iCCP в PNG.
// ICC-профили маленькие, сжатие ничего не даёт, а без него не нужна библиотека deflate.

const MAX_STORED_BLOCK = 0xffff;

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  // 5552 — максимальная длина участка, при которой суммы не переполняют 32 бита
  for (let i = 0; i < data.length; ) {
    const end = Math.min(i + 5552, data.length);
    for (; i < end; i++) {
      a += data[i]!;
      b += a;
    }
    a %= 65521;
    b %= 65521;
  }
  return ((b << 16) | a) >>> 0;
}

export function zlibStore(data: Uint8Array): Uint8Array {
  const blocks = Math.max(1, Math.ceil(data.length / MAX_STORED_BLOCK));
  const out = new Uint8Array(2 + blocks * 5 + data.length + 4);
  // CMF = 0x78 (deflate, окно 32 КБ), FLG = 0x01: (0x78 * 256 + 0x01) делится на 31
  out[0] = 0x78;
  out[1] = 0x01;
  let pos = 2;
  for (let i = 0; i < blocks; i++) {
    const start = i * MAX_STORED_BLOCK;
    const len = Math.min(MAX_STORED_BLOCK, data.length - start);
    out[pos++] = i === blocks - 1 ? 1 : 0; // BFINAL, BTYPE = 00 (без сжатия)
    out[pos++] = len & 0xff;
    out[pos++] = len >>> 8;
    out[pos++] = ~len & 0xff;
    out[pos++] = (~len >>> 8) & 0xff;
    out.set(data.subarray(start, start + len), pos);
    pos += len;
  }
  new DataView(out.buffer).setUint32(pos, adler32(data));
  return out;
}
