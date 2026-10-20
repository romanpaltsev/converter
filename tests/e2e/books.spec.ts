// Электронные книги (без WASM): FB2 ↔ EPUB, в PDF и TXT. EPUB и FB2 на выходе читаются нашими же разборщиками,
// PDF — pdf.js в Node.
import { parseEpub } from '../../src/converter/documents/epub';
import { parseFb2 } from '../../src/converter/documents/fb2';
import { readZip } from '../../src/converter/documents/zip';
import { convertFiles, downloadFile, expect, fileRow, openConverter, test } from './fixtures';
import { pdfText } from './files';

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

test.describe('электронные книги', () => {
  test('FB2 в EPUB: метаданные, обложка, главы, картинки; mimetype — первым; меню книги — «Документ» и «Книга»', async ({ page }) => {
    await openConverter(page, '/fb2-v-epub');
    await expect(page.locator('[data-settings]')).toBeHidden();
    await convertFiles(page, ['docs/book.fb2']);
    await fileRow(page, 'book.epub').locator('[data-target-button]').click();
    await expect(page.locator('[data-picker]').getByRole('menuitemradio')).toHaveText(['PDF', 'TXT', 'EPUB']);
    await page.keyboard.press('Escape');
    const epub = await downloadFile(page, 'book.epub');
    expect(text(epub.subarray(30, 58))).toBe('mimetypeapplication/epub+zip');
    expect([...readZip(epub).keys()]).toEqual(expect.arrayContaining(['OEBPS/nav.xhtml', 'OEBPS/toc.ncx']));
    const book = await parseEpub(epub);
    expect(book).toMatchObject({ title: 'Тестовая книга', authors: ['Антон Павлович Чехов', 'Редактор'], lang: 'ru' });
    expect(book.cover).not.toBeNull();
    expect(book.chapters.map((chapter) => chapter.title)).toEqual(['Глава первая', 'Глава вторая', 'Примечания']);
  });

  test('EPUB в FB2: авторы, обложка в binary; пропавшая картинка — предупреждение', async ({ page }) => {
    await openConverter(page, '/epub-v-fb2');
    await convertFiles(page, ['docs/book.epub']);
    await expect(fileRow(page, 'book.fb2')).toContainText('Картинки из документа не переносятся');
    const xml = text(await downloadFile(page, 'book.fb2'));
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    const book = parseFb2(xml);
    expect(book).toMatchObject({ title: 'Книга EPUB', authors: ['Лев Толстой'] });
    expect(book.cover).not.toBeNull();
    expect(book.chapters.map((chapter) => chapter.title)).toEqual(['Глава 1', 'Глава 2']);
  });

  test('FB2 и EPUB в PDF: титул и главы с новой страницы, текст выделяется', async ({ page }) => {
    await openConverter(page, '/fb2-v-pdf');
    await convertFiles(page, ['docs/book.fb2', 'docs/book.epub']);
    await expect(fileRow(page, 'book.pdf')).toContainText('страниц: 4');
    const fb2 = await pdfText(await downloadFile(page, 'book.pdf'));
    expect(fb2.pages).toBe(4);
    for (const fragment of ['Тестовая книга', 'Глава первая', 'Краткость — сестра таланта.', 'Второй абзац & символы <угловые>.', 'Текст примечания.']) expect(fb2.text).toContain(fragment);
    const epub = await pdfText(await downloadFile(page, 'book_2.pdf'));
    expect(epub.pages).toBe(3);
    expect(epub.text).toContain('Все счастливые семьи похожи друг на друга.');
  });

  test('FB2 в ZIP в TXT: UTF-8, титул, главы и примечания', async ({ page }) => {
    await openConverter(page, '/fb2-v-txt');
    await convertFiles(page, ['docs/book.fb2.zip']);
    const txt = text(await downloadFile(page, 'book.txt'));
    expect(txt.startsWith('Тестовая книга\n\nАнтон Павлович Чехов, Редактор')).toBe(true);
    expect(txt).toContain('Строка стиха один,');
    expect(txt).toContain('Текст примечания.');
  });
});
