// Распаковка средствами браузера: zlib (RFC 1950) — сжатые ICC-профили в чанке iCCP у PNG; «сырой» deflate
// (RFC 1951) — файлы внутри ZIP (XLSX).

export class InflateError extends Error {}

/** Распаковывает поток zlib; больше maxBytes — ошибка (защита от «zip-бомбы» в профиле). */
export function inflateZlib(data: Uint8Array, maxBytes = 16 * 1024 * 1024): Promise<Uint8Array> {
  // 'deflate' — это именно zlib-обёртка (как в iCCP), а не «сырой» deflate
  return inflate(data, 'deflate', maxBytes);
}

/** Распаковывает «сырой» deflate (данные файла в ZIP); больше maxBytes — ошибка. */
export function inflateRaw(data: Uint8Array, maxBytes: number): Promise<Uint8Array> {
  return inflate(data, 'deflate-raw', maxBytes);
}

async function inflate(data: Uint8Array, format: 'deflate' | 'deflate-raw', maxBytes: number): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'function') throw new InflateError('DecompressionStream недоступен');
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream(format));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes) throw new InflateError(`распакованные данные больше ${maxBytes} байт`);
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error instanceof InflateError ? error : new InflateError(`повреждённый поток ${format}: ${String(error)}`);
  }
  const out = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}
