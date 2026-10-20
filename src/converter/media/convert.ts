// Аудио в worker'е: mediabunny (MPL-2.0) читает контейнер (MP3, WAV, FLAC, Ogg, ADTS, MP4/M4A/MOV, WebM/MKV),
// декодирует звук через WebCodecs и кодирует в выбранный формат. MP3 (LAME) и FLAC (libFLAC) кодируют всегда наши
// WASM-расширения: результат одинаковый во всех браузерах (WebKit заявляет свои кодировщики MP3 и FLAC, но они то
// зависают, то дописывают тишину). AAC — кодировщик браузера, если он есть (Chrome, Safari), иначе расширение.
// Opus — только браузер. Кодек браузера может и зависнуть — без хода дольше STALL_MS задание прерывается.
// Файл читается кусками (BlobSource) — в память целиком попадает только результат. Видео при извлечении звука
// отбрасывается без декодирования. Если кодек тот же (AAC из MP4 в M4A, Opus из WebM в OGG), звук копируется
// без перекодирования — без потерь и быстро.

import { ALL_FORMATS, BlobSource, BufferTarget, Conversion, FlacOutputFormat, Input, type InputAudioTrack, Mp3OutputFormat, Mp4OutputFormat, OggOutputFormat, Output, type OutputFormat, Quality, WavOutputFormat, canEncodeAudio } from 'mediabunny';
import { ConvertError } from '../pipeline/types';
import { AUDIO_FORMATS, type AudioFormat, type AudioTargetId, type MediaOptions } from './formats';

const OUTPUT_FORMATS: Record<AudioTargetId, () => OutputFormat> = {
  mp3: () => new Mp3OutputFormat(),
  wav: () => new WavOutputFormat(),
  m4a: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
  ogg: () => new OggOutputFormat(),
  flac: () => new FlacOutputFormat(),
};

/** Запас на сам worker, буферы декодирования и копию результата при передаче. */
const BASE_MEMORY = 64 * 1024 * 1024;

/** Сколько ждать хода конвертации, прежде чем счесть кодек браузера зависшим. */
const STALL_MS = 45_000;

/** Расширения-кодировщики регистрируются один раз на worker (зарегистрированный — важнее кодировщика браузера). */
const registered = new Map<AudioFormat['codec'], Promise<void>>();

function ensureEncoder(codec: AudioFormat['codec']): Promise<void> {
  let ready = registered.get(codec);
  if (!ready) {
    ready = (async () => {
      if (codec === 'mp3') (await import('@mediabunny/mp3-encoder')).registerMp3Encoder();
      else if (codec === 'flac') (await import('@mediabunny/flac-encoder')).registerFlacEncoder();
      else if (codec === 'aac' && !(await canEncodeAudio('aac'))) (await import('@mediabunny/aac-encoder')).registerAacEncoder();
    })();
    registered.set(codec, ready);
    ready.catch(() => registered.delete(codec));
  }
  return ready;
}

export interface MediaProbe {
  input: Input;
  track: InputAudioTrack;
  /** Длительность, секунды. */
  duration: number;
  /** Сколько памяти займёт worker: результат в памяти (BufferTarget растёт удвоением) и запас. */
  footprint: number;
}

/** Открыть файл и оценить память; нет звуковой дорожки — ошибка no-audio, контейнер не читается — decode-failed. */
export async function probeMedia(file: Blob, options: MediaOptions): Promise<MediaProbe> {
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  try {
    let track: InputAudioTrack | null;
    let duration: number;
    try {
      track = await input.getPrimaryAudioTrack();
      duration = track ? await input.computeDuration([track]) : 0;
    } catch (error) {
      throw new ConvertError('decode-failed', `media: ${String(error)}`);
    }
    if (!track) throw new ConvertError('no-audio');
    const format = AUDIO_FORMATS[options.target];
    const channels = Math.min(track.numberOfChannels, format.codec === 'mp3' ? 2 : 8);
    const pcm = duration * track.sampleRate * channels * 2;
    const output = format.lossy ? (duration * options.bitrate * 1000) / 8 : format.codec === 'flac' ? pcm * 0.7 : pcm;
    return { input, track, duration, footprint: BASE_MEMORY + 2 * output };
  } catch (error) {
    input.dispose();
    throw error;
  }
}

export interface MediaResult {
  bytes: Uint8Array;
  duration: number;
  /** Звук скопирован без перекодирования (кодек тот же). */
  copied: boolean;
}

/** Конвертация в новый Output: copy — только копирование звука (без битрейта), иначе — перекодирование. */
function initConversion({ input, track }: MediaProbe, options: MediaOptions, copy: boolean): Promise<Conversion> {
  const format = AUDIO_FORMATS[options.target];
  return Conversion.init({
    input,
    output: new Output({ format: OUTPUT_FORMATS[options.target](), target: new BufferTarget() }),
    tracks: 'primary',
    video: { discard: true },
    audio: copy
      ? { codec: format.codec }
      : {
          codec: format.codec,
          // MP3 — только моно и стерео: многоканальный звук сводится в стерео
          ...(format.codec === 'mp3' && track.numberOfChannels > 2 ? { numberOfChannels: 2 } : {}),
          ...(format.lossy ? { quality: new Quality({ bitrate: options.bitrate * 1000 }) } : {}),
        },
    copy: copy ? { mode: 'forced', shiftTolerance: Infinity } : false,
    showWarnings: false,
  });
}

/**
 * Конвертирует звук открытого файла; onProgress — доля 0…1. Input закрывается в любом случае.
 * Сторож: кодек браузера бывает зависает без ошибки (и до первого хода, и так, что не отменяется) — если хода нет
 * дольше STALL_MS, задание завершается ошибкой с recycle: основной поток пересоздаст worker вместе с зависшим кодеком.
 */
export async function convertAudio(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  let timer = 0;
  let stall!: (error: ConvertError) => void;
  const stalled = new Promise<never>((_, reject) => (stall = reject));
  const watch = () => {
    clearTimeout(timer);
    timer = setTimeout(() => stall(new ConvertError('media-stalled', 'media: нет хода конвертации', { recycle: true })), STALL_MS) as unknown as number;
  };
  watch();
  try {
    return await Promise.race([
      runConversion(probe, options, (progress) => {
        watch();
        onProgress(progress);
      }),
      stalled,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function runConversion(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  const { input, track, duration } = probe;
  try {
    const format = AUDIO_FORMATS[options.target];
    await ensureEncoder(format.codec);
    // тот же кодек — сначала пробуем скопировать звук как есть (сдвиг меток времени допустим: видео не будет);
    // не вышло (например, нужна другая частота) — перекодируем с битрейтом из настроек
    const sameCodec = (await track.getCodec()) === format.codec;
    let copied = sameCodec;
    let conversion = sameCodec ? await initConversion(probe, options, true) : null;
    if (!conversion?.isValid) {
      copied = false;
      conversion = await initConversion(probe, options, false);
    }
    if (!conversion.isValid) {
      const reason = conversion.discardedTracks.find((discarded) => discarded.track.type === 'audio')?.reason;
      // кодек входа браузер не декодирует (например, AC-3) или формат выхода не кодирует (Opus в старом Safari)
      if (reason === 'no_encodable_target_codec') throw new ConvertError('media-encode-unsupported', `media: ${reason}`);
      throw new ConvertError('media-decode-unsupported', `media: ${reason ?? 'invalid conversion'}`);
    }
    conversion.onProgress = (progress) => onProgress(progress);
    try {
      await conversion.execute();
    } catch (error) {
      // декодер WebCodecs отказался уже при запуске (Firefox на Linux без системного ffmpeg — AAC и H.264)
      if (/not supported/i.test(String(error))) throw new ConvertError('media-decode-unsupported', `media: ${String(error)}`, { recycle: true });
      throw new ConvertError('decode-failed', `media: ${String(error)}`, { recycle: true });
    }
    const buffer = (conversion.output.target as BufferTarget).buffer;
    if (!buffer) throw new ConvertError('internal', 'media: пустой результат');
    return { bytes: new Uint8Array(buffer), duration, copied };
  } finally {
    input.dispose();
  }
}
