// Конфигурация виджета: сервер кладёт её в <script type="application/json" data-converter-config>.

import type { Locale } from '../../config/site';
import type { UiStrings } from '../../i18n/ui';
import type { OutputTarget } from '../pipeline/types';
import type { ToolMode } from '../../tools/registry';

export interface OutputOption {
  id: string;
  label: string;
  /** Кодировщик или 'original' — формат входа (HEIC и AVIF — JPG), выясняется по сигнатуре каждого файла. */
  encoder: OutputTarget;
  hasQuality: boolean;
  hasLossless: boolean;
  largeFiles: boolean;
}

export interface WidgetConfig {
  toolId: string;
  mode: ToolMode;
  locale: Locale;
  outputs: OutputOption[];
  defaultOutput: string;
  maxFiles: number;
  /** Имя ZIP-архива без расширения. */
  zipName: string;
  /** Страница для снимков с iPhone: к ошибке «уже JPG» добавляется пояснение про автоматическое перекодирование. */
  iphoneHint: boolean;
  strings: UiStrings['widget'];
}

export function readConfig(root: HTMLElement): WidgetConfig {
  const node = root.querySelector('script[data-converter-config]');
  if (!node?.textContent) throw new Error('converter: нет конфигурации');
  return JSON.parse(node.textContent) as WidgetConfig;
}
