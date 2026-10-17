import { defineConfig, devices } from '@playwright/test';

// Обычный прогон: npm run test:e2e (Chromium, Firefox, WebKit) против dist/ через scripts/serve-dist.mjs —
// он отдаёт те же заголовки (CSP и пр.), что и nginx. Медленные проверки: npm run test:e2e:slow.
// E2E_BASE_URL=http://127.0.0.1:8090 — прогон против запущенного Docker-контейнера.
const PORT = Number(process.env.E2E_PORT ?? 4321);
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: external ?? `http://127.0.0.1:${PORT}`,
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  webServer: external
    ? undefined
    : {
        command: 'node scripts/serve-dist.mjs',
        url: `http://127.0.0.1:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        env: { PORT: String(PORT) },
      },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@slow/ },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grepInvert: /@slow/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grepInvert: /@slow/ },
    { name: 'slow-chromium', use: { ...devices['Desktop Chrome'] }, grep: /@slow-chromium/, timeout: 40 * 60_000 },
    { name: 'slow-webkit', use: { ...devices['Desktop Safari'] }, grep: /@slow-webkit/, timeout: 15 * 60_000 },
  ],
});
