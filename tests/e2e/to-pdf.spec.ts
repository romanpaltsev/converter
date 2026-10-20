// «Изображения в PDF»: страницы в порядке списка, A4/Letter/по размеру фото, JPEG без перекодирования,
// прозрачность — маской, метаданные фото в документ не попадают. PDF разбирается независимо — pdf.js в Node.
import { readFileSync, writeFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { convertFiles as process, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, downloadBytes, entropyData, expectTimestamped, fixture, openPdf, pageInfo, pngInfo } from './files';

async function downloadPdf(page: Page, name: string): Promise<Buffer> {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: /^(Скачать PDF|Download PDF)$/ }).click();
  const file = await pending;
  expectTimestamped(file.suggestedFilename(), name);
  return downloadBytes(file);
}

test.describe('изображения в PDF', () => {
  test('страницы в порядке списка: JPEG без перекодирования, альбомные — на альбомный лист, прозрачность маской', async ({ page }) => {
    await openConverter(page, '/jpg-v-pdf');
    await expect(page.getByRole('radio', { name: 'A4' })).toBeChecked();
    await process(page, ['rotated.jpg', 'alpha.png', 'exif-gps.jpg']);
    await expect(page.locator('.file').filter({ hasText: 'rotated.jpg' })).toContainText('Стр. 1 · 600×800 · без перекодирования');
    // exif-gps.jpg — на второе место
    await page.getByRole('button', { name: 'Переместить выше: exif-gps.jpg' }).click();
    await expect(page.getByRole('button', { name: 'Переместить выше: exif-gps.jpg' })).toBeFocused();
    await expect(page.locator('.file__name')).toHaveText(['rotated.jpg', 'exif-gps.jpg', 'alpha.png']);
    await expect(page.locator('.file').filter({ hasText: 'alpha.png' })).toContainText('Стр. 3 · 800×600');

    const bytes = await downloadPdf(page, 'rotated.pdf');
    const pdf = await openPdf(bytes);
    expect(pdf.numPages).toBe(3);
    // 1: повёрнутый JPEG — книжный A4, поворот на 90° матрицей; пиксели в PDF — как в файле (800×600)
    const first = await pageInfo(pdf, 1);
    expect(first.view).toEqual([0, 0, 595.28, 841.89]);
    expect(first.transform.slice(0, 4)).toEqual([0, -793.71, 595.28, 0]);
    expect([first.image.width, first.image.height]).toEqual([800, 600]);
    // 2: альбомное фото — альбомный A4
    expect((await pageInfo(pdf, 2)).view).toEqual([0, 0, 841.89, 595.28]);
    // 3: PNG с прозрачностью — без потерь: углы прозрачные, центр — красный ровно как в файле (224, 0, 0)
    const third = await pageInfo(pdf, 3);
    expect([third.image.width, third.image.height]).toEqual([800, 600]);
    const pixel = (x: number, y: number) => Array.from(third.image.data.subarray((y * 800 + x) * 4, (y * 800 + x) * 4 + 4));
    expect(pixel(5, 5)[3]).toBe(0);
    expect(pixel(400, 300)).toEqual([224, 0, 0, 255]);

    // JPEG вставлены без перекодирования: сжатые данные исходников есть в PDF байт в байт
    expect(bytes.includes(entropyData(readFileSync(fixture('rotated.jpg'))))).toBe(true);
    expect(bytes.includes(entropyData(readFileSync(fixture('exif-gps.jpg'))))).toBe(true);
    // метаданных фото нет: ни камеры, ни серийного номера, ни XMP
    for (const text of ['iPhone', 'TESTSERIAL', 'http://ns.adobe.com/xap']) expect(bytes.includes(text), text).toBe(false);
  });

  test('HEIC — в PDF через JPEG, «По размеру фото» и узкие поля применяются без повторной обработки', async ({ page }) => {
    await openConverter(page, '/heic-v-pdf');
    await process(page, ['exif-gps.heic']);
    await page.getByRole('radio', { name: 'По размеру фото' }).check();
    await page.getByRole('radio', { name: 'Узкие' }).check();
    await expect(page.getByRole('button', { name: /заново/ })).toBeHidden();
    const pdf = await openPdf(await downloadPdf(page, 'exif-gps.pdf'));
    const { view, image } = await pageInfo(pdf, 1);
    // 1200×800 пикселей при 96 dpi — 900×600 пунктов, плюс поля по 10 мм
    expect(view).toEqual([0, 0, 956.69, 656.69]);
    expect([image.width, image.height]).toEqual([1200, 800]);
  });

  test('туда и обратно: «JPG в PDF», затем «PDF в PNG» — повёрнутое фото стоит правильно (рисует pdf.js)', async ({ page }, testInfo) => {
    await openConverter(page, '/jpg-v-pdf');
    await process(page, ['rotated.jpg']);
    const pdfPath = testInfo.outputPath('rotated.pdf');
    writeFileSync(pdfPath, await downloadPdf(page, 'rotated.pdf'));

    await openConverter(page, '/pdf-v-png');
    await page.getByRole('radio', { name: '72 dpi' }).check();
    await page.setInputFiles('[data-input]', [pdfPath]);
    await expect(page.locator('.file--page[data-status="done"]')).toHaveCount(1);
    const pending = page.waitForEvent('download');
    await page.locator('.file--page .file__download').click();
    const png = await downloadBytes(await pending);
    // A4 при 72 dpi; фото 600×800 вписано по ширине и стоит по центру
    expect(pngInfo(png)).toMatchObject({ width: 595, height: 841 });
    const points: [number, number][] = [[150, 220], [450, 220], [150, 620], [450, 620]];
    expect((await decodeInBrowser(page, png, 'image/png', points)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
  });

  test('en: Letter; файл с ошибкой и убранный файл в PDF не попадают', async ({ page }) => {
    await openConverter(page, '/en/png-to-pdf');
    await page.getByRole('radio', { name: 'Letter' }).check();
    await process(page, ['alpha.png', 'garbage.heic', 'photo.jpg']);
    await page.getByRole('button', { name: 'Remove from the list: photo.jpg' }).click();
    await expect(page.locator('.file')).toHaveCount(2);
    const pdf = await openPdf(await downloadPdf(page, 'alpha.pdf'));
    expect(pdf.numPages).toBe(1);
    expect((await pageInfo(pdf, 1)).view).toEqual([0, 0, 792, 612]);
  });
});
