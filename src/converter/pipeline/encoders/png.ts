// Кодирование PNG (Rust `png` из набора jSquash). Вызываем wasm-bindgen-функцию напрямую:
// обёртка @jsquash/png берёт data.buffer целиком и сломается на view в памяти декодера.

import initPng, { encode as encodePng } from '@jsquash/png/codec/pkg/squoosh_png.js';
import pngWasmUrl from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url';
import { insertPngMetadata } from '../../metadata/png-chunks';
import type { Encoder } from '../types';
import { compileWasm } from '../wasm';

export async function loadPngEncoder(): Promise<Encoder> {
  const { memory } = await initPng(await compileWasm(pngWasmUrl));
  return {
    mime: 'image/png',
    extension: 'png',
    maxExifBytes: Number.POSITIVE_INFINITY,
    async encode(image) {
      // всегда RGBA 8 бит: кодировщик принимает только такой вход
      return encodePng(image.rgba, image.width, image.height, 8);
    },
    embed: insertPngMetadata,
    heapBytes: () => memory.buffer.byteLength,
  };
}
