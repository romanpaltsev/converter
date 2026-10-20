// Видео в MP4 или WebM. Сначала — перепаковка без перекодирования (MOV с H.264 и AAC в MP4 — секунды и без потерь),
// если кодеки дорожек подходят контейнеру и уменьшать кадр не нужно. Иначе — перекодирование через WebCodecs:
// MP4 — H.264 (запасные HEVC, VP9, AV1 — если браузер не кодирует H.264), звук AAC; WebM — VP9 (запасные VP8, AV1),
// звук Opus. Звук, который браузер не может закодировать, не ломает видео: оно сохраняется без звука с предупреждением.

import { BufferTarget, Conversion, type ConversionVideoOptions, Mp4OutputFormat, Output, type OutputFormat, Quality, type VideoCodec, WebMOutputFormat, getFirstEncodableVideoCodec } from 'mediabunny';
import { ConvertError, type WarningCode } from '../pipeline/types';
import { ensureAudioEncoder } from './encoders';
import type { MediaOptions } from './formats';
import { type MediaProbe, type MediaResult, rejectInvalid, runConversion } from './run';

type VideoContainer = 'mp4' | 'webm';

/**
 * video/audio — чем кодировать (по порядку предпочтения); copyVideo/copyAudio — какие кодеки переносить как есть.
 * В MP4 копируется только H.264: HEVC (MOV с iPhone) и VP9 в MP4 открываются не везде, а MP4 обычно нужен ради
 * совместимости — такие видео перекодируются в H.264.
 */
const CONTAINERS: Record<VideoContainer, { format: () => OutputFormat; video: VideoCodec[]; audio: 'aac' | 'opus'; copyVideo: string[]; copyAudio: string[] }> = {
  mp4: { format: () => new Mp4OutputFormat({ fastStart: 'in-memory' }), video: ['avc', 'hevc', 'vp9', 'av1'], audio: 'aac', copyVideo: ['avc'], copyAudio: ['aac', 'mp3'] },
  webm: { format: () => new WebMOutputFormat(), video: ['vp9', 'vp8', 'av1'], audio: 'opus', copyVideo: ['vp9', 'vp8', 'av1'], copyAudio: ['opus', 'vorbis'] },
};

/** Чётное число (H.264 и VP9 с 4:2:0 требуют чётных сторон), не меньше 2. */
const even = (value: number) => Math.max(2, Math.round(value / 2) * 2);

/**
 * Размер кадра после уменьшения: «1080p» — это короткая сторона (у вертикального видео — ширина), только уменьшение;
 * null — размер прежний.
 */
export function scaledSize(width: number, height: number, maxHeight: number): { width: number; height: number } | null {
  const short = Math.min(width, height);
  if (maxHeight <= 0 || short <= maxHeight) return null;
  const scale = maxHeight / short;
  return { width: even(width * scale), height: even(height * scale) };
}

export async function convertVideo(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  const { input, video, audio } = probe;
  const container = CONTAINERS[options.target as VideoContainer];
  const size = scaledSize(await video!.getDisplayWidth(), await video!.getDisplayHeight(), options.maxHeight);

  // перепаковка: дорожки совместимых кодеков копируются как есть; если какая-то будет отброшена — не годится
  const copyable = container.copyVideo.includes((await video!.getCodec()) ?? '') && (!audio || container.copyAudio.includes((await audio.getCodec()) ?? ''));
  if (!size && copyable) {
    const copy = await Conversion.init({
      input,
      output: new Output({ format: container.format(), target: new BufferTarget() }),
      tracks: 'primary',
      copy: { mode: 'forced', shiftTolerance: Infinity },
      showWarnings: false,
    });
    if (copy.isValid && copy.discardedTracks.length === 0) {
      const buffer = await runConversion(copy, onProgress);
      return { bytes: new Uint8Array(buffer), duration: probe.duration, copied: true, warnings: [] };
    }
  }

  const codec = await getFirstEncodableVideoCodec(container.video, size ?? { width: await video!.getCodedWidth(), height: await video!.getCodedHeight() });
  if (!codec) throw new ConvertError('media-encode-unsupported', 'media: нет кодировщика видео');
  if (audio) await ensureAudioEncoder(container.audio);
  const videoOptions: ConversionVideoOptions = { codec, quality: new Quality(options.videoQuality), ...(size ? { ...size, fit: 'fill' as const } : {}) };
  const conversion = await Conversion.init({
    input,
    output: new Output({ format: container.format(), target: new BufferTarget() }),
    tracks: 'primary',
    video: videoOptions,
    audio: { codec: container.audio },
    showWarnings: false,
  });
  if (!conversion.isValid) rejectInvalid(conversion, 'video');
  // видео есть, а звук отброшен (браузер не кодирует Opus или AAC, не декодирует звук входа) — видео без звука
  const warnings: WarningCode[] = conversion.discardedTracks.some((discarded) => discarded.track.type === 'audio') ? ['audio-dropped'] : [];
  if (conversion.discardedTracks.some((discarded) => discarded.track.type === 'video')) rejectInvalid(conversion, 'video');
  const buffer = await runConversion(conversion, onProgress);
  return { bytes: new Uint8Array(buffer), duration: probe.duration, copied: false, warnings };
}
