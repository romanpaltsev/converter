// «Сжать фото»: формат сохраняется («Исходный»), качество с ползунка или подбор под целевой размер.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, fixture, jpegInfo, pngInfo, readExif, webpInfo } from './files';
import { statSync } from 'node:fs';

const SOF0 = 0xc0;

test.describe('сжатие', () => {
  test('по качеству: формат сохраняется, HEIC → JPG, метаданные по умолчанию — только даты', async ({ page }) => {
    await openConverter(page, '/szhat-foto');
    await expect(page.getByRole('radio', { name: 'Исходный' })).toBeChecked();
    await expect(page.locator('[data-original-hint]')).toContainText('сохраняются в JPG');
    await convert(page, ['exif-gps.jpg', 'basic.heic', 'alpha.png', 'basic.webp']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(4);

    const row = page.locator('.file').filter({ hasText: 'exif-gps.jpg' });
    await expect(row).toContainText(/\(−\d+\s%\)/);
    const photo = await download(page, 'exif-gps.jpg');
    expect(photo.length).toBeLessThan(statSync(fixture('exif-gps.jpg')).size);
    expect(jpegInfo(photo)).toMatchObject({ width: 1200, height: 800 });
    expect(await readExif(photo)).toMatchObject({ DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });

    expect(jpegInfo(await download(page, 'basic.jpg'))).toMatchObject({ width: 1200, height: 800 });
    expect(webpInfo(await download(page, 'basic.webp'))).toMatchObject({ width: 1200, height: 800 });
    const alpha = await download(page, 'alpha.png');
    expect(pngInfo(alpha)).toMatchObject({ width: 800, height: 600 });
    expect((await decodeInBrowser(page, alpha, 'image/png', [[5, 5], [400, 300]])).pixels.map(dominant)).toEqual(['t', 'r']);
  });

  test('до размера: файл не больше цели, качество подобрано, JPEG остаётся baseline', async ({ page }) => {
    await openConverter(page, '/szhat-foto');
    await page.getByRole('radio', { name: 'До размера' }).check();
    await expect(page.getByLabel('Качество')).toBeHidden();
    await page.getByLabel('Не больше').fill('40');
    await convert(page, ['exif-gps.jpg', 'exif-gps.png']);

    const row = page.locator('.file').filter({ hasText: 'exif-gps.jpg' });
    await expect(row).toContainText(/качество \d+/);
    const photo = await download(page, 'exif-gps.jpg');
    expect(photo.length).toBeLessThanOrEqual(40_000);
    expect(jpegInfo(photo).markers).toContain(SOF0);

    // у PNG нет качества — размер не подобрать, об этом говорит строка файла
    await expect(page.locator('.file').filter({ hasText: 'exif-gps.png' })).toContainText('подобрать размер нельзя');
  });

  test('недостижимая цель — самый маленький вариант и подсказка', async ({ page }) => {
    await openConverter(page, '/szhat-foto');
    await page.getByRole('radio', { name: 'До размера' }).check();
    await page.getByLabel('Не больше').fill('10');
    await convert(page, ['grid-24mp.heic']);
    const row = page.locator('.file').filter({ hasText: 'grid-24mp.jpg' });
    await expect(row).toHaveAttribute('data-status', 'done');
    await expect(row).toContainText('качество 5');
    await expect(row).toContainText('Уменьшите изображение в пикселях');
  });

  test('en: мегабайты и формат WebP', async ({ page }) => {
    await openConverter(page, '/en/compress-image');
    await page.getByRole('radio', { name: 'WebP' }).check();
    await page.getByRole('radio', { name: 'To file size' }).check();
    await page.getByLabel('At most').fill('0.03');
    await page.getByRole('radio', { name: 'MB' }).check();
    await convert(page, ['exif-gps.jpg']);
    const file = await download(page, 'exif-gps.webp');
    expect(file.length).toBeLessThanOrEqual(30_000);
    expect(webpInfo(file)).toMatchObject({ width: 1200, height: 800 });
  });
});
