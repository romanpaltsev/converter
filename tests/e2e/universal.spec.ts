// Формат у каждого файла (главная и страницы пар форматов): меню в строке, «Все файлы в …», смена формата на ходу,
// картинки в PDF (каждая — свой документ) и PDF в картинки.
import { readFileSync } from 'node:fs';
import { SETTLED_ROWS, convertFiles, downloadFile, expect, fileRow, openConverter, pickAll, pickTarget, test } from './fixtures';
import { downloadBytes, entropyData, expectTimestamped, fixture, openPdf, pageInfo, unzip } from './files';

const menu = (page: import('@playwright/test').Page) => page.locator('[data-picker]');

test.describe('главная: любой файл, формат — потом', () => {
  test('файлы ждут формата; выбранный у строки — конвертация сразу; «Все файлы в WebP» — заново; новые файлы — тоже в WebP; ZIP', async ({ page }) => {
    await openConverter(page, '/');
    await expect(page.getByRole('button', { name: /Выберите файлы или перетащите их сюда/ })).toBeVisible();
    await expect(page.locator('[data-settings]')).toBeHidden();
    await page.setInputFiles('[data-input]', ['basic.heic', 'alpha.png'].map(fixture));
    await expect(page.locator('.file[data-status="waiting"]')).toHaveCount(2);
    await expect(page.locator('[data-status-text]')).toHaveText('Ждут выбора формата: 2.');
    await expect(fileRow(page, 'basic.heic').locator('.file__thumb')).toHaveText('HEIC');
    await expect(page.locator('[data-target-all]')).toHaveText('Выбрать');

    await pickTarget(page, 'basic.heic', 'JPG');
    await expect(page.getByText('basic.jpg', { exact: true })).toBeVisible();
    await expect(page.locator('[data-settings]')).toBeVisible(); // качество и метаданные для JPG
    await expect(page.locator('[data-status-text]')).toHaveText('Готово: 1 из 1. Ждут выбора формата: 1.');

    await page.locator('[data-target-all]').click();
    await menu(page).getByRole('menuitemradio', { name: 'WebP', exact: true }).click();
    await expect(page.locator('.file__name')).toHaveText(['basic.webp', 'alpha.webp'], { timeout: 60_000 });
    await expect(page.locator('[data-target-all]')).toHaveText('WebP');
    // формат «Все файлы в …» действует и на файлы, добавленные после
    await page.setInputFiles('[data-input]', [fixture('photo.jpg')]);
    await expect(page.locator('.file__name')).toHaveText(['basic.webp', 'alpha.webp', 'photo.webp'], { timeout: 60_000 });

    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать всё (ZIP)' }).click();
    const zip = await pending;
    expectTimestamped(zip.suggestedFilename(), 'converter.zip');
    expect(Object.keys(unzip(await downloadBytes(zip))).sort()).toEqual(['alpha.webp', 'basic.webp', 'photo.webp']);
  });

  test('en: «Choose files», файл ждёт формата', async ({ page }) => {
    await openConverter(page, '/en/');
    await expect(page.getByRole('button', { name: /Choose files or drop them here/ })).toBeVisible();
    await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
    await expect(page.locator('.file[data-status="waiting"]')).toContainText('Choose a format');
    await expect(page.locator('[data-status-text]')).toHaveText('Waiting for a format: 1.');
    await pickTarget(page, 'basic.heic', 'PNG');
    await expect(page.getByText('basic.png', { exact: true })).toBeVisible();
  });
});

test.describe('формат у каждого файла', () => {
  test('смена формата во время конвертации: задание прерывается, результат один — в новом формате', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.setInputFiles('[data-input]', [fixture('grid-24mp.heic')]);
    const row = fileRow(page, 'grid-24mp');
    await expect(row).toHaveAttribute('data-status', 'converting');
    await pickTarget(page, 'grid-24mp', 'WebP');
    await expect(row).toHaveAttribute('data-status', 'done', { timeout: 120_000 });
    await expect(page.locator('.file__name')).toHaveText(['grid-24mp.webp']);
    await expect(page.locator('[data-status-text]')).toHaveText('Готово: 1 из 1.');
    const pending = page.waitForEvent('download');
    await row.locator('.file__download').click();
    const bytes = await downloadBytes(await pending);
    expect(String.fromCharCode(...bytes.subarray(8, 12))).toBe('WEBP');
  });

  test('клавиатура: Enter — меню на отмеченном пункте, стрелки и Enter — выбор, фокус возвращается; Esc и клик мимо закрывают', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await convertFiles(page, ['basic.heic']);
    const button = fileRow(page, 'basic.jpg').locator('[data-target-button]');
    await expect(button).toHaveAccessibleName('JPG — формат для basic.heic');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(menu(page).getByRole('menuitemradio', { name: 'JPG', exact: true })).toBeFocused();
    await expect(menu(page).getByRole('menuitemradio', { name: 'JPG', exact: true })).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    // стрелка вниз открывает меню на первом пункте; «a» — к AVIF, End — к PDF, Home — к JPG, вниз — PNG
    await page.keyboard.press('ArrowDown');
    await expect(menu(page).getByRole('menuitemradio', { name: 'JPG', exact: true })).toBeFocused();
    await page.keyboard.press('a');
    await expect(menu(page).getByRole('menuitemradio', { name: 'AVIF', exact: true })).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu(page).getByRole('menuitemradio', { name: 'PDF', exact: true })).toBeFocused();
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await expect(menu(page).getByRole('menuitemradio', { name: 'PNG', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toBeHidden();
    // строка перерисовывается (очередь → готово), фокус остаётся на её кнопке формата
    await expect(page.getByText('basic.png', { exact: true })).toBeVisible();
    await expect(fileRow(page, 'basic.png').locator('[data-target-button]')).toBeFocused();

    await fileRow(page, 'basic.png').locator('[data-target-button]').click();
    await expect(menu(page)).toBeVisible();
    await page.locator('h1').click();
    await expect(menu(page)).toBeHidden();
  });

  test('«Все файлы в …» и «убрать»: ждущий файл получает формат, убранный — пропадает, очередь подводит итог', async ({ page }) => {
    await openConverter(page, '/png-v-jpg');
    await page.setInputFiles('[data-input]', ['photo.jpg', 'alpha.png', 'basic.webp'].map(fixture));
    await expect(page.locator(SETTLED_ROWS)).toHaveCount(3);
    await expect(fileRow(page, 'photo.jpg')).toHaveAttribute('data-status', 'waiting');
    await expect(page.locator('[data-target-all-row]')).toBeVisible();
    await expect(page.locator('[data-target-all]')).toHaveText('JPG');
    await page.locator('[data-target-all]').click();
    // JPG в меню есть: он подходит двум файлам из трёх
    await expect(menu(page).getByRole('menuitemradio')).toHaveText(['JPG', 'PNG', 'WebP', 'AVIF', 'ICO', 'PDF']);
    await menu(page).getByRole('menuitemradio', { name: 'WebP', exact: true }).click();
    // photo.jpg и alpha.png — в WebP; basic.webp в WebP не бывает — остаётся в JPG
    await expect(page.locator('.file__name')).toHaveText(['photo.webp', 'alpha.webp', 'basic.jpg'], { timeout: 60_000 });
    await expect(page.locator('[data-target-all]')).toHaveText('WebP');

    await fileRow(page, 'basic.jpg').getByRole('button', { name: 'Убрать из списка: basic.webp' }).click();
    await expect(page.locator('.file')).toHaveCount(2);
    await expect(page.locator('[data-target-all-row]')).toBeVisible();
    await fileRow(page, 'alpha.webp').getByRole('button', { name: 'Убрать из списка: alpha.png' }).click();
    await expect(page.locator('[data-target-all-row]')).toBeHidden();
  });

  test('телефон 360×640: меню во всю ширину списка, без горизонтальной прокрутки', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openConverter(page, '/heic-v-jpg');
    await convertFiles(page, ['basic.heic', 'photo.jpg']);
    await fileRow(page, 'photo.jpg').locator('[data-target-button]').click();
    await expect(menu(page)).toBeVisible();
    const box = await menu(page).boundingBox();
    const list = await page.locator('[data-files]').boundingBox();
    expect(Math.round(box!.width)).toBe(Math.round(list!.width));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('телефон: меню не закрывается, когда меняется только высота окна (прячется адресная строка)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openConverter(page, '/');
    await page.setInputFiles('[data-input]', [fixture('photo.jpg')]);
    await expect(page.locator('.file[data-status="waiting"]')).toHaveCount(1);
    await fileRow(page, 'photo.jpg').locator('[data-target-button]').click();
    await expect(menu(page)).toBeVisible();
    // ждём само событие resize: обработчик меню подписан раньше и к этому моменту уже отработал
    const resize = async (width: number, height: number) => {
      await page.evaluate(() => {
        (window as unknown as { resized: Promise<unknown> }).resized = new Promise((resolve) => addEventListener('resize', resolve, { once: true }));
      });
      await page.setViewportSize({ width, height });
      await page.evaluate(() => (window as unknown as { resized: Promise<unknown> }).resized);
    };
    await resize(360, 560);
    await expect(menu(page)).toBeVisible();
    // поворот экрана — строки перестроились, меню закрывается
    await resize(640, 360);
    await expect(menu(page)).toBeHidden();
  });
});

test.describe('PDF в универсальном виджете', () => {
  test('«Все файлы в PDF»: у каждой картинки свой PDF, JPEG без перекодирования; «По размеру фото» — без обработки заново', async ({ page }) => {
    await openConverter(page, '/');
    await page.setInputFiles('[data-input]', ['rotated.jpg', 'alpha.png'].map(fixture));
    await expect(page.locator('.file[data-status="waiting"]')).toHaveCount(2);
    await pickAll(page, 'PDF');
    await expect(page.locator('.file__name')).toHaveText(['rotated.pdf', 'alpha.pdf'], { timeout: 60_000 });
    // у PDF — размер страницы и поля, качества и метаданных нет; подсказка про один документ из многих
    await expect(page.locator('[data-pdf-layout-row]')).toBeVisible();
    await expect(page.locator('[data-quality-row]')).toBeHidden();
    await expect(page.locator('[data-meta-row]')).toBeHidden();
    await expect(page.getByRole('link', { name: '«JPG в PDF»' })).toHaveAttribute('href', '/jpg-v-pdf');
    await expect(fileRow(page, 'rotated.pdf')).toContainText('600×800 · ');
    await expect(fileRow(page, 'rotated.pdf')).toContainText('без перекодирования');

    const bytes = await downloadFile(page, 'rotated.pdf');
    const pdf = await openPdf(bytes);
    expect(pdf.numPages).toBe(1);
    // повёрнутое по EXIF фото — книжная страница A4, JPEG внутри байт в байт
    expect((await pageInfo(pdf, 1)).view).toEqual([0, 0, 595.28, 841.89]);
    expect(bytes.includes(entropyData(readFileSync(fixture('rotated.jpg'))))).toBe(true);

    await page.getByRole('radio', { name: 'По размеру фото' }).check();
    await expect(page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' })).toBeHidden();
    // 600×800 пикселей при 96 dpi — 450×600 пунктов
    await expect.poll(async () => (await pageInfo(await openPdf(await downloadFile(page, 'rotated.pdf')), 1)).view).toEqual([0, 0, 450, 600]);
    const alpha = await pageInfo(await openPdf(await downloadFile(page, 'alpha.pdf')), 1);
    expect(alpha.view).toEqual([0, 0, 600, 450]);
  });

  test('«PDF в JPG»: dpi и формат у строки PDF; смена разрешения — «Конвертировать заново»', async ({ page }) => {
    await openConverter(page, '/pdf-v-jpg');
    await expect(page.locator('[data-dpi-row]')).toBeVisible();
    await expect(page.locator('[data-meta-row]')).toBeHidden();
    await convertFiles(page, ['quadrants.pdf']);
    await expect(page.locator('.file__name')).toHaveText(['quadrants.pdf', 'quadrants_1.jpg']);
    await expect(fileRow(page, 'quadrants.pdf').locator('[data-target-button]')).toHaveText('JPG');
    await page.getByRole('radio', { name: '72 dpi' }).check();
    const reconvert = page.getByRole('button', { name: 'Конвертировать заново с новыми настройками' });
    await expect(reconvert).toBeVisible();
    await reconvert.click();
    await expect(fileRow(page, 'quadrants_1.jpg')).toContainText('600×400', { timeout: 60_000 });
    await expect(reconvert).toBeHidden();
  });
});
