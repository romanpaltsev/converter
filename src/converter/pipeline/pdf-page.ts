// «Изображения в PDF»: картинка страницы из файла и маленькое превью для строки.
// JPEG вставляется как есть (без метаданных и хвостов после EOI); изображения без потерь (PNG, GIF, BMP, TIFF,
// WebP без потерь) — сжатыми zlib пикселями, чтобы не размыть текст скриншотов и сканов; остальное (HEIC, AVIF,
// WebP с потерями, JPEG XL) — JPEG от MozJPEG с качеством 90. Прозрачность — отдельной маской (SMask).

import { chooseProfile } from '../color/nclx';
import { loadProfile } from '../color/profiles';
import { stripJpeg } from '../metadata/strip/jpeg';
import type { PdfImage } from '../pdf/writer';
import { readJpegFrame } from './headers';
import { applyOrientation } from './orientation';
import { downscale } from './preview';
import type { ImageKind } from './sniff';
import type { ConvertOptions, DecoderSession, Encoder, WarningCode } from './types';

/** Качество JPEG для страниц из форматов с потерями: заметно не отличить, а PDF не раздувается. */
const PAGE_QUALITY = 90;

export interface PdfPageResult {
  image: PdfImage;
  /** Превью для строки файла (JPEG). */
  preview: Uint8Array;
  /** Размер картинки, как она видна (после поворота). */
  width: number;
  height: number;
  /** JPEG вставлен без перекодирования. */
  passthrough: boolean;
  warnings: WarningCode[];
}

/** Сжатие zlib (FlateDecode в PDF) встроенным CompressionStream. */
export async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** WebP без потерь (VP8L) — сжимаем без потерь и в PDF; у WebP с потерями — JPEG. */
function isLossless(kind: ImageKind, bytes: Uint8Array): boolean {
  if (kind === 'png' || kind === 'gif' || kind === 'bmp' || kind === 'tiff') return true;
  if (kind !== 'webp') return false;
  const text = String.fromCharCode(...bytes.subarray(0, Math.min(bytes.length, 4096)));
  return text.includes('VP8L') && !text.includes('VP8 ');
}

/** Каналы для PDF: серый (R = G = B у всех точек) или RGB, и альфа, если есть хоть одна непрозрачная не полностью. */
function split(rgba: Uint8Array): { gray: boolean; alpha: Uint8Array | null } {
  let gray = true;
  let translucent = false;
  for (let i = 0; i < rgba.length; i += 4) {
    if (gray && (rgba[i] !== rgba[i + 1] || rgba[i] !== rgba[i + 2])) gray = false;
    if (rgba[i + 3] !== 255) translucent = true;
    if (!gray && translucent) break;
  }
  if (!translucent) return { gray, alpha: null };
  const alpha = new Uint8Array(rgba.length / 4);
  for (let i = 0, j = 3; i < alpha.length; i++, j += 4) alpha[i] = rgba[j]!;
  return { gray, alpha };
}

function pack(rgba: Uint8Array, components: 1 | 3): Uint8Array {
  const out = new Uint8Array((rgba.length / 4) * components);
  for (let i = 0, j = 0; i < rgba.length; i += 4) {
    out[j++] = rgba[i]!;
    if (components === 3) {
      out[j++] = rgba[i + 1]!;
      out[j++] = rgba[i + 2]!;
    }
  }
  return out;
}

export async function preparePdfPage(
  bytes: Uint8Array,
  kind: ImageKind,
  session: DecoderSession,
  jpeg: Encoder,
  options: ConvertOptions,
): Promise<PdfPageResult> {
  const decoded = await session.decode();
  try {
    const warnings: WarningCode[] = [...decoded.warnings];
    const oriented = applyOrientation({ data: decoded.rgba, width: decoded.width, height: decoded.height }, decoded.orientation);
    const small = downscale(oriented);
    const preview = await jpeg.encode({ rgba: small.data, width: small.width, height: small.height, hasAlpha: decoded.hasAlpha }, { ...options, quality: 75 });

    if (kind === 'jpeg') {
      // JPEG — как есть: без EXIF, XMP и дополнительных изображений; поворот сделает матрица страницы
      const frame = readJpegFrame(bytes);
      const data = stripJpeg(bytes, 'all').bytes;
      const image: PdfImage = {
        data,
        filter: 'DCTDecode',
        width: decoded.width,
        height: decoded.height,
        components: frame?.components === 1 ? 1 : 3,
        icc: decoded.icc,
        alpha: null,
        orientation: decoded.orientation,
      };
      return { image, preview, width: oriented.width, height: oriented.height, passthrough: true, warnings };
    }

    // цвет: профиль исходника или эквивалент nclx, как у конвертеров
    const color = chooseProfile(decoded.nclx);
    if (color.hdr) warnings.push('hdr-tone');
    const icc = decoded.icc ?? (await loadProfile(color.profile));
    const { gray, alpha } = split(oriented.data);
    const base = { width: oriented.width, height: oriented.height, icc, alpha: alpha ? await deflate(alpha) : null, orientation: 1 };
    let image: PdfImage;
    if (isLossless(kind, bytes)) {
      const components = gray ? 1 : 3;
      image = { ...base, data: await deflate(pack(oriented.data, components)), filter: 'FlateDecode', components };
    } else {
      // кодировщик накладывает альфу на белый — маска уже снята выше
      const encoded = await jpeg.encode({ rgba: oriented.data, width: oriented.width, height: oriented.height, hasAlpha: decoded.hasAlpha }, { ...options, quality: PAGE_QUALITY });
      image = { ...base, data: encoded, filter: 'DCTDecode', components: 3 };
    }
    return { image, preview, width: oriented.width, height: oriented.height, passthrough: false, warnings };
  } finally {
    decoded.release();
  }
}
