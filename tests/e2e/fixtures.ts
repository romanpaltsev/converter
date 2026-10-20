// Общие фикстуры e2e: в каждом тесте автоматически ловим нарушения CSP, ошибки в консоли
// и следим, что сеть используется только для статики сайта.
import { type Locator, type Page, test as base, expect } from '@playwright/test';
import { downloadBytes, expectTimestamped, fixture } from './files';

export interface NetworkLog {
  /** Все запросы контекста (страница и worker'ы). */
  requests: { method: string; url: string; hasBody: boolean }[];
}

export const test = base.extend<{ network: NetworkLog; guards: void; allowedErrors: RegExp[] }>({
  /** Ожидаемые ошибки консоли (например, 404 на странице «не найдено»). */
  allowedErrors: [[], { option: true }],
  network: async ({ context, baseURL }, use) => {
    const log: NetworkLog = { requests: [] };
    context.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('blob:') || url.startsWith('data:')) return; // локальные URL, не сеть
      log.requests.push({ method: request.method(), url: url.replace(baseURL ?? '', ''), hasBody: request.postDataBuffer() !== null });
    });
    await use(log);
  },
  guards: [
    async ({ page, allowedErrors }, use) => {
      const problems: string[] = [];
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`));
      });
      page.on('console', (message) => {
        const text = message.text();
        if (message.type() === 'error' && !allowedErrors.some((re) => re.test(text))) problems.push(text);
      });
      page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
      await use();
      expect(problems, 'ошибки в консоли / нарушения CSP').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function openConverter(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('[data-converter][data-ready="true"]')).toBeVisible();
}

/** Строки файлов (без строк страниц PDF), которые закончены: готово, ошибка или ждут выбора формата. */
export const SETTLED_ROWS = '.file:not(.file--page):is([data-status="done"], [data-status="error"], [data-status="waiting"])';

/** Добавляет фикстуры и ждёт, пока каждая строка закончится (готово или ошибка) или будет ждать выбора формата. */
export async function convertFiles(page: Page, names: string[]): Promise<void> {
  await page.setInputFiles('[data-input]', names.map(fixture));
  await expect(page.locator(SETTLED_ROWS)).toHaveCount(names.length, { timeout: 120_000 });
}

/** Строка файла: по исходному имени (пока не готов) или по имени результата. */
export function fileRow(page: Page, name: string): Locator {
  return page.locator('.file').filter({ has: page.locator('.file__name', { hasText: name }) });
}

/** Формат у файла — через меню в его строке. */
export async function pickTarget(page: Page, name: string, label: string): Promise<void> {
  await fileRow(page, name).locator('[data-target-button]').click();
  await page.locator('[data-picker]').getByRole('menuitemradio', { name: label, exact: true }).click();
}

/** «Все файлы в …». */
export async function pickAll(page: Page, label: string): Promise<void> {
  await page.locator('[data-target-all]').click();
  await page.locator('[data-picker]').getByRole('menuitemradio', { name: label, exact: true }).click();
}

/** Скачивает результат по имени файла из строки; у скачанного файла к имени добавлены дата и время. */
export async function downloadFile(page: Page, name: string): Promise<Buffer> {
  const row = page.locator('.file').filter({ has: page.getByText(name, { exact: true }) });
  const pending = page.waitForEvent('download');
  await row.locator('.file__download').click();
  const file = await pending;
  expectTimestamped(file.suggestedFilename(), name);
  return downloadBytes(file);
}
