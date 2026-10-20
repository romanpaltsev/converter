// Аудио и видео в worker'е: mediabunny (MPL-2.0) читает контейнер (MP3, WAV, FLAC, Ogg, ADTS, MP4/M4A/MOV, WebM/MKV)
// кусками (BlobSource) — в памяти держится только результат. Декодирует и кодирует WebCodecs браузера, MP3 и FLAC —
// наши WASM-расширения (encoders.ts). Что делать — по формату: звук (audio.ts), видео (video.ts) или GIF (gif.ts).
// Кодек браузера может зависнуть без ошибки — без хода дольше STALL_MS задание прерывается (сторож).

import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import { ConvertError } from '../pipeline/types';
import { AUDIO_FORMATS, type MediaOptions, isAudioTarget } from './formats';
import { convertAudio } from './audio';
import { convertGif, gifSize, gifTimestamps } from './gif';
import { convertVideo } from './video';
import { BASE_MEMORY, type MediaProbe, type MediaResult } from './run';

export type { MediaProbe, MediaResult } from './run';

/** Сколько ждать хода конвертации, прежде чем счесть кодек браузера зависшим. */
const STALL_MS = 45_000;
/** Оценка битрейта перекодированного видео для памяти: с запасом для 1080p высокого качества. */
const VIDEO_BITS_PER_SECOND = 12_000_000;

/** Открыть файл и оценить память. Нужной дорожки нет — no-audio / no-video, контейнер не читается — decode-failed. */
export async function probeMedia(file: Blob, options: MediaOptions): Promise<MediaProbe> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    let probe: Omit<MediaProbe, 'footprint'>;
    try {
      const audio = await input.getPrimaryAudioTrack();
      const video = await input.getPrimaryVideoTrack();
      probe = { input, audio, video, duration: await input.computeDuration() };
    } catch (error) {
      throw new ConvertError('decode-failed', `media: ${String(error)}`);
    }
    if (isAudioTarget(options.target)) {
      if (!probe.audio) throw new ConvertError('no-audio');
      const format = AUDIO_FORMATS[options.target];
      const channels = Math.min(probe.audio.numberOfChannels, format.codec === 'mp3' ? 2 : 8);
      const pcm = probe.duration * probe.audio.sampleRate * channels * 2;
      const output = format.lossy ? (probe.duration * options.bitrate * 1000) / 8 : format.codec === 'flac' ? pcm * 0.7 : pcm;
      return { ...probe, footprint: BASE_MEMORY + 2 * output };
    }
    if (!probe.video) throw new ConvertError('no-video');
    if (options.target === 'gif') {
      // кадр RGBA на холсте и индексы, а результат — около байта на точку кадра
      const { width, height } = gifSize(probe.video.displayWidth, probe.video.displayHeight, options.gifWidth);
      const frames = gifTimestamps(0, probe.duration, options.gifFps).timestamps.length;
      return { ...probe, footprint: BASE_MEMORY + 2 * frames * width * height + 8 * width * height };
    }
    const output = Math.max(file.size, (probe.duration * VIDEO_BITS_PER_SECOND) / 8);
    return { ...probe, footprint: BASE_MEMORY + 2 * output };
  } catch (error) {
    input.dispose();
    throw error;
  }
}

/**
 * Конвертирует открытый файл; onProgress — доля 0…1. Input закрывается в любом случае.
 * Сторож: кодек браузера бывает зависает без ошибки (и до первого хода, и так, что не отменяется) — если хода нет
 * дольше STALL_MS, задание завершается ошибкой с recycle: основной поток пересоздаст worker вместе с зависшим кодеком.
 */
export async function convertMedia(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  let timer = 0;
  let stall!: (error: ConvertError) => void;
  const stalled = new Promise<never>((_, reject) => (stall = reject));
  const watch = () => {
    clearTimeout(timer);
    timer = setTimeout(() => stall(new ConvertError('media-stalled', 'media: нет хода конвертации', { recycle: true })), STALL_MS) as unknown as number;
  };
  const progress = (value: number) => {
    watch();
    onProgress(value);
  };
  watch();
  try {
    return await Promise.race([run(probe, options, progress), stalled]);
  } finally {
    clearTimeout(timer);
    probe.input.dispose();
  }
}

function run(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  if (isAudioTarget(options.target)) return convertAudio(probe, options, onProgress);
  if (options.target === 'gif') return convertGif(probe, options, onProgress);
  return convertVideo(probe, options, onProgress);
}
