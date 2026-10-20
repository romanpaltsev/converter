// Общее для аудио и видео: открытый файл (MediaProbe), запуск конвертации mediabunny и разбор её ошибок.

import type { Conversion, Input, InputAudioTrack, InputVideoTrack } from 'mediabunny';
import { ConvertError, type WarningCode } from '../pipeline/types';

/** Запас на сам worker, буферы декодирования и копию результата при передаче. */
export const BASE_MEMORY = 64 * 1024 * 1024;

export interface MediaProbe {
  input: Input;
  audio: InputAudioTrack | null;
  video: InputVideoTrack | null;
  /** Длительность, секунды. */
  duration: number;
  /** Сколько памяти займёт worker: результат в памяти (BufferTarget растёт удвоением) и запас. */
  footprint: number;
}

export interface MediaResult {
  bytes: Uint8Array;
  duration: number;
  /** Дорожки скопированы без перекодирования (тот же кодек). */
  copied: boolean;
  warnings: WarningCode[];
}

/** Конвертация не собралась: дорожка не декодируется (кодек входа) или формат выхода браузер не кодирует. */
export function rejectInvalid(conversion: Conversion, type: 'audio' | 'video'): never {
  const reason = conversion.discardedTracks.find((discarded) => discarded.track.type === type)?.reason;
  if (reason === 'no_encodable_target_codec') throw new ConvertError('media-encode-unsupported', `media: ${reason}`);
  throw new ConvertError('media-decode-unsupported', `media: ${reason ?? 'invalid conversion'}`);
}

/** Выполнить конвертацию: ход — в onProgress; отказ декодера при запуске — «кодек не поддерживается», а не «повреждён». */
export async function runConversion(conversion: Conversion, onProgress: (progress: number) => void): Promise<ArrayBuffer> {
  conversion.onProgress = (progress) => onProgress(progress);
  try {
    await conversion.execute();
  } catch (error) {
    // декодер WebCodecs отказался уже при запуске (Firefox на Linux без системного ffmpeg — AAC и H.264)
    if (/not supported/i.test(String(error))) throw new ConvertError('media-decode-unsupported', `media: ${String(error)}`, { recycle: true });
    throw new ConvertError('decode-failed', `media: ${String(error)}`, { recycle: true });
  }
  const buffer = (conversion.output.target as { buffer?: ArrayBuffer | null }).buffer;
  if (!buffer) throw new ConvertError('internal', 'media: пустой результат');
  return buffer;
}
