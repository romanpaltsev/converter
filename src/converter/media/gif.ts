// Видео в GIF: кадры с заданной частотой (CanvasSink mediabunny рисует их на OffscreenCanvas нужного размера),
// у каждого кадра своя палитра на 256 цветов (gifenc: квантование RGB565 и подбор ближайшего цвета), повтор — бесконечно.
// Длиннее GIF_MAX_SECONDS — обрезается с предупреждением: в GIF нет межкадрового сжатия, минута видео — десятки МБ.

import { CanvasSink } from 'mediabunny';
import { GIFEncoder, applyPalette, quantize } from 'gifenc';
import { ConvertError, type WarningCode } from '../pipeline/types';
import { GIF_MAX_SECONDS, type MediaOptions } from './formats';
import type { MediaProbe, MediaResult } from './run';

/** Размер кадра GIF: ширина из настроек (не больше исходной), высота — по пропорциям. */
export function gifSize(width: number, height: number, maxWidth: number): { width: number; height: number } {
  const w = Math.min(maxWidth, width);
  return { width: w, height: Math.max(1, Math.round((height * w) / width)) };
}

/** Метки времени кадров: от первого кадра с шагом 1/fps, не дольше GIF_MAX_SECONDS. */
export function gifTimestamps(start: number, duration: number, fps: number): { timestamps: number[]; trimmed: boolean } {
  const length = Math.min(duration, GIF_MAX_SECONDS);
  const count = Math.max(1, Math.floor(length * fps + 1e-6));
  return { timestamps: Array.from({ length: count }, (_, i) => start + i / fps), trimmed: duration > GIF_MAX_SECONDS + 1e-6 };
}

export async function convertGif(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  const video = probe.video!;
  if (!(await video.canDecode())) throw new ConvertError('media-decode-unsupported', 'media: видео не декодируется');
  const { width, height } = gifSize(await video.getDisplayWidth(), await video.getDisplayHeight(), options.gifWidth);
  const start = await video.getFirstTimestamp();
  const { timestamps, trimmed } = gifTimestamps(start, probe.duration - start, options.gifFps);
  const sink = new CanvasSink(video, { width, height, fit: 'fill', poolSize: 1 });
  const gif = GIFEncoder();
  // задержка в GIF — в сотых долях секунды: при 15 к/с это 7, а не 6,67
  const delay = Math.round(100 / options.gifFps) * 10;
  let frames = 0;
  try {
    for await (const wrapped of sink.canvasesAtTimestamps(timestamps)) {
      if (wrapped) {
        const context = (wrapped.canvas as OffscreenCanvas).getContext('2d')!;
        const { data } = context.getImageData(0, 0, width, height);
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay, repeat: 0 });
        frames++;
      }
      onProgress(frames / timestamps.length);
    }
  } catch (error) {
    if (/not supported/i.test(String(error))) throw new ConvertError('media-decode-unsupported', `media: ${String(error)}`, { recycle: true });
    throw new ConvertError('decode-failed', `media: ${String(error)}`, { recycle: true });
  }
  if (frames === 0) throw new ConvertError('decode-failed', 'media: ни одного кадра');
  gif.finish();
  const warnings: WarningCode[] = trimmed ? ['gif-trimmed'] : [];
  return { bytes: gif.bytesView().slice(), duration: frames / options.gifFps, copied: false, warnings };
}
