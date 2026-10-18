import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, hasXmp, iccProfile, jpegIcc, jpegInfo, pngInfo, readExif } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const SRGB = iccProfile('sRGB-v2-magic.icc');
const QUADRANTS: [number, number][] = [
  [150, 200],
  [450, 200],
  [150, 600],
  [450, 600],
];

test.describe('HEIC → JPG', () => {
  test('размеры, ориентация, ICC; по умолчанию даты есть, GPS и камеры нет', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convert(page, ['exif-gps.heic', 'rotated.heic', 'transposed.heic']);

    const photo = await download(page, 'exif-gps.jpg');
    const info = jpegInfo(photo);
    expect([info.width, info.height]).toEqual([1200, 800]);
    expect(info.markers.slice(0, 3)).toEqual([0xe0, 0xe1, 0xe2]); // APP0 JFIF, APP1 Exif, APP2 ICC
    const exif = await readExif(photo);
    expect(exif).toMatchObject({
      Orientation: 1,
      DateTimeOriginal: '2024:07:15 14:23:05',
      CreateDate: '2024:07:15 14:23:05',
      ModifyDate: '2024:07:15 14:23:05',
      OffsetTimeOriginal: '+03:00',
      SubSecTimeOriginal: '123',
      hasGps: false,
    });
    expect(exif?.Make).toBeUndefined();
    expect(exif?.Model).toBeUndefined();
    expect(exif?.SerialNumber).toBeUndefined();
    expect(hasXmp(photo)).toBe(false);
    expect(jpegIcc(photo)).toEqual(P3); // профиль исходника перенесён байт в байт

    for (const name of ['rotated.jpg', 'transposed.jpg']) {
      const bytes = await download(page, name);
      expect(jpegInfo(bytes)).toMatchObject({ width: 600, height: 800 });
      expect((await readExif(bytes))?.Orientation).toBe(1); // иначе будет двойной поворот
      const decoded = await decodeInBrowser(page, bytes, 'image/jpeg', QUADRANTS);
      expect([decoded.width, decoded.height]).toEqual([600, 800]);
      expect(decoded.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    }
  });

  test('«Сохранить все метаданные»: GPS и камера сохраняются, Orientation = 1', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.getByLabel('Сохранить все метаданные (включая геолокацию)').check();
    await convert(page, ['exif-gps.heic', 'rotated.heic']);
    const exif = await readExif(await download(page, 'exif-gps.jpg'));
    expect(exif).toMatchObject({ Orientation: 1, Make: 'Apple', Model: 'iPhone 15 Pro', SerialNumber: 'TESTSERIAL0001', hasGps: true });
    expect(exif?.latitude).toBeCloseTo(55.7539, 4);
    expect(exif?.longitude).toBeCloseTo(37.6208, 4);
    expect((await readExif(await download(page, 'rotated.jpg')))?.Orientation).toBe(1);
  });

  test('цвет в nclx: Display P3 → встраивается профиль P3, без профиля → sRGB', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convert(page, ['nclx-p3.heic', 'basic.heic', 'hdr-pq.heic']);
    expect(jpegIcc(await download(page, 'nclx-p3.jpg'))).toEqual(P3);
    expect(jpegIcc(await download(page, 'basic.jpg'))).toEqual(SRGB);
    await expect(page.locator('.file').filter({ hasText: 'hdr-pq.jpg' })).toContainText('HDR-снимок');
  });

  test('альфа-канал ложится на белый фон, многокадровый файл — основное изображение', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convert(page, ['alpha.heic', 'multi.heic', '10bit.heic']);
    const alpha = await decodeInBrowser(page, await download(page, 'alpha.jpg'), 'image/jpeg', [
      [5, 5],
      [400, 300],
    ]);
    expect(alpha.pixels.map(dominant)).toEqual(['w', 'r']);
    expect(jpegInfo(await download(page, 'multi.jpg'))).toMatchObject({ width: 640, height: 480 });
    expect(jpegInfo(await download(page, '10bit.jpg'))).toMatchObject({ width: 1200, height: 800 });
  });
});

test.describe('HEIC → PNG', () => {
  test('PNG по умолчанию: размеры, ориентация, iCCP и eXIf без GPS, прозрачность', async ({ page }) => {
    await openConverter(page, '/heic-v-png');
    await expect(page.locator('[data-png-warning]')).toBeVisible();
    await expect(page.locator('[data-quality-row]')).toBeHidden();
    await convert(page, ['exif-gps.heic', 'rotated.heic', 'alpha.heic']);

    const photo = pngInfo(await download(page, 'exif-gps.png'));
    expect([photo.width, photo.height]).toEqual([1200, 800]);
    expect(photo.chunks.slice(0, 3)).toEqual(['IHDR', 'iCCP', 'eXIf']);
    expect(photo.chunks.indexOf('eXIf')).toBeLessThan(photo.chunks.indexOf('IDAT'));
    expect(photo.icc).toEqual(P3);
    const exif = await readExif(photo.exif);
    expect(exif).toMatchObject({ Orientation: 1, DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
    expect(exif?.Make).toBeUndefined();

    const rotatedBytes = await download(page, 'rotated.png');
    expect(pngInfo(rotatedBytes)).toMatchObject({ width: 600, height: 800 });
    const rotated = await decodeInBrowser(page, rotatedBytes, 'image/png', QUADRANTS);
    expect(rotated.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);

    const alpha = await decodeInBrowser(page, await download(page, 'alpha.png'), 'image/png', [
      [5, 5],
      [400, 300],
    ]);
    expect(alpha.pixels.map(dominant)).toEqual(['t', 'r']);
  });

  test('на английской странице тоже PNG по умолчанию, с галочкой GPS сохраняется', async ({ page }) => {
    await openConverter(page, '/en/heic-to-png');
    await page.getByLabel('Keep all metadata (including location)').check();
    await convert(page, ['exif-gps.heic']);
    const exif = await readExif(pngInfo(await download(page, 'exif-gps.png')).exif);
    expect(exif?.latitude).toBeCloseTo(55.7539, 4);
    expect(exif?.Orientation).toBe(1);
  });
});
