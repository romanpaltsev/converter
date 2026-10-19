// AVIF на входе (libheif + dav1d): метаданные, irot, nclx и HDR, 10 бит, прозрачность, анимация, все выходы.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, hasXmp, iccProfile, jpegIcc, jpegInfo, pngInfo, readExif, webpInfo } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const SRGB = iccProfile('sRGB-v2-magic.icc');
// квадранты rotated.avif на экране 600×800: красный, зелёный / синий, жёлтый
const QUADRANTS: [number, number][] = [
  [150, 200],
  [450, 200],
  [150, 600],
  [450, 600],
];
const DATES = {
  DateTimeOriginal: '2024:07:15 14:23:05',
  CreateDate: '2024:07:15 14:23:05',
  OffsetTimeOriginal: '+03:00',
  SubSecTimeOriginal: '123',
};

test.describe('AVIF → JPG', () => {
  test('ICC и даты без GPS и камеры, irot, nclx → профиль, HDR и 10 бит, прозрачность на белом', async ({ page }) => {
    await openConverter(page, '/avif-v-jpg');
    await convert(page, ['exif-gps.avif', 'rotated.avif', 'nclx-p3.avif', 'photo.avif', 'hdr-pq.avif', '10bit.avif', 'alpha.avif']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(7);

    const photo = await download(page, 'exif-gps.jpg');
    expect(jpegInfo(photo)).toMatchObject({ width: 1200, height: 800 });
    expect(jpegIcc(photo)).toEqual(P3);
    const exif = await readExif(photo);
    expect(exif).toMatchObject({ Orientation: 1, ...DATES, hasGps: false });
    expect(exif?.Make).toBeUndefined();
    expect(exif?.SerialNumber).toBeUndefined();
    expect(hasXmp(photo)).toBe(false);

    const rotated = await download(page, 'rotated.jpg');
    expect(jpegInfo(rotated)).toMatchObject({ width: 600, height: 800 });
    expect((await decodeInBrowser(page, rotated, 'image/jpeg', QUADRANTS)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);

    expect(jpegIcc(await download(page, 'nclx-p3.jpg'))).toEqual(P3);
    expect(jpegIcc(await download(page, 'photo.jpg'))).toEqual(SRGB);
    await expect(page.locator('.file').filter({ hasText: 'hdr-pq.jpg' })).toContainText('HDR-снимок');
    expect(jpegInfo(await download(page, '10bit.jpg'))).toMatchObject({ width: 1200, height: 800 });

    const alpha = await decodeInBrowser(page, await download(page, 'alpha.jpg'), 'image/jpeg', [
      [5, 5],
      [400, 300],
    ]);
    expect(alpha.pixels.map(dominant)).toEqual(['w', 'r']);
  });

  test('анимированный AVIF — основное изображение и предупреждение', async ({ page }) => {
    await openConverter(page, '/avif-v-jpg');
    await convert(page, ['animated.avif']);
    const row = page.locator('.file').filter({ hasText: 'animated.jpg' });
    await expect(row).toHaveAttribute('data-status', 'done');
    await expect(row).toContainText('сохранён первый кадр');
    expect(jpegInfo(await download(page, 'animated.jpg'))).toMatchObject({ width: 640, height: 480 });
  });
});

test.describe('AVIF → PNG и WebP', () => {
  test('PNG: прозрачность сохраняется, iCCP и eXIf; «Сохранить все метаданные» переносит GPS', async ({ page }) => {
    await openConverter(page, '/en/avif-to-png');
    await page.getByLabel('Keep all metadata (including location)').check();
    await convert(page, ['alpha.avif', 'exif-gps.avif']);

    const alpha = await decodeInBrowser(page, await download(page, 'alpha.png'), 'image/png', [
      [5, 5],
      [400, 300],
    ]);
    expect(alpha.pixels.map(dominant)).toEqual(['t', 'r']);

    const photo = pngInfo(await download(page, 'exif-gps.png'));
    expect(photo.icc).toEqual(P3);
    const exif = await readExif(photo.exif);
    expect(exif).toMatchObject({ Orientation: 1, Make: 'Apple', hasGps: true });
    expect(exif?.latitude).toBeCloseTo(55.7539, 4);
  });

  test('WebP: профиль и поворот', async ({ page }) => {
    await openConverter(page, '/avif-v-jpg');
    await page.getByRole('radio', { name: 'WebP' }).check();
    await convert(page, ['rotated.avif', 'nclx-p3.avif']);
    const rotated = await download(page, 'rotated.webp');
    expect(webpInfo(rotated)).toMatchObject({ width: 600, height: 800 });
    expect((await decodeInBrowser(page, rotated, 'image/webp', QUADRANTS)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    expect(webpInfo(await download(page, 'nclx-p3.webp')).icc).toEqual(P3);
  });

  test('AVIF принимается и на чужой странице (HEIC → JPG)', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convert(page, ['photo.avif']);
    await expect(page.locator('.file').filter({ hasText: 'photo.jpg' })).toHaveAttribute('data-status', 'done');
  });
});
