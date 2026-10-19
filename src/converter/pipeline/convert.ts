// Конвейер одного файла: декодер → RGBA → поворот по EXIF → кодировщик → вставка EXIF и ICC.

import { chooseProfile } from '../color/nclx';
import { loadProfile } from '../color/profiles';
import { prepareExif } from '../metadata/exif-filter';
import { applyOrientation } from './orientation';
import { downscale } from './preview';
import { resizeRgba, targetSize } from './resize';
import { encodeToTarget } from './target-size';
import type { ConvertOptions, DecoderSession, Encoder, RawImage, WarningCode } from './types';

export interface ConvertResult {
  bytes: Uint8Array;
  /** Маленькое превью в том же формате (для строки файла в интерфейсе). */
  preview: Uint8Array;
  width: number;
  height: number;
  /** Размер исходника после поворота — для строки «4032×3024 → 1920×1440». */
  sourceWidth: number;
  sourceHeight: number;
  /** Качество, с которым закодирован файл (подобранное под целевой размер или с ползунка); null — без потерь. */
  quality: number | null;
  warnings: WarningCode[];
  timings: { decode: number; encode: number };
}

export async function convertImage(session: DecoderSession, encoder: Encoder, options: ConvertOptions): Promise<ConvertResult> {
  const started = performance.now();
  const image = await session.decode();
  const decoded = performance.now();
  try {
    const warnings: WarningCode[] = [...image.warnings];
    // поворот по EXIF применяем к пикселям, в результате Orientation = 1
    const oriented = applyOrientation({ data: image.rgba, width: image.width, height: image.height }, image.orientation);
    let sized = oriented;
    if (options.resize) {
      const size = targetSize(oriented.width, oriented.height, options.resize);
      if (size.width === oriented.width && size.height === oriented.height) warnings.push('not-resized');
      else sized = resizeRgba(oriented, size.width, size.height, image.hasAlpha);
    }
    const pixels: RawImage = { rgba: sized.data, width: sized.width, height: sized.height, hasAlpha: image.hasAlpha };

    // ICC исходника переносим всегда; если цвет задан nclx (или не задан) — встраиваем эквивалентный профиль
    const color = chooseProfile(image.nclx);
    if (color.hdr) warnings.push('hdr-tone');
    let icc: Uint8Array | null = image.icc ?? (await loadProfile(color.profile));
    if (icc.length > encoder.maxIccBytes) {
      warnings.push('icc-too-large');
      icc = null;
    }

    const exif = prepareExif(image.exif, {
      mode: options.metadata,
      width: pixels.width,
      height: pixels.height,
      maxBytes: encoder.maxExifBytes,
    });
    warnings.push(...exif.warnings);

    // превью — из исходных пикселей до кодирования (JPEG-кодировщик меняет буфер, накладывая альфу на белый)
    const small = downscale({ data: pixels.rgba, width: pixels.width, height: pixels.height });
    const preview = await encoder.encode(
      { rgba: small.data, width: small.width, height: small.height, hasAlpha: pixels.hasAlpha },
      { ...options, quality: 75, lossless: false },
    );

    const meta = { exif: exif.tiff, icc };
    // качество есть только у JPEG, WebP и AVIF с потерями (PNG и ICO — без потерь)
    const lossy = (options.encoder === 'jpeg' || options.encoder === 'webp' || options.encoder === 'avif') && !options.lossless;
    let bytes: Uint8Array;
    let quality: number | null = lossy ? options.quality : null;
    if (options.targetBytes !== null && lossy) {
      const target = await encodeToTarget(
        async (q) => encoder.embed(await encoder.encode(pixels, { ...options, quality: q }, meta), meta),
        options.targetBytes,
      );
      bytes = target.bytes;
      quality = target.quality;
      if (!target.reached) warnings.push('target-not-reached');
    } else {
      // PNG и WebP без потерь качества не имеют — целевой размер к ним не применить
      if (options.targetBytes !== null) warnings.push('target-lossless');
      bytes = encoder.embed(await encoder.encode(pixels, options, meta), meta);
    }
    return {
      bytes,
      preview,
      width: pixels.width,
      height: pixels.height,
      sourceWidth: oriented.width,
      sourceHeight: oriented.height,
      quality,
      warnings,
      timings: { decode: decoded - started, encode: performance.now() - decoded },
    };
  } finally {
    image.release();
  }
}
