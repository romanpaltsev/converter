// Аудио и видео на выходе для виджета и worker'а: таблицы форматов — в реестре (их читает и скрипт CONTENT.md без
// сборщика), здесь — настройки (битрейт, качество и разрешение видео, GIF) и параметры задания.

import type { AudioTargetId, VideoTargetId } from '../../tools/registry';

export { AUDIO_FORMATS, AUDIO_TARGETS, type AudioFormat, type AudioTargetId, isAudioTarget } from '../../tools/registry';
export { VIDEO_FORMATS, VIDEO_TARGETS, type VideoTargetId, isVideoTarget } from '../../tools/registry';

/** Битрейт (кбит/с) для форматов с потерями: 192 — по умолчанию, «как у музыкальных сервисов». */
export const AUDIO_BITRATES = [128, 192, 256, 320] as const;
export const DEFAULT_AUDIO_BITRATE = 192;

/** Качество видео — уровни mediabunny (битрейт по разрешению и кодеку): высокое — по умолчанию. */
export const VIDEO_QUALITIES = ['high', 'medium', 'low'] as const;
export type VideoQuality = (typeof VIDEO_QUALITIES)[number];
export const DEFAULT_VIDEO_QUALITY: VideoQuality = 'high';

/** Разрешение — наибольшая высота кадра (только уменьшение); 0 — исходное. */
export const VIDEO_HEIGHTS = [0, 1080, 720, 480] as const;

/** GIF: ширина кадра и частота; длиннее GIF_MAX_SECONDS — обрезается (GIF без сжатия между кадрами огромен). */
export const GIF_WIDTHS = [320, 480, 640] as const;
export const DEFAULT_GIF_WIDTH = 480;
export const GIF_FPS = [10, 15, 20] as const;
export const DEFAULT_GIF_FPS = 10;
export const GIF_MAX_SECONDS = 20;

/** Что передаётся в worker для аудио и видео; поля, не важные формату, не используются. */
export interface MediaOptions {
  target: AudioTargetId | VideoTargetId;
  /** Аудио с потерями (и звук видео не трогает), кбит/с. */
  bitrate: number;
  videoQuality: VideoQuality;
  /** Наибольшая высота кадра видео; 0 — исходная. */
  maxHeight: number;
  gifWidth: number;
  gifFps: number;
}
