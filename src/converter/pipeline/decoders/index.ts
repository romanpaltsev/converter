// Таблица декодеров. Новый входной формат — модуль в этой папке и строка здесь.

import type { Decoder, DecoderId } from '../types';

const loaders: Record<DecoderId, () => Promise<Decoder>> = {
  heic: () => import('./heic').then((m) => m.loadHeicDecoder()),
  jpeg: () => import('./jpeg').then((m) => m.loadJpegDecoder()),
  png: () => import('./png').then((m) => m.loadPngDecoder()),
};

const cache = new Map<DecoderId, Promise<Decoder>>();

export function loadDecoder(id: DecoderId): Promise<Decoder> {
  let decoder = cache.get(id);
  if (!decoder) {
    decoder = loaders[id]();
    decoder.catch(() => cache.delete(id));
    cache.set(id, decoder);
  }
  return decoder;
}
