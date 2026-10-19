// JPEG XL на входе (jxl-oxide): контейнер и кодовый поток, прозрачность, ICC и EXIF, ориентация, анимация.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, iccProfile, jpegIcc, jpegInfo, pngInfo, readExif } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const QUADRANTS: [number, number][] = [
  [300, 200],
  [900, 200],
  [300, 600],
  [900, 600],
];

test.describe('JPEG XL', () => {
  test('→ JPG: квадранты (контейнер и кодовый поток), ICC и даты без GPS, ориентация, анимация', async ({ page }) => {
    await openConverter(page, '/jxl-v-jpg');
    await convert(page, ['basic.jxl', 'codestream.jxl', 'exif-gps.jxl', 'exif-brotli.jxl', 'rotated.jxl', 'animated.jxl']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(6);
    for (const name of ['basic.jpg', 'codestream.jpg']) {
      const file = await download(page, name);
      expect(jpegInfo(file)).toMatchObject({ width: 1200, height: 800 });
      expect((await decodeInBrowser(page, file, 'image/jpeg', QUADRANTS)).pixels.map(dominant), name).toEqual(['r', 'g', 'b', 'y']);
    }

    const photo = await download(page, 'exif-gps.jpg');
    expect(jpegIcc(photo)).toEqual(P3);
    expect(await readExif(photo)).toMatchObject({ Orientation: 1, DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
    // Exif, сжатый brotli, не читается — файл всё равно конвертируется
    expect(jpegInfo(await download(page, 'exif-brotli.jpg'))).toMatchObject({ width: 1200, height: 800 });

    const rotated = await download(page, 'rotated.jpg');
    expect(jpegInfo(rotated)).toMatchObject({ width: 600, height: 800 });
    const points: [number, number][] = [
      [150, 200],
      [450, 200],
      [150, 600],
      [450, 600],
    ];
    expect((await decodeInBrowser(page, rotated, 'image/jpeg', points)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);

    await expect(page.locator('.file').filter({ hasText: 'animated.jpg' })).toContainText('сохранён первый кадр');
  });

  test('→ PNG: прозрачность; «Сохранить все метаданные» — GPS', async ({ page }) => {
    await openConverter(page, '/en/jxl-to-png');
    await page.getByLabel('Keep all metadata (including location)').check();
    await convert(page, ['alpha.jxl', 'exif-gps.jxl']);
    const alpha = await download(page, 'alpha.png');
    expect(pngInfo(alpha)).toMatchObject({ width: 800, height: 600 });
    expect((await decodeInBrowser(page, alpha, 'image/png', [[5, 5], [400, 300]])).pixels.map(dominant)).toEqual(['t', 'r']);
    const exif = await readExif(pngInfo(await download(page, 'exif-gps.png')).exif);
    expect(exif).toMatchObject({ Make: 'Apple', hasGps: true });
  });
});
