# CLAUDE.md — ключевые решения и устройство проекта

Онлайн-конвертер файлов: статический сайт на Astro (ru/en), конвертация полностью в браузере
(module Web Worker + WASM), файлы на сервер не загружаются. Первый инструмент — HEIC → JPG / PNG.
Дальше по плану: JPG ↔ PNG, WebP, AVIF, HEIC → WebP, сжатие и изменение размера, позже PDF.
Обзор и команды — README.md, деплой — DEPLOY.md, тесты и замеры — TESTING.md, тексты — CONTENT.md.

## Правила работы

- Идентификаторы в коде — на английском, комментарии и документация — на русском.
- После каждой законченной фичи: сборка и тесты зелёные → коммит → push в `main`
  (просьба владельца). Push по SSH: `git push git@github.com:romanpaltsev/converter.git main`
  (у токена gh нет scope `workflow`, HTTPS-push изменений в `.github/workflows` отклоняется).
- Push в `main` запускает CI и деплой на VDS. Пока секретов `VDS_*` нет, деплой пропускается
  (автодеплой — решение владельца: ключ и секреты добавляются только с его явного согласия).
- Тестовую площадку https://converter.hotbar.pro по просьбе владельца (18.10.2026) выложил Claude ровно по DEPLOY.md:
  `/opt/converter`, пользователь `deploy`, сайт nginx `/etc/nginx/sites-available/converter.hotbar.pro`, сертификат
  Let's Encrypt (плагин nginx). На сервере есть и другие проекты — их не трогать. Действия на сервере — только по прямой
  просьбе владельца.
- Репозиторий публичный: `SPEC.md` (задание владельца) не коммитится (`.git/info/exclude`);
  реальные фото — только в `tests/fixtures/private/` (в `.gitignore`).
- Решения, которые меняют SPEC, — только после согласования с владельцем и с записью сюда.

## Стек и версии

Astro 7.4 (Vite 8 + Rolldown, Zod 4), TypeScript 6.0 strict (не 7.x: `@astrojs/check` поддерживает только ^5/^6),
libheif-js 1.23.5 (libheif 1.23.5 + libde265 1.0.15), @jsquash/jpeg 1.6.0 (MozJPEG 3.3.1), @jsquash/png 3.1.1,
client-zip 2.5.1, Vitest 5, Playwright 1.64, Node 24 LTS, nginx 1.30. Версии закреплены точно (`.npmrc`: `save-exact`).

## Устройство

```
src/config/site.ts            название (плейсхолдер), языки, лимит пачки (100), почта владельца (CONTACT_EMAIL)
src/tools/registry.ts         реестр инструментов + таблицы входных и выходных форматов
src/i18n/routes.ts            явная таблица страниц ru/en → canonical, hreflang, переключатель, sitemap
src/i18n/ui.ts                короткие строки интерфейса (en типизирован по ru)
src/content.config.ts         схемы текстов; тексты — src/content/{tools,pages}/{ru,en}/*.yaml
src/pages/[tool].astro        страницы-конвертеры из реестра (ru), en/[tool].astro — то же для en
src/components/pages/*.astro  страницы целиком: ToolPage, HomePage, LicensesPage, ContactsPage, NotFoundPage
src/converter/pipeline/       sniff → декодер (decoders/) → RGBA → кодировщик (encoders/) → метаданные; превью
src/converter/metadata/       TIFF/EXIF, фильтр EXIF, APP1/APP2 в JPEG, eXIf/iCCP в PNG, CRC32, zlib
src/converter/color/          ICC-профили (CC0) и выбор по nclx
src/converter/worker/         convert.worker.ts (конвертация), zip.worker.ts (ZIP), protocol.ts
src/converter/widget/         виджет: controller.ts (очередь, DOM), worker-client.ts (жизненный цикл worker'а)
scripts/                      serve-dist (тестовый сервер как nginx), content-md, smoke-docker, e2e-docker, lighthouse, fixtures
```

## Как добавить новый инструмент

**Новая пара уже поддерживаемых форматов** (например, страница «HEIF в JPG» с другим текстом):

1. Добавьте объект в `TOOLS` в `src/tools/registry.ts`: `id`, `slugs` для ru и en (разные, без префикса `/en/`),
   `inputFormats`, `defaultOutput`, `outputs`, `content` (имя YAML-файла), `related` (перелинковка). Добавьте
   новый id в `related` соседних инструментов.
2. Создайте тексты `src/content/tools/ru/<content>.yaml` и `src/content/tools/en/<content>.yaml` по образцу
   существующих. Схема в `src/content.config.ts` проверяет поля и количество: 3 шага, 4 пункта «Почему здесь», 6–8 FAQ.
   Английский текст пишется как оригинальный, под англоязычные запросы.
3. `npm run content` — обновить CONTENT.md.
4. `npm run build && npm run test:unit && npm run test:dist && npm run test:e2e`. Страницы, hreflang, sitemap,
   карточки на главной и перелинковка появятся сами: всё строится из реестра и таблицы маршрутов.

**Новый формат** (например, WebP на выходе или JPG на входе):

1. Выходной: модуль `src/converter/pipeline/encoders/<id>.ts` с `load<Id>Encoder(): Promise<Encoder>`
   (mime, расширение, `encode`, `embed` метаданных, `maxExifBytes`, `heapBytes`), строка в `encoders/index.ts`,
   `EncoderId` в `pipeline/types.ts`, запись в `OUTPUT_FORMATS` реестра. WASM подключать через `?url` +
   `compileWasm()` (хешированный файл в `/_astro/`, потоковая компиляция). Canvas не использовать.
2. Входной: модуль в `pipeline/decoders/` (интерфейс `Decoder`/`DecoderSession`: размер до декодирования,
   `decode()` → RGBA + ICC/nclx/EXIF), строка в `decoders/index.ts`, `DecoderId`, запись в `INPUT_FORMATS`,
   сигнатура в `pipeline/sniff.ts` (сейчас ветки «already-jpeg/png» считают такие файлы ошибкой — поменять там,
   где формат станет входным). Сейчас `convert.worker.ts` всегда грузит декодер `heic` — при втором декодере
   выбирать его по результату `sniff`.
3. Тексты ошибок/предупреждений — `src/i18n/ui.ts`; лицензия нового компонента — `src/content/licenses/components.ts`
   (+ полный текст лицензии, если её нет).
4. Unit-тесты на метаданные нового контейнера, e2e на конвертацию, фикстуры (`tests/fixtures/generate/generate.sh`).

## Конвейер и замеры (десктоп)

- **Декодер** — libheif-js, вариант с отдельным `.wasm` (а не wasm-bundle: на 200 КБ gzip меньше,
  потоковая компиляция, HTTP-кэш; согласовано с владельцем). Вызываем сырой C API (`_heif_*`): обёртка
  libheif-js не отдаёт ICC, nclx и блок Exif. Структуры — для wasm32; функции, возвращающие `heif_error`,
  получают первым аргументом указатель на результат. Сборка синхронная (`WASM_ASYNC_COMPILATION=0`) →
  `instantiateWasm` обязан вернуть экземпляр синхронно (модуль заранее компилируется потоково).
- `heif_decode_image(…, options = NULL)`: libheif сам применяет irot/imir/clap и понижает 10 бит до 8.
  Профиль цвета берём у handle, а не у декодированного изображения (libheif перетегирует его в sRGB, не меняя пиксели).
- **RGBA не копируется**: view в памяти libheif, выравнивание строк убирается на месте. PNG-кодировщик вызывается
  напрямую через `squoosh_png.encode` (обёртка @jsquash/png берёт `data.buffer` целиком и ломается на view).
- **JPEG** — MozJPEG baseline (`progressive: false`): вдвое быстрее progressive, файл больше на ~4 %, память та же;
  4:2:0, как в исходном HEVC.
- **Память** (heap WASM): 24 Мп — libheif 133 МБ + MozJPEG 547 МБ; 48 Мп — 269 + 1027 МБ. MozJPEG в jSquash ~20 байт
  на пиксель: RGBA копируется в кучу дважды (embind `std::string`) плюс полнокадровые буферы trellis. Решение владельца
  (17.10.2026): оставляем jSquash, проверяем на iPhone; если вкладка падает — своя сборка MozJPEG с построчной подачей.
- **Время**: 24 Мп ≈ 2 с декодирование + 2,5 с JPEG; 48 Мп ≈ 4 + 6 с; PNG 24 Мп — файл ≈ 48 МБ.
- **Жизненный цикл worker'а** (`worker-client.ts`): строго один файл за раз; файл > 30 Мп — в свежем worker'е
  (рукопожатие `needs-fresh-worker` по размеру до декодирования) и после него пересоздание; страховка — каждые 20 файлов;
  после фатальной ошибки (OOM, сбой WASM) — пересоздание и одна повторная попытка. На файлах одного размера heap не растёт.
- Формат определяется по сигнатуре ещё в основном потоке — для не-HEIC WASM не грузится.
- **Превью** — маленькая копия (короткая сторона 96 px), которую делает worker из тех же пикселей (усреднение без canvas)
  и кодирует тем же кодировщиком. Отступление от SPEC («превью из готового файла») согласовано владельцем 18.10.2026:
  Chromium для превью 48×48 полностью декодировал снимок 24 Мп (≈350 мс, ≈96 МБ), пачка 50 × 24 Мп давала паузы до 0,4 с.
- **ZIP** — client-zip (store, ZIP64) в отдельном worker'е: CRC32 по сотням мегабайт на основном потоке давал паузы ~0,5 с.
  Минус client-zip: `.blob()` на время сборки удваивает память; если на телефонах это проблема — своя zero-copy сборка Blob.
- Результаты в Chromium, Firefox и WebKit побайтно одинаковые.

## Метаданные

- По умолчанию: только даты — DateTime, DateTimeOriginal, DateTimeDigitized, OffsetTime, OffsetTimeOriginal,
  OffsetTimeDigitized, SubSecTimeOriginal — плюс Orientation = 1 и служебная ExifVersion (без неё EXIF формально невалиден).
- «Сохранить все метаданные»: весь EXIF и GPS, Orientation = 1, PixelX/YDimension = фактический размер.
  MakerNote переносится только Apple (смещения относительно его начала — проверено по ExifTool), чужие отбрасываются
  (их смещения сломались бы при переносе). IFD1 (EXIF-миниатюра) отбрасывается всегда: она не повёрнута.
  XMP не переносится ни в каком режиме. EXIF не влез в APP1 (64 КБ) → сначала без MakerNote, затем только даты.
- EXIF пишется с исходным порядком байтов (значения копируются сырыми байтами); блок Exif из HEIF —
  4 байта смещения, затем (обычно) `Exif\0\0` + TIFF.
- Цвет: ICC исходника копируется байт в байт; если цвет задан nclx (или не задан) — встраивается CC0-профиль
  из `src/converter/color/icc` (sRGB, Display P3 Compat, Rec.2020 Compat), пиксели не пересчитываются.
  PQ/HLG — предупреждение «HDR-снимок» (тон-маппинга нет).
- JPEG: SOI, APP0, APP1 Exif, APP2 ICC (по 65519 байт на сегмент); PNG: `iCCP` (zlib stored) и `eXIf` сразу после IHDR.

## Сайт, SEO, безопасность

- Маршруты по таблице SPEC: `/heic-v-jpg`, `/en/heic-to-jpg`, `/en/` и т. д. → `build.format: 'preserve'`,
  `trailingSlash: 'ignore'`; все адреса строятся из `src/i18n/routes.ts`, nginx делает 301 для лишнего слеша и `/en`.
- Встроенная i18n Astro не умеет разные слаги → hreflang и sitemap (`serialize`) строятся из своей таблицы.
- `SITE_URL` читается в `astro.config.mjs`; `PUBLIC_INDEXING`, `ADS_ENABLED`, `PRO_ENABLED` — через `astro:env`
  (значения встраиваются при сборке, поэтому они build args образа).
- CSP без `unsafe-inline`: `vite.build.assetsInlineLimit: 0` (иначе мелкие скрипты инлайнятся),
  `build.inlineStylesheets: 'never'`, никаких `style=`, `define:vars`, `is:inline` и обработчиков в атрибутах —
  это проверяет `tests/dist/csp.test.ts`. JSON-LD и конфиг виджета — блоки данных (`type=application/(ld+)json`).
- Заголовки безопасности — `nginx/snippets/security-headers.conf`, единый источник: его же читает тестовый сервер
  `scripts/serve-dist.mjs`. CSP нужен и на JS-ответах: worker берёт политику из своего ответа.
- Клиентский JS только на страницах-конвертерах; WASM грузится по первому выбору файла.
- `compressHTML: true` (в Astro 7 режим по умолчанию 'jsx' может съедать пробелы между инлайн-элементами);
  Rust-компилятор Astro строг к вложенности тегов.
- Аналитика — только заглушка `track()` в `src/lib/analytics.ts` (событие `conversion_complete`), сторонних скриптов нет.

## Тексты

- Тексты — черновики для владельца; источник — YAML и `ui.ts`, CONTENT.md генерируется (`npm run content`), тест следит.
- Не обещать «файлы меньше за счёт MozJPEG»: при одинаковом числе качества MozJPEG даёт файл больше,
  чем libjpeg-turbo (но и качество выше). Решение владельца: нейтральная формулировка. Без кликбейта и выдуманных цифр.

## Подводные камни

- Vite 8: `worker.format: 'es'` обязателен; `new Worker(new URL('…', import.meta.url), { type: 'module' })` — литералом.
- Предупреждения сборки «Module "fs"/"path"/"crypto" has been externalized» от libheif-js безвредны.
- `.gitignore`: правила сборки только от корня (`/dist/`) — иначе пропадёт `tests/dist/`.
- headless Chromium не запускает 11-ю подряд загрузку через `<a download>` — в e2e не больше 10 скачиваний на тест.
- WebKit в Playwright сообщает `blob:` URL как запросы — в проверке сети их исключаем.
- Пробный worker в `support.ts` нельзя завершать сразу: WebKit пишет ошибку загрузки в консоль.
- Под WSL Lighthouse с локальным Chrome создаёт в проекте каталоги `C:\Users\…` — запускать `npm run lighthouse` (Docker).
- Не используйте `pkill -f serve-dist` в той же команде, где упоминается это имя (убьёт свою оболочку).
- Будущие серверные страницы (личный кабинет): адаптер `@astrojs/node`, `export const prerender = false` на нужных
  страницах; статика переедет в `dist/client/` — поправить `root` в nginx и Dockerfile.
