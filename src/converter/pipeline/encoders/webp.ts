// Кодирование WebP: своя сборка libwebp 1.6.0 (codecs/webp, src/converter/vendor/webp).
// С потерями — качество с ползунка, без потерь — пресет усилия. Метаданные добавляет insertWebpMetadata.

import createWebpEncoder, { type WebpEncoderModule } from '../../vendor/webp/webp_enc.mjs';
import webpEncWasmUrl from '../../vendor/webp/webp_enc.wasm?url';
import { insertWebpMetadata } from '../../metadata/webp-chunks';
import { ConvertError, type Encoder, type RawImage, WEBP_MAX_DIMENSION } from '../types';
import { compileWasm } from '../wasm';

/** Усилие сжатия без потерь (0–9, как у cwebp -z): компромисс между временем на 24 Мп и размером файла. */
const LOSSLESS_LEVEL = 4;

/**
 * Режимы предсказания VP8 должны поместиться в 512 КБ первого раздела. На больших детальных снимках libwebp
 * иначе кодирует кадр заново, каждый раз вдвое ужимая бюджет режимов intra 4×4: 48 Мп — 41 с вместо 9 с при том же
 * размере и PSNR (замеры — в CLAUDE.md). До 16 Мп переполнения нет, а ограничение лишь снижает PSNR на ~0,1 дБ.
 */
const PARTITION_LIMIT_ABOVE_PIXELS = 20_000_000;
const PARTITION_LIMIT = 70;

// коды WebPEncodingError
const VP8_ENC_ERROR_OUT_OF_MEMORY = 1;
const VP8_ENC_ERROR_BITSTREAM_OUT_OF_MEMORY = 2;
const VP8_ENC_ERROR_BAD_DIMENSION = 5;

let loading: Promise<WebpEncoderModule> | null = null;

function loadModule(): Promise<WebpEncoderModule> {
  if (!loading) {
    loading = (async () => {
      const compiled = await compileWasm(webpEncWasmUrl);
      return createWebpEncoder({
        instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
          void WebAssembly.instantiate(compiled, imports).then((instance) => receive(instance, compiled));
          return {};
        },
        print: () => {},
        printErr: () => {},
      });
    })();
    loading.catch(() => (loading = null));
  }
  return loading;
}

function encode(lib: WebpEncoderModule, image: RawImage, quality: number, lossless: boolean): Uint8Array {
  if (image.width > WEBP_MAX_DIMENSION || image.height > WEBP_MAX_DIMENSION) throw new ConvertError('too-large-for-webp');
  const bytes = image.width * image.height * 4;
  const input = lib._malloc(bytes);
  const result = lib._malloc(8);
  if (!input || !result) {
    lib._free(input);
    lib._free(result);
    throw new ConvertError('out-of-memory', 'WebP: не удалось выделить память', { fatal: true });
  }
  lib.HEAPU8.set(image.rgba.subarray(0, bytes), input);
  const partitionLimit = image.width * image.height > PARTITION_LIMIT_ABOVE_PIXELS ? PARTITION_LIMIT : 0;
  const ptr = lib._webp_encode_rgba(input, image.width, image.height, quality, lossless ? 1 : 0, LOSSLESS_LEVEL, partitionLimit, result);
  lib._free(input);
  const [size, error] = lib.HEAP32.subarray(result >> 2, (result >> 2) + 2);
  lib._free(result);
  if (!ptr) {
    if (error === VP8_ENC_ERROR_OUT_OF_MEMORY || error === VP8_ENC_ERROR_BITSTREAM_OUT_OF_MEMORY) {
      throw new ConvertError('out-of-memory', 'WebP: нехватка памяти при кодировании', { fatal: true });
    }
    if (error === VP8_ENC_ERROR_BAD_DIMENSION) throw new ConvertError('too-large-for-webp');
    throw new ConvertError('internal', `WebP: ошибка кодирования (${error})`);
  }
  const out = lib.HEAPU8.slice(ptr, ptr + size!);
  lib._webp_free(ptr);
  return out;
}

export async function loadWebpEncoder(): Promise<Encoder> {
  const lib = await loadModule();
  return {
    module: 'libwebp-enc',
    mime: 'image/webp',
    extension: 'webp',
    maxExifBytes: Number.POSITIVE_INFINITY,
    maxIccBytes: Number.POSITIVE_INFINITY,
    async encode(image, options) {
      return encode(lib, image, options.quality, options.lossless);
    },
    embed: insertWebpMetadata,
    heapBytes: () => lib.HEAPU8.length,
  };
}
