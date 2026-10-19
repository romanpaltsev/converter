// «Изменить размер»: по длинной стороне, в процентах, ширина × высота; только уменьшение; формат сохраняется.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, jpegInfo, pngInfo, readExif, webpInfo } from './files';

test.describe('изменение размера', () => {
  test('по длинной стороне: 24 Мп HEIC → JPG 1920×1280, маленький файл не увеличивается', async ({ page }) => {
    await openConverter(page, '/izmenit-razmer-foto');
    await expect(page.getByRole('radio', { name: 'По длинной стороне' })).toBeChecked();
    await expect(page.getByRole('button', { name: '1920' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '3840' }).click();
    await expect(page.getByLabel('Сторона', { exact: true })).toHaveValue('3840');
    await expect(page.getByRole('button', { name: '3840' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: '1920' }).click();
    await convert(page, ['grid-24mp.heic', 'photo.jpg']);

    await expect(page.locator('.file').filter({ hasText: 'grid-24mp.jpg' })).toContainText('6000×4000 → 1920×1280');
    const big = await download(page, 'grid-24mp.jpg');
    expect(jpegInfo(big)).toMatchObject({ width: 1920, height: 1280 });
    expect(await readExif(big)).toMatchObject({ hasGps: false });

    const small = page.locator('.file').filter({ hasText: 'photo.jpg' });
    await expect(small).toContainText('1200×800 ·');
    await expect(small).toContainText('размер не изменён');
    expect(jpegInfo(await download(page, 'photo.jpg'))).toMatchObject({ width: 1200, height: 800 });
  });

  test('в процентах: поворот по EXIF применяется до уменьшения, квадранты на месте', async ({ page }) => {
    await openConverter(page, '/izmenit-razmer-foto');
    await page.getByRole('radio', { name: 'В процентах' }).check();
    await expect(page.getByLabel('Сторона', { exact: true })).toBeHidden();
    await page.getByLabel('Масштаб').fill('50');
    await convert(page, ['rotated.jpg']);
    const file = await download(page, 'rotated.jpg');
    expect(jpegInfo(file)).toMatchObject({ width: 300, height: 400 });
    const points: [number, number][] = [
      [75, 100],
      [225, 100],
      [75, 300],
      [225, 300],
    ];
    expect((await decodeInBrowser(page, file, 'image/jpeg', points)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
  });

  test('ширина и высота: с пропорциями — вписать (PNG с прозрачностью), без — растянуть (WebP)', async ({ page }) => {
    await openConverter(page, '/izmenit-razmer-foto');
    await page.getByRole('radio', { name: 'Ширина и высота' }).check();
    await page.getByLabel('Ширина', { exact: true }).fill('400');
    await page.getByLabel('Высота', { exact: true }).fill('400');
    await convert(page, ['alpha.png']);
    const alpha = await download(page, 'alpha.png');
    expect(pngInfo(alpha)).toMatchObject({ width: 400, height: 300 });
    expect((await decodeInBrowser(page, alpha, 'image/png', [[3, 3], [200, 150]])).pixels.map(dominant)).toEqual(['t', 'r']);

    await page.getByLabel('Сохранять пропорции').uncheck();
    await page.getByLabel('Высота', { exact: true }).fill('');
    await page.getByLabel('Ширина', { exact: true }).fill('600');
    await page.getByRole('button', { name: /Обработать заново/ }).click();
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
    expect(pngInfo(await download(page, 'alpha.png'))).toMatchObject({ width: 600, height: 600 });

    await page.getByRole('button', { name: 'Очистить' }).click();
    await page.getByLabel('Высота', { exact: true }).fill('300');
    await convert(page, ['exif-gps.webp']);
    expect(webpInfo(await download(page, 'exif-gps.webp'))).toMatchObject({ width: 600, height: 300 });
  });

  test('en: неверное число подсвечивается, готовый размер 800', async ({ page }) => {
    await openConverter(page, '/en/resize-image');
    const side = page.getByLabel('Side', { exact: true });
    await side.fill('abc');
    await expect(side).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: '800' }).click();
    await expect(side).toHaveAttribute('aria-invalid', 'false');
    await page.getByRole('radio', { name: 'WebP' }).check();
    await convert(page, ['photo.jpg']);
    await expect(page.locator('.file')).toContainText('1200×800 → 800×533');
    expect(webpInfo(await download(page, 'photo.webp'))).toMatchObject({ width: 800, height: 533 });
  });
});
