// Декодер WebP: своя сборка libwebp 1.6.0 (codecs/webp, src/converter/vendor/webp). У анимированных файлов —
// первый кадр. RGBA остаётся в памяти модуля без копирования и освобождается в release().

import createWebpDecoder, { type WebpDecoderModule } from '../../vendor/webp/webp_dec.mjs';
import webpDecWasmUrl from '../../vendor/webp/webp_dec.wasm?url';
import { isPlausibleIcc } from '../../color/profiles';
import { readOrientation } from '../../metadata/exif-filter';
import { WebpError, type WebpMetadata, readWebpMetadata } from '../../metadata/webp-chunks';
import { readWebpHeader } from '../headers';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type WarningCode } from '../types';
import { compileWasm } from '../wasm';

// коды VP8StatusCode
const VP8_STATUS_OUT_OF_MEMORY = 1;
const VP8_STATUS_UNSUPPORTED_FEATURE = 4;

let loading: Promise<WebpDecoderModule> | null = null;

function loadModule(): Promise<WebpDecoderModule> {
  if (!loading) {
    loading = (async () => {
      const compiled = await compileWasm(webpDecWasmUrl);
      return createWebpDecoder({
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

class WebpSession implements DecoderSession {
  readonly width: number;
  readonly height: number;
  private readonly hasAlpha: boolean;

  constructor(
    private readonly lib: WebpDecoderModule,
    private readonly bytes: Uint8Array,
  ) {
    const header = readWebpHeader(bytes);
    if (!header || header.width === 0 || header.height === 0) throw new ConvertError('decode-failed', 'WebP: нет заголовка изображения');
    this.width = header.width;
    this.height = header.height;
    this.hasAlpha = header.hasAlpha;
  }

  async decode(): Promise<DecodedImage> {
    // битые чанки метаданных не мешают декодированию — просто без ICC/EXIF
    let meta: WebpMetadata = { icc: null, exif: null };
    try {
      meta = readWebpMetadata(this.bytes);
    } catch (error) {
      if (!(error instanceof WebpError)) throw error;
    }
    const warnings: WarningCode[] = [];
    let icc = meta.icc;
    if (icc && !isPlausibleIcc(icc)) {
      icc = null;
      warnings.push('icc-unreadable');
    }

    const { lib } = this;
    const input = lib._malloc(this.bytes.length);
    const info = lib._malloc(12);
    if (!input || !info) {
      lib._free(input);
      lib._free(info);
      throw new ConvertError('out-of-memory', 'WebP: не удалось выделить память', { fatal: true });
    }
    lib.HEAPU8.set(this.bytes, input);
    const ptr = lib._webp_decode_rgba(input, this.bytes.length, info);
    lib._free(input);
    const [width, height, flag] = lib.HEAP32.subarray(info >> 2, (info >> 2) + 3);
    lib._free(info);
    if (!ptr) {
      if (flag === VP8_STATUS_OUT_OF_MEMORY) throw new ConvertError('out-of-memory', 'WebP: нехватка памяти', { fatal: true });
      if (flag === VP8_STATUS_UNSUPPORTED_FEATURE) throw new ConvertError('unsupported-variant', 'WebP: неподдерживаемая возможность');
      throw new ConvertError('decode-failed', `WebP: ошибка декодирования (${flag})`);
    }
    if (flag === 1) warnings.push('first-frame-only');

    let released = false;
    return {
      width: width!,
      height: height!,
      rgba: lib.HEAPU8.subarray(ptr, ptr + width! * height! * 4),
      hasAlpha: this.hasAlpha,
      orientation: readOrientation(meta.exif),
      icc,
      nclx: null,
      exif: meta.exif,
      warnings,
      release: () => {
        if (!released) lib._webp_free(ptr);
        released = true;
      },
    };
  }

  close(): void {}
}

export async function loadWebpDecoder(): Promise<Decoder> {
  const lib = await loadModule();
  return { module: 'libwebp-dec', open: (bytes) => new WebpSession(lib, bytes), heapBytes: () => lib.HEAPU8.length };
}
