// Кодирование PNG (Rust `png` из набора jSquash). Вызываем wasm-bindgen-функцию напрямую:
// обёртка @jsquash/png берёт data.buffer целиком и сломается на view в памяти декодера.

import { encode as encodePng } from '@jsquash/png/codec/pkg/squoosh_png.js';
import { insertPngMetadata } from '../../metadata/png-chunks';
import { loadSquooshPng } from '../codecs/squoosh-png';
import type { Encoder } from '../types';

export async function loadPngEncoder(): Promise<Encoder> {
  const memory = await loadSquooshPng();
  return {
    module: 'squoosh-png',
    mime: 'image/png',
    extension: 'png',
    maxExifBytes: Number.POSITIVE_INFINITY,
    maxIccBytes: Number.POSITIVE_INFINITY,
    async encode(image) {
      // всегда RGBA 8 бит: кодировщик принимает только такой вход
      return encodePng(image.rgba, image.width, image.height, 8);
    },
    embed: insertPngMetadata,
    heapBytes: () => memory.buffer.byteLength,
  };
}
