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

export type InputFormatId = keyof typeof INPUT_FORMATS;
export type DocumentFormatId = keyof typeof DOCUMENT_FORMATS;
/** Всё, что инструмент называет своим входом (accept, заголовок зоны). */
export const SOURCE_FORMATS: Record<InputFormatId | DocumentFormatId, { label: string; accept: string }> = { ...INPUT_FORMATS, ...DOCUMENT_FORMATS };
export type OutputFormatId = keyof typeof OUTPUT_FORMATS;
/** Выбор в переключателе формата: конкретный формат или «Исходный» (формат входа; HEIC и AVIF — в JPG). */
export type OutputChoiceId = OutputFormatId | 'original';

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
/** Инструменты раздела «PDF» на главной. */
export const PDF_MODES: ToolMode[] = ['to-pdf', 'from-pdf', 'merge-pdf'];
/** Универсальный виджет: формат результата выбирается у каждого файла (решение владельца 20.10.2026). */
export const UNIVERSAL_MODES: ToolMode[] = ['convert', 'from-pdf'];

export interface ToolConfig {
  id: string;
  mode: ToolMode;
  /** Слаг страницы на каждом языке (без префикса /en/). */
  slugs: Record<Locale, string>;
  /** Форматы, которые страница называет своими (accept, заголовок зоны); остальные поддерживаемые тоже принимаются. */
  inputFormats: (InputFormatId | DocumentFormatId)[];
  /** У пар форматов — предустановка: с этим форматом файлы встают в очередь (его можно сменить у каждого файла). */
  defaultOutput: OutputChoiceId;
  /**
   * Переключатель формата (общий для всех файлов) — только у режимов без выбора у файла: сжатие и размер
   * («Исходный» и основные форматы); у метаданных, EXIF, «Изображения в PDF» и «Объединить PDF» — ['original'].
   * У пар форматов его нет: формат выбирается у каждого файла (UNIVERSAL_MODES).
   */
  outputs?: OutputChoiceId[];
  /** Качество по умолчанию для форматов с потерями. */
  defaultQuality: number;
  /** Имя файла с текстами в src/content/tools/<locale>/. */
  content: string;
  /** Перелинковка, заданная вручную (для сжатия и размера); у конвертеров строится по форматам. */
  related?: string[];
}

/** Сжатие и изменение размера: по умолчанию формат сохраняется. */
const SAME_OR_ANY: OutputChoiceId[] = ['original', 'jpeg', 'png', 'webp'];
const ALL_INPUTS: InputFormatId[] = ['heic', 'avif', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'jxl'];

/** Сначала обработка (сжатие, размер, метаданные), затем PDF и конвертеры по входному формату: так идут карточки на главной и ссылки в подвале. */
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
];

export function getTool(id: string): ToolConfig {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Неизвестный инструмент: ${id}`);
  return tool;
}

export interface ToolGroups {
  /** Сжатие, размер, метаданные, EXIF. */
  photo: ToolConfig[];
  pdf: ToolConfig[];
  /** Пары форматов. */
  converters: ToolConfig[];
}

/** Группы инструментов для главной, меню и подвала — в порядке TOOLS. */
export function toolGroups(): ToolGroups {
  return {
    photo: TOOLS.filter((t) => t.mode !== 'convert' && !PDF_MODES.includes(t.mode)),
    pdf: TOOLS.filter((t) => PDF_MODES.includes(t.mode)),
    converters: TOOLS.filter((t) => t.mode === 'convert'),
  };
}

/**
 * Перелинковка внизу страницы: обратная конвертация, тот же вход в другие форматы,
 * тот же выход из других форматов (в порядке TOOLS). Не больше четырёх.
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
  ];
  return [...new Set(ordered)].slice(0, limit);
}
