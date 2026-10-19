# CLAUDE.md — ключевые решения и устройство проекта

Онлайн-конвертер файлов: статический сайт на Astro (ru/en), конвертация полностью в браузере
(module Web Worker + WASM), файлы на сервер не загружаются. Сейчас: HEIC, AVIF, JPG, PNG и WebP → JPG, PNG или WebP
(11 страниц-конвертеров), «Сжать фото» и «Изменить размер». Дальше по плану: PDF.
Обзор и команды — README.md, деплой — DEPLOY.md, тесты и замеры — TESTING.md, тексты — CONTENT.md.

## Правила работы

- Идентификаторы в коде — на английском, комментарии и документация — на русском.
- После каждой законченной фичи: сборка и тесты зелёные → коммит → push в `main`
  (просьба владельца). Push по SSH: `git push git@github.com:romanpaltsev/converter.git main`
  (у токена gh нет scope `workflow`, HTTPS-push изменений в `.github/workflows` отклоняется).
- Push в `main` запускает CI и, если все проверки зелёные, деплой на VDS. Автодеплой включён по просьбе владельца
  (19.10.2026): секреты `VDS_HOST`, `VDS_USER` (`deploy`), `VDS_PATH`, `VDS_SSH_KEY`, `VDS_KNOWN_HOSTS` заданы,
  ключ на сервере ограничен командой деплоя (`restrict,command=…`, DEPLOY.md, шаг 3); локальной копии ключа нет.
  Смена ключа или команды деплоя — только с согласия владельца.
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
client-zip 2.5.1, шрифт Inter Variable (@fontsource-variable/inter 5.3.0, OFL), Vitest 5, Playwright 1.64, Node 24 LTS, nginx 1.30. Версии закреплены точно (`.npmrc`: `save-exact`).

## Устройство

```
src/config/site.ts            название (плейсхолдер), языки, лимит пачки (100), почта владельца (CONTACT_EMAIL)
src/tools/registry.ts         реестр инструментов + таблицы входных и выходных форматов
src/i18n/routes.ts            явная таблица страниц ru/en → canonical, hreflang, переключатель, sitemap
src/i18n/ui.ts                короткие строки интерфейса (en типизирован по ru)
src/content.config.ts         схемы текстов; тексты — src/content/{tools,pages}/{ru,en}/*.yaml
src/pages/[tool].astro        страницы-конвертеры из реестра (ru), en/[tool].astro — то же для en
src/components/pages/*.astro  страницы целиком: ToolPage, HomePage, LicensesPage, ContactsPage, NotFoundPage
src/converter/pipeline/       sniff + checkInput (input.ts) → декодер (decoders/) → RGBA → поворот (orientation.ts) →
                              кодировщик (encoders/) → метаданные; превью; headers.ts — размеры до декодирования
src/converter/pipeline/codecs общий загрузчик модуля PNG (декодер и кодировщик — один экземпляр)
src/converter/vendor/webp/    собранная libwebp 1.6.0 (WASM + glue, BUILD.txt); исходники сборки — codecs/webp/
src/converter/vendor/avif/    собранные libheif 1.23.6 + dav1d 1.5.4 (декодер AVIF, BUILD.txt); исходники — codecs/avif/
src/converter/metadata/       TIFF/EXIF, фильтр EXIF, APP1/APP2 в JPEG, eXIf/iCCP в PNG, чанки RIFF в WebP, CRC32, zlib
src/converter/color/          ICC-профили (CC0) и выбор по nclx
src/converter/worker/         convert.worker.ts (конвертация), zip.worker.ts (ZIP), protocol.ts
src/converter/widget/         виджет: controller.ts (очередь, DOM), worker-client.ts (жизненный цикл worker'а)
scripts/                      serve-dist (тестовый сервер как nginx), content-md, smoke-docker, e2e-docker, lighthouse, fixtures, codecs
```

## Как добавить новый инструмент

**Новая пара уже поддерживаемых форматов** (например, страница «HEIF в JPG» с другим текстом):

1. Добавьте объект в `TOOLS` в `src/tools/registry.ts`: `id`, `mode: 'convert'`, `slugs` для ru и en (разные, без
   префикса `/en/`), `inputFormats`, `defaultOutput`, `outputs` (обычно `ALL_OUTPUTS`), `defaultQuality` (90),
   `content` (имя YAML-файла). Порядок в `TOOLS` — по входному формату.
   Перелинковка строится сама (`relatedTools()`: обратная пара → тот же вход → тот же выход).
2. Создайте тексты `src/content/tools/ru/<content>.yaml` и `src/content/tools/en/<content>.yaml` по образцу
   существующих. Схема в `src/content.config.ts` проверяет поля и количество: 3 шага, 4 пункта «Почему здесь», 6–8 FAQ.
   Английский текст пишется как оригинальный, под англоязычные запросы.
3. `npm run content` — обновить CONTENT.md.
4. `npm run build && npm run test:unit && npm run test:dist && npm run test:e2e`. Страницы, hreflang, sitemap,
   карточки на главной и перелинковка появятся сами: всё строится из реестра и таблицы маршрутов.

**Новый формат** (например, WebP на выходе или JPG на входе):

1. Выходной: модуль `src/converter/pipeline/encoders/<id>.ts` с `load<Id>Encoder(): Promise<Encoder>`
   (`module`, mime, расширение, `encode`, `embed` метаданных, `maxExifBytes`, `maxIccBytes`, `heapBytes`), строка в `encoders/index.ts`,
   `EncoderId` в `pipeline/types.ts`, запись в `OUTPUT_FORMATS` реестра. WASM подключать через `?url` +
   `compileWasm()` (хешированный файл в `/_astro/`, потоковая компиляция). Canvas не использовать.
2. Входной: модуль в `pipeline/decoders/` (интерфейс `Decoder`/`DecoderSession`: размер до декодирования,
   `async decode()` → RGBA + ICC/nclx/EXIF + Orientation, которую ещё нужно применить), строка в `decoders/index.ts`,
   `DecoderId`, запись в `INPUT_FORMATS` (ключ = `kind` из `pipeline/sniff.ts`) и в `DECODER_BY_KIND`
   (`pipeline/input.ts`; unit-тест сверяет обе таблицы). Декодер выбирается по сигнатуре в `checkInput()`.
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
- **Любой вход на любой странице** (решение владельца 18.10.2026): страница принимает все поддерживаемые форматы и
  конвертирует в выбранный; «Файл уже в формате …» — только когда вход совпадает с выбранным выходом. `accept` у каждой
  страницы свой (иначе iOS может перекодировать HEIC в JPEG при выборе); пояснение «iPhone мог сам сделать JPEG» —
  только на HEIC-страницах (`iphoneHint`). Проверка — `checkInput()` в `pipeline/input.ts`, одна для основного потока
  (по первым 256 байтам, без WASM) и worker'а.
- **Ориентация**: декодер возвращает EXIF Orientation, `convert.ts` поворачивает пиксели (`applyOrientation()`),
  в EXIF пишется 1. У HEIC всегда 1 — libheif применяет irot/imir сам.
- **JPEG на входе** — декодер MozJPEG из @jsquash/jpeg; фабрику модуля вызываем напрямую (свой `printErr`: иначе libjpeg
  пишет в console.error; ошибка libjpeg — это `exit(1)` и исключение `ExitStatus`, модуль остаётся рабочим, но embind
  теряет копию входа → `recycle`). Флаг `preserveOrientation: true` в jSquash означает «повернуть» — передаём `false`,
  поворачиваем сами. Не читает: CMYK/YCCK, 12 бит, lossless (SOF3) и арифметическое кодирование — отсекаем по
  заголовку кадра в `checkInput()` (`readJpegFrame()` в `pipeline/headers.ts`), без загрузки WASM.
- **PNG на входе** — Rust `png` из @jsquash/png: на выходе всегда RGBA 8 бит (палитра, tRNS, серый, 16 бит), у APNG —
  первый кадр с предупреждением. Декодер и кодировщик — один экземпляр wasm-bindgen (`codecs/squoosh-png.ts`).
  Метаданные: iCCP (распаковка `DecompressionStream`), eXIf (в том числе после IDAT), cICP → nclx; CRC входа не
  проверяем. Текстовые чанки и XMP не переносятся.
- **WebP — своя сборка libwebp 1.6.0** (решение 18.10.2026): в @jsquash/webp libwebp от 24.11.2020 — до исправления
  CVE-2023-4863 в декодере lossless, а декодер разбирает файлы пользователя. Исходники сборки — `codecs/webp/`
  (Dockerfile с emsdk 6.0.12 и sha256 архива libwebp, `build.sh`, C-обёртки), результат закоммичен в
  `src/converter/vendor/webp/` (`BUILD.txt` — версии и sha256), пересборка — `npm run codecs`. Декодер пишет RGBA
  прямо в свою кучу (view без копии, как у libheif), у анимации — первый кадр через `WebPAnimDecoder` с предупреждением.
  В libwebp 1.6.0 сломана SIMD-сборка под Emscripten (AVX2 добавили в начало списка, и проверка «индекс ≥ 2» выкидывает
  SSE2) — `build.sh` правит `cmake/cpu.cmake`: для Emscripten SSE4.1 + SSE2, без AVX2. Размер в gzip: декодер 74 КБ,
  кодировщик 143 КБ. Метаданные входа — `metadata/webp-chunks.ts` (ICCP, EXIF с префиксом «Exif\0\0» и без).
- **AVIF на входе — своя сборка libheif 1.23.6 + dav1d 1.5.4** (решение 19.10.2026): в libheif-js нет декодера AV1
  («a suitable decoder plugin is dav1d»). Отдельный модуль `avif_dec` (`codecs/avif/`, `npm run codecs -- avif`): только
  dav1d, без libde265 и кодировщиков, без embind (`__EMSCRIPTEN_STANDALONE_WASM__`), экспортирует ровно те функции C API,
  что вызывает `decoders/heif.ts`. Сессия libheif общая для HEIC и AVIF (`heif.ts`): ICC/nclx/Exif, irot/imir/clap,
  10/12 бит → 8 — одинаково; `heic.ts` и `avif.ts` только загружают свои модули. dav1d без потоков и без ассемблера
  (в WASM его нет), SIMD — авто-векторизацией (`-msimd128`). Размер: 1,55 МБ, в gzip 541 КБ — грузится только для AVIF.
  Анимированный AVIF (бренд `avis`) — основное изображение и предупреждение «первый кадр». HEIC по-прежнему читает
  libheif-js 1.23.5 (1.23.6 в npm ещё нет; libde265-сборке исправления 1.23.6 не критичны — они в unci/OpenJPEG/FFmpeg).
- **WebP на выходе** — та же libwebp: с потерями — `method 4` и качество с ползунка, без потерь — пресет уровня 4
  (`WebPConfigLosslessPreset`). Метаданные пишет `insertWebpMetadata()`: VP8X → ICCP → ALPH → VP8/VP8L → EXIF (TIFF без
  префикса, как у ExifTool). Предел формата — 16 383 точки по стороне: проверка в worker'е до декодирования.
- **`partition_limit` для больших снимков**: режимы предсказания VP8 должны поместиться в 512 КБ первого раздела; при
  переполнении libwebp кодирует кадр заново, каждый раз вдвое ужимая бюджет intra 4×4. На детальных 24–48 Мп это 2–3
  лишних полных прохода: фото 48 Мп — 40,8 с против 9,4 с с `partition_limit = 70` при том же размере и PSNR (36,10 дБ);
  24 Мп — 20,5 с против 4,7 с. До 16 Мп переполнения нет, а ограничение только снижает PSNR на ~0,13 дБ, поэтому оно
  включается для снимков больше 20 Мп (`encoders/webp.ts`). SIMD (SSE2/SSE4.1 → WASM SIMD) на этих данных почти не
  влияет: время упирается в скалярную RD-оптимизацию и энтропийное кодирование.
- **Память WebP**: с потерями 24 Мп — 390 МБ кучи, 48 Мп — 748 МБ; без потерь 24 Мп — 816 МБ, 48 Мп — 1,65 ГБ (риск
  на телефонах, предел кучи — 2 ГБ).
- **Память при смешанных форматах**: кроме порога 30 Мп — свежий worker, если кучи загруженных модулей в сумме
  больше 1 ГиБ (кучи не уменьшаются); после ошибки внутри WASM (`ConvertError.recycle`) — новый worker без повторной
  попытки. `WorkerClient.load()` досылает в worker только недостающие модули.
- **Превью** — маленькая копия (короткая сторона 96 px), которую делает worker из тех же пикселей (усреднение без canvas)
  и кодирует тем же кодировщиком. Отступление от SPEC («превью из готового файла») согласовано владельцем 18.10.2026:
  Chromium для превью 48×48 полностью декодировал снимок 24 Мп (≈350 мс, ≈96 МБ), пачка 50 × 24 Мп давала паузы до 0,4 с.
- **Сжатие и изменение размера** (решения владельца 19.10.2026; SPEC.md на этой машине не было — сверить, когда владелец
  его положит): две общие страницы — «Сжать фото» (`/szhat-foto`, `/en/compress-image`) и «Изменить размер»; любой вход,
  выход по умолчанию «Исходный» (`'original'`: формат входа, HEIC и AVIF — JPG; `ORIGINAL_ENCODER` в `input.ts`),
  «уже в формате …» на этих страницах не бывает (`allowSameFormat`). Режим инструмента — `mode` в реестре
  (`convert` / `compress` / `resize`), перелинковка сжатия задана вручную (`related`), у конвертеров — только конвертеры.
  Качество по умолчанию при сжатии — 75 (`defaultQuality`).
- **Целевой размер** («До размера»): `pipeline/target-size.ts` — двоичный поиск наибольшего качества в 5–92, при котором
  файл с метаданными не больше цели; первая проба 85, остановка, когда файл ≥ 90 % цели, не больше 7 полных кодирований
  (на 24 Мп каждое — секунды). Недостижимо — файл с качеством 5 и предупреждение. КБ и МБ десятичные (файл «до 1 МБ»
  проходит и лимит 1 000 000, и 1 048 576 байт). PNG и WebP без потерь — предупреждение, размер не подбирается.
  Результат не меньше исходника — предупреждение «не стал меньше» (ставит виджет).
- **Изменение размера** (`/izmenit-razmer-foto`, `/en/resize-image`): режимы «По длинной стороне» (по умолчанию 1920,
  готовые 3840/2560/1920/1280/800), «В процентах» (5–100 %), «Ширина и высота» (с пропорциями — вписать, без — растянуть;
  пустая сторона — без ограничения). Только уменьшение: больше исходника — размер прежний и предупреждение `not-resized`.
  Уменьшение — после поворота по EXIF, до превью и кодирования (`convert.ts`), PixelX/YDimension в EXIF — новые.
- **Ресемплер** `pipeline/resize.ts` — свой, на JS, без canvas: Lanczos3, разделимый, строки после горизонтального прохода
  в кольцевом буфере (память — несколько строк, а не кадр); при уменьшении в 4 раза и больше — сначала усреднение блоками
  (иначе фильтр берёт 25+ точек на пиксель); альфа предумножается (без тёмной каймы). Замеры (Node 22, десктоп):
  24 Мп → 1920 — 1,4 с, 48 Мп → 1920 — 1,8 с, 24 Мп → 4800×3200 — 2,8 с. Если на телефонах медленно — WASM-сборка
  (например, resize из Squoosh) или потоки.
- MozJPEG кодирует с `baseline: true`: без него при качестве ниже ~25 таблицы квантования 16-битные (SOF1, не baseline)
  и libjpeg пишет предупреждение в консоль.
- **Без `<select>` в виджете**: в WebKit его внутренние элементы ставят инлайн-стили → нарушение CSP `style-src-attr`.
  Выбор из вариантов — `.segmented`, числа — `type="text"` + `inputmode="decimal"` (запятая разбирается).
- **Имена скачиваемых файлов** (просьба владельца, 19.10.2026): к имени добавляются местные дата и время в момент
  нажатия — `IMG_1234_2026-10-19_00-45-12.jpg`, архив `heic-to-jpg_2026-10-19_00-45-12.zip` (`withTimestamp()`
  в `widget/filenames.ts`; без двоеточий — их не допускает Windows). В строке файла и внутри ZIP имена короткие.
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

## Дизайн

- Токены темы (цвета, радиусы, тени, `--ease`) — `:root` в `src/styles/global.css`, тёмная тема — те же токены под
  `prefers-color-scheme: dark`. Компоненты используют только токены, без «сырых» цветов (исключение — градиент логотипа).
- Направление (просьба владельца 19.10.2026 «более премиальный дизайн»): светлый фон с мягким свечением акцента
  под шапкой, полупрозрачная липкая шапка с размытием, центрированный первый экран, виджет — одна приподнятая панель,
  блоки страниц — карточки на `--surface` с тонкой рамкой и мягкой тенью, акцент — индиго (`#4f46e5`, в тёмной теме `#a5b4fc`).
- Шрифт — Inter Variable со своего домена (`@import` в `global.css`): браузер грузит только нужные поднаборы
  (латиница 48 КБ, кириллица 19 КБ); символа «→» в поднаборах нет — он берётся из системного шрифта.
- Иконки в CSS — `mask` с SVG в `data:` (CSP разрешает `img-src data:`), инлайновых стилей нет.
- Контраст проверяет axe в e2e в обеих темах; на телефоне 360×640 зона выбора файлов должна целиком помещаться в первый экран.

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
