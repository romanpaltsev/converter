// BMP на входе (свой декодер на TypeScript): разные глубины и сжатие, прозрачность, встроенный ICC.
import { readFileSync } from 'node:fs';
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, fixture, iccProfile, jpegIcc, jpegInfo, pngInfo } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');
const QUADRANTS: [number, number][] = [
  [100, 75],
  [300, 75],
  [100, 225],
  [300, 225],
];

test.describe('BMP', () => {
  test('→ JPG: 24 бита, палитра, RLE8, 16 бит — квадранты на месте; встроенный профиль переносится', async ({ page }) => {
    await openConverter(page, '/bmp-v-jpg');
    await convert(page, ['basic.bmp', 'palette4.bmp', 'rle8.bmp', 'rgb565.bmp', 'p3.bmp']);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(5);
    for (const name of ['basic.jpg', 'palette4.jpg', 'rle8.jpg', 'rgb565.jpg']) {
      const file = await download(page, name);
      expect(jpegInfo(file)).toMatchObject({ width: 400, height: 300 });
      expect((await decodeInBrowser(page, file, 'image/jpeg', QUADRANTS)).pixels.map(dominant), name).toEqual(['r', 'g', 'b', 'y']);
    }
    expect(jpegIcc(await download(page, 'p3.jpg'))).toEqual(P3);
  });

  test('→ PNG: 32 бита с альфой — как у браузера', async ({ page }) => {
    await openConverter(page, '/en/bmp-to-png');
    await convert(page, ['alpha.bmp', 'mono.bmp']);
    const points: [number, number][] = [
      [2, 2],
      [100, 75],
      [100, 21],
    ];
    const alpha = await download(page, 'alpha.png');
    expect(pngInfo(alpha)).toMatchObject({ width: 200, height: 150 });
    const ours = await decodeInBrowser(page, alpha, 'image/png', points);
    expect(ours.pixels.map(dominant)).toEqual(['t', 'r', expect.any(String)]);
    const browser = await decodeInBrowser(page, readFileSync(fixture('alpha.bmp')), 'image/bmp', points);
    expect(ours.pixels).toEqual(browser.pixels);
    expect(pngInfo(await download(page, 'mono.png'))).toMatchObject({ width: 64, height: 32 });
  });
});
