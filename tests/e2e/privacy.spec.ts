import { expect, openConverter, test } from './fixtures';
import { fixture } from './files';

test('до выбора файла WASM и worker не загружаются, потом — «Загружаем конвертер…»', async ({ page, network }) => {
  await page.addInitScript(() => {
    // история текста статуса: сообщение о загрузке может мелькнуть быстрее проверки
    const history: string[] = [];
    (window as unknown as { __statusHistory: string[] }).__statusHistory = history;
    document.addEventListener('DOMContentLoaded', () => {
      const status = document.querySelector('[data-status-text]');
      if (status) new MutationObserver(() => history.push(status.textContent ?? '')).observe(status, { childList: true, characterData: true, subtree: true });
    });
  });
  await openConverter(page, '/heic-v-jpg');
  await page.waitForLoadState('networkidle');
  expect(network.requests.filter((r) => /^\/_astro\/.*(\.wasm|worker|heic-|jpeg-|png-|webp)/.test(r.url))).toEqual([]);

  await page.setInputFiles('[data-input]', [fixture('basic.heic')]);
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(1);
  const history = await page.evaluate(() => (window as unknown as { __statusHistory: string[] }).__statusHistory);
  expect(history[0]).toBe('Загружаем конвертер…');
  expect(network.requests.some((r) => r.url.endsWith('.wasm'))).toBe(true);
});

test('нет сетевых запросов с данными файлов', async ({ page, context, network }) => {
  const blocked: string[] = [];
  // страж: любой запрос, кроме GET без тела, — нарушение (и не уходит в сеть)
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET' || request.postDataBuffer() !== null) {
      blocked.push(`${request.method()} ${request.url()}`);
      return route.abort();
    }
    return route.continue();
  });
  await openConverter(page, '/heic-v-jpg');
  await page.setInputFiles('[data-input]', ['exif-gps.heic', 'rotated.heic', 'nclx-p3.heic'].map(fixture));
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(3);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Скачать всё (ZIP)' }).click();
  await pending;

  expect(blocked).toEqual([]);
  for (const request of network.requests) {
    expect(request.method, request.url).toBe('GET');
    expect(request.hasBody, request.url).toBe(false);
    // только статика своего сайта: страница, ассеты сборки (JS, CSS, WASM, ICC) и иконка
    expect(request.url).toMatch(/^\/(heic-v-jpg|_astro\/[\w.-]+|favicon\.svg)$/);
  }
});

test('удаление метаданных: без WASM и без запросов с данными файлов', async ({ page, network }) => {
  await openConverter(page, '/udalit-metadannye-foto');
  await page.setInputFiles('[data-input]', ['exif-gps.jpg', 'exif-gps.heic'].map(fixture));
  await expect(page.locator('.file[data-status="done"]')).toHaveCount(2);
  expect(network.requests.filter((r) => r.url.endsWith('.wasm'))).toEqual([]);
  for (const request of network.requests) {
    expect(request.method, request.url).toBe('GET');
    expect(request.hasBody, request.url).toBe(false);
    expect(request.url).toMatch(/^\/(udalit-metadannye-foto|_astro\/[\w.-]+|favicon\.svg)$/);
  }
});
