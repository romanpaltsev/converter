// Декодер JPEG XL: jxl-oxide (Rust → WASM, безопасная работа с памятью — важно для чужих файлов).
// Его WASM-обёртка отдаёт результат только как PNG (+ ICC-профиль), поэтому пиксели получаем через наш PNG-декодер:
// JXL → PNG в памяти → RGBA 8 бит (16 бит понижаются там же). Ориентацию jxl-oxide применяет сам (по заголовку
// кодового потока, EXIF Orientation у JXL не главный), поэтому orientation = 1. ICC — тот, что вернул jxl-oxide
// (для цветовых пространств, заданных перечислением, он синтезирует профиль). EXIF — из бокса «Exif» контейнера
// (формат как у HEIF: 4 байта смещения + TIFF); сжатые brotli боксы («brob») не читаем.
// Анимация — первый кадр и предупреждение.

import { decode as decodePng } from '@jsquash/png/codec/pkg/squoosh_png.js';
import { JxlImage, initSync } from 'jxl-oxide-wasm';
import jxlWasmUrl from 'jxl-oxide-wasm/module.wasm?url';
import { isPlausibleIcc } from '../../color/profiles';
import { tiffFromHeifExif } from '../../metadata/heif-exif';
import { loadSquooshPng } from '../codecs/squoosh-png';
import { readPngHeader } from '../headers';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type WarningCode } from '../types';
import { compileWasm } from '../wasm';

const MAX_PIXELS = 16384 * 16384;

/** Сигнатуры: «голый» кодовый поток (FF 0A) и контейнер (бокс «JXL »). */
export function isJxl(bytes: Uint8Array): boolean {
  if (bytes[0] === 0xff && bytes[1] === 0x0a) return true;
  const box = [0, 0, 0, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a];
  return box.every((b, i) => bytes[i] === b);
}

/** Содержимое бокса Exif контейнера JXL (или null). Боксы: размер (4 байта, 1 — 64-битный, 0 — до конца) + тип. */
export function jxlExif(bytes: Uint8Array): Uint8Array | null {
  if (bytes[0] === 0xff) return null; // кодовый поток без контейнера — метаданных нет
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 0;
  while (pos + 8 <= bytes.length) {
    let size = view.getUint32(pos);
    const type = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
    let header = 8;
    if (size === 1) {
      if (pos + 16 > bytes.length) return null;
      size = Number(view.getBigUint64(pos + 8));
      header = 16;
    } else if (size === 0) {
      size = bytes.length - pos;
    }
    if (size < header || pos + size > bytes.length) return null;
    if (type === 'Exif') return tiffFromHeifExif(bytes.subarray(pos + header, pos + size));
    pos += size;
  }
  return null;
}

let loading: Promise<WebAssembly.Memory> | null = null;

function loadModule(): Promise<WebAssembly.Memory> {
  if (!loading) {
    loading = compileWasm(jxlWasmUrl).then((module) => initSync({ module }).memory);
    loading.catch(() => (loading = null));
  }
  return loading;
}

class JxlSession implements DecoderSession {
  readonly width: number;
  readonly height: number;
  private readonly image = new JxlImage();

  constructor(private readonly bytes: Uint8Array) {
    try {
      this.image.feedBytes(bytes);
      if (!this.image.tryInit()) throw new Error('заголовок не прочитан');
    } catch (error) {
      this.image.free();
      throw new ConvertError('decode-failed', `JXL: ${String(error)}`);
    }
    this.width = this.image.width ?? 0;
    this.height = this.image.height ?? 0;
  }

  async decode(): Promise<DecodedImage> {
    if (this.width * this.height > MAX_PIXELS) throw new ConvertError('unsupported-variant', `JXL: ${this.width}×${this.height}`);
    const warnings: WarningCode[] = this.image.animated ? ['first-frame-only'] : [];
    let png: Uint8Array;
    let icc: Uint8Array | null;
    try {
      const result = this.image.render(0);
      // encodeToPng поглощает результат (в Rust принимает self): профиль читаем до него, free() после не нужен
      try {
        icc = result.iccProfile;
      } catch (error) {
        result.free();
        throw error;
      }
      png = result.encodeToPng();
    } catch (error) {
      const text = String((error as { message?: string })?.message ?? error);
      if (/memory|allocation/i.test(text)) throw new ConvertError('out-of-memory', `JXL: ${text}`, { fatal: true });
      throw new ConvertError('decode-failed', `JXL: ${text}`, { recycle: true });
    }
    const header = readPngHeader(png);
    const decoded = decodePng(png);
    return {
      width: decoded.width,
      height: decoded.height,
      rgba: new Uint8Array(decoded.data.buffer, decoded.data.byteOffset, decoded.data.byteLength),
      hasAlpha: header?.colorType === 4 || header?.colorType === 6,
      orientation: 1,
      // пустой профиль — sRGB (его подставит convert.ts)
      icc: icc.length > 0 && isPlausibleIcc(icc) ? icc : null,
      nclx: null,
      exif: jxlExif(this.bytes),
      warnings,
      release: () => {},
    };
  }

  close(): void {
    this.image.free();
  }
}

export async function loadJxlDecoder(): Promise<Decoder> {
  const [png, jxl] = await Promise.all([loadSquooshPng(), loadModule()]);
  return {
    module: 'jxl-oxide',
    open: (bytes) => new JxlSession(bytes),
    // кучи jxl-oxide и PNG-модуля, через который идут пиксели (если PNG-кодировщик тоже загружен, PNG посчитается
    // дважды — оценка с запасом, worker лишь раньше пересоздастся)
    heapBytes: () => jxl.buffer.byteLength + png.buffer.byteLength,
  };
}
