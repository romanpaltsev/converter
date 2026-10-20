// Ссылки на инструменты с короткими названиями из текстов (card.title) — для подвала и меню в шапке.

import { getEntry } from 'astro:content';
import type { Locale } from '../config/site';
import { pagePath, toolPageId } from '../i18n/routes';
import type { ToolConfig } from '../tools/registry';

export interface ToolLink {
  href: string;
  title: string;
}

export function toolLinks(tools: ToolConfig[], locale: Locale): Promise<ToolLink[]> {
  return Promise.all(
    tools.map(async (tool) => {
      const entry = await getEntry('tools', `${locale}/${tool.content}`);
      if (!entry) throw new Error(`Нет текстов ${locale}/${tool.content}`);
      return { href: pagePath(toolPageId(tool.id), locale), title: entry.data.card.title };
    }),
  );
}
