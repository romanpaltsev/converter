import { copyFileSync, mkdirSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { expect, openConverter, test } from './fixtures';
import { downloadBytes, expectTimestamped, fixture, jpegInfo, unzip } from './files';

async function waitForRows(page: Page, count: number): Promise<void> {
  await expect(page.locator('.file:is([data-status="done"], [data-status="error"])')).toHaveCount(count, { timeout: 120_000 });
}

test('ошибки не останавливают очередь, причины понятны; PNG и AVIF на HEIC-странице тоже конвертируются', async ({ page }) => {
  await openConverter(page, '/heic-v-jpg');
  const names = ['not-heic.heic', 'basic.heic', 'garbage.heic', 'photo.avif', 'photo.jpg', 'rotated.heic'];
  await page.setInputFiles('[data-input]', names.map(fixture));
  await waitForRows(page, names.length);
  const rows = page.locator('.file');
  await expect(rows.evaluateAll((list) => list.map((row) => (row as HTMLElement).dataset.status))).resolves.toEqual([
    'done',
    'done',
    'error',
    'done',
    'error',
    'done',
  ]);
  await expect(rows.nth(0)).toContainText('not-heic.jpg'); // PNG с расширением .heic: формат определяется по сигнатуре
  await expect(rows.nth(2)).toContainText('Не удалось распознать файл как изображение');
  await expect(rows.nth(3)).toContainText('photo.jpg'); // AVIF по сигнатуре — свой декодер
  await expect(rows.nth(4)).toContainText('iPhone'); // пояснение про автоматическое перекодирование в JPEG
  await expect(page.locator('[data-status-text]')).toHaveText('Готово: 4 из 6. Не удалось: 2.');
});

test('несколько файлов обрабатываются одновременно, имена и порядок — как в очереди', async ({ page }) => {
  await page.addInitScript(() => {
    // сколько строк одновременно было в состоянии «конвертируется»
    const state = window as unknown as { __maxConverting: number };
    state.__maxConverting = 0;
    new MutationObserver(() => {
      state.__maxConverting = Math.max(state.__maxConverting, document.querySelectorAll('.file[data-status="converting"]').length);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-status'] });
  });
  await openConverter(page, '/heic-v-jpg');
  const cores = await page.evaluate(() => navigator.hardwareConcurrency);
  await page.setInputFiles('[data-input]', Array.from({ length: 6 }, () => fixture('basic.heic')));
  await waitForRows(page, 6);
  await expect(page.locator('.file__name')).toHaveText(['basic.jpg', 'basic_2.jpg', 'basic_3.jpg', 'basic_4.jpg', 'basic_5.jpg', 'basic_6.jpg']);
  await expect(page.locator('[data-status-text]')).toHaveText('Готово: 6 из 6.');
  // одно ядро пул оставляет интерфейсу: при трёх и больше ядрах файлы идут параллельно
  const parallel = await page.evaluate(() => (window as unknown as { __maxConverting: number }).__maxConverting);
  expect(parallel).toBeGreaterThanOrEqual(cores >= 3 ? 2 : 1);
});

test('«Скачать всё (ZIP)»: все готовые файлы, одинаковые имена с суффиксами', async ({ page }) => {
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', ['basic.heic', 'basic.heic', 'rotated.heic', 'garbage.heic'].map(fixture));
  await waitForRows(page, 4);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Скачать всё (ZIP)' }).click();
  const zip = await pending;
  expectTimestamped(zip.suggestedFilename(), 'heic-to-jpg.zip');
  const files = unzip(await downloadBytes(zip));
  // внутри архива — короткие имена: дата и время уже в имени архива
  expect(Object.keys(files).sort()).toEqual(['basic.jpg', 'basic_2.jpg', 'rotated.jpg']);
  expect(jpegInfo(files['rotated.jpg']!)).toMatchObject({ width: 600, height: 800 });
  expect(jpegInfo(files['basic_2.jpg']!)).toMatchObject({ width: 1200, height: 800 });
});

test('больше 100 файлов: берём первые 100 и сообщаем об этом', async ({ page }, testInfo) => {
  const dir = testInfo.outputPath('many');
  mkdirSync(dir, { recursive: true });
  const paths = Array.from({ length: 101 }, (_, i) => {
    const path = `${dir}/file-${String(i + 1).padStart(3, '0')}.heic`;
    copyFileSync(fixture('garbage.heic'), path); // не изображение: ошибки мгновенные, WASM не нужен
    return path;
  });
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', paths);
  await expect(page.locator('[data-notice]')).toHaveText('За один раз можно добавить до 100 файлов — взяли первые 100.');
  await waitForRows(page, 100);
  await expect(page.locator('.file')).toHaveCount(100);
  await expect(page.locator('.file').last()).toContainText('file-100.heic');
});

test('смена формата после конвертации: «Конвертировать заново»', async ({ page }) => {
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
  await waitForRows(page, 1);
  await expect(page.getByText('basic.jpg', { exact: true })).toBeVisible();
  const reconvert = page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' });
  await expect(reconvert).toBeHidden();
  await page.getByRole('radio', { name: 'PNG' }).check();
  await expect(page.locator('[data-quality-row]')).toBeHidden();
  await expect(page.locator('[data-png-warning]')).toBeVisible();
  await expect(reconvert).toBeVisible();
  await reconvert.click();
  await expect(page.getByText('basic.png', { exact: true })).toBeVisible();
  await expect(reconvert).toBeHidden();
  const pending = page.waitForEvent('download');
  await page.locator('.file__download').click();
  const png = await downloadBytes(await pending);
  expect([...png.subarray(1, 4)].map((c) => String.fromCharCode(c)).join('')).toBe('PNG');
});

test('«Очистить» убирает результаты', async ({ page }) => {
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
  await waitForRows(page, 1);
  await page.getByRole('button', { name: 'Очистить' }).click();
  await expect(page.locator('.file')).toHaveCount(0);
  await expect(page.locator('[data-results]')).toBeHidden();
  await expect(page.locator('[data-dropzone]')).toBeFocused();
});
