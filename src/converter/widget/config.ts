// Конфигурация виджета: сервер кладёт её в <script type="application/json" data-converter-config>.

import type { Locale } from '../../config/site';
import type { UiStrings } from '../../i18n/ui';
import type { SniffKind } from '../pipeline/sniff';
import type { OutputTarget } from '../pipeline/types';
import type { ToolMode } from '../../tools/registry';
import type { TargetId } from './targets';

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
  /** Формат выбирается у каждого файла (меню в строке и «Все файлы в …»), общего переключателя нет. */
  universal: boolean;
  /** Универсальный виджет: формат, с которым файлы встают в очередь (null — ждут выбора), и вход страницы. */
  preset: TargetId | null;
  presetKind: SniffKind | null;
  /** Подписи форматов в меню и на кнопках строк. */
  targets: { id: TargetId; label: string }[];
  /** Общий переключатель формата (сжатие, размер, PDF в JPG); у универсального — пусто. */
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
