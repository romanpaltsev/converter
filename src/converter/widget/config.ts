// Конфигурация виджета: сервер кладёт её в <script type="application/json" data-converter-config>.

import type { Locale } from '../../config/site';
import type { UiStrings } from '../../i18n/ui';
import type { DecoderId, EncoderId } from '../pipeline/types';

export interface OutputOption {
  id: string;
  label: string;
  extension: string;
  encoder: EncoderId;
  hasQuality: boolean;
  largeFiles: boolean;
}

export interface WidgetConfig {
  toolId: string;
  locale: Locale;
  decoder: DecoderId;
  outputs: OutputOption[];
  defaultOutput: string;
  maxFiles: number;
  /** Имя ZIP-архива без расширения. */
  zipName: string;
  strings: UiStrings['widget'];
}

export function readConfig(root: HTMLElement): WidgetConfig {
  const node = root.querySelector('script[data-converter-config]');
  if (!node?.textContent) throw new Error('converter: нет конфигурации');
  return JSON.parse(node.textContent) as WidgetConfig;
}
