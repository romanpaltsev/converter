// «Посмотреть EXIF»: сводка на языке страницы, место на карте только ссылкой, полная таблица, скачивание без метаданных.
import { convertFiles as process, expect, openConverter, test } from './fixtures';
import { downloadBytes, expectTimestamped, jpegInfo, readExif } from './files';

test.describe('просмотр EXIF', () => {
  test('сводка, место на карте и все теги; файл без метаданных — так и сказано', async ({ page }) => {
    await openConverter(page, '/posmotret-exif');
    await expect(page.locator('form[data-settings]')).toBeHidden();
    await process(page, ['exif-gps.jpg', 'basic.webp', 'rotated.heic']);
    const photo = page.locator('.file').filter({ hasText: 'exif-gps.jpg' });
    await expect(photo.locator('.file__meta')).toHaveText(/^JPG · \d+ КБ · 1200×800$/);
    await expect(photo.locator('.report__summary')).toContainText(/15 июля 2024.*14:23:05 \(UTC\+03:00\)/);
    await expect(photo.locator('.report__summary')).toContainText('Apple iPhone 15 Pro');
    await expect(photo.locator('.report__summary')).toContainText('Display P3');
    await expect(photo.locator('.report__location')).toContainText('55,753900° с. ш., 37,620800° в. д., высота 150 м');
    const yandex = photo.getByRole('link', { name: 'Яндекс Карты' });
    await expect(yandex).toHaveAttribute('href', 'https://yandex.ru/maps/?pt=37.620800,55.753900&z=16&l=map');
    // ссылка открывается в новой вкладке и не передаёт адрес страницы
    await expect(yandex).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(yandex).toHaveAttribute('target', '_blank');

    await photo.getByText('Все теги EXIF (27)').click();
    await expect(photo.getByRole('row', { name: 'GPSLatitudeRef N' })).toBeVisible();
    await expect(photo.getByRole('row', { name: 'ExifVersion 0232' })).toBeVisible();

    await expect(page.locator('.file').filter({ hasText: 'basic.webp' })).toContainText('Метаданных не найдено.');
    await expect(page.locator('.file').filter({ hasText: 'rotated.heic' }).locator('.file__meta')).toHaveText(/600×800$/);
    await expect(page.locator('[data-zip]')).toBeHidden();
  });

  test('«Скачать без метаданных»: копия без EXIF, имя с датой и временем', async ({ page }) => {
    await openConverter(page, '/posmotret-exif');
    await process(page, ['exif-gps.jpg']);
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать без метаданных: exif-gps.jpg' }).click();
    const file = await pending;
    expectTimestamped(file.suggestedFilename(), 'exif-gps.jpg');
    const bytes = await downloadBytes(file);
    expect(await readExif(bytes)).toBeNull();
    expect(jpegInfo(bytes)).toMatchObject({ width: 1200, height: 800 });
  });

  test('en: Google Maps и OpenStreetMap, координаты с N/E', async ({ page }) => {
    await openConverter(page, '/en/exif-viewer');
    await process(page, ['exif-gps.heic']);
    const card = page.locator('.file');
    await expect(card.locator('.report__summary')).toContainText('Apple iPhone 15 Pro');
    await expect(card.locator('.report__location')).toContainText('55.753900° N, 37.620800° E, altitude 150 m');
    await expect(card.getByRole('link', { name: 'Google Maps' })).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=55.753900,37.620800');
    await expect(card.getByRole('link', { name: 'OpenStreetMap' })).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/?mlat=55.753900&mlon=37.620800#map=16/55.753900/37.620800',
    );
  });
});
