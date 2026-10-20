// Форматы результата в универсальном виджете (формат выбирается у каждого файла): что можно выбрать для файла
// по его виду (сигнатуре), с какой предустановкой он стартует и какие общие настройки нужны выбранным форматам.
// Чистые функции: их используют и браузер, и сборка (начальная видимость настроек).

import { AUDIO_FORMATS, AUDIO_TARGETS, type AudioTargetId, isAudioTarget } from '../media/formats';
import { type SniffKind, isMediaKind } from '../pipeline/sniff';
import type { EncoderId } from '../pipeline/types';

/** Формат результата: кодировщик изображения, PDF (каждая картинка — свой документ) или аудио. */
export type TargetId = EncoderId | 'pdf' | AudioTargetId;

/** Пункты меню «Изображение», «Документ» и «Аудио» — в этом порядке. */
export const IMAGE_TARGETS: readonly TargetId[] = ['jpeg', 'png', 'webp', 'avif', 'ico'];
export const DOCUMENT_TARGETS: readonly TargetId[] = ['pdf'];
export { AUDIO_TARGETS };
export const ALL_TARGETS: readonly TargetId[] = [...IMAGE_TARGETS, ...DOCUMENT_TARGETS, ...AUDIO_TARGETS];
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
};

/** Во что можно сконвертировать файл этого вида (пусто — файл не поддерживается). Аудио и видео — в аудио. */
export function targetsFor(kind: SniffKind): TargetId[] {
  if (kind === 'unknown') return [];
  if (kind === 'pdf') return [...PAGE_TARGETS];
  if (isMediaKind(kind)) return AUDIO_TARGETS.filter((target) => target !== OWN_TARGET[kind]);
  return [...IMAGE_TARGETS, ...DOCUMENT_TARGETS].filter((target) => target !== OWN_TARGET[kind]);
}

/**
 * Что делать с файлом: image — картинка в картинку, document — картинка в свой PDF, pages — страницы PDF картинками
 * (у каждой страницы своя строка под строкой документа), media — аудио и видео через mediabunny.
 */
export function jobFor(kind: SniffKind, target: TargetId): 'image' | 'document' | 'pages' | 'media' {
  if (kind === 'pdf') return 'pages';
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
    metadata: any(({ kind, target }) => kind !== 'pdf' && target !== 'ico' && target !== 'pdf' && !isAudioTarget(target)),
    pngWarning: any(({ kind, target }) => kind !== 'pdf' && target === 'png'),
    icoHint: any(({ target }) => target === 'ico'),
    avifHint: any(({ target }) => target === 'avif'),
    dpi: any(({ kind }) => kind === 'pdf'),
    pdfLayout: any(({ target }) => target === 'pdf'),
    audioBitrate: any(({ target }) => lossyAudio(target)),
  };
}

/**
 * Настройки, с которыми файл сконвертирован, — только те, что влияют на этот формат: смена качества не делает
 * устаревшим PNG, галочка метаданных — ICO. Готовый файл с другим ключом можно «Конвертировать заново».
 */
export function settingsKey({ kind, target }: TargetPair, settings: TargetSettings): string {
  // картинка → PDF: качество страницы постоянное, размер страницы и поля применяются при сборке без перекодирования
  if (target === 'pdf') return target;
  // аудио: важен только битрейт (и только с потерями)
  if (isAudioTarget(target)) return lossyAudio(target) ? `${target}:b${settings.audioBitrate}` : target;
  const parts: string[] = [target];
  if (target === 'webp') parts.push(settings.lossless ? 'lossless' : 'lossy');
  if (lossy(target, settings.lossless)) parts.push(`q${settings.quality}`);
  if (kind === 'pdf') parts.push(`dpi${settings.dpi}`);
  else if (target !== 'ico') parts.push(settings.keepMetadata ? 'all' : 'dates');
  return parts.join(':');
}
