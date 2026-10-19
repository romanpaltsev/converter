// GIF на входе (свой декодер на TypeScript): первый кадр, прозрачность, чересстрочность, кадр со смещением.
import { readFileSync } from 'node:fs';
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, fixture, iccProfile, jpegIcc, jpegInfo, pngInfo } from './files';

const SRGB = iccProfile('sRGB-v2-magic.icc');
const QUADRANTS: [number, number][] = [
  [300, 200],
  [900, 200],
  [300, 600],
  [900, 600],
];

test.describe('GIF', () => {
  test('→ JPG: квадранты, чересстрочный, прозрачность на белом, анимация — первый кадр', async ({ page }) => {
    await openConverter(page, '/gif-v-jpg');
    await convert(page, ['basic.gif', 'interlaced.gif', 'alpha.gif', 'animated.gif']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(4);

    for (const name of ['basic.jpg', 'interlaced.jpg']) {
      const file = await download(page, name);
      expect(jpegInfo(file)).toMatchObject({ width: 1200, height: 800 });
      expect(jpegIcc(file)).toEqual(SRGB);
      expect((await decodeInBrowser(page, file, 'image/jpeg', QUADRANTS)).pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);
    }
    const alpha = await download(page, 'alpha.jpg');
    expect((await decodeInBrowser(page, alpha, 'image/jpeg', [[5, 5], [400, 300]])).pixels.map(dominant)).toEqual(['w', 'r']);

    const animated = page.locator('.file').filter({ hasText: 'animated.jpg' });
    await expect(animated).toContainText('сохранён первый кадр');
    expect(jpegInfo(await download(page, 'animated.jpg'))).toMatchObject({ width: 640, height: 480 });
  });

  test('→ PNG: пиксели как у браузера, прозрачность и холст больше кадра', async ({ page }) => {
    await openConverter(page, '/en/gif-to-png');
    await convert(page, ['alpha.gif', 'offset.gif']);

    // свой декодер против декодера браузера — на тех же точках
    const points: [number, number][] = [
      [5, 5],
      [400, 300],
      [400, 81],
      [180, 300],
    ];
    const alpha = await download(page, 'alpha.png');
    expect(pngInfo(alpha)).toMatchObject({ width: 800, height: 600 });
    const ours = await decodeInBrowser(page, alpha, 'image/png', points);
    const browser = await decodeInBrowser(page, readFileSync(fixture('alpha.gif')), 'image/gif', points);
    expect(ours.pixels).toEqual(browser.pixels);

    const offset = await download(page, 'offset.png');
    expect(pngInfo(offset)).toMatchObject({ width: 400, height: 300 });
    expect((await decodeInBrowser(page, offset, 'image/png', [[20, 20], [200, 100], [380, 280]])).pixels.map(dominant)).toEqual(['t', 'r', 't']);
  });

  test('сжатие: GIF «в исходном формате» сохраняется в PNG', async ({ page }) => {
    await openConverter(page, '/szhat-foto');
    await convert(page, ['basic.gif']);
    expect(pngInfo(await download(page, 'basic.png'))).toMatchObject({ width: 1200, height: 800 });
  });
});
