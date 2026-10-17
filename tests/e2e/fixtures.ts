// Общие фикстуры e2e: в каждом тесте автоматически ловим нарушения CSP, ошибки в консоли
// и следим, что сеть используется только для статики сайта.
import { type Page, test as base, expect } from '@playwright/test';

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
