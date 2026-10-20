// Звук в аудиоформат (и звук из видео — дорожка видео отбрасывается без декодирования). Тот же кодек (AAC из MP4
// в M4A, Opus из WebM в OGG) сначала пробуем скопировать как есть; не вышло — перекодируем с битрейтом из настроек.

import { BufferTarget, Conversion, FlacOutputFormat, Mp3OutputFormat, Mp4OutputFormat, OggOutputFormat, Output, type OutputFormat, Quality, WavOutputFormat } from 'mediabunny';
import { ensureAudioEncoder } from './encoders';
import { AUDIO_FORMATS, type AudioTargetId, type MediaOptions } from './formats';
import { type MediaProbe, type MediaResult, rejectInvalid, runConversion } from './run';

const OUTPUT_FORMATS: Record<AudioTargetId, () => OutputFormat> = {
  mp3: () => new Mp3OutputFormat(),
  wav: () => new WavOutputFormat(),
  m4a: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
  ogg: () => new OggOutputFormat(),
  flac: () => new FlacOutputFormat(),
};

/** Конвертация в новый Output: copy — только копирование звука (без битрейта), иначе — перекодирование. */
function initConversion({ input, audio }: MediaProbe, target: AudioTargetId, bitrate: number, copy: boolean): Promise<Conversion> {
  const format = AUDIO_FORMATS[target];
  return Conversion.init({
    input,
    output: new Output({ format: OUTPUT_FORMATS[target](), target: new BufferTarget() }),
    tracks: 'primary',
    video: { discard: true },
    audio: copy
      ? { codec: format.codec }
      : {
          codec: format.codec,
          // MP3 — только моно и стерео: многоканальный звук сводится в стерео
          ...(format.codec === 'mp3' && audio!.numberOfChannels > 2 ? { numberOfChannels: 2 } : {}),
          ...(format.lossy ? { quality: new Quality({ bitrate: bitrate * 1000 }) } : {}),
        },
    copy: copy ? { mode: 'forced', shiftTolerance: Infinity } : false,
    showWarnings: false,
  });
}

export async function convertAudio(probe: MediaProbe, options: MediaOptions, onProgress: (progress: number) => void): Promise<MediaResult> {
  const target = options.target as AudioTargetId;
  const format = AUDIO_FORMATS[target];
  await ensureAudioEncoder(format.codec);
  const sameCodec = (await probe.audio!.getCodec()) === format.codec;
  let copied = sameCodec;
  let conversion = sameCodec ? await initConversion(probe, target, options.bitrate, true) : null;
  if (!conversion?.isValid) {
    copied = false;
    conversion = await initConversion(probe, target, options.bitrate, false);
  }
  if (!conversion.isValid) rejectInvalid(conversion, 'audio');
  const buffer = await runConversion(conversion, onProgress);
  return { bytes: new Uint8Array(buffer), duration: probe.duration, copied, warnings: [] };
}
