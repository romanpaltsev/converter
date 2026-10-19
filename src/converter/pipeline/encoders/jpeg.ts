// Кодирование JPEG через MozJPEG (@jsquash/jpeg). Canvas не используем: в Safari на iOS он ограничен 16,7 Мп.

import mozjpegEncode, { init as initMozjpeg } from '@jsquash/jpeg/encode.js';
import mozjpegWasmUrl from '@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm?url';
import { MAX_EXIF_TIFF_BYTES, MAX_ICC_BYTES, insertJpegMetadata } from '../../metadata/jpeg-segments';
import { ENCODER_EXTENSIONS, type Encoder, type RawImage } from '../types';
import { compileWasm } from '../wasm';

interface EmscriptenHeap {
  HEAPU8: Uint8Array;
}

let heap: EmscriptenHeap | null = null;

/** JPEG не хранит прозрачность: накладываем изображение на белый фон прямо в буфере. */
function flattenOnWhite(rgba: Uint8Array): void {
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3]!;
    if (alpha === 255) continue;
    const background = 255 * (255 - alpha);
    rgba[i] = (rgba[i]! * alpha + background + 127) / 255;
    rgba[i + 1] = (rgba[i + 1]! * alpha + background + 127) / 255;
    rgba[i + 2] = (rgba[i + 2]! * alpha + background + 127) / 255;
    rgba[i + 3] = 255;
  }
}

async function encode(image: RawImage, quality: number): Promise<Uint8Array> {
  const data = new Uint8ClampedArray(image.rgba.buffer, image.rgba.byteOffset, image.rgba.byteLength);
  // jSquash нужны только data/width/height; настоящий ImageData не создаём, чтобы не копировать буфер
  const pixels = { data, width: image.width, height: image.height, colorSpace: 'srgb' } as ImageData;
  // baseline вместо progressive: по замерам прототипа кодирование вдвое быстрее (24 Мп: ~2,5 с против ~5 с),
  // файл больше всего на ~4 %, памяти не больше. Остальное — по умолчанию jSquash:
  // оптимизация Хаффмана, trellis, 4:2:0 (как в исходном HEVC — 4:4:4 ничего бы не добавил)
  // baseline: true — таблицы квантования не больше 255: иначе при качестве ниже ~25 libjpeg пишет 16-битные таблицы
  // (это уже не baseline-JPEG, его откроет не всякая программа) и ругается в консоль
  return new Uint8Array(await mozjpegEncode(pixels, { quality, progressive: false, baseline: true }));
}

export async function loadJpegEncoder(): Promise<Encoder> {
  const module = await compileWasm(mozjpegWasmUrl);
  const init = initMozjpeg as unknown as (module: WebAssembly.Module, overrides: Record<string, unknown>) => Promise<void>;
  await init(module, {
    onRuntimeInitialized(this: EmscriptenHeap) {
      heap = this;
    },
  });
  // пробное кодирование 1×1: ошибки инициализации проявятся сейчас, а не на первом файле
  await mozjpegEncode({ data: new Uint8ClampedArray(4), width: 1, height: 1, colorSpace: 'srgb' } as ImageData);
  return {
    module: 'mozjpeg-enc',
    mime: 'image/jpeg',
    extension: ENCODER_EXTENSIONS.jpeg,
    maxExifBytes: MAX_EXIF_TIFF_BYTES,
    maxIccBytes: MAX_ICC_BYTES,
    async encode(image, options) {
      if (image.hasAlpha) flattenOnWhite(image.rgba);
      return encode(image, options.quality);
    },
    embed: insertJpegMetadata,
    heapBytes: () => heap?.HEAPU8.length ?? 0,
  };
}
