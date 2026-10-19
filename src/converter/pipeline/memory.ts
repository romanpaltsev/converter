// Оценка памяти одного файла — для параллельной обработки (widget/worker-pool.ts): насколько вырастут кучи
// WASM-модулей и сколько займут буферы в JS. Коэффициенты — байт на пиксель, с запасом; замеры — TESTING.md.

import type { DecoderId, EncoderId } from './types';

/** Куча декодера на пиксель исходника. У JS-декодеров (GIF, BMP, TIFF) кучи нет — их буферы считаются в JS. */
const DECODER_HEAP: Record<DecoderId, number> = { heic: 6, avif: 7, jpeg: 5, png: 12, webp: 5, jxl: 32, gif: 0, bmp: 0, tiff: 0 };
/** Буферы в JS на пиксель исходника: копия RGBA от декодера, поворот по EXIF, промежуточные данные JS-декодеров. */
const DECODER_JS: Record<DecoderId, number> = { heic: 4, avif: 4, jpeg: 8, png: 8, webp: 4, jxl: 8, gif: 9, bmp: 9, tiff: 16 };
/** Куча кодировщика на пиксель результата: MozJPEG из jSquash — около 23 байт, WebP с потерями — 17 (CLAUDE.md). */
const ENCODER_HEAP: Record<EncoderId, number> = { jpeg: 23, png: 10, webp: 17, ico: 0, avif: 30 };
const WEBP_LOSSLESS_HEAP = 35;
/** Куча только что загруженного модуля не бывает меньше начальной (у сборок Emscripten — 16 МБ и больше). */
export const MIN_MODULE_HEAP = 32 * 1024 * 1024;

export interface MemoryNeeds {
  /** До какого размера вырастут кучи модулей (у декодера и кодировщика PNG модуль общий — потребности складываются). */
  heaps: Map<string, number>;
  /** Буферы в JS: вход, пиксели, результат. */
  js: number;
}

export interface NeedsInput {
  decoder: DecoderId;
  /** Имена модулей — как у Decoder.module и Encoder.module. */
  decoderModule: string;
  encoder: EncoderId;
  encoderModule: string;
  lossless: boolean;
  /** Точек в исходнике и в результате (после уменьшения). */
  pixels: number;
  outputPixels: number;
  fileBytes: number;
}

export function estimateNeeds(input: NeedsInput): MemoryNeeds {
  const heaps = new Map<string, number>();
  const add = (module: string, bytes: number) => heaps.set(module, (heaps.get(module) ?? 0) + bytes);
  const decoderHeap = DECODER_HEAP[input.decoder];
  // WASM-декодеры копируют вход в свою кучу
  if (decoderHeap > 0) add(input.decoderModule, input.pixels * decoderHeap + input.fileBytes);
  const encoderHeap = input.encoder === 'webp' && input.lossless ? WEBP_LOSSLESS_HEAP : ENCODER_HEAP[input.encoder];
  add(input.encoderModule, input.outputPixels * encoderHeap);
  const js = 2 * input.fileBytes + input.pixels * DECODER_JS[input.decoder] + input.outputPixels * 4;
  return { heaps, js };
}

/**
 * Сколько займёт worker, у которого кучи модулей уже такие (current): кучи не уменьшаются, а растут только
 * до потребности. Модули, которых ещё нет, займут не меньше начальной кучи.
 */
export function projectFootprint(needs: MemoryNeeds, current: ReadonlyMap<string, number>): number {
  let total = needs.js;
  for (const [module, heap] of current) total += Math.max(heap, needs.heaps.get(module) ?? 0);
  for (const [module, need] of needs.heaps) if (!current.has(module)) total += Math.max(MIN_MODULE_HEAP, need);
  return total;
}

/** Сколько займёт свежий worker: только нужные модули. */
export function freshFootprint(needs: MemoryNeeds): number {
  return projectFootprint(needs, new Map());
}
