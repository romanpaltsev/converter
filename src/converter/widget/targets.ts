// Форматы результата в универсальном виджете (формат выбирается у каждого файла): что можно выбрать для файла
// по его виду (сигнатуре), с какой предустановкой он стартует и какие общие настройки нужны выбранным форматам.
// Чистые функции: их используют и браузер, и сборка (начальная видимость настроек).

import { AUDIO_FORMATS, AUDIO_TARGETS, type AudioTargetId, VIDEO_TARGETS, type VideoTargetId, isAudioTarget, isVideoTarget } from '../media/formats';
import { type SniffKind, type TextKind, isMediaKind, isTextKind } from '../pipeline/sniff';
import type { DocTargetId } from '../../tools/registry';
import type { EncoderId } from '../pipeline/types';

/** Формат результата: кодировщик изображения, PDF (картинка или текст — свой документ), документ, таблица, видео или аудио. */
export type TargetId = EncoderId | 'pdf' | DocTargetId | VideoTargetId | AudioTargetId;

/** Пункты меню «Изображение», «Документ», «Таблица», «Видео» и «Аудио» — в этом порядке (у видеофайла видео — первым). */
export const IMAGE_TARGETS: readonly TargetId[] = ['jpeg', 'png', 'webp', 'avif', 'ico'];
export const DOCUMENT_TARGETS: readonly TargetId[] = ['pdf', 'html', 'txt'];
export const TABLE_TARGETS: readonly TargetId[] = ['xlsx', 'csv', 'json'];
export { AUDIO_TARGETS, VIDEO_TARGETS };
export const ALL_TARGETS: readonly TargetId[] = [...IMAGE_TARGETS, ...DOCUMENT_TARGETS, ...TABLE_TARGETS, ...VIDEO_TARGETS, ...AUDIO_TARGETS];
/** Документы и таблицы: текст — в PDF (Markdown — и в HTML, HTML — и в TXT), таблицы — друг в друга. */
const TEXT_TARGETS: Record<TextKind, readonly TargetId[]> = {
  txt: ['pdf'],
  md: ['pdf', 'html'],
  html: ['pdf', 'txt'],
  csv: ['xlsx', 'json'],
  json: ['xlsx', 'csv'],
  xlsx: ['csv', 'json'],
};
/** Контейнеры видео: из них — и видео, и звук; из остальных медиа (MP3, WAV…) — только звук. */
const VIDEO_KINDS: readonly SniffKind[] = ['mp4', 'mov', 'webm', 'mkv'];
/** Страницы PDF — картинками в основных форматах (AVIF для многостраничных документов слишком медленный). */
const PAGE_TARGETS: readonly TargetId[] = ['jpeg', 'png', 'webp'];

/** Вход уже в этом формате — конвертировать в него нечего, такой пункт не предлагаем. */
// Opus в Ogg — тот же контейнер, что и «OGG» на выходе (Opus в Ogg); у ADTS (AAC) своего пункта нет — M4A полезен
const OWN_TARGET: Partial<Record<SniffKind, TargetId>> = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  pdf: 'pdf',
  mp3: 'mp3',
  wav: 'wav',
  m4a: 'm4a',
  ogg: 'ogg',
  opus: 'ogg',
  flac: 'flac',
  mp4: 'mp4',
  webm: 'webm',
};

/** Во что можно сконвертировать файл этого вида (пусто — файл не поддерживается). Видео — в видео и в аудио, аудио — в аудио. */
export function targetsFor(kind: SniffKind): TargetId[] {
  if (kind === 'unknown') return [];
  if (kind === 'pdf') return [...PAGE_TARGETS];
  if (isTextKind(kind)) return [...TEXT_TARGETS[kind]];
  if (isMediaKind(kind)) {
    const targets: TargetId[] = VIDEO_KINDS.includes(kind) ? [...VIDEO_TARGETS, ...AUDIO_TARGETS] : [...AUDIO_TARGETS];
    return targets.filter((target) => target !== OWN_TARGET[kind]);
  }
  return [...IMAGE_TARGETS, 'pdf' as const].filter((target) => target !== OWN_TARGET[kind]);
}

/**
 * Что делать с файлом: image — картинка в картинку, document — картинка в свой PDF, pages — страницы PDF картинками
 * (у каждой страницы своя строка под строкой документа), media — аудио и видео через mediabunny.
 */
export function jobFor(kind: SniffKind, target: TargetId): 'image' | 'document' | 'pages' | 'media' | 'text' {
  if (kind === 'pdf') return 'pages';
  if (isTextKind(kind)) return 'text';
  if (isMediaKind(kind)) return 'media';
  return target === 'pdf' ? 'document' : 'image';
}

/** Формат, в котором файл уже есть (и которого поэтому нет в его меню), или null. */
export function ownTarget(kind: SniffKind): TargetId | null {
  return OWN_TARGET[kind] ?? null;
}

/** С каким форматом файл встаёт в очередь: предустановка страницы, если она ему подходит; иначе ждёт выбора. */
export function defaultTarget(kind: SniffKind, preset: TargetId | null): TargetId | null {
  return preset !== null && targetsFor(kind).includes(preset) ? preset : null;
}

/** Пункты меню «Все файлы в …»: то, что подходит хотя бы одному файлу, — в порядке меню. */
export function sharedTargets(kinds: readonly SniffKind[]): TargetId[] {
  const available = new Set(kinds.flatMap(targetsFor));
  return ALL_TARGETS.filter((target) => available.has(target));
}

export interface TargetPair {
  kind: SniffKind;
  target: TargetId;
}

/** Общие настройки виджета, от которых зависит результат. */
export interface TargetSettings {
  quality: number;
  lossless: boolean;
  keepMetadata: boolean;
  /** Разрешение страниц PDF. */
  dpi: number;
  /** Битрейт аудио с потерями, кбит/с. */
  audioBitrate: number;
  /** Видео: качество и наибольшая короткая сторона кадра (0 — исходная). */
  videoQuality: string;
  videoHeight: number;
  /** Видео в GIF: ширина и частота кадров. */
  gifWidth: number;
  gifFps: number;
  /** Разделитель CSV на выходе. */
  csvDelimiter: string;
}

export interface SettingsVisibility {
  quality: boolean;
  lossless: boolean;
  metadata: boolean;
  /** «PNG — большие файлы». */
  pngWarning: boolean;
  /** Размеры в ICO; метаданных в нём нет. */
  icoHint: boolean;
  /** AVIF кодируется долго. */
  avifHint: boolean;
  /** Разрешение страниц — когда в списке есть PDF. */
  dpi: boolean;
  /** Размер страницы и поля — когда картинки идут в PDF. */
  pdfLayout: boolean;
  /** Битрейт — когда звук кодируется с потерями (MP3, M4A, OGG). */
  audioBitrate: boolean;
  /** Качество и размер кадра — когда видео идёт в MP4 или WebM. */
  video: boolean;
  /** Ширина и частота кадров — когда видео идёт в GIF. */
  gif: boolean;
  /** Разделитель — когда таблица идёт в CSV. */
  csv: boolean;
}

const lossy = (target: TargetId, lossless: boolean) => target === 'jpeg' || target === 'avif' || (target === 'webp' && !lossless);
const lossyAudio = (target: TargetId) => isAudioTarget(target) && AUDIO_FORMATS[target].lossy;

/** Какие строки настроек показывать, если в списке такие пары (вход, формат); каждая строка нужна хотя бы одной паре. */
export function visibleSettings(pairs: readonly TargetPair[], lossless: boolean): SettingsVisibility {
  const any = (test: (pair: TargetPair) => boolean) => pairs.some(test);
  return {
    quality: any(({ target }) => lossy(target, lossless)),
    lossless: any(({ target }) => target === 'webp'),
    // у страниц PDF метаданных фото нет, в ICO и PDF они не попадают; теги аудио переносятся всегда
    metadata: any(({ kind, target }) => kind !== 'pdf' && !isTextKind(kind) && target !== 'ico' && target !== 'pdf' && !isAudioTarget(target) && !isVideoTarget(target)),
    pngWarning: any(({ kind, target }) => kind !== 'pdf' && target === 'png'),
    icoHint: any(({ target }) => target === 'ico'),
    avifHint: any(({ target }) => target === 'avif'),
    dpi: any(({ kind }) => kind === 'pdf'),
    // размер страницы и поля — для картинок в PDF; текст верстается на A4 с полями 20 мм
    pdfLayout: any(({ kind, target }) => target === 'pdf' && !isTextKind(kind)),
    audioBitrate: any(({ target }) => lossyAudio(target)),
    video: any(({ target }) => target === 'mp4' || target === 'webm'),
    gif: any(({ kind, target }) => target === 'gif' && isMediaKind(kind)),
    csv: any(({ target }) => target === 'csv'),
  };
}

/**
 * Настройки, с которыми файл сконвертирован, — только те, что влияют на этот формат: смена качества не делает
 * устаревшим PNG, галочка метаданных — ICO. Готовый файл с другим ключом можно «Конвертировать заново».
 */
export function settingsKey({ kind, target }: TargetPair, settings: TargetSettings): string {
  // картинка → PDF: качество страницы постоянное, размер страницы и поля применяются при сборке без перекодирования
  if (target === 'pdf') return target;
  // документы: важен только разделитель CSV
  if (isTextKind(kind)) return target === 'csv' ? `csv:${settings.csvDelimiter}` : target;
  // аудио: важен только битрейт (и только с потерями)
  if (isAudioTarget(target)) return lossyAudio(target) ? `${target}:b${settings.audioBitrate}` : target;
  if (target === 'gif') return `gif:w${settings.gifWidth}:f${settings.gifFps}`;
  if (isVideoTarget(target)) return `${target}:q${settings.videoQuality}:h${settings.videoHeight}`;
  const parts: string[] = [target];
  if (target === 'webp') parts.push(settings.lossless ? 'lossless' : 'lossy');
  if (lossy(target, settings.lossless)) parts.push(`q${settings.quality}`);
  if (kind === 'pdf') parts.push(`dpi${settings.dpi}`);
  else if (target !== 'ico') parts.push(settings.keepMetadata ? 'all' : 'dates');
  return parts.join(':');
}
