// Кодирование AVIF: своя сборка libheif 1.23.6 + libaom 3.15.2 (codecs/avif-enc, src/converter/vendor/avif-enc).
// Метаданные пишет сам libheif при кодировании (ICC — бокс colr, Exif — элемент метаданных), поэтому они приходят
// в encode, а embed ничего не делает. 4:2:0, 8 бит; скорость libaom — компромисс времени и размера (замеры в CLAUDE.md).

import createAvifEncoder, { type AvifEncoderModule } from '../../vendor/avif-enc/avif_enc.mjs';
import avifEncWasmUrl from '../../vendor/avif-enc/avif_enc.wasm?url';
import { ConvertError, type Encoder, type EncodeMeta, type RawImage } from '../types';
import { compileWasm } from '../wasm';

/** Скорость libaom (0–9): выше — быстрее и немного хуже сжатие. */
export const AVIF_SPEED = 7;
/** heif_error_Memory_allocation_error */
const HEIF_ERROR_MEMORY = 6;

let loading: Promise<AvifEncoderModule> | null = null;

function loadModule(): Promise<AvifEncoderModule> {
  if (!loading) {
    loading = (async () => {
      const compiled = await compileWasm(avifEncWasmUrl);
      return createAvifEncoder({
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

/** Копия байтов в кучу модуля (0 — пусто); освобождать _free. */
function copyIn(lib: AvifEncoderModule, bytes: Uint8Array | null): number {
  if (!bytes || bytes.length === 0) return 0;
  const ptr = lib._malloc(bytes.length);
  if (!ptr) throw new ConvertError('out-of-memory', 'AVIF: не удалось выделить память', { fatal: true });
  lib.HEAPU8.set(bytes, ptr);
  return ptr;
}

function encode(lib: AvifEncoderModule, image: RawImage, quality: number, meta: EncodeMeta): Uint8Array {
  const pointers: number[] = [];
  try {
    const rgba = copyIn(lib, image.rgba.subarray(0, image.width * image.height * 4));
    pointers.push(rgba);
    const icc = copyIn(lib, meta.icc);
    const exif = copyIn(lib, meta.exif);
    pointers.push(icc, exif);
    const result = lib._malloc(12);
    if (!result) throw new ConvertError('out-of-memory', 'AVIF: не удалось выделить память', { fatal: true });
    pointers.push(result);
    const ptr = lib._avif_encode_rgba(
      rgba,
      image.width,
      image.height,
      image.hasAlpha ? 1 : 0,
      quality,
      AVIF_SPEED,
      icc,
      meta.icc?.length ?? 0,
      exif,
      meta.exif?.length ?? 0,
      result,
    );
    const [size, code, subcode] = lib.HEAP32.subarray(result >> 2, (result >> 2) + 3);
    if (!ptr) {
      if (code === HEIF_ERROR_MEMORY) throw new ConvertError('out-of-memory', 'AVIF: нехватка памяти при кодировании', { fatal: true });
      throw new ConvertError('internal', `AVIF: ошибка кодирования (${code}/${subcode})`);
    }
    const out = lib.HEAPU8.slice(ptr, ptr + size!);
    lib._free(ptr);
    return out;
  } finally {
    for (const ptr of pointers) if (ptr) lib._free(ptr);
  }
}

export async function loadAvifEncoder(): Promise<Encoder> {
  const lib = await loadModule();
  return {
    module: 'libheif-avif-enc',
    mime: 'image/avif',
    extension: 'avif',
    maxExifBytes: Number.POSITIVE_INFINITY,
    maxIccBytes: Number.POSITIVE_INFINITY,
    async encode(image, options, meta) {
      return encode(lib, image, options.quality, meta ?? { exif: null, icc: null });
    },
    // метаданные уже записаны libheif при кодировании
    embed: (file) => file,
    heapBytes: () => lib.HEAPU8.length,
  };
}
