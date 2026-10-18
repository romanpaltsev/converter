// Декодер PNG: Rust `png` из набора jSquash. Он сам разворачивает палитру, прозрачность tRNS и серый
// и понижает 16 бит до 8 — на выходе всегда RGBA 8 бит. У анимированного PNG берётся основной (первый) кадр.

import { decode as decodePng } from '@jsquash/png/codec/pkg/squoosh_png.js';
import type { Nclx } from '../../color/nclx';
import { isPlausibleIcc } from '../../color/profiles';
import { tiffFromExifChunk } from '../../metadata/heif-exif';
import { inflateZlib } from '../../metadata/inflate';
import { readOrientation } from '../../metadata/exif-filter';
import { PngError, readPngChunks } from '../../metadata/png-chunks';
import { loadSquooshPng } from '../codecs/squoosh-png';
import { readPngHeader } from '../headers';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type WarningCode } from '../types';

interface PngMeta {
  /** Сжатый профиль из iCCP (поток zlib) или null. */
  iccCompressed: Uint8Array | null;
  exif: Uint8Array | null;
  nclx: Nclx | null;
  hasTransparency: boolean;
  animated: boolean;
}

/** Метаданные PNG: все чанки до IEND (eXIf бывает и после IDAT). CRC не проверяем — это дорого на больших файлах. */
function readPngMeta(bytes: Uint8Array): PngMeta {
  const meta: PngMeta = { iccCompressed: null, exif: null, nclx: null, hasTransparency: false, animated: false };
  let chunks;
  try {
    chunks = readPngChunks(bytes, { verifyCrc: false });
  } catch (error) {
    if (error instanceof PngError) throw new ConvertError('decode-failed', error.message);
    throw error;
  }
  for (const chunk of chunks) {
    const { data } = chunk;
    if (chunk.type === 'tRNS') meta.hasTransparency = true;
    else if (chunk.type === 'acTL') meta.animated = true;
    else if (chunk.type === 'eXIf') meta.exif = tiffFromExifChunk(data);
    else if (chunk.type === 'cICP' && data.length >= 4) {
      meta.nclx = { colorPrimaries: data[0]!, transferCharacteristics: data[1]!, matrixCoefficients: data[2]!, fullRange: data[3] === 1 };
    } else if (chunk.type === 'iCCP') {
      // имя профиля (1–79 байт) + NUL + метод сжатия (0) + поток zlib
      const nul = data.indexOf(0);
      if (nul > 0 && nul < 80 && data[nul + 1] === 0) meta.iccCompressed = data.subarray(nul + 2);
    }
  }
  return meta;
}

class PngSession implements DecoderSession {
  readonly width: number;
  readonly height: number;
  private readonly hasAlpha: boolean;

  constructor(private readonly bytes: Uint8Array) {
    const header = readPngHeader(bytes);
    if (!header || header.width === 0 || header.height === 0) throw new ConvertError('decode-failed', 'PNG: нет заголовка IHDR');
    this.width = header.width;
    this.height = header.height;
    this.hasAlpha = header.colorType === 4 || header.colorType === 6;
  }

  async decode(): Promise<DecodedImage> {
    const meta = readPngMeta(this.bytes);
    const warnings: WarningCode[] = [];
    if (meta.animated) warnings.push('first-frame-only');

    // cICP (PNG 3) важнее iCCP; без обоих — sRGB (его подставит convert.ts)
    let icc: Uint8Array | null = null;
    if (!meta.nclx && meta.iccCompressed) {
      try {
        const profile = await inflateZlib(meta.iccCompressed);
        if (isPlausibleIcc(profile)) icc = profile;
        else warnings.push('icc-unreadable');
      } catch {
        warnings.push('icc-unreadable');
      }
    }

    let image: ImageData;
    try {
      image = decodePng(this.bytes);
    } catch (error) {
      // ошибка внутри WASM: память, выделенная под вход, не освобождается — worker пересоздаётся
      const text = String((error as { message?: string })?.message ?? error);
      if (/memory|allocation/i.test(text)) throw new ConvertError('out-of-memory', `PNG: ${text}`, { fatal: true });
      throw new ConvertError('decode-failed', `PNG: ${text}`, { recycle: true });
    }
    return {
      width: image.width,
      height: image.height,
      rgba: new Uint8Array(image.data.buffer, image.data.byteOffset, image.data.byteLength),
      hasAlpha: this.hasAlpha || meta.hasTransparency,
      orientation: readOrientation(meta.exif),
      icc,
      nclx: meta.nclx,
      exif: meta.exif,
      warnings,
      release: () => {},
    };
  }

  close(): void {}
}

export async function loadPngDecoder(): Promise<Decoder> {
  const memory = await loadSquooshPng();
  return {
    module: 'squoosh-png',
    open: (bytes) => new PngSession(bytes),
    heapBytes: () => memory.buffer.byteLength,
  };
}
