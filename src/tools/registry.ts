// Реестр инструментов: один объект на страницу-конвертер.
// Новый инструмент = запись здесь + YAML с текстами в src/content/tools/{ru,en}/<content>.yaml.
// Новый формат = декодер/кодировщик в src/converter/pipeline + строка в таблицах ниже.

import type { Locale } from '../config/site';
import type { DecoderId, EncoderId } from '../converter/pipeline/types';

export const INPUT_FORMATS = {
  heic: {
    label: 'HEIC',
    /** Атрибут accept поля выбора файлов. */
    accept: '.heic,.heif,image/heic,image/heif',
    decoder: 'heic',
  },
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
  /** Инструменты для перелинковки внизу страницы. */
  related: string[];
}

export const TOOLS: ToolConfig[] = [
  {
    id: 'heic-to-jpg',
    slugs: { ru: 'heic-v-jpg', en: 'heic-to-jpg' },
    inputFormats: ['heic'],
    defaultOutput: 'jpeg',
    outputs: ['jpeg', 'png'],
    content: 'heic-to-jpg',
    related: ['heic-to-png'],
  },
  {
    id: 'heic-to-png',
    slugs: { ru: 'heic-v-png', en: 'heic-to-png' },
    inputFormats: ['heic'],
    defaultOutput: 'png',
    outputs: ['jpeg', 'png'],
    content: 'heic-to-png',
    related: ['heic-to-jpg'],
  },
];

export function getTool(id: string): ToolConfig {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Неизвестный инструмент: ${id}`);
  return tool;
}
