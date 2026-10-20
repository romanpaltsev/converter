// «Объединить PDF»: документы по порядку списка → один PDF (pdf.js extractPages в worker'е).
import { OPS, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { convertFiles as process, expect, openConverter, test } from './fixtures';
import { downloadBytes, expectTimestamped } from './files';

async function openPdf(bytes: Buffer) {
  return getDocument({ data: new Uint8Array(bytes), verbosity: 0, isOffscreenCanvasSupported: false }).promise;
}

test.describe('объединение PDF', () => {
  test('порядок из списка, страницы с поворотом, PDF с паролем и не PDF — не попадают', async ({ page }) => {
    await openConverter(page, '/obedinit-pdf');
    await expect(page.locator('form[data-settings]')).toBeHidden();
    await process(page, ['quadrants.pdf', 'two-pages.pdf', 'text.pdf', 'encrypted.pdf', 'photo.jpg']);
    await expect(page.locator('.file').filter({ hasText: 'two-pages.pdf' })).toContainText('PDF · страниц: 2');
    await expect(page.locator('.file').filter({ hasText: 'two-pages.pdf' }).locator('img')).toHaveCount(1); // превью первой страницы
    await expect(page.locator('.file').filter({ hasText: 'encrypted.pdf' })).toContainText('PDF защищён паролем');
    await expect(page.locator('.file').filter({ hasText: 'photo.jpg' })).toContainText('Это не PDF-файл.');
    // text.pdf — в начало
    await page.getByRole('button', { name: 'Переместить выше: text.pdf' }).click();
    await page.getByRole('button', { name: 'Переместить выше: text.pdf' }).click();

    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Объединить PDF' }).click();
    const file = await pending;
    expectTimestamped(file.suggestedFilename(), 'merge-pdf.pdf');
    await expect(page.locator('[data-status-text]')).toHaveText('PDF · страниц: 4');

    const pdf = await openPdf(await downloadBytes(file));
    expect(pdf.numPages).toBe(4);
    const pages = await Promise.all([1, 2, 3, 4].map((n) => pdf.getPage(n)));
    expect(pages.map((p) => [p.view[2], p.view[3], p.rotate])).toEqual([
      [595, 842, 0],
      [600, 400, 0],
      [600, 400, 90],
      [595, 842, 0],
    ]);
    // текст остался текстом, картинка — картинкой
    expect((await pages[0]!.getTextContent()).items.map((item) => ('str' in item ? item.str : '')).join('')).toContain('Hello PDF');
    expect((await pages[1]!.getOperatorList()).fnArray).toContain(OPS.paintImageXObject);
    const { info } = (await pdf.getMetadata()) as { info: Record<string, unknown> };
    expect(info.Producer).toBe('PDF.js');
  });

  test('en: два документа', async ({ page }) => {
    await openConverter(page, '/en/merge-pdf');
    await process(page, ['quadrants.pdf', 'text.pdf']);
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Merge PDFs' }).click();
    const pdf = await openPdf(await downloadBytes(await pending));
    expect(pdf.numPages).toBe(2);
  });
});
