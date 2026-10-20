// FB2 (FictionBook 2): разбор (htmlparser2 в режиме XML) и запись. Кодировка — из объявления XML (у старых книг
// windows-1251), книга в ZIP (.fb2.zip) распаковывается. Секции верхнего уровня — главы; вложенные секции — заголовки
// глубже. Картинки — из <binary> (base64), тип — по сигнатуре; в книгу на выходе идут только JPEG и PNG.

import { Parser } from 'htmlparser2';
import { ConvertError } from '../pipeline/types';
import { type Block, type Run, mergeRuns, trimRuns } from './blocks';
import { BOOK_IMAGE_TYPES, type Book, type Chapter, fromBase64, imageType, toBase64 } from './book';
import { decodeText, escapeXml } from './text';
import { readZip } from './zip';

/** Текст FB2 из байтов: ZIP — первый файл .fb2 внутри; кодировка — из объявления XML. */
export async function readFb2Text(bytes: Uint8Array): Promise<string> {
  let data = bytes;
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    const entry = [...readZip(bytes).values()].find((file) => /\.fb2$/i.test(file.name));
    if (!entry) throw new ConvertError('decode-failed', 'fb2.zip: нет файла .fb2');
    data = await entry.read();
  }
  const head = new TextDecoder('latin1').decode(data.subarray(0, 200));
  const encoding = head.match(/encoding\s*=\s*["']([\w-]+)["']/i)?.[1]?.toLowerCase();
  if (encoding && encoding !== 'utf-8' && encoding !== 'utf8') {
    try {
      return new TextDecoder(encoding).decode(data);
    } catch {
      // неизвестная кодировка — как обычный текст
    }
  }
  return decodeText(data).text;
}

const hrefOf = (attrs: Record<string, string>) => Object.entries(attrs).find(([key]) => key === 'href' || key.endsWith(':href'))?.[1] ?? '';

export function parseFb2(xml: string): Book {
  const book: Book = { title: '', authors: [], lang: '', annotation: [], cover: null, chapters: [], images: new Map(), lostImages: false };
  const stack: string[] = [];
  const inside = (name: string) => stack.includes(name);
  let chapter: Chapter | null = null;
  let sectionDepth = 0;
  /** Тело с примечаниями: его секции — не главы, а абзацы одной главы «Примечания». */
  let notes = false;
  let runs: Run[] = [];
  let collecting = false;
  let titleRuns: Run[] | null = null;
  let bold = 0;
  let italic = 0;
  let code = 0;
  let link: string | null = null;
  let author: Record<string, string> | null = null;
  let text = '';
  let binary: { id: string; text: string } | null = null;
  let table: { header: boolean; cells: Run[][] }[] | null = null;
  let row: { header: boolean; cells: Run[][] } | null = null;

  /** Куда идут блоки: аннотация или текущая глава (создаётся при первом блоке вне секций). */
  const target = (): Block[] => {
    if (inside('annotation') && inside('description')) return book.annotation;
    if (!chapter) {
      chapter = { title: null, blocks: [] };
      book.chapters.push(chapter);
    }
    return chapter.blocks;
  };
  const style = (value: string): Run => ({ text: value, ...(bold ? { bold: true } : {}), ...(italic ? { italic: true } : {}), ...(code ? { code: true } : {}), ...(link ? { link } : {}) });

  const parser = new Parser(
    {
      onopentag(name, attrs) {
        stack.push(name);
        if (name === 'binary') binary = { id: attrs.id ?? '', text: '' };
        else if (name === 'body') {
          sectionDepth = 0;
          chapter = null;
          // примечания — отдельной главой в конце
          notes = attrs.name === 'notes' || attrs.name === 'comments';
          if (notes) {
            chapter = { title: attrs.name === 'notes' ? 'Примечания' : 'Комментарии', blocks: [] };
            book.chapters.push(chapter);
          }
        } else if (name === 'section' && inside('body')) {
          sectionDepth++;
          if (sectionDepth === 1 && !notes) {
            chapter = { title: null, blocks: [] };
            book.chapters.push(chapter);
          }
        } else if (name === 'author' && inside('title-info')) author = {};
        else if (name === 'title' && inside('body')) titleRuns = [];
        else if (name === 'p' || name === 'v' || name === 'subtitle' || name === 'text-author') {
          collecting = true;
          runs = [];
        } else if (name === 'emphasis') italic++;
        else if (name === 'strong') bold++;
        else if (name === 'code') code++;
        else if (name === 'a') {
          const href = hrefOf(attrs);
          link = /^https?:/i.test(href) ? href : null;
        } else if (name === 'image') {
          const id = hrefOf(attrs).replace(/^#/, '');
          if (inside('coverpage')) book.cover ??= id;
          else if (id && inside('body')) {
            target().push({ type: 'image', id });
          }
        } else if (name === 'table' && inside('body')) table = [];
        else if (name === 'tr' && table) row = { header: false, cells: [] };
        else if ((name === 'td' || name === 'th') && row) {
          collecting = true;
          runs = [];
          if (name === 'th') row.header = true;
        }
        text = '';
      },
      ontext(value) {
        if (binary) {
          binary.text += value;
          return;
        }
        text += value;
        if (collecting) runs.push(style(value.replace(/\s+/g, ' ')));
      },
      onclosetag(name) {
        stack.pop();
        if (name === 'binary' && binary) {
          const data = fromBase64(binary.text);
          const mime = imageType(data);
          if (mime) book.images.set(binary.id, { mime, data });
          binary = null;
        } else if (name === 'book-title' && inside('title-info')) book.title = text.trim();
        else if (name === 'lang' && inside('title-info')) book.lang = text.trim();
        else if (author && ['first-name', 'middle-name', 'last-name', 'nickname'].includes(name)) author[name] = text.trim();
        else if (name === 'author' && author) {
          const full = [author['first-name'], author['middle-name'], author['last-name']].filter(Boolean).join(' ');
          const display = full || author.nickname;
          if (display) book.authors.push(display);
          author = null;
        } else if (name === 'section' && inside('body')) sectionDepth = Math.max(0, sectionDepth - 1);
        else if (name === 'title' && titleRuns) {
          const merged = trimRuns(mergeRuns(titleRuns));
          titleRuns = null;
          const value = merged.map((run) => run.text).join('').trim();
          // заголовок тела повторяет название книги (оно и так на титуле) — пропускаем; заголовок верхней секции —
          // название главы
          if (value && sectionDepth > 0) {
            if (sectionDepth === 1 && !notes && chapter && !chapter.title) chapter.title = value;
            target().push({ type: 'heading', level: Math.min(6, sectionDepth + 1), runs: merged.map(({ bold: _bold, ...run }) => run) });
          }
        } else if ((name === 'p' || name === 'v' || name === 'subtitle' || name === 'text-author') && collecting) {
          collecting = false;
          const merged = trimRuns(mergeRuns(runs));
          if (titleRuns) {
            if (titleRuns.length > 0) titleRuns.push({ text: ' ' });
            titleRuns.push(...merged);
          } else if (row) {
            // абзац внутри ячейки — та же ячейка
          } else if (merged.length > 0) {
            if (name === 'subtitle') target().push({ type: 'heading', level: Math.min(6, sectionDepth + 2), runs: merged });
            else if (inside('epigraph') || inside('cite')) target().push({ type: 'quote', runs: merged });
            else if (name === 'text-author') target().push({ type: 'paragraph', runs: merged.map((run) => ({ ...run, italic: true })) });
            else target().push({ type: 'paragraph', runs: merged });
          }
        } else if ((name === 'td' || name === 'th') && row) {
          row.cells.push(trimRuns(mergeRuns(runs)));
          collecting = false;
        } else if (name === 'tr' && table && row) {
          table.push(row);
          row = null;
        } else if (name === 'table' && table) {
          if (table.length > 0) target().push({ type: 'table', rows: table });
          table = null;
        } else if (name === 'emphasis') italic = Math.max(0, italic - 1);
        else if (name === 'strong') bold = Math.max(0, bold - 1);
        else if (name === 'code') code = Math.max(0, code - 1);
        else if (name === 'a') link = null;
        else if (name === 'empty-line' && inside('body')) target().push({ type: 'paragraph', runs: [] });
      },
    },
    { xmlMode: true, decodeEntities: true },
  );
  parser.write(xml);
  parser.end();
  if (!xml.includes('<FictionBook')) throw new ConvertError('decode-failed', 'fb2: нет FictionBook');

  // картинки без данных (нет <binary> или формат не JPEG/PNG/GIF) — убрать из текста
  for (const item of book.chapters) {
    item.blocks = item.blocks.filter((block) => {
      if (block.type === 'paragraph' && block.runs.length === 0) return false;
      if (block.type !== 'image') return true;
      const asset = book.images.get(block.id);
      if (asset && BOOK_IMAGE_TYPES.has(asset.mime)) return true;
      book.lostImages = true;
      return false;
    });
  }
  if (book.cover && !BOOK_IMAGE_TYPES.has(book.images.get(book.cover)?.mime ?? '')) book.cover = null;
  book.chapters = book.chapters.filter((item) => item.blocks.length > 0);
  if (!book.title) book.title = book.chapters[0]?.title ?? 'Без названия';
  return book;
}

// ---------------------------------------------------------------- запись

function inline(runs: Run[]): string {
  return runs
    .map((run) => {
      let out = escapeXml(run.text);
      if (run.code) out = `<code>${out}</code>`;
      if (run.italic) out = `<emphasis>${out}</emphasis>`;
      if (run.bold) out = `<strong>${out}</strong>`;
      if (run.link) out = `<a l:href="${escapeXml(run.link)}">${out}</a>`;
      return out;
    })
    .join('');
}

function blockXml(block: Block, images: Map<string, unknown>): string {
  switch (block.type) {
    case 'heading':
      return `<subtitle>${inline(block.runs)}</subtitle>`;
    case 'paragraph':
      return `<p>${inline(block.runs)}</p>`;
    case 'item':
      return `<p>${escapeXml(`${'  '.repeat(block.depth)}${block.marker} `)}${inline(block.runs)}</p>`;
    case 'quote':
      return `<cite><p>${inline(block.runs)}</p></cite>`;
    case 'code':
    case 'lines':
      return block.text
        .split('\n')
        .map((line) => (line.trim() ? `<p>${block.type === 'code' ? `<code>${escapeXml(line)}</code>` : escapeXml(line)}</p>` : '<empty-line/>'))
        .join('');
    case 'rule':
      return '<empty-line/>';
    case 'table':
      return `<table>${block.rows.map((row) => `<tr>${row.cells.map((cell) => (row.header ? `<th>${inline(cell)}</th>` : `<td>${inline(cell)}</td>`)).join('')}</tr>`).join('')}</table>`;
    case 'image':
      return images.has(block.id) ? `<image l:href="#${escapeXml(block.id)}"/>` : '';
    case 'pagebreak':
      return '';
  }
}

/** Имя автора — в элементы FB2: последнее слово — фамилия, остальное — имя; одно слово — псевдоним. */
function authorXml(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return `<author><nickname>${escapeXml(name.trim())}</nickname></author>`;
  return `<author><first-name>${escapeXml(parts.slice(0, -1).join(' '))}</first-name><last-name>${escapeXml(parts.at(-1)!)}</last-name></author>`;
}

/** id картинки — допустимое имя XML (в EPUB это пути вида images/1.jpg). */
export function xmlId(id: string): string {
  const safe = id.replace(/[^A-Za-z0-9._-]/g, '_');
  return /^[A-Za-z_]/.test(safe) ? safe : `img_${safe}`;
}

export function writeFb2(book: Book, today: string, identifier: string): Uint8Array {
  // только JPEG и PNG; id картинок — допустимые имена XML
  const ids = new Map<string, string>();
  for (const [id, asset] of book.images) if (BOOK_IMAGE_TYPES.has(asset.mime)) ids.set(id, xmlId(id));
  const rename = (blocks: Block[]) => blocks.map((block) => (block.type === 'image' ? { ...block, id: ids.get(block.id) ?? '' } : block));
  const renamed = new Map([...ids.values()].map((id) => [id, true]));
  const lang = book.lang || (/[а-яё]/i.test(book.title) ? 'ru' : 'en');
  const cover = book.cover && ids.has(book.cover) ? `<coverpage><image l:href="#${ids.get(book.cover)}"/></coverpage>` : '';
  const annotation = book.annotation.length > 0 ? `<annotation>${book.annotation.map((block) => blockXml(block, renamed)).join('')}</annotation>` : '';
  const sections = book.chapters
    .map((chapter) => {
      const blocks = rename(chapter.blocks);
      // заголовок главы уже в <title> — первый заголовок с тем же текстом не повторяем
      const first = blocks[0];
      const skip = first?.type === 'heading' && first.runs.map((run) => run.text).join('').trim() === chapter.title ? 1 : 0;
      const title = chapter.title ? `<title><p>${escapeXml(chapter.title)}</p></title>` : '';
      return `<section>${title}${blocks.slice(skip).map((block) => blockXml(block, renamed)).join('\n')}</section>`;
    })
    .join('\n');
  const binaries = [...book.images]
    .filter(([id]) => ids.has(id))
    .map(([id, asset]) => `<binary id="${ids.get(id)}" content-type="${asset.mime}">${toBase64(asset.data)}</binary>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description>
<title-info><genre>unrecognised</genre>${(book.authors.length > 0 ? book.authors : ['Unknown']).map(authorXml).join('')}<book-title>${escapeXml(book.title)}</book-title>${annotation}${cover}<lang>${escapeXml(lang)}</lang></title-info>
<document-info><author><nickname>Converter</nickname></author><program-used>Converter</program-used><date value="${today}">${today}</date><id>${identifier}</id><version>1.0</version></document-info>
</description>
<body>
<title><p>${escapeXml(book.title)}</p></title>
${sections}
</body>
${binaries}
</FictionBook>
`;
  return new TextEncoder().encode(xml);
}
