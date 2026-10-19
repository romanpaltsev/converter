// Контент-коллекции: тексты страниц хранятся отдельно от вёрстки (YAML в src/content).
// Схемы проверяются при сборке — пропущенное поле или лишний вопрос в FAQ сломают build.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1);

const seo = {
  title: text.max(70),
  description: text.max(170),
  h1: text,
};

/** Тексты страницы-конвертера: src/content/tools/<locale>/<content>.yaml (content — из реестра). */
const tools = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/tools' }),
  schema: z.object({
    ...seo,
    subtitle: text,
    breadcrumb: text,
    /** Карточка на главной и в блоке перелинковки. */
    card: z.object({ title: text, text }),
    /** Название и описание для JSON-LD WebApplication. */
    app: z.object({ name: text, description: text }),
    howTo: z.object({ title: text, steps: z.array(text).length(3) }),
    why: z.object({ title: text, items: z.array(z.object({ title: text, text })).length(4) }),
    faq: z.object({ title: text, items: z.array(z.object({ q: text, a: text })).min(6).max(8) }),
  }),
});

const home = z.object({
  page: z.literal('home'),
  ...seo,
  intro: text,
  /** Раздел «Обработка фото»: сжатие, размер, метаданные — инструменты, которые не меняют формат. */
  editToolsTitle: text,
  /** Раздел «PDF». */
  pdfToolsTitle: text,
  toolsTitle: text,
  features: z.array(z.object({ title: text, text })).min(2).max(4),
});

const licenses = z.object({
  page: z.literal('licenses'),
  ...seo,
  breadcrumb: text,
  intro: text,
  columns: z.object({ name: text, purpose: text, license: text, source: text }),
  lgpl: text,
  patents: text,
  fullTexts: text,
});

/** Сам адрес почты — CONTACT_EMAIL в src/config/site.ts. */
const contacts = z.object({
  page: z.literal('contacts'),
  ...seo,
  breadcrumb: text,
  intro: text,
  emailLabel: text,
  note: text,
});

/** Прочие страницы: src/content/pages/<locale>/<page>.yaml. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: z.discriminatedUnion('page', [home, licenses, contacts]),
});

export const collections = { tools, pages };
