// Реальные снимки владельца из tests/fixtures/private (папка не в git). Тесты запускаются, только если там есть файлы.
import { readdirSync, statSync } from 'node:fs';
import { expect, openConverter, test } from './fixtures';
import { FIXTURES, downloadBytes, jpegIcc, jpegInfo, readExif } from './files';

const DIR = `${FIXTURES}private/`;
const files = readdirSync(DIR).filter((name) => /\.(heic|heif|hif)$/i.test(name) && statSync(DIR + name).isFile());

test.describe('реальные фото', () => {
  test.skip(files.length === 0, 'в tests/fixtures/private нет HEIC-файлов');
  test.setTimeout(5 * 60_000);

  for (const name of files) {
    test(name, async ({ page }, testInfo) => {
      const source = await readExif(new Uint8Array(await import('node:fs').then((fs) => fs.readFileSync(DIR + name))));
      await openConverter(page, '/heic-v-jpg');
      await page.setInputFiles('[data-input]', [DIR + name]);
      const row = page.locator('.file');
      await expect(row).toHaveAttribute('data-status', /done|error/, { timeout: 4 * 60_000 });
      await expect(row, await row.textContent() ?? '').toHaveAttribute('data-status', 'done');
      const pending = page.waitForEvent('download');
      await page.locator('.file__download').click();
      const bytes = await downloadBytes(await pending);
      const info = jpegInfo(bytes);
      const exif = await readExif(bytes);
      testInfo.annotations.push({ type: 'result', description: `${info.width}×${info.height}, ${(bytes.length / 1048576).toFixed(1)} МБ, исходная Orientation ${source?.Orientation ?? '—'}` });
      expect(info.width * info.height).toBeGreaterThan(0);
      expect(exif?.Orientation ?? 1).toBe(1);
      expect(exif?.hasGps ?? false).toBe(false);
      expect(jpegIcc(bytes)).not.toBeNull();
      // если исходник повёрнут на 90°, стороны результата меняются местами относительно EXIF-размеров
      const w = (source as { ExifImageWidth?: number } | null)?.ExifImageWidth;
      const h = (source as { ExifImageHeight?: number } | null)?.ExifImageHeight;
      if (w && h && source?.Orientation && source.Orientation >= 5) expect([info.width, info.height]).toEqual([h, w]);
    });
  }
});
