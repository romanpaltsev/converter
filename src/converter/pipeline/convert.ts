// Конвейер одного файла: декодер → RGBA → кодировщик → вставка EXIF и ICC.

import { chooseProfile } from '../color/nclx';
import { loadProfile } from '../color/profiles';
import { prepareExif } from '../metadata/exif-filter';
import { downscale } from './preview';
import type { ConvertOptions, DecoderSession, Encoder, WarningCode } from './types';

export interface ConvertResult {
  bytes: Uint8Array;
  /** Маленькое превью в том же формате (для строки файла в интерфейсе). */
  preview: Uint8Array;
  width: number;
  height: number;
  warnings: WarningCode[];
  timings: { decode: number; encode: number };
}

export async function convertImage(session: DecoderSession, encoder: Encoder, options: ConvertOptions): Promise<ConvertResult> {
  const started = performance.now();
  const image = session.decode();
  const decoded = performance.now();
  try {
    const warnings: WarningCode[] = [];
    // ICC исходника переносим всегда; если цвет задан nclx (или не задан) — встраиваем эквивалентный профиль
    const color = chooseProfile(image.nclx);
    if (color.hdr) warnings.push('hdr-tone');
    const icc = image.icc ?? (await loadProfile(color.profile));

    const exif = prepareExif(image.exif, {
      mode: options.metadata,
      width: image.width,
      height: image.height,
      maxBytes: encoder.maxExifBytes,
    });
    warnings.push(...exif.warnings);

    // превью — из исходных пикселей до кодирования (JPEG-кодировщик меняет буфер, накладывая альфу на белый)
    const small = downscale({ data: image.rgba, width: image.width, height: image.height });
    const preview = await encoder.encode({ rgba: small.data, width: small.width, height: small.height, hasAlpha: image.hasAlpha }, { ...options, quality: 75 });

    const encoded = await encoder.encode(image, options);
    const bytes = encoder.embed(encoded, { exif: exif.tiff, icc });
    return {
      bytes,
      preview,
      width: image.width,
      height: image.height,
      warnings,
      timings: { decode: decoded - started, encode: performance.now() - decoded },
    };
  } finally {
    image.release();
  }
}
