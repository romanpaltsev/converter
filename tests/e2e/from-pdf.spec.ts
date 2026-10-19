// «PDF в JPG/PNG»: pdf.js рисует страницы в worker'е; размеры по dpi, поворот /Rotate, стандартные шрифты
// со своего домена, пароль и битый файл — понятные ошибки.
import type { Page } from '@playwright/test';
import { convertFiles, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, downloadBytes, expectTimestamped, fixture, jpegInfo, pngInfo, unzip } from './files';

/** Добавить PDF и дождаться, пока каждый документ закончится: строки страниц не считаются. */
async function process(page: Page, names: string[]): Promise<void> {
  await page.setInputFiles('[data-input]', names.map(fixture));
  await expect(page.locator('.file:not(.file--page):is([data-status="done"], [data-status="error"])')).toHaveCount(names.length, { timeout: 120_000 });
}

/** Сколько тёмных точек в прямоугольнике картинки (текст на странице). */
async function darkPixels(page: Page, bytes: Uint8Array, mime: string, [x, y, w, h]: number[]): Promise<number> {
  return page.evaluate(
    async ({ base64, mime, box }) => {
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([binary], { type: mime }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      const { data } = ctx.getImageData(box[0]!, box[1]!, box[2]!, box[3]!);
      let dark = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i]! + data[i + 1]! + data[i + 2]! < 200) dark++;
      return dark;
    },
    { base64: Buffer.from(bytes).toString('base64'), mime, box: [x, y, w, h] },
  );
}

test.describe('PDF в картинки', () => {
  test('страницы по 150 dpi: квадранты, поворот /Rotate, текст стандартным шрифтом; ошибки понятные', async ({ page, network }) => {
    await openConverter(page, '/pdf-v-jpg');
    await expect(page.getByRole('radio', { name: '150 dpi' })).toBeChecked();
    await process(page, ['quadrants.pdf', 'two-pages.pdf', 'encrypted.pdf', 'garbage.pdf', 'photo.jpg']);
    await expect(page.locator('.file__name')).toHaveText([
      'quadrants.pdf',
      'quadrants_1.jpg',
      'two-pages.pdf',
      'two-pages_1.jpg',
      'two-pages_2.jpg',
      'encrypted.pdf',
      'garbage.pdf',
      'photo.jpg',
    ]);
    await expect(page.locator('.file').filter({ hasText: 'two-pages.pdf' })).toContainText('PDF · страниц: 2');
    await expect(page.locator('.file').filter({ hasText: 'two-pages_2.jpg' })).toContainText('Стр. 2 из 2 · 1239×1754');

    // 600×400 pt при 150 dpi — 1250×833
    const quadrants = await download(page, 'quadrants_1.jpg');
    expect(jpegInfo(quadrants)).toMatchObject({ width: 1250, height: 833 });
    const colors = await decodeInBrowser(page, quadrants, 'image/jpeg', [[300, 200], [950, 200], [300, 630], [950, 630]]);
    expect(colors.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    // страница с /Rotate 90: книжная, квадранты повёрнуты по часовой
    const rotated = await download(page, 'two-pages_1.jpg');
    expect(jpegInfo(rotated)).toMatchObject({ width: 833, height: 1250 });
    expect((await decodeInBrowser(page, rotated, 'image/jpeg', [[200, 300], [630, 300], [200, 950], [630, 950]])).pixels.map(dominant)).toEqual(['b', 'r', 'y', 'g']);
    // текст Helvetica без встраивания нарисован: шрифт взят с нашего сайта
    const text = await download(page, 'two-pages_2.jpg');
    expect((await decodeInBrowser(page, text, 'image/jpeg', [[625, 350]])).pixels.map(dominant)).toEqual(['b']);
    expect(await darkPixels(page, text, 'image/jpeg', [125, 790, 700, 130])).toBeGreaterThan(2000);
    expect(network.requests.some((r) => /^\/_astro\/pdfjs\/[\d.]+\/standard_fonts\//.test(r.url))).toBe(true);

    await expect(page.locator('.file').filter({ hasText: 'encrypted.pdf' })).toContainText('PDF защищён паролем');
    await expect(page.locator('.file').filter({ hasText: 'garbage.pdf' })).toContainText('Не удалось прочитать файл');
    await expect(page.locator('.file').filter({ hasText: 'photo.jpg' })).toContainText('Это не PDF-файл.');
  });

  test('en: PNG без потерь при 72 dpi, ZIP со всеми страницами, смена разрешения — страницы заново', async ({ page }) => {
    await openConverter(page, '/en/pdf-to-png');
    await page.getByRole('radio', { name: '72 dpi' }).check();
    await process(page, ['quadrants.pdf', 'two-pages.pdf']);
    const quadrants = await download(page, 'quadrants_1.png');
    expect(pngInfo(quadrants)).toMatchObject({ width: 600, height: 400 });
    expect((await decodeInBrowser(page, quadrants, 'image/png', [[150, 100]])).pixels[0]).toEqual([224, 0, 0, 255]);

    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download all (ZIP)' }).click();
    const zip = await pending;
    expectTimestamped(zip.suggestedFilename(), 'pdf-to-png.zip');
    expect(Object.keys(unzip(await downloadBytes(zip))).sort()).toEqual(['quadrants_1.png', 'two-pages_1.png', 'two-pages_2.png']);

    await page.getByRole('radio', { name: '150 dpi' }).check();
    await page.getByRole('button', { name: 'Convert again with the new settings' }).click();
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(5);
    await expect(page.locator('.file').filter({ hasText: 'quadrants_1.png' })).toContainText('1250×833');
    await expect(page.locator('.file')).toHaveCount(5);
  });

  test('PDF на странице картинок — подсказка открыть «PDF в JPG»', async ({ page }) => {
    await openConverter(page, '/jpg-v-png');
    await convertFiles(page, ['quadrants.pdf']);
    await expect(page.locator('.file')).toContainText('Это PDF-документ, а не картинка');
  });
});
