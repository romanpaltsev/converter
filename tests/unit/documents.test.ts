import { describe, expect, test } from 'vitest';
import { toPlainText } from '../../src/converter/documents/blocks';
import { htmlToModel } from '../../src/converter/documents/html';
import { markdownToHtml, markdownToModel } from '../../src/converter/documents/markdown';
import { detectDelimiter, jsonToTable, parseCsv, readTable, readXlsx, tableToJson, writeCsv, writeXlsx } from '../../src/converter/documents/table';
import { decodeText } from '../../src/converter/documents/text';
import { readZip } from '../../src/converter/documents/zip';
import { sniffFile } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe('текст: кодировка', () => {
  test('Windows-1251 без BOM, UTF-8 с BOM и без, UTF-16LE', () => {
    expect(decodeText(fixture('docs/cp1251.txt'))).toMatchObject({ encoding: 'windows-1251', text: 'Первая строка\r\nВторая строка\r\n\r\nПосле пустой строки\r\n' });
    expect(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0xd0, 0xaf]))).toEqual({ encoding: 'utf-8', text: 'Я' });
    expect(decodeText(new TextEncoder().encode('ёж'))).toEqual({ encoding: 'utf-8', text: 'ёж' });
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x2f, 0x04]))).toEqual({ encoding: 'utf-16le', text: 'Я' });
  });

  test('вид файла без сигнатуры — по расширению и «похожести на текст»; сигнатура важнее имени', () => {
    const ascii = new TextEncoder().encode('a,b\n1,2\n');
    expect(sniffFile('data.CSV', ascii)).toBe('csv');
    expect(sniffFile('notes.markdown', ascii)).toBe('md');
    expect(sniffFile('page.htm', ascii)).toBe('html');
    expect(sniffFile('report.tsv', ascii)).toBe('csv');
    expect(sniffFile('data.json', ascii)).toBe('json');
    expect(sniffFile('readme', ascii)).toBe('unknown');
    expect(sniffFile('binary.txt', new Uint8Array([0x41, 0x00, 0x42]))).toBe('unknown');
    expect(sniffFile('book.xlsx', fixture('docs/book.xlsx'))).toBe('xlsx');
    expect(sniffFile('fake.xlsx', ascii)).toBe('unknown');
    expect(sniffFile('photo.txt', fixture('photo.jpg').subarray(0, 1024))).toBe('jpeg');
  });
});

describe('таблицы', () => {
  test('CSV: разделитель по содержимому, кавычки, удвоенные кавычки и перевод строки внутри кавычек', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a\tb\n1\t2')).toBe('\t');
    expect(detectDelimiter('a,b\n"x;y",2')).toBe(',');
    expect(parseCsv('a,"b ""q""","c\nd"\r\n1,2,3\n')).toEqual([
      ['a', 'b "q"', 'c\nd'],
      ['1', '2', '3'],
    ]);
  });

  test('CSV из русского Excel (Windows-1251, точка с запятой) в JSON: числа — числами, коды с нулями — строками', async () => {
    const { table } = await readTable(fixture('docs/semicolon.csv'), 'csv');
    expect(table[3]).toEqual(['Нижний; Новгород', '1228199', '']);
    expect(JSON.parse(text(tableToJson(table)))).toEqual([
      { Город: 'Казань', Население: 1308660, Код: '007' },
      { Город: 'Самара', Население: '1 163 399', Код: '012' },
      { Город: 'Нижний; Новгород', Население: 1228199, Код: '' },
    ]);
  });

  test('CSV на выходе: BOM, \\r\\n, кавычки там, где нужны', () => {
    const csv = writeCsv([['a;b', 'c"d', 1, null, true]], ';');
    expect([...csv.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(text(csv.subarray(3))).toBe('"a;b";"c""d";1;;true\r\n');
  });

  test('JSON в таблицу: массив объектов (ключи по порядку появления), вложенное — строкой JSON; массив массивов; не таблица — ошибка', () => {
    const { table, warnings } = jsonToTable(text(fixture('docs/people.json')));
    expect(table).toEqual([
      ['name', 'age', 'city', 'tags', 'active'],
      ['Анна', 30, 'Казань', null, null],
      ['Борис', 41, null, '["admin","dev"]', null],
      ['Вера', null, null, null, true],
    ]);
    expect(warnings).toEqual(['json-nested']);
    expect(jsonToTable('[[1,2],[3,4]]').table).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(jsonToTable('{"items": [{"a": 1}]}').table).toEqual([['a'], [1]]);
    expect(() => jsonToTable('"строка"')).toThrow();
    expect(() => jsonToTable('{нет')).toThrow();
  });

  test('XLSX: первый лист по связи, общие строки (с форматированием), числа, формулы — значением, даты, логические, пропуски', async () => {
    const { table, warnings } = await readXlsx(fixture('docs/book.xlsx'));
    expect(warnings).toEqual(['sheets-first-only']);
    expect(table).toEqual([
      ['Товар', 'Цена', 'Дата', 'В наличии'],
      ['Чай "Зелёный"', 199.5, '2024-07-15', true],
      ['Кофе & молоко', 399, '2024-07-15 14:30:00', false],
      [null, null, null, null],
      ['Через строку', null, 'формула-текст', null],
    ]);
  });

  test('XLSX на выходе читается обратно: строки, числа, логические, спецсимволы; ZIP — пять частей', async () => {
    const table = [
      ['Имя', 'Сумма', 'Флаг'],
      ['A & <B>', '1500', true],
      ['007', 2.5, null],
    ];
    const bytes = writeXlsx(table);
    expect([...readZip(bytes).keys()]).toEqual(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/worksheets/sheet1.xml']);
    const back = await readXlsx(bytes);
    expect(back.warnings).toEqual([]);
    expect(back.table).toEqual([
      ['Имя', 'Сумма', 'Флаг'],
      ['A & <B>', 1500, true],
      ['007', 2.5, null],
    ]);
  });
});

describe('текстовые документы', () => {
  test('Markdown: заголовки, начертание, ссылка, списки с вложенностью и задачами, цитата, код, таблица, линия; картинка — флаг', () => {
    const model = markdownToModel(text(fixture('docs/sample.md')));
    expect(model.images).toBe(true);
    expect(model.blocks.map((block) => block.type)).toEqual(['heading', 'paragraph', 'heading', 'item', 'item', 'item', 'item', 'item', 'item', 'quote', 'code', 'table', 'rule', 'paragraph']);
    const paragraph = model.blocks[1]!;
    expect(paragraph.type === 'paragraph' && paragraph.runs).toEqual([
      { text: 'Текст с ' },
      { text: 'жирным', bold: true },
      { text: ', ' },
      { text: 'курсивом', italic: true },
      { text: ', ' },
      { text: 'кодом', code: true },
      { text: ' и ' },
      { text: 'ссылкой', link: 'https://example.com' },
      { text: '. Иероглиф 中 не входит в шрифт.' },
    ]);
    const items = model.blocks.filter((block) => block.type === 'item');
    expect(items.map((item) => [item.depth, item.marker])).toEqual([
      [0, '•'],
      [1, '◦'],
      [0, '•'],
      [0, '■'],
      [0, '1.'],
      [0, '2.'],
    ]);
  });

  test('Markdown в TXT: пункты списка подряд, таблица через табуляцию, ссылка с адресом', () => {
    const plain = toPlainText(markdownToModel('# Т\n\nСм. [сайт](https://x.ru).\n\n- а\n- б\n\n| x | y |\n|---|---|\n| 1 | 2 |\n'));
    expect(plain).toBe('Т\n\nСм. сайт (https://x.ru).\n\n• а\n• б\n\nx\ty\n1\t2\n');
  });

  test('Markdown в HTML: страница с кодировкой, заголовком из первого заголовка и таблицей', () => {
    const html = markdownToHtml('# Привет <мир>\n\n| a |\n|---|\n| 1 |\n', 'файл');
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain('<title>Привет &lt;мир&gt;</title>');
    expect(html).toContain('<table>');
    expect(markdownToHtml('просто текст', 'заметки')).toContain('<title>заметки</title>');
  });

  test('HTML: без script/style/head; абзац в пункте списка сохраняет маркер; таблица с шапкой; pre с отступами; картинка — флаг', () => {
    const model = htmlToModel(text(fixture('docs/sample.html')));
    expect(model.images).toBe(true);
    const plain = toPlainText(model);
    expect(plain).not.toMatch(/alert|color|Страница/);
    expect(plain).toBe('Меню (/)\n\nЗаголовок страницы\n\nПервый абзац с жирным и ссылкой (https://example.com).\n\n• Пункт в абзаце\n• Второй пункт\n\nИмя\tВозраст\nАнна\t30\n\n  отступ\nсохраняется\n');
    const table = model.blocks.find((block) => block.type === 'table');
    expect(table?.type === 'table' && table.rows.map((row) => row.header)).toEqual([true, false]);
  });
});
