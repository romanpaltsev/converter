// «Удалить метаданные»: без перекодирования — формат, размеры, ориентация и ICC те же, метаданных нет.
import exifr from 'exifr';
import { readFileSync, statSync } from 'node:fs';
import { convertFiles as process, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, downloadBytes, expectTimestamped, fixture, hasXmp, jpegIcc, jpegInfo, readExif, unzip } from './files';

/** Всё, что видит exifr, включая XMP (у PNG — и текстовые чанки). */
async function everything(bytes: Uint8Array): Promise<Record<string, unknown>> {
  return ((await exifr.parse(bytes, { tiff: true, exif: true, gps: true, xmp: true, iptc: true, mergeOutput: true, reviveValues: false })) ?? {}) as Record<string, unknown>;
}

const DATE = '2024:07:15 14:23:05';

test.describe('удаление метаданных', () => {
  test('по умолчанию — всё: GPS, камеры, дат и XMP нет; ICC, размеры и сжатые данные те же', async ({ page }) => {
    await openConverter(page, '/udalit-metadannye-foto');
    await expect(page.getByRole('radio', { name: 'Все метаданные' })).toBeChecked();
    await expect(page.locator('[data-strip-hint]')).toContainText('Ориентация и цветовой профиль остаются');
    await expect(page.getByRole('radio', { name: 'JPG' })).toHaveCount(0); // формат не выбирается
    await process(page, ['exif-gps.jpg', 'exif-gps.heic', 'basic.webp', 'rotated.jpg', 'garbage.heic']);

    const photo = page.locator('.file').filter({ hasText: 'exif-gps.jpg' });
    await expect(photo).toContainText('Удалено: геолокация, камера и объектив, серийные номера');
    await expect(photo).toContainText('XMP');
    const jpeg = await download(page, 'exif-gps.jpg');
    expect(jpeg.length).toBeLessThan(statSync(fixture('exif-gps.jpg')).size);
    expect(jpegInfo(jpeg)).toMatchObject({ width: 1200, height: 800 });
    expect(await readExif(jpeg)).toBeNull();
    expect(hasXmp(jpeg)).toBe(false);
    expect(jpegIcc(jpeg)).not.toBeNull();

    // HEIC остаётся HEIC того же размера: EXIF и XMP затёрты на месте
    const heic = await download(page, 'exif-gps.heic');
    expect(heic.length).toBe(statSync(fixture('exif-gps.heic')).size);
    expect(heic.subarray(4, 8).toString()).toBe('ftyp');
    const heicData = await everything(heic);
    expect(heicData).not.toHaveProperty('Make');
    expect(heicData).not.toHaveProperty('latitude');

    await expect(page.locator('.file').filter({ hasText: 'basic.webp' })).toContainText('Метаданных не найдено — файл не изменён.');
    // ориентация сохраняется: снимок в галерее стоит так же, как исходный
    const rotated = await download(page, 'rotated.jpg');
    expect(await readExif(rotated)).toMatchObject({ Orientation: 6 });
    const pixels = await decodeInBrowser(page, rotated, 'image/jpeg', [[150, 200], [450, 200], [150, 600], [450, 600]]);
    expect(pixels.width).toBe(600);
    expect(pixels.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    await expect(page.locator('.file').filter({ hasText: 'garbage.heic' })).toContainText('Не удалось распознать файл как изображение');
    await expect(page.locator('[data-status-text]')).toHaveText('Готово: 4 из 5. Не удалось: 1.');
  });

  test('только геолокация, затем «Всё, кроме даты» — обработать заново', async ({ page }) => {
    await openConverter(page, '/udalit-metadannye-foto');
    await page.getByRole('radio', { name: 'Только геолокацию' }).check();
    await expect(page.locator('[data-strip-hint]')).toContainText('Камера и дата остаются');
    await process(page, ['exif-gps.jpg', 'exif-gps.png']);
    await expect(page.locator('.file').filter({ hasText: 'exif-gps.jpg' })).toContainText('Удалено: геолокация, XMP.');
    const located = await readExif(await download(page, 'exif-gps.jpg'));
    expect(located).toMatchObject({ hasGps: false, Make: expect.any(String), DateTimeOriginal: DATE });
    const png = await everything(await download(page, 'exif-gps.png'));
    expect(png).toMatchObject({ Make: expect.any(String), DateTimeOriginal: DATE });
    expect(png).not.toHaveProperty('latitude');

    await page.getByRole('radio', { name: 'Всё, кроме даты' }).check();
    const again = page.getByRole('button', { name: 'Обработать заново с новыми настройками' });
    await expect(again).toBeVisible();
    await again.click();
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(2);
    await expect(again).toBeHidden();
    const dated = await readExif(await download(page, 'exif-gps.jpg'));
    expect(dated).toMatchObject({ hasGps: false, DateTimeOriginal: DATE });
    expect(dated).not.toHaveProperty('Make');
  });

  test('en: ZIP с исходными именами, файл без метаданных не меняется', async ({ page }) => {
    await openConverter(page, '/en/remove-exif');
    await process(page, ['exif-gps.webp', 'basic.webp', 'exif-gps.tif']);
    await expect(page.locator('.file').filter({ hasText: 'basic.webp' })).toContainText('No metadata found — the file is unchanged.');
    await expect(page.locator('.file').filter({ hasText: 'exif-gps.tif' })).toContainText('Removed: location, camera and lens');
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download all (ZIP)' }).click();
    const zip = await pending;
    expectTimestamped(zip.suggestedFilename(), 'remove-exif.zip');
    const files = unzip(await downloadBytes(zip));
    expect(Object.keys(files).sort()).toEqual(['basic.webp', 'exif-gps.tif', 'exif-gps.webp']);
    expect(Buffer.from(files['basic.webp']!).equals(readFileSync(fixture('basic.webp')))).toBe(true);
    const tiff = await everything(files['exif-gps.tif']!);
    expect(tiff).not.toHaveProperty('Make');
    expect(tiff).toMatchObject({ ImageWidth: 400, ImageHeight: 300 });
  });
});
