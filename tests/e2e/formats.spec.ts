// JPG, PNG и WebP на входе и WebP на выходе: метаданные, поворот по EXIF, прозрачность, варианты форматов,
// «любой вход на любой странице».
import { readFileSync } from 'node:fs';
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, fixture, hasXmp, iccProfile, jpegIcc, jpegInfo, pngInfo, readExif, webpInfo } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const SRGB = iccProfile('sRGB-v2-magic.icc');
// квадранты повёрнутых фикстур на экране 600×800: красный, зелёный / синий, жёлтый
const QUADRANTS: [number, number][] = [
  [150, 200],
  [450, 200],
  [150, 600],
  [450, 600],
];
const WIDE_QUADRANTS: [number, number][] = [
  [300, 200],
  [900, 200],
  [300, 600],
  [900, 600],
];
const DATES = {
  DateTimeOriginal: '2024:07:15 14:23:05',
  CreateDate: '2024:07:15 14:23:05',
  OffsetTimeOriginal: '+03:00',
  SubSecTimeOriginal: '123',
};

test.describe('PNG → JPG', () => {
  test('ICC, даты без GPS и камеры, поворот по eXIf, прозрачность на белом', async ({ page }) => {
    await openConverter(page, '/png-v-jpg');
    await convert(page, ['exif-gps.png', 'rotated.png', 'alpha.png', 'palette-trns.png']);

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
    expect((await readExif(rotated))?.Orientation).toBe(1);
    expect((await decodeInBrowser(page, rotated, 'image/jpeg', QUADRANTS)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);

    for (const name of ['alpha.jpg', 'palette-trns.jpg']) {
      const decoded = await decodeInBrowser(page, await download(page, name), 'image/jpeg', [
        [5, 5],
        [400, 300],
      ]);
      expect(decoded.pixels.map(dominant), name).toEqual(['w', 'r']);
    }
  });

  test('серый, 16 бит, чересстрочный; у APNG — первый кадр и предупреждение', async ({ page }) => {
    await openConverter(page, '/png-v-jpg');
    await convert(page, ['gray.png', '16bit.png', 'interlaced.png', 'animated.png']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(4);
    expect(jpegIcc(await download(page, 'gray.jpg'))).toEqual(SRGB); // профиля нет — sRGB
    expect(jpegInfo(await download(page, '16bit.jpg'))).toMatchObject({ width: 1200, height: 800 });
    const interlaced = await decodeInBrowser(page, await download(page, 'interlaced.jpg'), 'image/jpeg', WIDE_QUADRANTS);
    expect(interlaced.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    expect(jpegInfo(await download(page, 'animated.jpg'))).toMatchObject({ width: 640, height: 480 });
    await expect(page.locator('.file').filter({ hasText: 'animated.jpg' })).toContainText('сохранён первый кадр');
  });
});

test.describe('JPG → PNG', () => {
  test('iCCP и eXIf без GPS, повороты 6, 5 и 2, без профиля — sRGB', async ({ page }) => {
    await openConverter(page, '/jpg-v-png');
    await convert(page, ['exif-gps.jpg', 'rotated.jpg', 'transposed.jpg', 'mirrored.jpg', 'photo.jpg']);

    const photo = pngInfo(await download(page, 'exif-gps.png'));
    expect([photo.width, photo.height]).toEqual([1200, 800]);
    expect(photo.chunks.slice(0, 3)).toEqual(['IHDR', 'iCCP', 'eXIf']);
    expect(photo.icc).toEqual(P3);
    const exif = await readExif(photo.exif);
    expect(exif).toMatchObject({ Orientation: 1, ...DATES, hasGps: false });
    expect(exif?.Model).toBeUndefined();

    for (const name of ['rotated.png', 'transposed.png', 'mirrored.png']) {
      const bytes = await download(page, name);
      expect(pngInfo(bytes), name).toMatchObject({ width: 600, height: 800 });
      expect((await decodeInBrowser(page, bytes, 'image/png', QUADRANTS)).pixels.map(dominant), name).toEqual(['r', 'g', 'b', 'y']);
    }
    expect(pngInfo(await download(page, 'photo.png')).icc).toEqual(SRGB);
  });

  test('«Сохранить все метаданные»: GPS и камера переносятся в PNG', async ({ page }) => {
    await openConverter(page, '/en/jpg-to-png');
    await page.getByLabel('Keep all metadata (including location)').check();
    await convert(page, ['exif-gps.jpg']);
    const exif = await readExif(pngInfo(await download(page, 'exif-gps.png')).exif);
    expect(exif).toMatchObject({ Orientation: 1, Make: 'Apple', Model: 'iPhone 15 Pro', hasGps: true });
    expect(exif?.latitude).toBeCloseTo(55.7539, 4);
  });

  test('варианты JPEG: серый и прогрессивный — да; CMYK, 12 бит, lossless и арифметический — понятные ошибки', async ({ page }) => {
    await openConverter(page, '/jpg-v-png');
    await convert(page, ['gray.jpg', 'progressive.jpg', 'cmyk.jpg', '12bit.jpg', 'lossless.jpg', 'arith.jpg']);
    const rows = page.locator('.file');
    await expect(rows.evaluateAll((list) => list.map((row) => (row as HTMLElement).dataset.status))).resolves.toEqual([
      'done',
      'done',
      'error',
      'error',
      'error',
      'error',
    ]);
    await expect(rows.nth(2)).toContainText('CMYK');
    for (const i of [3, 4, 5]) await expect(rows.nth(i)).toContainText('Этот вариант формата не поддерживается');
    const progressive = await decodeInBrowser(page, await download(page, 'progressive.png'), 'image/png', WIDE_QUADRANTS);
    expect(progressive.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
  });
});

test.describe('WebP → JPG', () => {
  test('ICC и даты, поворот по EXIF (с префиксом «Exif» и без), прозрачность на белом, у анимации — первый кадр', async ({ page }) => {
    await openConverter(page, '/webp-v-jpg');
    await convert(page, ['exif-gps.webp', 'rotated.webp', 'exif-prefixed.webp', 'lossless-alpha.webp', 'lossy-alpha.webp', 'animated.webp', 'basic.webp']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(7);

    const photo = await download(page, 'exif-gps.jpg');
    expect(jpegInfo(photo)).toMatchObject({ width: 1200, height: 800 });
    expect(jpegIcc(photo)).toEqual(P3);
    const exif = await readExif(photo);
    expect(exif).toMatchObject({ Orientation: 1, ...DATES, hasGps: false });
    expect(exif?.Make).toBeUndefined();

    for (const name of ['rotated.jpg', 'exif-prefixed.jpg']) {
      const bytes = await download(page, name);
      expect(jpegInfo(bytes), name).toMatchObject({ width: 600, height: 800 });
      expect((await decodeInBrowser(page, bytes, 'image/jpeg', QUADRANTS)).pixels.map(dominant), name).toEqual(['r', 'g', 'b', 'y']);
    }
    for (const name of ['lossless-alpha.jpg', 'lossy-alpha.jpg']) {
      const decoded = await decodeInBrowser(page, await download(page, name), 'image/jpeg', [
        [5, 5],
        [400, 300],
      ]);
      expect(decoded.pixels.map(dominant), name).toEqual(['w', 'r']);
    }
    expect(jpegInfo(await download(page, 'animated.jpg'))).toMatchObject({ width: 640, height: 480 });
    await expect(page.locator('.file').filter({ hasText: 'animated.jpg' })).toContainText('сохранён первый кадр');
    expect(jpegIcc(await download(page, 'basic.jpg'))).toEqual(SRGB);
  });
});

test.describe('WebP → PNG', () => {
  test('прозрачность сохраняется; ICC и EXIF без GPS переносятся в PNG', async ({ page }) => {
    await openConverter(page, '/webp-v-png');
    await convert(page, ['lossless-alpha.webp', 'lossy-alpha.webp', 'exif-gps.webp']);
    for (const name of ['lossless-alpha.png', 'lossy-alpha.png']) {
      const decoded = await decodeInBrowser(page, await download(page, name), 'image/png', [
        [5, 5],
        [400, 300],
      ]);
      expect(decoded.pixels.map(dominant), name).toEqual(['t', 'r']);
    }
    const photo = pngInfo(await download(page, 'exif-gps.png'));
    expect(photo.icc).toEqual(P3);
    expect(await readExif(photo.exif)).toMatchObject({ Orientation: 1, ...DATES, hasGps: false });
  });
});

test.describe('WebP на выходе', () => {
  test('JPG → WebP: VP8X, ICCP и EXIF без GPS, поворот, без профиля — sRGB', async ({ page }) => {
    await openConverter(page, '/jpg-v-webp');
    await expect(page.locator('[data-lossless-row]')).toBeVisible();
    await convert(page, ['exif-gps.jpg', 'rotated.jpg', 'photo.jpg']);

    const bytes = await download(page, 'exif-gps.webp');
    const photo = webpInfo(bytes);
    expect(photo.chunks).toEqual(['VP8X', 'ICCP', 'VP8 ', 'EXIF']);
    expect([photo.width, photo.height, photo.flags]).toEqual([1200, 800, 0x28]);
    expect(photo.icc).toEqual(P3);
    const exif = await readExif(photo.exif);
    expect(exif).toMatchObject({ Orientation: 1, ...DATES, hasGps: false });
    expect(exif?.Make).toBeUndefined();
    expect((await decodeInBrowser(page, bytes, 'image/webp', [[600, 400]])).width).toBe(1200);

    const rotated = await download(page, 'rotated.webp');
    expect((await decodeInBrowser(page, rotated, 'image/webp', QUADRANTS)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    expect(webpInfo(await download(page, 'photo.webp')).icc).toEqual(SRGB);
  });

  test('PNG → WebP: прозрачность сохраняется; «Без потерь» — VP8L с теми же пикселями', async ({ page }) => {
    await openConverter(page, '/png-v-webp');
    const POINTS: [number, number][] = [
      [5, 5],
      [400, 300],
      [400, 90],
    ];
    await convert(page, ['alpha.png']);
    const lossy = await download(page, 'alpha.webp');
    expect(webpInfo(lossy).chunks).toContain('ALPH');
    expect((await decodeInBrowser(page, lossy, 'image/webp', POINTS)).pixels.map(dominant).slice(0, 2)).toEqual(['t', 'r']);

    await expect(page.locator('[data-quality-row]')).toBeVisible();
    await page.getByLabel('Без потерь').check();
    await expect(page.locator('[data-quality-row]')).toBeHidden();
    await page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' }).click();
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
    const lossless = await download(page, 'alpha.webp');
    expect(webpInfo(lossless).chunks).toContain('VP8L');
    const source = await decodeInBrowser(page, readFileSync(fixture('alpha.png')), 'image/png', POINTS);
    expect((await decodeInBrowser(page, lossless, 'image/webp', POINTS)).pixels).toEqual(source.pixels);
  });

  test('HEIC → WebP: профиль P3 из nclx, предупреждение HDR, даты без GPS', async ({ page }) => {
    await openConverter(page, '/heic-v-webp');
    await convert(page, ['nclx-p3.heic', 'hdr-pq.heic', 'exif-gps.heic']);
    expect(webpInfo(await download(page, 'nclx-p3.webp')).icc).toEqual(P3);
    await expect(page.locator('.file').filter({ hasText: 'hdr-pq.webp' })).toContainText('HDR-снимок');
    expect(await readExif(webpInfo(await download(page, 'exif-gps.webp')).exif)).toMatchObject({ ...DATES, hasGps: false });
  });

  test('WebP при выходе WebP — «уже»; изображение шире 16 383 точек — понятная ошибка', async ({ page }) => {
    await openConverter(page, '/png-v-webp');
    await convert(page, ['basic.webp', 'too-wide.png']);
    await expect(page.locator('.file').nth(0)).toContainText('Файл уже в формате WebP');
    await expect(page.locator('.file').nth(1)).toContainText('WebP вмещает изображения не больше 16 383 точек');
  });
});

test.describe('любой вход на любой странице', () => {
  test('PNG и WebP на странице HEIC → JPG конвертируются; JPG при выходе JPG — «уже», с пояснением про iPhone', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convert(page, ['alpha.png', 'basic.webp', 'photo.jpg']);
    await expect(page.locator('.file').nth(0)).toHaveAttribute('data-status', 'done');
    await expect(page.locator('.file').nth(1)).toHaveAttribute('data-status', 'done');
    await expect(page.locator('.file').nth(2)).toContainText('Файл уже в формате JPG');
    await expect(page.locator('.file').nth(2)).toContainText('iPhone');
  });

  test('на страницах без HEIC — без пояснения про iPhone; смена формата конвертирует такие строки заново', async ({ page }) => {
    await openConverter(page, '/png-v-jpg');
    await convert(page, ['photo.jpg']);
    const row = page.locator('.file');
    await expect(row).toContainText('Файл уже в формате JPG');
    await expect(row).not.toContainText('iPhone');

    const reconvert = page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' });
    await expect(reconvert).toBeHidden();
    await page.getByRole('radio', { name: 'PNG' }).check();
    await reconvert.click();
    await expect(row).toHaveAttribute('data-status', 'done');
    await expect(page.getByText('photo.png', { exact: true })).toBeVisible();
  });
});
