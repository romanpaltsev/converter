// Аудио на выходе для виджета и worker'а: таблица форматов — в реестре (её читает и скрипт CONTENT.md без сборщика),
// здесь — битрейт и параметры задания.

import type { AudioTargetId } from '../../tools/registry';

export { AUDIO_FORMATS, AUDIO_TARGETS, type AudioFormat, type AudioTargetId, isAudioTarget } from '../../tools/registry';

/** Битрейт (кбит/с) для форматов с потерями: 192 — по умолчанию, «как у музыкальных сервисов». */
export const AUDIO_BITRATES = [128, 192, 256, 320] as const;
export const DEFAULT_AUDIO_BITRATE = 192;

/** Что передаётся в worker для аудио: формат и битрейт (для форматов без потерь не используется). */
export interface MediaOptions {
  target: AudioTargetId;
  bitrate: number;
}
