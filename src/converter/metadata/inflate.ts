// Распаковка zlib (RFC 1950) средствами браузера — для сжатых ICC-профилей в чанке iCCP у PNG.

export class InflateError extends Error {}

/** Распаковывает поток zlib; больше maxBytes — ошибка (защита от «zip-бомбы» в профиле). */
export async function inflateZlib(data: Uint8Array, maxBytes = 16 * 1024 * 1024): Promise<Uint8Array> {
  if (typeof DecompressionStream !== 'function') throw new InflateError('DecompressionStream недоступен');
  // 'deflate' — это именно zlib-обёртка (как в iCCP), а не «сырой» deflate
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream('deflate'));
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
    throw error instanceof InflateError ? error : new InflateError(`повреждённый поток zlib: ${String(error)}`);
  }
  const out = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}
