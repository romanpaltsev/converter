// Вёрстка на телефоне: размеры кнопок, колонки, переносы — то, что легко сломать правкой стилей.
import type { Locator } from '@playwright/test';
import { expect, fileRow, openConverter, test } from './fixtures';
import { fixture } from './files';

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('телефон 360×640', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('шапка: кнопки меню, темы и языка — не меньше 40×40, меню — до низа экрана', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    const menuButton = banner.getByRole('button', { name: 'Конвертировать', exact: true });
    for (const control of [menuButton, banner.locator('[data-theme-toggle]'), banner.getByRole('link', { name: 'English' })]) {
      const size = await box(control);
      expect(size.width).toBeGreaterThanOrEqual(40);
      expect(size.height).toBeGreaterThanOrEqual(40);
    }
    await menuButton.click();
    const menu = await box(page.locator('#site-menu'));
    expect(menu.y + menu.height).toBeGreaterThanOrEqual(639);
  });

  test('хлебные крошки инструмента — в одну строку, текущая страница остаётся для диктора', async ({ page }) => {
    await page.goto('/heic-v-jpg');
    const crumbs = page.getByRole('navigation', { name: 'Навигационная цепочка' });
    await expect(crumbs).toMatchAriaSnapshot(`
      - navigation "Навигационная цепочка":
        - link "Главная"
        - link "Конвертер изображений"
        - text: HEIC в JPG
    `);
    // строка 14 px × 1,6
    expect((await box(crumbs)).height).toBeLessThan(30);
  });

  test('главная: карточки инструментов по две в ряд, без описаний', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('section[aria-labelledby="section-images"] .card');
    const [first, second] = [await box(cards.nth(0)), await box(cards.nth(1))];
    expect(second.y).toBe(first.y);
    expect(second.x).toBeGreaterThan(first.x + first.width);
    await expect(cards.first().locator('.card__text')).toBeHidden();
  });

  test('раздел с несколькими инструментами — карточки с описаниями', async ({ page }) => {
    await page.goto('/obrabotka-foto');
    await expect(page.locator('main .card__text').first()).toBeVisible();
  });

  test('подвал: разделы в две колонки', async ({ page }) => {
    await page.goto('/contacts');
    const [photo, pdf] = [await box(page.locator('.footer__group--photo')), await box(page.locator('.footer__group--pdf'))];
    expect(pdf.y).toBe(photo.y);
    expect(pdf.x).toBeGreaterThan(photo.x + photo.width);
  });

  test('«Изменить размер»: готовые размеры — в один ряд', async ({ page }) => {
    await openConverter(page, '/izmenit-razmer-foto');
    const tops = await page.locator('.chip').evaluateAll((chips) => chips.map((chip) => Math.round(chip.getBoundingClientRect().top)));
    expect(tops).toHaveLength(5);
    expect(new Set(tops).size).toBe(1);
  });

  test('«JPG в PDF»: «По размеру фото» не переносится по словам', async ({ page }) => {
    await openConverter(page, '/jpg-v-pdf');
    const heights = await page.locator('input[name="pageSize"] + span').evaluateAll((spans) => spans.map((span) => Math.round(span.getBoundingClientRect().height)));
    expect(heights).toHaveLength(3);
    expect(new Set(heights).size).toBe(1);
  });

  test('строка файла: «убрать» — справа на строке имени, формат и «Скачать» — под именем', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
    const row = fileRow(page, 'basic.jpg');
    await expect(row).toHaveAttribute('data-status', 'done', { timeout: 60_000 });
    const [line, name, remove, to, download] = await Promise.all([row, row.locator('.file__name'), row.locator('[data-remove]'), row.locator('.file__to'), row.locator('.file__download')].map(box));
    expect(remove.y).toBeLessThan(name.y + name.height);
    expect(Math.round(remove.x + remove.width)).toBe(Math.round(line.x + line.width));
    expect(to.y).toBeGreaterThan(name.y + name.height);
    expect(Math.round(to.x)).toBe(Math.round(name.x));
    expect(Math.round(download.y)).toBeGreaterThan(Math.round(name.y + name.height));
  });

  test('кнопки под списком — во всю ширину', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
    await expect(fileRow(page, 'basic.jpg')).toHaveAttribute('data-status', 'done', { timeout: 60_000 });
    const [actions, zip, clear] = await Promise.all([page.locator('.converter__actions'), page.getByRole('button', { name: 'Скачать всё (ZIP)' }), page.getByRole('button', { name: 'Очистить' })].map(box));
    expect(Math.round(zip.x)).toBe(Math.round(actions.x));
    expect(Math.round(clear.x + clear.width)).toBe(Math.round(actions.x + actions.width));
  });

  test('«Посмотреть EXIF»: имена тегов переносятся только между словами', async ({ page }) => {
    await openConverter(page, '/posmotret-exif');
    await page.setInputFiles('[data-input]', [fixture('exif-gps.jpg')]);
    await page.getByText(/Все теги EXIF/).click();
    const name = page.locator('.report__tags th').filter({ hasText: 'DateTimeOriginal' });
    await expect(name).toHaveText('DateTimeOriginal');
    await expect(name.locator('wbr')).toHaveCount(2);
  });

  test('лицензии: таблица без горизонтальной прокрутки', async ({ page }) => {
    await page.goto('/licenses');
    expect(await page.locator('.table-wrap').evaluate((wrap) => wrap.scrollWidth <= wrap.clientWidth)).toBe(true);
  });
});

test.describe('большой телефон 430×932', () => {
  test.use({ viewport: { width: 430, height: 932 } });

  test('строка файла — в две строки: имя не обрезается кнопками', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.setInputFiles('[data-input]', [fixture('exif-gps.heic')]);
    const row = fileRow(page, 'exif-gps.jpg');
    await expect(row).toHaveAttribute('data-status', 'done', { timeout: 60_000 });
    const name = row.locator('.file__name');
    expect(await name.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect((await box(row.locator('.file__to'))).y).toBeGreaterThan((await box(name)).y + (await box(name)).height);
  });
});
