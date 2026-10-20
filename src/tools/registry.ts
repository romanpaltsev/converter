// Реестр инструментов: один объект на страницу-конвертер.
// Новый инструмент = запись здесь + YAML с текстами в src/content/tools/{ru,en}/<content>.yaml.
// Новый формат = декодер/кодировщик в src/converter/pipeline + строка в таблицах ниже.

import type { Locale } from '../config/site';
import type { DecoderId, EncoderId } from '../converter/pipeline/types';

/** Входные форматы; ключ совпадает с видом формата из pipeline/sniff.ts. */
export const INPUT_FORMATS = {
  heic: {
    label: 'HEIC',
    /** Атрибут accept поля выбора файлов. */
    accept: '.heic,.heif,image/heic,image/heif',
    decoder: 'heic',
  },
  avif: { label: 'AVIF', accept: '.avif,image/avif', decoder: 'avif' },
  jpeg: { label: 'JPG', accept: '.jpg,.jpeg,.jfif,.jpe,image/jpeg', decoder: 'jpeg' },
  png: { label: 'PNG', accept: '.png,.apng,image/png,image/apng', decoder: 'png' },
  webp: { label: 'WebP', accept: '.webp,image/webp', decoder: 'webp' },
  gif: { label: 'GIF', accept: '.gif,image/gif', decoder: 'gif' },
  bmp: { label: 'BMP', accept: '.bmp,.dib,image/bmp,image/x-ms-bmp', decoder: 'bmp' },
  tiff: { label: 'TIFF', accept: '.tif,.tiff,image/tiff', decoder: 'tiff' },
  jxl: { label: 'JPEG XL', accept: '.jxl,image/jxl', decoder: 'jxl' },
} as const satisfies Record<string, { label: string; accept: string; decoder: DecoderId }>;

/** Документы — вход инструментов «PDF в JPG/PNG» (не изображения: декодеров изображений у них нет). */
export const DOCUMENT_FORMATS = {
  pdf: { label: 'PDF', accept: '.pdf,application/pdf' },
} as const satisfies Record<string, { label: string; accept: string }>;

export const OUTPUT_FORMATS = {
  jpeg: { label: 'JPG', extension: 'jpg', encoder: 'jpeg', hasQuality: true, hasLossless: false, largeFiles: false },
  png: { label: 'PNG', extension: 'png', encoder: 'png', hasQuality: false, hasLossless: false, largeFiles: true },
  webp: { label: 'WebP', extension: 'webp', encoder: 'webp', hasQuality: true, hasLossless: true, largeFiles: false },
  ico: { label: 'ICO', extension: 'ico', encoder: 'ico', hasQuality: false, hasLossless: false, largeFiles: false },
  avif: { label: 'AVIF', extension: 'avif', encoder: 'avif', hasQuality: true, hasLossless: false, largeFiles: false },
} as const satisfies Record<
  string,
  { label: string; extension: string; encoder: EncoderId; hasQuality: boolean; hasLossless: boolean; largeFiles: boolean }
>;

/**
 * Аудио и видео на входе (ключ — вид из pipeline/sniff.ts): читает mediabunny, в аудио — любой из них
 * (из видео — звуковая дорожка). MIME в accept — и стандартные, и встречающиеся у Windows/Android.
 */
export const MEDIA_FORMATS = {
  mp3: { label: 'MP3', accept: '.mp3,audio/mpeg,audio/mp3' },
  wav: { label: 'WAV', accept: '.wav,audio/wav,audio/x-wav,audio/wave' },
  flac: { label: 'FLAC', accept: '.flac,audio/flac,audio/x-flac' },
  ogg: { label: 'OGG', accept: '.ogg,.oga,audio/ogg' },
  opus: { label: 'Opus', accept: '.opus,audio/opus' },
  aac: { label: 'AAC', accept: '.aac,audio/aac,audio/x-aac' },
  m4a: { label: 'M4A', accept: '.m4a,.m4b,audio/mp4,audio/x-m4a' },
  mp4: { label: 'MP4', accept: '.mp4,.m4v,video/mp4' },
  mov: { label: 'MOV', accept: '.mov,video/quicktime' },
  webm: { label: 'WebM', accept: '.webm,.weba,video/webm,audio/webm' },
  mkv: { label: 'MKV', accept: '.mkv,video/x-matroska' },
} as const satisfies Record<string, { label: string; accept: string }>;

export const AUDIO_TARGETS = ['mp3', 'wav', 'm4a', 'ogg', 'flac'] as const;
export type AudioTargetId = (typeof AUDIO_TARGETS)[number];

export interface AudioFormat {
  label: string;
  extension: string;
  mime: string;
  /** Кодек mediabunny: OGG — это Opus в Ogg (Vorbis браузеры не кодируют), WAV — PCM 16 бит. */
  codec: 'mp3' | 'pcm-s16' | 'aac' | 'opus' | 'flac';
  /** С потерями: битрейт выбирается в настройках. */
  lossy: boolean;
}

/** Аудио на выходе (меню форматов «Аудио»); кодек — имя кодека mediabunny. */
export const AUDIO_FORMATS: Record<AudioTargetId, AudioFormat> = {
  mp3: { label: 'MP3', extension: 'mp3', mime: 'audio/mpeg', codec: 'mp3', lossy: true },
  wav: { label: 'WAV', extension: 'wav', mime: 'audio/wav', codec: 'pcm-s16', lossy: false },
  m4a: { label: 'M4A', extension: 'm4a', mime: 'audio/mp4', codec: 'aac', lossy: true },
  ogg: { label: 'OGG', extension: 'ogg', mime: 'audio/ogg', codec: 'opus', lossy: true },
  flac: { label: 'FLAC', extension: 'flac', mime: 'audio/flac', codec: 'flac', lossy: false },
};

export function isAudioTarget(target: string): target is AudioTargetId {
  return (AUDIO_TARGETS as readonly string[]).includes(target);
}

/** Видео на выходе (меню «Видео»): MP4 — H.264 и AAC, WebM — VP9 и Opus (запасные кодеки — в media/video.ts); GIF — без звука. */
export const VIDEO_TARGETS = ['mp4', 'webm', 'gif'] as const;
export type VideoTargetId = (typeof VIDEO_TARGETS)[number];

export const VIDEO_FORMATS: Record<VideoTargetId, { label: string; extension: string; mime: string }> = {
  mp4: { label: 'MP4', extension: 'mp4', mime: 'video/mp4' },
  webm: { label: 'WebM', extension: 'webm', mime: 'video/webm' },
  gif: { label: 'GIF', extension: 'gif', mime: 'image/gif' },
};

export function isVideoTarget(target: string): target is VideoTargetId {
  return (VIDEO_TARGETS as readonly string[]).includes(target);
}

/**
 * Документы и таблицы на входе (ключ — вид из pipeline/sniff.ts). У текстовых форматов нет сигнатуры: вид — по
 * расширению, а содержимое проверяется на «текст» (sniffFile); XLSX — ZIP с расширением .xlsx.
 */
export const TEXT_FORMATS = {
  txt: { label: 'TXT', accept: '.txt,text/plain' },
  md: { label: 'Markdown', accept: '.md,.markdown,text/markdown' },
  html: { label: 'HTML', accept: '.html,.htm,text/html' },
  csv: { label: 'CSV', accept: '.csv,.tsv,text/csv,text/tab-separated-values' },
  json: { label: 'JSON', accept: '.json,application/json' },
  xlsx: { label: 'XLSX', accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
} as const satisfies Record<string, { label: string; accept: string }>;

/** Документы и таблицы на выходе (PDF — общий пункт с «картинка в PDF», TargetId 'pdf'). */
export const DOC_TARGETS = ['html', 'txt', 'xlsx', 'csv', 'json'] as const;
export type DocTargetId = (typeof DOC_TARGETS)[number];

export const DOC_FORMATS: Record<DocTargetId | 'pdf', { label: string; extension: string; mime: string }> = {
  pdf: { label: 'PDF', extension: 'pdf', mime: 'application/pdf' },
  html: { label: 'HTML', extension: 'html', mime: 'text/html' },
  txt: { label: 'TXT', extension: 'txt', mime: 'text/plain' },
  xlsx: { label: 'XLSX', extension: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  csv: { label: 'CSV', extension: 'csv', mime: 'text/csv' },
  json: { label: 'JSON', extension: 'json', mime: 'application/json' },
};

export function isDocTarget(target: string): target is DocTargetId {
  return (DOC_TARGETS as readonly string[]).includes(target);
}

export type InputFormatId = keyof typeof INPUT_FORMATS;
export type DocumentFormatId = keyof typeof DOCUMENT_FORMATS;
export type MediaFormatId = keyof typeof MEDIA_FORMATS;
export type TextFormatId = keyof typeof TEXT_FORMATS;
export type SourceFormatId = InputFormatId | DocumentFormatId | MediaFormatId | TextFormatId;
/** Всё, что инструмент называет своим входом (accept, заголовок зоны). */
export const SOURCE_FORMATS: Record<SourceFormatId, { label: string; accept: string }> = { ...INPUT_FORMATS, ...DOCUMENT_FORMATS, ...MEDIA_FORMATS, ...TEXT_FORMATS };
export type OutputFormatId = keyof typeof OUTPUT_FORMATS;
/** Выбор в переключателе формата: конкретный формат, аудио или «Исходный» (формат входа; HEIC и AVIF — в JPG). */
export type OutputChoiceId = OutputFormatId | AudioTargetId | VideoTargetId | DocTargetId | 'pdf' | 'original';

/**
 * convert — конвертер из одного формата в другой (вход в формате выхода — ошибка «уже в формате …»);
 * compress — «Сжать фото» (качество или целевой размер); resize — «Изменить размер»;
 * strip — «Удалить метаданные» (без перекодирования: формат и пиксели те же, выбора формата нет);
 * inspect — «Посмотреть EXIF» (только чтение: настроек и файлов-результатов нет);
 * to-pdf — «Изображения в PDF» (все файлы — страницы одного документа, порядок задаёт пользователь);
 * from-pdf — «PDF в JPG/PNG» (каждая страница PDF — отдельная картинка);
 * merge-pdf — «Объединить PDF» (документы по порядку → один PDF).
 */
export type ToolMode = 'convert' | 'compress' | 'resize' | 'strip' | 'inspect' | 'to-pdf' | 'from-pdf' | 'merge-pdf';

/** Режимы, у которых формат результата не выбирается. */
export const FIXED_OUTPUT_MODES: ToolMode[] = ['strip', 'inspect', 'to-pdf', 'merge-pdf'];
/** Инструменты раздела «PDF». */
export const PDF_MODES: ToolMode[] = ['to-pdf', 'from-pdf', 'merge-pdf'];
/** Универсальный виджет: формат результата выбирается у каждого файла (решение владельца 20.10.2026). */
export const UNIVERSAL_MODES: ToolMode[] = ['convert', 'from-pdf'];

export interface ToolConfig {
  id: string;
  mode: ToolMode;
  /** Слаг страницы на каждом языке (без префикса /en/). */
  slugs: Record<Locale, string>;
  /** Форматы, которые страница называет своими (accept, заголовок зоны); остальные поддерживаемые тоже принимаются. */
  inputFormats: SourceFormatId[];
  /** У пар форматов — предустановка: с этим форматом файлы встают в очередь (его можно сменить у каждого файла). */
  defaultOutput: OutputChoiceId;
  /**
   * Переключатель формата (общий для всех файлов) — только у режимов без выбора у файла: сжатие и размер
   * («Исходный» и основные форматы); у метаданных, EXIF, «Изображения в PDF» и «Объединить PDF» — ['original'].
   * У пар форматов его нет: формат выбирается у каждого файла (UNIVERSAL_MODES).
   */
  outputs?: (OutputFormatId | 'original')[];
  /** Качество по умолчанию для форматов с потерями. */
  defaultQuality: number;
  /** Имя файла с текстами в src/content/tools/<locale>/. */
  content: string;
  /** Перелинковка, заданная вручную (для сжатия и размера); у конвертеров строится по форматам. */
  related?: string[];
}

/** Сжатие и изменение размера: по умолчанию формат сохраняется. */
const SAME_OR_ANY: (OutputFormatId | 'original')[] = ['original', 'jpeg', 'png', 'webp'];
const ALL_INPUTS: InputFormatId[] = ['heic', 'avif', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'jxl'];

/** Сначала обработка (сжатие, размер, метаданные), затем PDF и конвертеры по входному формату; на сайте — по разделам (TOOL_CATEGORIES), внутри раздела — в этом порядке. */
export const TOOLS: ToolConfig[] = [
  {
    id: 'compress-image',
    mode: 'compress',
    slugs: { ru: 'szhat-foto', en: 'compress-image' },
    inputFormats: ALL_INPUTS,
    defaultOutput: 'original',
    outputs: SAME_OR_ANY,
    defaultQuality: 75,
    content: 'compress-image',
    related: ['resize-image', 'remove-metadata', 'heic-to-jpg', 'jpg-to-webp'],
  },
  {
    id: 'resize-image',
    mode: 'resize',
    slugs: { ru: 'izmenit-razmer-foto', en: 'resize-image' },
    inputFormats: ALL_INPUTS,
    defaultOutput: 'original',
    outputs: SAME_OR_ANY,
    defaultQuality: 90,
    content: 'resize-image',
    related: ['compress-image', 'remove-metadata', 'heic-to-jpg', 'jpg-to-webp'],
  },
  {
    id: 'remove-metadata',
    mode: 'strip',
    slugs: { ru: 'udalit-metadannye-foto', en: 'remove-exif' },
    inputFormats: ALL_INPUTS,
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'remove-metadata',
    related: ['exif-viewer', 'compress-image', 'resize-image', 'heic-to-jpg'],
  },
  {
    id: 'exif-viewer',
    mode: 'inspect',
    slugs: { ru: 'posmotret-exif', en: 'exif-viewer' },
    inputFormats: ALL_INPUTS,
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'exif-viewer',
    related: ['remove-metadata', 'compress-image', 'resize-image', 'heic-to-jpg'],
  },
  {
    id: 'jpg-to-pdf',
    mode: 'to-pdf',
    slugs: { ru: 'jpg-v-pdf', en: 'jpg-to-pdf' },
    inputFormats: ['jpeg'],
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'jpg-to-pdf',
    related: ['png-to-pdf', 'heic-to-pdf', 'merge-pdf', 'pdf-to-jpg'],
  },
  {
    id: 'png-to-pdf',
    mode: 'to-pdf',
    slugs: { ru: 'png-v-pdf', en: 'png-to-pdf' },
    inputFormats: ['png'],
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'png-to-pdf',
    related: ['jpg-to-pdf', 'heic-to-pdf', 'png-to-jpg', 'compress-image'],
  },
  {
    id: 'heic-to-pdf',
    mode: 'to-pdf',
    slugs: { ru: 'heic-v-pdf', en: 'heic-to-pdf' },
    inputFormats: ['heic'],
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'heic-to-pdf',
    related: ['jpg-to-pdf', 'png-to-pdf', 'heic-to-jpg', 'heic-to-png'],
  },
  {
    id: 'merge-pdf',
    mode: 'merge-pdf',
    slugs: { ru: 'obedinit-pdf', en: 'merge-pdf' },
    inputFormats: ['pdf'],
    defaultOutput: 'original',
    outputs: ['original'],
    defaultQuality: 90,
    content: 'merge-pdf',
    related: ['jpg-to-pdf', 'pdf-to-jpg', 'png-to-pdf', 'heic-to-pdf'],
  },
  {
    id: 'pdf-to-jpg',
    mode: 'from-pdf',
    slugs: { ru: 'pdf-v-jpg', en: 'pdf-to-jpg' },
    inputFormats: ['pdf'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'pdf-to-jpg',
    related: ['pdf-to-png', 'jpg-to-pdf', 'merge-pdf', 'compress-image'],
  },
  {
    id: 'pdf-to-png',
    mode: 'from-pdf',
    slugs: { ru: 'pdf-v-png', en: 'pdf-to-png' },
    inputFormats: ['pdf'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'pdf-to-png',
    related: ['pdf-to-jpg', 'png-to-pdf', 'jpg-to-pdf', 'png-to-jpg'],
  },
  {
    id: 'heic-to-jpg',
    mode: 'convert',
    slugs: { ru: 'heic-v-jpg', en: 'heic-to-jpg' },
    inputFormats: ['heic'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'heic-to-jpg',
  },
  {
    id: 'heic-to-png',
    mode: 'convert',
    slugs: { ru: 'heic-v-png', en: 'heic-to-png' },
    inputFormats: ['heic'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'heic-to-png',
  },
  {
    id: 'heic-to-webp',
    mode: 'convert',
    slugs: { ru: 'heic-v-webp', en: 'heic-to-webp' },
    inputFormats: ['heic'],
    defaultOutput: 'webp',
    defaultQuality: 90,
    content: 'heic-to-webp',
  },
  {
    id: 'avif-to-jpg',
    mode: 'convert',
    slugs: { ru: 'avif-v-jpg', en: 'avif-to-jpg' },
    inputFormats: ['avif'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'avif-to-jpg',
  },
  {
    id: 'avif-to-png',
    mode: 'convert',
    slugs: { ru: 'avif-v-png', en: 'avif-to-png' },
    inputFormats: ['avif'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'avif-to-png',
  },
  {
    id: 'jpg-to-png',
    mode: 'convert',
    slugs: { ru: 'jpg-v-png', en: 'jpg-to-png' },
    inputFormats: ['jpeg'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'jpg-to-png',
  },
  {
    id: 'jpg-to-webp',
    mode: 'convert',
    slugs: { ru: 'jpg-v-webp', en: 'jpg-to-webp' },
    inputFormats: ['jpeg'],
    defaultOutput: 'webp',
    defaultQuality: 90,
    content: 'jpg-to-webp',
  },
  {
    id: 'jpg-to-ico',
    mode: 'convert',
    slugs: { ru: 'jpg-v-ico', en: 'jpg-to-ico' },
    inputFormats: ['jpeg'],
    defaultOutput: 'ico',
    defaultQuality: 90,
    content: 'jpg-to-ico',
  },
  {
    id: 'jpg-to-avif',
    mode: 'convert',
    slugs: { ru: 'jpg-v-avif', en: 'jpg-to-avif' },
    inputFormats: ['jpeg'],
    defaultOutput: 'avif',
    defaultQuality: 75,
    content: 'jpg-to-avif',
  },
  {
    id: 'png-to-jpg',
    mode: 'convert',
    slugs: { ru: 'png-v-jpg', en: 'png-to-jpg' },
    inputFormats: ['png'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'png-to-jpg',
  },
  {
    id: 'png-to-webp',
    mode: 'convert',
    slugs: { ru: 'png-v-webp', en: 'png-to-webp' },
    inputFormats: ['png'],
    defaultOutput: 'webp',
    defaultQuality: 90,
    content: 'png-to-webp',
  },
  {
    id: 'png-to-ico',
    mode: 'convert',
    slugs: { ru: 'png-v-ico', en: 'png-to-ico' },
    inputFormats: ['png'],
    defaultOutput: 'ico',
    defaultQuality: 90,
    content: 'png-to-ico',
  },
  {
    id: 'png-to-avif',
    mode: 'convert',
    slugs: { ru: 'png-v-avif', en: 'png-to-avif' },
    inputFormats: ['png'],
    defaultOutput: 'avif',
    defaultQuality: 75,
    content: 'png-to-avif',
  },
  {
    id: 'webp-to-jpg',
    mode: 'convert',
    slugs: { ru: 'webp-v-jpg', en: 'webp-to-jpg' },
    inputFormats: ['webp'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'webp-to-jpg',
  },
  {
    id: 'webp-to-png',
    mode: 'convert',
    slugs: { ru: 'webp-v-png', en: 'webp-to-png' },
    inputFormats: ['webp'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'webp-to-png',
  },
  {
    id: 'gif-to-jpg',
    mode: 'convert',
    slugs: { ru: 'gif-v-jpg', en: 'gif-to-jpg' },
    inputFormats: ['gif'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'gif-to-jpg',
  },
  {
    id: 'gif-to-png',
    mode: 'convert',
    slugs: { ru: 'gif-v-png', en: 'gif-to-png' },
    inputFormats: ['gif'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'gif-to-png',
  },
  {
    id: 'bmp-to-jpg',
    mode: 'convert',
    slugs: { ru: 'bmp-v-jpg', en: 'bmp-to-jpg' },
    inputFormats: ['bmp'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'bmp-to-jpg',
  },
  {
    id: 'bmp-to-png',
    mode: 'convert',
    slugs: { ru: 'bmp-v-png', en: 'bmp-to-png' },
    inputFormats: ['bmp'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'bmp-to-png',
  },
  {
    id: 'tiff-to-jpg',
    mode: 'convert',
    slugs: { ru: 'tiff-v-jpg', en: 'tiff-to-jpg' },
    inputFormats: ['tiff'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'tiff-to-jpg',
  },
  {
    id: 'tiff-to-png',
    mode: 'convert',
    slugs: { ru: 'tiff-v-png', en: 'tiff-to-png' },
    inputFormats: ['tiff'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'tiff-to-png',
  },
  {
    id: 'jxl-to-jpg',
    mode: 'convert',
    slugs: { ru: 'jxl-v-jpg', en: 'jxl-to-jpg' },
    inputFormats: ['jxl'],
    defaultOutput: 'jpeg',
    defaultQuality: 90,
    content: 'jxl-to-jpg',
  },
  {
    id: 'jxl-to-png',
    mode: 'convert',
    slugs: { ru: 'jxl-v-png', en: 'jxl-to-png' },
    inputFormats: ['jxl'],
    defaultOutput: 'png',
    defaultQuality: 90,
    content: 'jxl-to-png',
  },
  // аудио (раздел «Аудио»): в MP3 из популярных форматов и из видео, MP3 в WAV
  {
    id: 'mp4-to-mp3',
    mode: 'convert',
    slugs: { ru: 'mp4-v-mp3', en: 'mp4-to-mp3' },
    inputFormats: ['mp4'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'mp4-to-mp3',
  },
  {
    id: 'wav-to-mp3',
    mode: 'convert',
    slugs: { ru: 'wav-v-mp3', en: 'wav-to-mp3' },
    inputFormats: ['wav'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'wav-to-mp3',
  },
  {
    id: 'm4a-to-mp3',
    mode: 'convert',
    slugs: { ru: 'm4a-v-mp3', en: 'm4a-to-mp3' },
    inputFormats: ['m4a'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'm4a-to-mp3',
  },
  {
    id: 'flac-to-mp3',
    mode: 'convert',
    slugs: { ru: 'flac-v-mp3', en: 'flac-to-mp3' },
    inputFormats: ['flac'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'flac-to-mp3',
  },
  {
    id: 'ogg-to-mp3',
    mode: 'convert',
    slugs: { ru: 'ogg-v-mp3', en: 'ogg-to-mp3' },
    inputFormats: ['ogg'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'ogg-to-mp3',
  },
  {
    id: 'opus-to-mp3',
    mode: 'convert',
    slugs: { ru: 'opus-v-mp3', en: 'opus-to-mp3' },
    inputFormats: ['opus'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'opus-to-mp3',
  },
  {
    id: 'aac-to-mp3',
    mode: 'convert',
    slugs: { ru: 'aac-v-mp3', en: 'aac-to-mp3' },
    inputFormats: ['aac'],
    defaultOutput: 'mp3',
    defaultQuality: 90,
    content: 'aac-to-mp3',
  },
  {
    id: 'mp3-to-wav',
    mode: 'convert',
    slugs: { ru: 'mp3-v-wav', en: 'mp3-to-wav' },
    inputFormats: ['mp3'],
    defaultOutput: 'wav',
    defaultQuality: 90,
    content: 'mp3-to-wav',
  },
  // видео (раздел «Видео»): перепаковка и перекодирование в MP4 и WebM, видео в GIF
  {
    id: 'mov-to-mp4',
    mode: 'convert',
    slugs: { ru: 'mov-v-mp4', en: 'mov-to-mp4' },
    inputFormats: ['mov'],
    defaultOutput: 'mp4',
    defaultQuality: 90,
    content: 'mov-to-mp4',
  },
  {
    id: 'webm-to-mp4',
    mode: 'convert',
    slugs: { ru: 'webm-v-mp4', en: 'webm-to-mp4' },
    inputFormats: ['webm'],
    defaultOutput: 'mp4',
    defaultQuality: 90,
    content: 'webm-to-mp4',
  },
  {
    id: 'mkv-to-mp4',
    mode: 'convert',
    slugs: { ru: 'mkv-v-mp4', en: 'mkv-to-mp4' },
    inputFormats: ['mkv'],
    defaultOutput: 'mp4',
    defaultQuality: 90,
    content: 'mkv-to-mp4',
  },
  {
    id: 'mp4-to-webm',
    mode: 'convert',
    slugs: { ru: 'mp4-v-webm', en: 'mp4-to-webm' },
    inputFormats: ['mp4'],
    defaultOutput: 'webm',
    defaultQuality: 90,
    content: 'mp4-to-webm',
  },
  {
    id: 'mp4-to-gif',
    mode: 'convert',
    slugs: { ru: 'mp4-v-gif', en: 'mp4-to-gif' },
    inputFormats: ['mp4'],
    defaultOutput: 'gif',
    defaultQuality: 90,
    content: 'mp4-to-gif',
  },
  // документы и таблицы (раздел «Документы»): текст в PDF, Markdown в HTML, CSV/XLSX/JSON друг в друга
  {
    id: 'txt-to-pdf',
    mode: 'convert',
    slugs: { ru: 'txt-v-pdf', en: 'txt-to-pdf' },
    inputFormats: ['txt'],
    defaultOutput: 'pdf',
    defaultQuality: 90,
    content: 'txt-to-pdf',
  },
  {
    id: 'md-to-pdf',
    mode: 'convert',
    slugs: { ru: 'md-v-pdf', en: 'md-to-pdf' },
    inputFormats: ['md'],
    defaultOutput: 'pdf',
    defaultQuality: 90,
    content: 'md-to-pdf',
  },
  {
    id: 'html-to-pdf',
    mode: 'convert',
    slugs: { ru: 'html-v-pdf', en: 'html-to-pdf' },
    inputFormats: ['html'],
    defaultOutput: 'pdf',
    defaultQuality: 90,
    content: 'html-to-pdf',
  },
  {
    id: 'md-to-html',
    mode: 'convert',
    slugs: { ru: 'md-v-html', en: 'md-to-html' },
    inputFormats: ['md'],
    defaultOutput: 'html',
    defaultQuality: 90,
    content: 'md-to-html',
  },
  {
    id: 'csv-to-xlsx',
    mode: 'convert',
    slugs: { ru: 'csv-v-xlsx', en: 'csv-to-xlsx' },
    inputFormats: ['csv'],
    defaultOutput: 'xlsx',
    defaultQuality: 90,
    content: 'csv-to-xlsx',
  },
  {
    id: 'xlsx-to-csv',
    mode: 'convert',
    slugs: { ru: 'xlsx-v-csv', en: 'xlsx-to-csv' },
    inputFormats: ['xlsx'],
    defaultOutput: 'csv',
    defaultQuality: 90,
    content: 'xlsx-to-csv',
  },
  {
    id: 'json-to-csv',
    mode: 'convert',
    slugs: { ru: 'json-v-csv', en: 'json-to-csv' },
    inputFormats: ['json'],
    defaultOutput: 'csv',
    defaultQuality: 90,
    content: 'json-to-csv',
  },
  {
    id: 'csv-to-json',
    mode: 'convert',
    slugs: { ru: 'csv-v-json', en: 'csv-to-json' },
    inputFormats: ['csv'],
    defaultOutput: 'json',
    defaultQuality: 90,
    content: 'csv-to-json',
  },
];

export function getTool(id: string): ToolConfig {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Неизвестный инструмент: ${id}`);
  return tool;
}

/**
 * Разделы сайта по типу файлов (решение владельца 20.10.2026: конвертер «для разных файлов», как convertio) —
 * в этом порядке идут в меню, подвале и на главной. Раздел без инструментов не показывается: новые типы файлов
 * (аудио, видео, документы, книги) появляются вместе со своими инструментами.
 */
export const TOOL_CATEGORIES = ['images', 'photo', 'pdf', 'audio', 'video', 'documents', 'ebooks'] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/** Раздел инструмента: пары форматов изображений, обработка фото (сжатие, размер, метаданные, EXIF), PDF, документы, аудио и видео. */
export function toolCategory(tool: ToolConfig): ToolCategory {
  if (PDF_MODES.includes(tool.mode)) return 'pdf';
  // текст и таблицы (в том числе TXT в PDF) — раздел «Документы»
  if (tool.inputFormats.some((format) => format in TEXT_FORMATS)) return 'documents';
  // звук в аудиоформат — раздел «Аудио», в том числе из видео («MP4 в MP3»); видео в видео и в GIF — «Видео»
  if (isAudioTarget(tool.defaultOutput)) return 'audio';
  if (isVideoTarget(tool.defaultOutput)) return 'video';
  return tool.mode === 'convert' ? 'images' : 'photo';
}

export interface ToolGroup {
  id: ToolCategory;
  tools: ToolConfig[];
}

/** Непустые разделы для главной, меню и подвала; инструменты — в порядке TOOLS. */
export function toolGroups(): ToolGroup[] {
  return TOOL_CATEGORIES.map((id) => ({ id, tools: TOOLS.filter((tool) => toolCategory(tool) === id) })).filter((group) => group.tools.length > 0);
}

/**
 * Перелинковка внизу страницы: обратная конвертация, тот же вход в другие форматы,
 * тот же выход из других форматов, затем другие пары того же раздела (в порядке TOOLS). Не больше четырёх.
 */
export function relatedTools(tool: ToolConfig, limit = 4): ToolConfig[] {
  if (tool.related) return tool.related.map(getTool).slice(0, limit);
  const input: string = tool.inputFormats[0]!;
  const output: string = tool.defaultOutput;
  const others = TOOLS.filter((t) => t.id !== tool.id && t.mode === 'convert');
  const ordered = [
    ...others.filter((t) => t.inputFormats[0] === output && t.defaultOutput === input),
    ...others.filter((t) => t.inputFormats[0] === input),
    ...others.filter((t) => t.defaultOutput === output),
    ...others.filter((t) => toolCategory(t) === toolCategory(tool)),
  ];
  return [...new Set(ordered)].slice(0, limit);
}
