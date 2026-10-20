// Таблицы: CSV, JSON и XLSX в обе стороны. Таблица — строки ячеек; первая строка — заголовки (для JSON — ключи).
// CSV — RFC 4180, разделитель определяется сам (запятая, точка с запятой, табуляция); на выходе — с BOM, чтобы Excel
// узнал UTF-8. XLSX — первый лист: общие строки, встроенные строки, числа, логические значения, даты по формату ячейки.

import { ConvertError, type WarningCode } from '../pipeline/types';
import { decodeText, decodeXmlEntities, escapeXml, normalizeNewlines } from './text';
import { readZip, writeZip } from './zip';

export type Cell = string | number | boolean | null;
export type Table = Cell[][];

export type CsvDelimiter = ',' | ';' | '\t';

// ---------------------------------------------------------------- CSV

/** Разделитель по первым строкам: тот из трёх, что встречается вне кавычек чаще всего (при равенстве — запятая). */
export function detectDelimiter(text: string): CsvDelimiter {
  const counts: Record<CsvDelimiter, number> = { ',': 0, ';': 0, '\t': 0 };
  let quoted = false;
  let lines = 0;
  for (const char of text.slice(0, 64 * 1024)) {
    if (char === '"') quoted = !quoted;
    else if (!quoted && char === '\n' && ++lines >= 20) break;
    else if (!quoted && char in counts) counts[char as CsvDelimiter]++;
  }
  return (['\t', ';', ','] as const).reduce((best, delimiter) => (counts[delimiter] > counts[best] ? delimiter : best), ',' as CsvDelimiter);
}

/** Разбор CSV (кавычки, удвоенные кавычки, переводы строк внутри кавычек); пустая последняя строка отбрасывается. */
export function parseCsv(text: string, delimiter = detectDelimiter(text)): Table {
  const rows: Table = [];
  let row: Cell[] = [];
  let field = '';
  let quoted = false;
  const source = normalizeNewlines(text);
  for (let i = 0; i < source.length; i++) {
    const char = source[i]!;
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === '') quoted = true;
    else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvField(cell: Cell, delimiter: CsvDelimiter): string {
  const text = cell === null ? '' : String(cell);
  return /["\n\r]/.test(text) || text.includes(delimiter) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV с BOM и переводами строк \r\n (так его без вопросов открывает Excel). */
export function writeCsv(table: Table, delimiter: CsvDelimiter): Uint8Array {
  const text = table.map((row) => row.map((cell) => csvField(cell, delimiter)).join(delimiter)).join('\r\n') + '\r\n';
  return new TextEncoder().encode('﻿' + text);
}

// ---------------------------------------------------------------- JSON

/** Строка CSV, похожая на число, — число (без ведущих нулей: «007» и телефоны остаются строками). */
export function typedCell(value: Cell): Cell {
  if (typeof value !== 'string') return value;
  if (/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** Таблица в JSON: массив объектов по заголовкам первой строки (пустые заголовки — «column_N»). */
export function tableToJson(table: Table): Uint8Array {
  const [header = [], ...rows] = table;
  const keys = header.map((cell, index) => (cell === null || cell === '' ? `column_${index + 1}` : String(cell)));
  const objects = rows.map((row) => Object.fromEntries(keys.map((key, index) => [key, typedCell(row[index] ?? null)])));
  return new TextEncoder().encode(JSON.stringify(objects, null, 2) + '\n');
}

/**
 * JSON в таблицу: массив объектов (столбцы — все ключи в порядке появления), массив массивов или объект с одним
 * массивом. Вложенные объекты и массивы записываются строкой JSON — warning json-nested.
 */
export function jsonToTable(text: string): { table: Table; warnings: WarningCode[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new ConvertError('decode-failed', `json: ${String(error)}`);
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrays = Object.values(data).filter(Array.isArray);
    data = arrays.length === 1 ? arrays[0] : [data];
  }
  if (!Array.isArray(data)) throw new ConvertError('not-table');
  let nested = false;
  const cell = (value: unknown): Cell => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    nested = true;
    return JSON.stringify(value);
  };
  let table: Table;
  if (data.every(Array.isArray)) {
    table = (data as unknown[][]).map((row) => row.map(cell));
  } else {
    const keys: string[] = [];
    for (const item of data) {
      if (item && typeof item === 'object' && !Array.isArray(item)) for (const key of Object.keys(item)) if (!keys.includes(key)) keys.push(key);
    }
    if (keys.length === 0) throw new ConvertError('not-table');
    table = [keys, ...data.map((item) => keys.map((key) => (item && typeof item === 'object' ? cell((item as Record<string, unknown>)[key]) : null)))];
  }
  return { table, warnings: nested ? ['json-nested'] : [] };
}

// ---------------------------------------------------------------- XLSX

/** Буква столбца в номер: A → 0, Z → 25, AA → 26. */
function columnIndex(reference: string): number {
  let index = 0;
  for (const char of reference.replace(/\d+$/, '')) index = index * 26 + (char.charCodeAt(0) - 64);
  return index - 1;
}

function columnName(index: number): string {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

/** Атрибуты тега: name="value". */
function attributes(tag: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([\w:]+)\s*=\s*"([^"]*)"/g)) result[match[1]!] = decodeXmlEntities(match[2]!);
  return result;
}

/** Текст всех <t> внутри фрагмента (у строк с форматированием их несколько). */
function textOf(xml: string): string {
  return [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((match) => decodeXmlEntities(match[1]!)).join('');
}

/** Встроенные форматы дат Excel (14–22, 45–47) и свои форматы с d, m, y, h без кавычек. */
function isDateFormat(id: number, code: string | undefined): boolean {
  if ((id >= 14 && id <= 22) || (id >= 45 && id <= 47)) return true;
  if (!code) return false;
  const plain = code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '');
  return /[dmyhs]/i.test(plain) && !/[#0]/.test(plain.replace(/[dmyhs]+/gi, ''));
}

/** Серийная дата Excel (с 1899-12-30) в ISO: дата, а если есть время — с ним. */
function excelDate(serial: number): string {
  const ms = Math.round((serial - 25569) * 86_400_000);
  const iso = new Date(ms).toISOString();
  return serial % 1 === 0 ? iso.slice(0, 10) : iso.slice(0, 19).replace('T', ' ');
}

/** Первый лист XLSX в таблицу; листов больше — warning sheets-first-only. */
export async function readXlsx(bytes: Uint8Array): Promise<{ table: Table; warnings: WarningCode[] }> {
  const zip = readZip(bytes);
  const text = async (name: string) => {
    const entry = zip.get(name);
    return entry ? new TextDecoder().decode(await entry.read()) : null;
  };
  const workbook = await text('xl/workbook.xml');
  if (!workbook) throw new ConvertError('decode-failed', 'xlsx: нет xl/workbook.xml');
  const sheets = [...workbook.matchAll(/<sheet\s[^>]*>/g)].map((match) => attributes(match[0]));
  const first = sheets[0];
  if (!first) throw new ConvertError('decode-failed', 'xlsx: нет листов');
  const rels = (await text('xl/_rels/workbook.xml.rels')) ?? '';
  const relationId = first['r:id'] ?? Object.entries(first).find(([key]) => key.endsWith(':id'))?.[1];
  const target = [...rels.matchAll(/<Relationship\s[^>]*>/g)].map((match) => attributes(match[0])).find((rel) => rel.Id === relationId)?.Target ?? 'worksheets/sheet1.xml';
  const path = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  const sheet = await text(path);
  if (!sheet) throw new ConvertError('decode-failed', `xlsx: нет ${path}`);

  const shared = [...((await text('xl/sharedStrings.xml')) ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => textOf(match[1]!));
  // стили ячеек: номер формата у каждого xf из cellXfs; свои форматы — numFmt
  const styles = (await text('xl/styles.xml')) ?? '';
  const formats = new Map([...styles.matchAll(/<numFmt\s[^>]*>/g)].map((match) => attributes(match[0])).map((fmt) => [Number(fmt.numFmtId), fmt.formatCode]));
  const xfs = [...(styles.match(/<cellXfs[\s\S]*?<\/cellXfs>/)?.[0] ?? '').matchAll(/<xf\s[^>]*>/g)].map((match) => Number(attributes(match[0]).numFmtId ?? 0));

  const table: Table = [];
  for (const rowMatch of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rowNumber = Number(attributes(rowMatch[1]!).r ?? table.length + 1) - 1;
    const row: Cell[] = [];
    for (const cellMatch of (rowMatch[2] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = attributes(cellMatch[1]!);
      const inner = cellMatch[2] ?? '';
      const raw = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      let value: Cell = null;
      if (attrs.t === 's') value = raw === undefined ? null : (shared[Number(raw)] ?? null);
      else if (attrs.t === 'inlineStr') value = textOf(inner);
      else if (attrs.t === 'str' || attrs.t === 'e') value = raw === undefined ? null : decodeXmlEntities(raw);
      else if (attrs.t === 'b') value = raw === '1';
      else if (raw !== undefined) {
        const number = Number(raw);
        const formatId = xfs[Number(attrs.s ?? 0)] ?? 0;
        value = Number.isFinite(number) && isDateFormat(formatId, formats.get(formatId)) ? excelDate(number) : number;
      }
      const column = attrs.r ? columnIndex(attrs.r) : row.length;
      while (row.length < column) row.push(null);
      row[column] = value;
    }
    while (table.length < rowNumber) table.push([]);
    table[rowNumber] = row;
  }
  // строки выравниваются до ширины таблицы
  const width = Math.max(0, ...table.map((row) => row.length));
  for (const row of table) while (row.length < width) row.push(null);
  return { table, warnings: sheets.length > 1 ? ['sheets-first-only'] : [] };
}

/** Таблица в XLSX: один лист, строки — встроенные (inlineStr), числа и логические значения — с типом. */
export function writeXlsx(table: Table): Uint8Array {
  const encode = (text: string) => new TextEncoder().encode(text);
  const rows = table
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${columnName(c)}${r + 1}`;
          const cell = typedCell(value);
          if (cell === null || cell === '') return '';
          if (typeof cell === 'number') return `<c r="${ref}"><v>${cell}</v></c>`;
          if (typeof cell === 'boolean') return `<c r="${ref}" t="b"><v>${cell ? 1 : 0}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''))}</t></is></c>`;
        })
        .join('');
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join('');
  const header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  return writeZip([
    {
      name: '[Content_Types].xml',
      data: encode(
        `${header}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
      ),
    },
    {
      name: '_rels/.rels',
      data: encode(
        `${header}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
    },
    {
      name: 'xl/workbook.xml',
      data: encode(
        `${header}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encode(
        `${header}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
      ),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: encode(`${header}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`),
    },
  ]);
}

/** Таблица из файла любого из трёх форматов. */
export async function readTable(bytes: Uint8Array, kind: 'csv' | 'json' | 'xlsx'): Promise<{ table: Table; warnings: WarningCode[] }> {
  if (kind === 'xlsx') return readXlsx(bytes);
  const { text } = decodeText(bytes);
  if (kind === 'json') return jsonToTable(text);
  return { table: parseCsv(text), warnings: [] };
}
