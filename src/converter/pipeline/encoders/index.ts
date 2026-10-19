// Таблица кодировщиков. Новый выходной формат — модуль в этой папке и строка здесь.

import type { Encoder, EncoderId } from '../types';

const loaders: Record<EncoderId, () => Promise<Encoder>> = {
  jpeg: () => import('./jpeg').then((m) => m.loadJpegEncoder()),
  png: () => import('./png').then((m) => m.loadPngEncoder()),
  webp: () => import('./webp').then((m) => m.loadWebpEncoder()),
  ico: () => import('./ico').then((m) => m.loadIcoEncoder()),
};

const cache = new Map<EncoderId, Promise<Encoder>>();

export function loadEncoder(id: EncoderId): Promise<Encoder> {
  let encoder = cache.get(id);
  if (!encoder) {
    encoder = loaders[id]();
    encoder.catch(() => cache.delete(id));
    cache.set(id, encoder);
  }
  return encoder;
}
