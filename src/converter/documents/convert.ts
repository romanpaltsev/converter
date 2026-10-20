// Документы, таблицы и книги в worker'е (без WASM): текст (TXT, Markdown, HTML) — в PDF, HTML или TXT; таблицы (CSV,
// JSON, XLSX) — друг в друга; книги (FB2, EPUB) — друг в друга, в PDF и TXT. Грузится отдельным чанком только для этих
// файлов (pdf-lib со шрифтами — только для PDF).

import type { TextKind } from '../pipeline/sniff';
import { ConvertError, type WarningCode } from '../pipeline/types';
import { type DocumentModel, toPlainText } from './blocks';
import { type CsvDelimiter, readTable, tableToJson, writeCsv, writeXlsx } from './table';
import { decodeText, normalizeNewlines } from './text';

export type DocTarget = 'pdf' | 'html' | 'txt' | 'xlsx' | 'csv' | 'json' | 'epub' | 'fb2';

export interface DocOptions {
  csvDelimiter: CsvDelimiter;
  /** Имя файла без расширения — заголовок HTML, если в Markdown нет заголовка. */
  title: string;
}

export interface DocResult {
  bytes: Uint8Array;
  /** Страниц PDF или строк таблицы (без заголовка); null — не считается. */
  pages: number | null;
  rows: number | null;
  warnings: WarningCode[];
}

async function textModel(kind: 'txt' | 'md' | 'html', text: string): Promise<DocumentModel> {
  if (kind === 'md') return (await import('./markdown')).markdownToModel(text);
  if (kind === 'html') return (await import('./html')).htmlToModel(text);
  return { blocks: [{ type: 'lines', text }], images: false };
}

/** Книга: FB2 или EPUB в модель книги, оттуда — в EPUB, FB2, PDF или TXT. */
async function convertBook(bytes: Uint8Array, kind: 'fb2' | 'epub', target: DocTarget): Promise<DocResult> {
  const { bookToModel } = await import('./book');
  const book = kind === 'fb2' ? await import('./fb2').then(async ({ parseFb2, readFb2Text }) => parseFb2(await readFb2Text(bytes))) : await (await import('./epub')).parseEpub(bytes);
  const lost: WarningCode[] = book.lostImages ? ['images-dropped'] : [];
  const now = new Date();
  const identifier = `urn:uuid:${crypto.randomUUID()}`;
  if (target === 'epub') {
    const { writeEpub } = await import('./epub');
    return { bytes: writeEpub(book, now.toISOString().replace(/\.\d+Z$/, 'Z'), identifier), pages: null, rows: null, warnings: lost };
  }
  if (target === 'fb2') {
    const { writeFb2 } = await import('./fb2');
    return { bytes: writeFb2(book, now.toISOString().slice(0, 10), identifier), pages: null, rows: null, warnings: lost };
  }
  const model = bookToModel(book);
  if (target === 'txt') return { bytes: new TextEncoder().encode(toPlainText(model)), pages: null, rows: null, warnings: [] };
  if (target === 'pdf') {
    const { modelToPdf } = await import('./pdf');
    const pdf = await modelToPdf(model);
    return { bytes: pdf.bytes, pages: pdf.pages, rows: null, warnings: [...new Set([...lost, ...pdf.warnings])] };
  }
  throw new ConvertError('internal', `${kind} в ${target}`);
}

export async function convertDocument(bytes: Uint8Array, kind: TextKind, target: DocTarget, options: DocOptions): Promise<DocResult> {
  if (kind === 'fb2' || kind === 'epub') return convertBook(bytes, kind, target);
  if (kind === 'csv' || kind === 'json' || kind === 'xlsx') {
    const { table, warnings } = await readTable(bytes, kind);
    if (table.length === 0) throw new ConvertError('not-table', 'пустая таблица');
    const rows = Math.max(0, table.length - 1);
    if (target === 'csv') return { bytes: writeCsv(table, options.csvDelimiter), pages: null, rows, warnings };
    if (target === 'json') return { bytes: tableToJson(table), pages: null, rows, warnings };
    if (target === 'xlsx') return { bytes: writeXlsx(table), pages: null, rows, warnings };
    throw new ConvertError('internal', `таблица в ${target}`);
  }
  const text = normalizeNewlines(decodeText(bytes).text);
  if (target === 'html' && kind === 'md') {
    const { markdownToHtml } = await import('./markdown');
    return { bytes: new TextEncoder().encode(markdownToHtml(text, options.title)), pages: null, rows: null, warnings: [] };
  }
  const model = await textModel(kind, text);
  if (target === 'txt') {
    return { bytes: new TextEncoder().encode(toPlainText(model)), pages: null, rows: null, warnings: model.images ? ['images-dropped'] : [] };
  }
  if (target === 'pdf') {
    const { modelToPdf } = await import('./pdf');
    const pdf = await modelToPdf(model);
    return { bytes: pdf.bytes, pages: pdf.pages, rows: null, warnings: pdf.warnings };
  }
  throw new ConvertError('internal', `${kind} в ${target}`);
}
