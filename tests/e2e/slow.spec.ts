// Медленные проверки из критериев готовности: npm run test:e2e:slow.
import { copyFileSync, mkdirSync } from 'node:fs';
import { expect, openConverter, test } from './fixtures';
import { downloadBytes, fixture, jpegIcc, jpegInfo, readExif, webpInfo } from './files';

const BATCH = 50;

test('@slow-chromium пачка из 50 файлов по 24 Мп без зависания интерфейса', async ({ page }, testInfo) => {
  const dir = testInfo.outputPath('batch');
  mkdirSync(dir, { recursive: true });
  const paths = Array.from({ length: BATCH }, (_, i) => {
    const path = `${dir}/IMG_${String(i + 1).padStart(4, '0')}.HEIC`;
    copyFileSync(fixture('grid-24mp.heic'), path);
    return path;
  });

  await page.addInitScript(() => {
    // длинные задачи основного потока и максимальный разрыв между кадрами — мера «зависания»
    const metrics = { longTasks: [] as { start: number; duration: number }[], frameGaps: [] as { start: number; duration: number }[] };
    (window as unknown as { __metrics: typeof metrics }).__metrics = metrics;
    new PerformanceObserver((list) => list.getEntries().forEach((e) => metrics.longTasks.push({ start: e.startTime, duration: e.duration }))).observe({
      type: 'longtask',
      buffered: true,
    });
    let last = 0;
    const tick = (time: number) => {
      if (last && time - last > 100) metrics.frameGaps.push({ start: last, duration: time - last });
      last = time;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await openConverter(page, '/heic-v-jpg');
  const started = Date.now();
  await page.setInputFiles('[data-input]', paths);
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(BATCH, { timeout: 35 * 60_000 });
  const seconds = (Date.now() - started) / 1000;
  await expect(page.locator('[data-status-text]')).toHaveText(`Готово: ${BATCH} из ${BATCH}.`);
  type Metrics = { longTasks: { start: number; duration: number }[]; frameGaps: { start: number; duration: number }[] };
  const read = () => page.evaluate(() => (window as unknown as { __metrics: Metrics }).__metrics);
  const zipStart = await page.evaluate(() => performance.now());

  // интерфейс отзывчив сразу после пачки: кнопка ZIP нажимается, архив собирается
  const pending = page.waitForEvent('download', { timeout: 5 * 60_000 });
  await page.getByRole('button', { name: 'Скачать всё (ZIP)' }).click();
  expect((await pending).suggestedFilename()).toBe('heic-to-jpg.zip');

  const metrics = await read();
  const describe = (list: { start: number; duration: number }[]) =>
    list.map((t) => `${t.duration.toFixed(0)} мс @${(t.start / 1000).toFixed(1)} с${t.start >= zipStart ? ' (ZIP)' : ''}`).join(', ') || 'нет';
  testInfo.annotations.push({
    type: 'metrics',
    description: `${BATCH} × 24 Мп за ${seconds.toFixed(0)} с. Длинные задачи: ${describe(metrics.longTasks)}. Паузы кадров > 100 мс: ${describe(metrics.frameGaps)}`,
  });
  console.log(testInfo.annotations.at(-1)?.description);
  const during = (list: { start: number; duration: number }[]) => Math.max(0, ...list.filter((t) => t.start < zipStart).map((t) => t.duration));
  const after = (list: { start: number; duration: number }[]) => Math.max(0, ...list.filter((t) => t.start >= zipStart).map((t) => t.duration));
  // критерий готовности — интерфейс не зависает, пока идёт обработка пачки
  expect(during(metrics.longTasks), 'самая длинная задача основного потока во время обработки, мс').toBeLessThan(200);
  expect(during(metrics.frameGaps), 'пауза между кадрами во время обработки, мс').toBeLessThan(300);
  // после пачки Chromium может разово перерисовать миниатюры из снимков на 24 Мп (см. TESTING.md) — без многосекундных зависаний
  expect(after(metrics.longTasks), 'самая длинная задача после обработки, мс').toBeLessThan(1000);
});

test('@slow-webkit файл 48 Мп конвертируется в WebKit', async ({ page }) => {
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', [fixture('grid-48mp.heic')]);
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(1, { timeout: 10 * 60_000 });
  const pending = page.waitForEvent('download');
  await page.locator('.file__download').click();
  const bytes = await downloadBytes(await pending);
  expect(jpegInfo(bytes)).toMatchObject({ width: 8064, height: 6048 });
  expect(await readExif(bytes)).toMatchObject({ Orientation: 1, DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
  expect(jpegIcc(bytes)).not.toBeNull();
});

test('@slow-webkit файл 48 Мп → WebP в WebKit (большой кадр без многократного перекодирования)', async ({ page }) => {
  await openConverter(page, '/heic-v-webp');
  const started = Date.now();
  await page.setInputFiles('[data-input]', [fixture('grid-48mp.heic')]);
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(1, { timeout: 10 * 60_000 });
  const seconds = (Date.now() - started) / 1000;
  console.log(`48 Мп → WebP: ${seconds.toFixed(0)} с`);
  const pending = page.waitForEvent('download');
  await page.locator('.file__download').click();
  const info = webpInfo(await downloadBytes(await pending));
  expect([info.width, info.height]).toEqual([8064, 6048]);
  expect(info.icc).not.toBeNull();
  expect(await readExif(info.exif)).toMatchObject({ Orientation: 1, DateTimeOriginal: '2024:07:15 14:23:05', hasGps: false });
});
