// Кодировщики звука на WASM (расширения mediabunny). MP3 (LAME) и FLAC (libFLAC) — всегда наши: результат одинаковый
// во всех браузерах (WebKit заявляет свои MP3 и FLAC, но они то зависают, то дописывают тишину). AAC — кодировщик
// браузера, если он есть (Chrome, Safari), иначе расширение на FFmpeg. Opus — только браузер.
// Зарегистрированный кодировщик mediabunny предпочитает кодировщику браузера.

import { canEncodeAudio } from 'mediabunny';
import type { AudioFormat } from './formats';

const registered = new Map<AudioFormat['codec'], Promise<void>>();

/** Регистрирует расширение для кодека (один раз на worker). */
export function ensureAudioEncoder(codec: AudioFormat['codec']): Promise<void> {
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
