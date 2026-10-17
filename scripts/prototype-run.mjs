// ВРЕМЕННЫЙ прогон стенда прототипа в браузере: конвертирует фикстуры и сохраняет результаты.
// node scripts/prototype-run.mjs <chromium|firefox|webkit> <файлы...>; ENCODER=jpeg|png, METADATA=dates|all
import { mkdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { chromium, firefox, webkit } from '@playwright/test';

const [browserName = 'chromium', ...files] = process.argv.slice(2);
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const encoder = process.env.ENCODER ?? 'jpeg';
const metadata = process.env.METADATA ?? 'dates';
const out = resolve(`test-results/prototype/${browserName}-${encoder}-${metadata}`);
mkdirSync(out, { recursive: true });

const browser = await { chromium, firefox, webkit }[browserName].launch();
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();
const requests = [];
context.on('request', (r) => requests.push(`${r.method()} ${r.url().replace(BASE, '')}${r.postDataBuffer() ? ' [BODY]' : ''}`));
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(`[console.${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => console.log(`[pageerror] ${e}`));
await page.addInitScript(() =>
  document.addEventListener('securitypolicyviolation', (e) => console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`)),
);

await page.goto(`${BASE}/prototype`);
await page.selectOption('select[name=encoder]', encoder);
if (metadata === 'all') await page.check('input[name=all]');
const started = Date.now();
await page.setInputFiles('#files', files.map((f) => resolve(f)));
await page.waitForFunction(() => window.__proto.finished, null, { timeout: 60 * 60_000, polling: 500 });
const wall = Date.now() - started;
const results = await page.evaluate(() => window.__proto.results);

for (const [index, r] of results.entries()) {
  if (!r.ok) continue;
  const download = page.waitForEvent('download', { timeout: 15_000 });
  await page.click(`a[data-index="${index}"]`);
  try {
    await (await download).saveAs(`${out}/${r.downloadName}`);
  } catch (error) {
    console.log(`  скачивание ${r.downloadName} не началось: ${String(error).split('\n')[0]}`);
  }
}
const MB = (n) => (n / 1048576).toFixed(1);
console.log(`\n${browserName} ${encoder} ${metadata}: ${results.length} файлов за ${(wall / 1000).toFixed(1)} с`);
for (const r of results) {
  if (!r.ok) {
    console.log(`  ${basename(r.name)}: ОШИБКА ${r.code}`);
    continue;
  }
  const t = r.timings;
  const h = r.heap;
  console.log(
    `  ${r.name}: ${r.width}x${r.height} ${MB(r.inBytes)}→${MB(r.outBytes)} МБ; read ${t.read.toFixed(0)} decode ${t.decode.toFixed(0)} encode ${t.encode.toFixed(0)} мс; heap libheif ${MB(h.decoder)} jpeg ${MB(h.jpeg)} png ${MB(h.png)} МБ; workers ${r.workersCreated}${r.warnings.length ? '; ' + r.warnings.join(',') : ''}`,
  );
}
const unexpected = requests.filter((r) => !/^GET \/(prototype|_astro\/)/.test(r) || r.includes('[BODY]'));
console.log(`запросов: ${requests.length}, неожиданных: ${unexpected.length}${unexpected.length ? '\n  ' + unexpected.join('\n  ') : ''}`);
await browser.close();
