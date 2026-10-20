// ICO на выходе: размеры 16–256 (не больше исходника), PNG внутри, квадрат с прозрачными полями.
import { convertFiles as convert, downloadFile as download, expect, fileRow, openConverter, pickTarget, test } from './fixtures';
import { decodeInBrowser, dominant, icoEntries, pngInfo } from './files';

test.describe('ICO', () => {
  test('PNG → ICO: все размеры, PNG с прозрачностью внутри; прямоугольная картинка — в квадрате с полями', async ({ page }) => {
    await openConverter(page, '/png-v-ico');
    await expect(page.getByLabel('Качество')).toBeHidden();
    await expect(page.getByLabel(/Сохранить все метаданные/)).toBeHidden();
    await convert(page, ['alpha.png', 'exif-gps.png']);
    await expect(fileRow(page, 'alpha.ico').locator('[data-target-button]')).toHaveText('ICO');

    const alpha = icoEntries(await download(page, 'alpha.ico'));
    expect(alpha.map((e) => e.width)).toEqual([16, 32, 48, 64, 128, 256]);
    for (const entry of alpha) {
      expect(entry.bitCount).toBe(32);
      expect(pngInfo(entry.data)).toMatchObject({ width: entry.width, height: entry.width });
    }
    // круг на прозрачном фоне 800×600 → 256×192 в квадрате 256: поля по 32 строки сверху и снизу
    const big = alpha.at(-1)!.data;
    expect((await decodeInBrowser(page, big, 'image/png', [[128, 10], [128, 128], [5, 128]])).pixels.map(dominant)).toEqual(['t', 'r', 't']);

    const photo = icoEntries(await download(page, 'exif-gps.ico'));
    const square = photo.at(-1)!.data;
    expect(pngInfo(square)).toMatchObject({ width: 256, height: 256 });
    const [top, center] = (await decodeInBrowser(page, square, 'image/png', [[128, 5], [128, 128]])).pixels;
    expect(top![3]).toBe(0);
    expect(center![3]).toBe(255);
  });

  test('JPG → ICO: все размеры; при выборе другого формата пояснение скрывается, метаданные возвращаются', async ({ page }) => {
    await openConverter(page, '/en/jpg-to-ico');
    await expect(page.getByText('The icon gets sizes from 16 to 256 pixels')).toBeVisible();
    await convert(page, ['photo.jpg']);
    expect(icoEntries(await download(page, 'photo.ico')).map((e) => e.width)).toEqual([16, 32, 48, 64, 128, 256]);

    // другой формат у файла: пояснение про ICO скрывается, галочка метаданных возвращается
    await pickTarget(page, 'photo.ico', 'PNG');
    await expect(page.getByText('photo.png', { exact: true })).toBeVisible();
    await expect(page.getByText('The icon gets sizes from 16 to 256 pixels')).toBeHidden();
    await expect(page.getByLabel(/Keep all metadata/)).toBeVisible();
  });
});
