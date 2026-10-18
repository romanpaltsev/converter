// Декодер JPEG: MozJPEG из @jsquash/jpeg (WASM). Фабрику модуля вызываем напрямую (как у libheif):
// так виден текст ошибки libjpeg, а не только «Decoding error».
// Поворот по EXIF декодер не применяет (preserveOrientation = false) — пиксели поворачивает общий convert.ts.

import createMozjpegDecoder from '@jsquash/jpeg/codec/dec/mozjpeg_dec.js';
import mozjpegDecWasmUrl from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url';
import { readOrientation } from '../../metadata/exif-filter';
import { JpegError, extractJpegExif, extractJpegIcc } from '../../metadata/jpeg-segments';
import { readJpegFrame } from '../headers';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession } from '../types';
import { compileWasm } from '../wasm';

interface MozjpegDecoder {
  HEAPU8: Uint8Array;
  decode(data: Uint8Array, preserveOrientation: boolean): ImageData | null;
}

type Factory = (options: Record<string, unknown>) => Promise<MozjpegDecoder>;

interface Loaded {
  module: MozjpegDecoder;
  /** Последнее сообщение libjpeg (error_exit пишет его через printErr, затем вызывает exit). */
  takeError(): string;
}

let loading: Promise<Loaded> | null = null;

function loadModule(): Promise<Loaded> {
  if (!loading) {
    loading = (async () => {
      const compiled = await compileWasm(mozjpegDecWasmUrl);
      let lastError = '';
      const module = await (createMozjpegDecoder as unknown as Factory)({
        instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
          void WebAssembly.instantiate(compiled, imports).then((instance) => receive(instance, compiled));
          return {};
        },
        print: () => {},
        // без этого libjpeg пишет ошибки в console.error
        printErr: (text: string) => (lastError = text),
      });
      return {
        module,
        takeError: () => {
          const text = lastError;
          lastError = '';
          return text;
        },
      };
    })();
    loading.catch(() => (loading = null));
  }
  return loading;
}

/** Ошибка libjpeg → код для пользователя. После ошибки модуль работоспособен, но embind теряет копию входа. */
function mapError(text: string): ConvertError {
  const message = `MozJPEG: ${text || 'decode failed'}`;
  if (/color conversion/i.test(text)) return new ConvertError('cmyk-unsupported', message, { recycle: true });
  if (/insufficient memory|out of memory/i.test(text)) return new ConvertError('out-of-memory', message, { fatal: true });
  if (/precision|process|arithmetic|not supported|bogus/i.test(text)) return new ConvertError('unsupported-variant', message, { recycle: true });
  return new ConvertError('decode-failed', message, { recycle: true });
}

class JpegSession implements DecoderSession {
  readonly width: number;
  readonly height: number;

  constructor(
    private readonly loaded: Loaded,
    private readonly bytes: Uint8Array,
  ) {
    const frame = readJpegFrame(bytes);
    if (!frame || frame.width === 0 || frame.height === 0) throw new ConvertError('decode-failed', 'JPEG: не найден заголовок кадра');
    this.width = frame.width;
    this.height = frame.height;
  }

  async decode(): Promise<DecodedImage> {
    // метаданные: битые сегменты не мешают декодированию — просто без ICC/EXIF
    let icc: Uint8Array | null = null;
    let exif: Uint8Array | null = null;
    try {
      icc = extractJpegIcc(this.bytes);
      exif = extractJpegExif(this.bytes)?.slice() ?? null;
    } catch (error) {
      if (!(error instanceof JpegError)) throw error;
    }

    const { module, takeError } = this.loaded;
    takeError();
    let image: ImageData | null;
    try {
      image = module.decode(this.bytes, false);
    } catch (error) {
      throw mapError(takeError() || String((error as { message?: string })?.message ?? error));
    }
    if (!image) throw mapError(takeError());
    if (image.width !== this.width || image.height !== this.height) {
      throw new ConvertError('decode-failed', `JPEG: размер ${image.width}×${image.height} вместо ${this.width}×${this.height}`, { recycle: true });
    }
    return {
      width: image.width,
      height: image.height,
      rgba: new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength),
      hasAlpha: false,
      orientation: readOrientation(exif),
      icc,
      nclx: null,
      exif,
      warnings: [],
      release: () => {},
    };
  }

  close(): void {}
}

export async function loadJpegDecoder(): Promise<Decoder> {
  const loaded = await loadModule();
  return {
    module: 'mozjpeg-dec',
    open: (bytes) => new JpegSession(loaded, bytes),
    heapBytes: () => loaded.module.HEAPU8.length,
  };
}
