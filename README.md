# Конвертер

Бесплатный онлайн-конвертер файлов. Первый инструмент — **HEIC → JPG / PNG**. Конвертация идёт полностью
в браузере (WebAssembly в Web Worker): файлы не загружаются на сервер. Интерфейс на русском и английском.

Тестовая площадка: https://converter.hotbar.pro (закрыта от индексации). Название «Конвертер» — плейсхолдер,
задаётся в `src/config/site.ts`.

## Возможности

- HEIC/HEIF → JPG (MozJPEG, качество 1–100) или PNG; до 100 файлов за раз, перетаскивание и выбор.
- Формат определяется по сигнатуре; AVIF, JPEG, PNG и прочее — понятная ошибка в строке файла, очередь идёт дальше.
- Поворот (irot/imir) применяется к пикселям, в EXIF всегда Orientation = 1.
- ICC-профиль переносится всегда (Display P3 у iPhone); цвет из nclx — встраивается эквивалентный профиль.
- Метаданные: по умолчанию только даты съёмки; галочка — весь EXIF, включая GPS.
- Скачивание по одному и «Скачать всё (ZIP)»; маленькие превью; «Конвертировать заново» после смены настроек.
- SEO: hreflang ru/en/x-default, canonical, sitemap с альтернативами, JSON-LD; noindex по флагу.
- Строгий CSP без `unsafe-inline`, ноль клиентского JS на страницах без конвертера, Lighthouse mobile 100.

## Быстрый старт

Нужен Node 24 (`.nvmrc`) и, для части проверок, Docker.

```bash
npm ci
npm run dev        # разработка: http://localhost:4321
npm run build      # статическая сборка в dist/
npm run preview    # dist/ с теми же заголовками, что у nginx: http://localhost:4321
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер Astro |
| `npm run build` | сборка в `dist/` |
| `npm run preview` | раздача `dist/` с заголовками из `nginx/snippets/security-headers.conf` |
| `npm run check` | проверка типов (`astro check`) |
| `npm run test:unit` | unit-тесты (Vitest) |
| `npm run test:dist` | проверки собранного сайта (SEO, CSP-гигиена, разметка виджета) — после `build` |
| `npm run test:e2e` | e2e в Chromium, Firefox, WebKit (нужны браузеры: `npx playwright install --with-deps`) |
| `npm run test:e2e:docker` | те же e2e в официальном образе Playwright (без установки браузеров) |
| `npm run test:e2e:slow` | медленные: 50 × 24 Мп в Chromium, 48 Мп в WebKit (`:docker` — в образе) |
| `npm run smoke:docker` | сборка Docker-образа, проверки curl'ом; `-- --e2e` — ещё и все e2e против контейнера |
| `npm run lighthouse` | Lighthouse (мобильный) против Docker-образа |
| `npm run fixtures` | пересоздать синтетические HEIC-фикстуры (Docker) |
| `npm run content` | пересобрать `CONTENT.md` из текстов |

## Структура

```
src/config/site.ts          название сайта, языки, лимит пачки, почта для «Контактов»
src/tools/registry.ts       реестр инструментов и форматов (новая страница-конвертер — запись здесь)
src/i18n/                   таблица маршрутов ru/en, словари интерфейса
src/content/                тексты страниц (YAML), лицензии
src/components/, layouts/   вёрстка (Astro, без UI-фреймворков)
src/pages/                  маршруты: /, /heic-v-jpg, /heic-v-png, /licenses, /contacts, 404, en/…, robots.txt
src/converter/pipeline/     конвейер: определение формата, декодеры, кодировщики, превью
src/converter/metadata/     EXIF (TIFF), сегменты JPEG, чанки PNG, CRC32, zlib
src/converter/color/        выбор и загрузка ICC-профилей
src/converter/worker/       Web Worker'ы: конвертация и сборка ZIP
src/converter/widget/       виджет на странице (TypeScript без фреймворков)
nginx/, Dockerfile, docker-compose.yml, deploy/   деплой
tests/unit, tests/dist, tests/e2e, tests/fixtures
```

## Документация

- [CLAUDE.md](CLAUDE.md) — ключевые решения, устройство проекта, как добавить новый инструмент.
- [DEPLOY.md](DEPLOY.md) — настройка сервера, переменные окружения, переезд на финальный домен.
- [TESTING.md](TESTING.md) — тесты, фикстуры, замеры, ручной чек-лист для iPhone и Android.
- [CONTENT.md](CONTENT.md) — все тексты сайта для вычитки (генерируется).
- Лицензии сторонних компонентов — страница `/licenses` на сайте.
