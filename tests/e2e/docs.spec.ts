// Документы и таблицы (без WASM): TXT, Markdown, HTML в PDF (pdf-lib, Liberation Sans), Markdown в HTML, CSV, XLSX и JSON
// друг в друга. PDF проверяет pdf.js в Node (текст, страницы A4), XLSX — наш же читатель, CSV и JSON — побайтно.
import { readXlsx } from '../../src/converter/documents/table';
import { convertFiles, downloadFile, expect, fileRow, openConverter, test } from './fixtures';
import { fixture, pdfText } from './files';

const doc = (name: string) => fixture(`docs/${name}`);
const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

test.describe('документы', () => {
  test('Markdown в PDF: A4, текст выделяется, вся разметка; иероглиф и картинка — предупреждения; настроек нет', async ({ page }) => {
    await openConverter(page, '/md-v-pdf');
    await expect(page.locator('[data-settings]')).toBeHidden();
    await page.setInputFiles('[data-input]', [doc('sample.md')]);
    const row = fileRow(page, 'sample.pdf');
    await expect(row).toHaveAttribute('data-status', 'done', { timeout: 60_000 });
    await expect(row).toContainText('страниц: 1');
    await expect(row).toContainText('заменены на «?»');
    await expect(row).toContainText('Картинки из документа не переносятся');
    const pdf = await pdfText(await downloadFile(page, 'sample.pdf'));
    expect(pdf).toMatchObject({ pages: 1, size: [595, 842] });
    for (const fragment of ['Отчёт о поездке', 'жирным', 'Вложенный пункт', '■', 'Цитата из письма.', 'const answer = 42;', 'Казань', 'Конец.']) expect(pdf.text).toContain(fragment);
  });

  test('TXT в PDF: Windows-1251 читается, отступы и переносы строк сохраняются; длинный текст — несколько страниц', async ({ page }) => {
    await openConverter(page, '/txt-v-pdf');
    const long = Array.from({ length: 200 }, (_, i) => `    Строка ${i + 1}: съешь же ещё этих мягких французских булок, да выпей чаю.`).join('\n');
    await page.setInputFiles('[data-input]', [doc('cp1251.txt')]);
    await page.setInputFiles('[data-input]', [{ name: 'long.txt', mimeType: 'text/plain', buffer: Buffer.from(long) }]);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(2, { timeout: 60_000 });
    expect((await pdfText(await downloadFile(page, 'cp1251.pdf'))).text).toContain('Первая строка Вторая строка После пустой строки');
    const pdf = await pdfText(await downloadFile(page, 'long.pdf'));
    expect(pdf.pages).toBeGreaterThan(3);
    expect(pdf.text).toContain('Строка 200: съешь же ещё');
  });

  test('HTML в PDF и в TXT: только содержимое, без скриптов и стилей', async ({ page }) => {
    await openConverter(page, '/html-v-pdf');
    await convertFiles(page, ['docs/sample.html']);
    const pdf = await pdfText(await downloadFile(page, 'sample.pdf'));
    expect(pdf.text).toContain('Заголовок страницы');
    expect(pdf.text).toContain('Пункт в абзаце');
    expect(pdf.text).not.toMatch(/alert|color/);
  });

  test('Markdown в HTML: страница с кодировкой, заголовком и таблицей; меню Markdown — «Документ»: PDF и HTML', async ({ page }) => {
    await openConverter(page, '/md-v-html');
    await convertFiles(page, ['docs/sample.md']);
    await fileRow(page, 'sample.html').locator('[data-target-button]').click();
    await expect(page.locator('[data-picker]').getByRole('menuitemradio')).toHaveText(['PDF', 'HTML']);
    await page.keyboard.press('Escape');
    const html = text(await downloadFile(page, 'sample.html'));
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain('<title>Отчёт о поездке</title>');
    expect(html).toContain('<td>Казань</td>');
  });

  test('CSV в XLSX: Windows-1251 и точка с запятой определяются сами; числа — числами, коды — текстом', async ({ page }) => {
    await openConverter(page, '/csv-v-xlsx');
    await convertFiles(page, ['docs/semicolon.csv']);
    await expect(fileRow(page, 'semicolon.xlsx')).toContainText('строк: 3');
    const { table } = await readXlsx(await downloadFile(page, 'semicolon.xlsx'));
    expect(table).toEqual([
      ['Город', 'Население', 'Код'],
      ['Казань', 1308660, '007'],
      ['Самара', '1 163 399', '012'],
      ['Нижний; Новгород', 1228199, null],
    ]);
  });

  test('XLSX в CSV: первый лист, даты, BOM; разделитель — точка с запятой (ru) и запятая (en)', async ({ page }) => {
    await openConverter(page, '/xlsx-v-csv');
    await expect(page.locator('[data-csv-row]')).toBeVisible();
    await convertFiles(page, ['docs/book.xlsx']);
    await expect(fileRow(page, 'book.csv')).toContainText('сконвертирован первый');
    const csv = await downloadFile(page, 'book.csv');
    expect([...csv.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(text(csv.subarray(3))).toBe('Товар;Цена;Дата;В наличии\r\n"Чай ""Зелёный""";199.5;2024-07-15;true\r\nКофе & молоко;399;2024-07-15 14:30:00;false\r\n;;;\r\nЧерез строку;;формула-текст;\r\n');

    await openConverter(page, '/en/xlsx-to-csv');
    await convertFiles(page, ['docs/book.xlsx']);
    expect(text((await downloadFile(page, 'book.csv')).subarray(3))).toMatch(/^Товар,Цена,Дата,В наличии\r\n/);
  });

  test('JSON в CSV и CSV в JSON', async ({ page }) => {
    await openConverter(page, '/json-v-csv');
    await convertFiles(page, ['docs/people.json']);
    await expect(fileRow(page, 'people.csv')).toContainText('как текст JSON');
    expect(text((await downloadFile(page, 'people.csv')).subarray(3))).toBe('name;age;city;tags;active\r\nАнна;30;Казань;;\r\nБорис;41;;"[""admin"",""dev""]";\r\nВера;;;;true\r\n');

    await openConverter(page, '/csv-v-json');
    await convertFiles(page, ['docs/semicolon.csv']);
    expect(JSON.parse(text(await downloadFile(page, 'semicolon.json')))[0]).toEqual({ Город: 'Казань', Население: 1308660, Код: '007' });
  });
});
