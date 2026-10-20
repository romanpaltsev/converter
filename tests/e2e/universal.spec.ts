// Формат у каждого файла (страницы пар форматов): меню в строке, «Все файлы в …», смена формата на ходу.
import { SETTLED_ROWS, convertFiles, expect, fileRow, openConverter, pickTarget, test } from './fixtures';
import { downloadBytes, fixture } from './files';

const menu = (page: import('@playwright/test').Page) => page.locator('[data-picker]');

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

    // стрелка вниз открывает меню на первом пункте; «a» — к AVIF, End — к ICO, Home — к JPG, вниз — PNG
    await page.keyboard.press('ArrowDown');
    await expect(menu(page).getByRole('menuitemradio', { name: 'JPG', exact: true })).toBeFocused();
    await page.keyboard.press('a');
    await expect(menu(page).getByRole('menuitemradio', { name: 'AVIF', exact: true })).toBeFocused();
    await page.keyboard.press('End');
    await expect(menu(page).getByRole('menuitemradio', { name: 'ICO', exact: true })).toBeFocused();
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
    await expect(menu(page).getByRole('menuitemradio')).toHaveText(['JPG', 'PNG', 'WebP', 'AVIF', 'ICO']);
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
});
