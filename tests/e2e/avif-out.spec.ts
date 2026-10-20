// AVIF на выходе (libheif + libaom): файл читается браузером и нашим же декодером, ICC и даты внутри,
// поворот применён, прозрачность сохраняется; AVIF на странице «в AVIF» ждёт выбора другого формата.
import { convertFiles as convert, downloadFile as download, expect, openConverter, test } from './fixtures';
import { decodeInBrowser, dominant, iccProfile, pngInfo, readExif } from './files';

const P3 = iccProfile('DisplayP3Compat-v2-magic.icc');

/** Бренды ftyp: основной и совместимые. */
function brands(bytes: Uint8Array): string[] {
  const text = (from: number) => String.fromCharCode(...bytes.subarray(from, from + 4));
  if (text(4) !== 'ftyp') return [];
  const size = new DataView(bytes.buffer, bytes.byteOffset).getUint32(0);
  const list = [text(8)];
  for (let pos = 16; pos + 4 <= size; pos += 4) list.push(text(pos));
  return list;
}

test.describe('AVIF на выходе', () => {
  test('JPG → AVIF: браузер читает файл, поворот применён; обратно через наш декодер — ICC P3 и даты без GPS', async ({ page }) => {
    await openConverter(page, '/jpg-v-avif');
    await expect(page.getByLabel('Качество')).toHaveValue('75');
    await expect(page.getByText('AVIF кодируется заметно дольше других форматов')).toBeVisible();
    await convert(page, ['exif-gps.jpg', 'rotated.jpg', 'photo.avif']);

    const rotated = await download(page, 'rotated.avif');
    expect(brands(rotated)).toContain('avif');
    const points: [number, number][] = [
      [150, 200],
      [450, 200],
      [150, 600],
      [450, 600],
    ];
    const decoded = await decodeInBrowser(page, rotated, 'image/avif', points);
    expect([decoded.width, decoded.height]).toEqual([600, 800]);
    expect(decoded.pixels.map(dominant)).toEqual(['r', 'g', 'b', 'y']);

    const same = page.locator('.file').filter({ hasText: 'photo.avif' });
    await expect(same).toHaveAttribute('data-status', 'waiting');
    await expect(same).toContainText('Файл уже в формате AVIF.');

    // круг: AVIF → PNG нашим декодером, метаданные должны пережить оба шага
    const photo = await download(page, 'exif-gps.avif');
    await openConverter(page, '/avif-v-png');
    await page.setInputFiles('[data-input]', { name: 'roundtrip.avif', mimeType: 'image/avif', buffer: photo });
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(1, { timeout: 60_000 });
    const png = pngInfo(await download(page, 'roundtrip.png'));
    expect(png).toMatchObject({ width: 1200, height: 800, icc: P3 });
    expect(await readExif(png.exif)).toMatchObject({ DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
  });

  test('PNG → AVIF: прозрачность сохраняется', async ({ page }) => {
    await openConverter(page, '/en/png-to-avif');
    await convert(page, ['alpha.png']);
    const file = await download(page, 'alpha.avif');
    const decoded = await decodeInBrowser(page, file, 'image/avif', [[5, 5], [400, 300]]);
    expect([decoded.width, decoded.height]).toEqual([800, 600]);
    expect(decoded.pixels.map(dominant)).toEqual(['t', 'r']);
  });
});
