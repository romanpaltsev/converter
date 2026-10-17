// Сборка CONTENT.md — перечня всех текстов сайта для вычитки владельцем.
// Источник правды — YAML в src/content и словари src/i18n/ui.ts; CONTENT.md только отражает их.
// Запуск: npm run content (Node 24 исполняет TypeScript без сборки).

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { UI } from '../src/i18n/ui.ts';
import { TOOLS } from '../src/tools/registry.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOCALES = ['ru', 'en'] as const;
const LOCALE_NAMES = { ru: 'Русский', en: 'English' } as const;

type Yaml = Record<string, any>;

function readYaml(path: string): Yaml {
  return parse(readFileSync(ROOT + path, 'utf8')) as Yaml;
}

const len = (s: string) => `${s} _(${[...s].length} симв.)_`;

function toolSection(content: string, slugs: Record<string, string>): string[] {
  const out: string[] = [];
  for (const locale of LOCALES) {
    const file = `src/content/tools/${locale}/${content}.yaml`;
    const c = readYaml(file);
    const path = locale === 'ru' ? `/${slugs.ru}` : `/en/${slugs.en}`;
    out.push(`#### ${LOCALE_NAMES[locale]} — \`${path}\``, '', `Файл: \`${file}\``, '');
    out.push(`- **title:** ${len(c.title)}`, `- **description:** ${len(c.description)}`, `- **H1:** ${c.h1}`, `- **Подзаголовок:** ${c.subtitle}`);
    out.push(`- **Хлебные крошки:** ${c.breadcrumb}`, `- **Карточка:** ${c.card.title} — ${c.card.text}`, `- **JSON-LD:** ${c.app.name} — ${c.app.description}`, '');
    out.push(`**${c.howTo.title}**`, '', ...c.howTo.steps.map((s: string, i: number) => `${i + 1}. ${s}`), '');
    out.push(`**${c.why.title}**`, '', ...c.why.items.map((i: Yaml) => `- **${i.title}.** ${i.text}`), '');
    out.push(`**${c.faq.title}**`, '', ...c.faq.items.map((i: Yaml) => `- **${i.q}** ${i.a}`), '');
  }
  return out;
}

function pageSection(page: string): string[] {
  const out: string[] = [];
  for (const locale of LOCALES) {
    const file = `src/content/pages/${locale}/${page}.yaml`;
    const c = readYaml(file);
    out.push(`#### ${LOCALE_NAMES[locale]}`, '', `Файл: \`${file}\``, '');
    for (const [key, value] of Object.entries(c)) {
      if (key === 'page') continue;
      if (typeof value === 'string') out.push(`- **${key}:** ${key === 'title' || key === 'description' ? len(value) : value}`);
      else if (Array.isArray(value)) out.push(`- **${key}:**`, ...value.map((v: Yaml) => `  - **${v.title}.** ${v.text}`));
      else out.push(`- **${key}:** ${Object.values(value as Yaml).join(' · ')}`);
    }
    out.push('');
  }
  return out;
}

function flatten(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) => flatten(v, prefix ? `${prefix}.${key}` : key));
}

function uiSection(): string[] {
  const ru = new Map(flatten(UI.ru));
  const en = new Map(flatten(UI.en));
  const cell = (s = '') => s.replace(/\|/g, '\\|');
  return [
    '| Ключ | RU | EN |',
    '|---|---|---|',
    ...[...ru.keys()].map((key) => `| \`${key}\` | ${cell(ru.get(key))} | ${cell(en.get(key))} |`),
    '',
  ];
}

export function buildContentMd(): string {
  const toolContents = new Set(readdirSync(ROOT + 'src/content/tools/ru').map((f) => f.replace(/\.yaml$/, '')));
  const lines = [
    '# CONTENT.md — тексты сайта',
    '',
    '> **Файл генерируется** командой `npm run content` — не правьте его вручную.',
    '> Тексты страниц лежат в `src/content/**/*.yaml`, короткие строки интерфейса — в `src/i18n/ui.ts`.',
    '> После правки перегенерируйте файл: тест `content.test.ts` проверяет, что он актуален.',
    '',
    'Все тексты — **черновики для проверки владельцем**. Правила: без кликбейта и выдуманных цифр;',
    'английские тексты пишутся как оригинальные (под запросы «heic to jpg» и т. п.), а не как перевод.',
    'Не обещаем «файлы меньше за счёт MozJPEG» — см. CLAUDE.md, раздел «Тексты».',
    '',
    '## Страницы-конвертеры',
    '',
  ];
  for (const tool of TOOLS) {
    toolContents.delete(tool.content);
    lines.push(`### ${tool.id}`, '', ...toolSection(tool.content, tool.slugs));
  }
  if (toolContents.size > 0) throw new Error(`Тексты без инструмента в реестре: ${[...toolContents].join(', ')}`);
  lines.push('## Другие страницы', '', '### Главная', '', ...pageSection('home'));
  lines.push('### Лицензии', '', ...pageSection('licenses'));
  lines.push('## Строки интерфейса (виджет, шапка, 404)', '', `Файл: \`src/i18n/ui.ts\``, '', ...uiSection());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(ROOT + 'CONTENT.md', buildContentMd());
  console.log('CONTENT.md обновлён');
}
