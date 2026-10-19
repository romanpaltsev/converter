// TIFF на входе (UTIF.js + свой перевод в RGBA): сжатия, тайлы, 16 бит, альфа, страницы, метаданные, поворот.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, iccProfile, jpegIcc, jpegInfo, pngInfo, readExif } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const QUADRANTS: [number, number][] = [
  [100, 75],
  [300, 75],
  [100, 225],
  [300, 225],
];

test.describe('TIFF', () => {
  test('→ JPG: сжатия и тайлы — квадранты на месте; многостраничный — первая страница; CMYK — ошибка', async ({ page }) => {
    await openConverter(page, '/tiff-v-jpg');
    await convert(page, ['deflate.tif', 'jpeg.tif', 'tiled.tif', '16bit.tif', 'mono-g4.tif', 'multipage.tif', 'cmyk.tif']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(6);
    for (const name of ['deflate.jpg', 'jpeg.jpg', 'tiled.jpg', '16bit.jpg', 'multipage.jpg']) {
      const file = await download(page, name);
      expect(jpegInfo(file)).toMatchObject({ width: 400, height: 300 });
      expect((await decodeInBrowser(page, file, 'image/jpeg', QUADRANTS)).pixels.map(dominant), name).toEqual(['r', 'g', 'b', 'y']);
    }
    await expect(page.locator('.file').filter({ hasText: 'multipage.jpg' })).toContainText('сохранена первая страница');
    await expect(page.locator('.file').filter({ hasText: 'cmyk.tif' })).toContainText('CMYK');
  });

  test('метаданные: даты без GPS по умолчанию, ICC P3 переносится, Orientation применяется', async ({ page }) => {
    await openConverter(page, '/tiff-v-jpg');
    await convert(page, ['exif-gps.tif', 'rotated.tif']);
    const photo = await download(page, 'exif-gps.jpg');
    expect(jpegIcc(photo)).toEqual(P3);
    const exif = await readExif(photo);
    expect(exif).toMatchObject({ Orientation: 1, DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
    expect(exif?.Make).toBeUndefined();

    const rotated = await download(page, 'rotated.jpg');
    expect(jpegInfo(rotated)).toMatchObject({ width: 300, height: 400 });
    const points: [number, number][] = [
      [75, 100],
      [225, 100],
      [75, 300],
      [225, 300],
    ];
    expect((await decodeInBrowser(page, rotated, 'image/jpeg', points)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
  });

  test('→ PNG: прозрачность (обычная и предумноженная), «Сохранить все метаданные» — GPS', async ({ page }) => {
    await openConverter(page, '/en/tiff-to-png');
    await page.getByLabel('Keep all metadata (including location)').check();
    await convert(page, ['alpha.tif', 'alpha-assoc.tif', 'exif-gps.tif']);
    for (const name of ['alpha.png', 'alpha-assoc.png']) {
      const file = await download(page, name);
      expect(pngInfo(file)).toMatchObject({ width: 200, height: 150 });
      expect((await decodeInBrowser(page, file, 'image/png', [[2, 2], [100, 75]])).pixels.map(dominant), name).toEqual(['t', 'r']);
    }
    const exif = await readExif(pngInfo(await download(page, 'exif-gps.png')).exif);
    expect(exif).toMatchObject({ Make: 'Apple', hasGps: true });
  });
});
