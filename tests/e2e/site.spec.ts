import AxeBuilder from '@axe-core/playwright';
import { expect, openConverter, test } from './fixtures';
import { fixture } from './files';

const PAGES = [
  '/',
  '/en/',
  '/heic-v-jpg',
  '/en/heic-to-jpg',
  '/heic-v-png',
  '/en/heic-to-png',
  '/heic-v-webp',
  '/en/heic-to-webp',
  '/jpg-v-webp',
  '/en/jpg-to-webp',
  '/png-v-webp',
  '/en/png-to-webp',
  '/jpg-v-png',
  '/en/jpg-to-png',
  '/png-v-jpg',
  '/en/png-to-jpg',
  '/webp-v-jpg',
  '/en/webp-to-jpg',
  '/webp-v-png',
  '/en/webp-to-png',
  '/szhat-foto',
  '/en/compress-image',
  '/izmenit-razmer-foto',
  '/en/resize-image',
  '/licenses',
  '/en/licenses',
  '/contacts',
  '/en/contacts',
];
// страницы-конвертеры собраны из одного шаблона — для axe достаточно представителей каждого вида
const AXE_PAGES = ['/', '/en/', '/heic-v-jpg', '/szhat-foto', '/en/resize-image', '/en/remove-exif', '/posmotret-exif', '/en/jpg-to-pdf', '/en/png-to-webp', '/webp-v-png', '/licenses', '/en/contacts'];

test.describe('заголовки ответа', () => {
  for (const path of PAGES) {
    test(`${path}: CSP и заголовки безопасности`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const headers = response!.headers();
      expect(headers['content-security-policy']).toContain("default-src 'self'; script-src 'self' 'wasm-unsafe-eval'");
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['x-robots-tag']).toBe('noindex, nofollow');
      expect(headers['cache-control']).toBe('no-cache');
    });
  }

  test('worker и WASM работают под CSP; у них тоже CSP и долгий кэш', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    const worker = page.waitForResponse(/convert\.worker-[\w-]+\.js$/);
    const wasm = page.waitForResponse(/libheif-[\w-]+\.wasm$/);
    await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
    for (const response of [await worker, await wasm]) {
      expect(response.headers()['content-security-policy']).toContain("'wasm-unsafe-eval'");
      expect(response.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
    }
    expect((await wasm).headers()['content-type']).toBe('application/wasm');
  });
});

test.describe('навигация', () => {
  test('переключатель языка ведёт на ту же страницу на другом языке', async ({ page }) => {
    await page.goto('/heic-v-jpg');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL('/en/heic-to-jpg');
    await expect(page.locator('h1')).toHaveText('HEIC to JPG Converter');
    await page.getByRole('link', { name: 'Русский' }).click();
    await expect(page).toHaveURL('/heic-v-jpg');
  });

  test('«Контакты» из подвала: почта ссылкой mailto, на обоих языках', async ({ page }) => {
    await page.goto('/heic-v-jpg');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Контакты' }).click();
    await expect(page).toHaveURL('/contacts');
    const mail = page.locator('main a[href^="mailto:"]');
    await expect(mail).toHaveText(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    expect(await mail.getAttribute('href')).toBe(`mailto:${await mail.textContent()}`);
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL('/en/contacts');
    await expect(page.locator('h1')).toHaveText('Contact');
    await expect(page.locator('main a[href^="mailto:"]')).toHaveText((await mail.textContent())!);
  });

  test('канонические адреса: лишний слеш и /en без слеша — 301', async ({ request }) => {
    for (const [from, to] of [
      ['/heic-v-jpg/', '/heic-v-jpg'],
      ['/en/heic-to-png/', '/en/heic-to-png'],
      ['/en', '/en/'],
    ]) {
      const response = await request.get(from!, { maxRedirects: 0 });
      expect(response.status(), from).toBe(301);
      expect(response.headers()['location']).toBe(to);
    }
  });

  test.describe('404', () => {
    test.use({ allowedErrors: [/404|Not Found/i] });

    test('на русском и английском, noindex', async ({ page }) => {
      const ru = await page.goto('/nichego-net');
      expect(ru?.status()).toBe(404);
      await expect(page.locator('h1')).toHaveText('Страница не найдена');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      const en = await page.goto('/en/nothing-here');
      expect(en?.status()).toBe(404);
      await expect(page.locator('h1')).toHaveText('Page not found');
    });
  });
});

test.describe('интерфейс', () => {
  test('зона загрузки — кнопка, работает с клавиатуры', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    const dropzone = page.getByRole('button', { name: /Перетащите HEIC-файлы сюда/ });
    await dropzone.focus();
    await expect(dropzone).toBeFocused();
    const chooser = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    expect((await chooser).isMultiple()).toBe(true);
  });

  test('файлы можно бросить в зону загрузки', async ({ page }) => {
    await openConverter(page, '/heic-v-jpg');
    await page.locator('[data-dropzone]').drop({ files: [fixture('basic.heic')] });
    await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
  });

  for (const path of ['/heic-v-jpg', '/en/heic-to-png', '/szhat-foto', '/en/compress-image', '/izmenit-razmer-foto', '/udalit-metadannye-foto', '/posmotret-exif', '/jpg-v-pdf']) {
    test(`${path}: конвертер в первом экране телефона (360×640)`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await openConverter(page, path);
      const box = await page.locator('[data-dropzone]').boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(640);
      const noHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
      expect(noHorizontalScroll).toBe(true);
    });
  }
});

test.describe('доступность (axe, WCAG 2.1 AA)', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const path of AXE_PAGES) {
      test(`${path} (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        await page.locator('details').evaluateAll((list) => list.forEach((d) => d.setAttribute('open', '')));
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      });
    }

    test(`виджет с результатами и ошибками (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/heic-v-jpg');
      await page.setInputFiles('[data-input]', ['basic.heic', 'garbage.heic', 'hdr-pq.heic'].map(fixture));
      await expect(page.locator('.file:is([data-status="done"], [data-status="error"])')).toHaveCount(3);
      await page.getByRole('radio', { name: 'PNG' }).check(); // показывает предупреждение и «Конвертировать заново»
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`размер: ширина и высота, результаты (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/izmenit-razmer-foto');
      await page.getByRole('radio', { name: 'Ширина и высота' }).check();
      await page.getByLabel('Ширина', { exact: true }).fill('x'); // подсвеченное неверное значение
      await page.setInputFiles('[data-input]', ['photo.jpg'].map(fixture));
      await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`удаление метаданных: режимы, итог по файлу и формат вместо превью (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/udalit-metadannye-foto');
      await page.getByRole('radio', { name: 'Только геолокацию' }).check();
      await page.setInputFiles('[data-input]', ['exif-gps.jpg', 'basic.webp', 'garbage.heic'].map(fixture));
      await expect(page.locator('.file:is([data-status="done"], [data-status="error"])')).toHaveCount(3);
      await expect(page.locator('.file__thumb--format').first()).toHaveText('JPG');
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`просмотр EXIF: карточки, геолокация и таблица тегов (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/posmotret-exif');
      await page.setInputFiles('[data-input]', ['exif-gps.jpg', 'basic.webp', 'garbage.heic'].map(fixture));
      await expect(page.locator('.file:is([data-status="done"], [data-status="error"])')).toHaveCount(3);
      await page.locator('.report__tags summary').first().click();
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`изображения в PDF: страницы, порядок и ошибки (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/jpg-v-pdf');
      await page.setInputFiles('[data-input]', ['photo.jpg', 'alpha.png', 'garbage.heic'].map(fixture));
      await expect(page.locator('.file:is([data-status="done"], [data-status="error"])')).toHaveCount(3);
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });

    test(`сжатие до размера: поле, единицы и результаты (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await openConverter(page, '/szhat-foto');
      await page.getByRole('radio', { name: 'До размера' }).check();
      await page.setInputFiles('[data-input]', ['basic.heic', 'exif-gps.png'].map(fixture));
      await expect(page.locator('.file[data-status="done"]')).toHaveCount(2);
      const result = await new AxeBuilder({ page }).include('[data-converter]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});
