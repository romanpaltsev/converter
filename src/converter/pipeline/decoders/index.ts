// Таблица декодеров. Новый входной формат — модуль в этой папке и строка здесь.

import type { Decoder, DecoderId } from '../types';

const loaders: Record<DecoderId, () => Promise<Decoder>> = {
  heic: () => import('./heic').then((m) => m.loadHeicDecoder()),
  avif: () => import('./avif').then((m) => m.loadAvifDecoder()),
  jpeg: () => import('./jpeg').then((m) => m.loadJpegDecoder()),
  png: () => import('./png').then((m) => m.loadPngDecoder()),
  webp: () => import('./webp').then((m) => m.loadWebpDecoder()),
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
