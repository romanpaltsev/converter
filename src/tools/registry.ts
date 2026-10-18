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
  jpeg: { label: 'JPG', accept: '.jpg,.jpeg,.jfif,.jpe,image/jpeg', decoder: 'jpeg' },
  png: { label: 'PNG', accept: '.png,.apng,image/png,image/apng', decoder: 'png' },
} as const satisfies Record<string, { label: string; accept: string; decoder: DecoderId }>;

export const OUTPUT_FORMATS = {
  jpeg: { label: 'JPG', extension: 'jpg', encoder: 'jpeg', hasQuality: true, largeFiles: false },
  png: { label: 'PNG', extension: 'png', encoder: 'png', hasQuality: false, largeFiles: true },
} as const satisfies Record<string, { label: string; extension: string; encoder: EncoderId; hasQuality: boolean; largeFiles: boolean }>;

export type InputFormatId = keyof typeof INPUT_FORMATS;
export type OutputFormatId = keyof typeof OUTPUT_FORMATS;

export interface ToolConfig {
  id: string;
  /** Слаг страницы на каждом языке (без префикса /en/). */
  slugs: Record<Locale, string>;
  inputFormats: InputFormatId[];
  defaultOutput: OutputFormatId;
  /** Допустимые выходные форматы (переключатель в виджете), по порядку. */
  outputs: OutputFormatId[];
  /** Имя файла с текстами в src/content/tools/<locale>/. */
  content: string;
}

/** Порядок — по входному формату: так идут карточки на главной и ссылки в подвале. */
export const TOOLS: ToolConfig[] = [
  {
    id: 'heic-to-jpg',
    slugs: { ru: 'heic-v-jpg', en: 'heic-to-jpg' },
    inputFormats: ['heic'],
    defaultOutput: 'jpeg',
    outputs: ['jpeg', 'png'],
    content: 'heic-to-jpg',
  },
  {
    id: 'heic-to-png',
    slugs: { ru: 'heic-v-png', en: 'heic-to-png' },
    inputFormats: ['heic'],
    defaultOutput: 'png',
    outputs: ['jpeg', 'png'],
    content: 'heic-to-png',
  },
  {
    id: 'jpg-to-png',
    slugs: { ru: 'jpg-v-png', en: 'jpg-to-png' },
    inputFormats: ['jpeg'],
    defaultOutput: 'png',
    outputs: ['jpeg', 'png'],
    content: 'jpg-to-png',
  },
  {
    id: 'png-to-jpg',
    slugs: { ru: 'png-v-jpg', en: 'png-to-jpg' },
    inputFormats: ['png'],
    defaultOutput: 'jpeg',
    outputs: ['jpeg', 'png'],
    content: 'png-to-jpg',
  },
];

export function getTool(id: string): ToolConfig {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Неизвестный инструмент: ${id}`);
  return tool;
}

/**
 * Перелинковка внизу страницы: обратная конвертация, тот же вход в другие форматы,
 * тот же выход из других форматов (в порядке TOOLS). Не больше четырёх.
 */
export function relatedTools(tool: ToolConfig, limit = 4): ToolConfig[] {
  const input: string = tool.inputFormats[0]!;
  const output: string = tool.defaultOutput;
  const others = TOOLS.filter((t) => t.id !== tool.id);
  const ordered = [
    ...others.filter((t) => t.inputFormats[0] === output && t.defaultOutput === input),
    ...others.filter((t) => t.inputFormats[0] === input),
    ...others.filter((t) => t.defaultOutput === output),
  ];
  return [...new Set(ordered)].slice(0, limit);
}
