# CONTENT.md — тексты сайта

> **Файл генерируется** командой `npm run content` — не правьте его вручную.
> Тексты страниц лежат в `src/content/**/*.yaml`, короткие строки интерфейса — в `src/i18n/ui.ts`.
> После правки перегенерируйте файл: тест `content.test.ts` проверяет, что он актуален.

Все тексты — **черновики для проверки владельцем**. Правила: без кликбейта и выдуманных цифр;
английские тексты пишутся как оригинальные (под запросы «heic to jpg» и т. п.), а не как перевод.
Не обещаем «файлы меньше за счёт MozJPEG» — см. CLAUDE.md, раздел «Тексты».

## Страницы-конвертеры

### heic-to-jpg

#### Русский — `/heic-v-jpg`

Файл: `src/content/tools/ru/heic-to-jpg.yaml`

- **title:** HEIC в JPG онлайн — бесплатно и без загрузки на сервер _(54 симв.)_
- **description:** Конвертируйте фото HEIC с iPhone в JPG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. Можно сразу много снимков. _(143 симв.)_
- **H1:** Конвертер HEIC в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** HEIC в JPG
- **Карточка:** HEIC → JPG — Фото с iPhone в самый совместимый формат: откроется везде.
- **JSON-LD:** Конвертер HEIC в JPG — Онлайн-конвертер фотографий HEIC в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать HEIC в JPG**

1. Нажмите на область выше или перетащите на неё HEIC-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Метаданные под вашим контролем.** По умолчанию сохраняется дата съёмки, а геолокация, модель телефона и другие сведения удаляются. Если нужно, сохраните всё одной галочкой.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 фото за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое HEIC?** HEIC — формат фотографий, в котором по умолчанию снимают iPhone и iPad. Он основан на сжатии HEVC и хранит снимки компактнее, чем JPG, но открывается не везде: многие программы, сайты и старые версии Windows его не понимают.
- **Как открыть HEIC в Windows?** В Windows 10 и 11 для HEIC нужны «Расширения для изображений HEIF» и «Расширения для видео HEVC» из Microsoft Store (второе может быть платным). Проще сконвертировать снимки в JPG — его открывает любая программа.
- **Как сделать, чтобы iPhone сразу снимал в JPG?** Откройте «Настройки» → «Камера» → «Форматы» и выберите «Наиболее совместимые». Новые снимки будут сохраняться в JPG, а уже сделанные останутся в HEIC — их можно сконвертировать здесь.
- **Теряется ли качество при конвертации?** JPG сжимает изображение с потерями, поэтому снимок немного меняется. При качестве 90 (значение по умолчанию) разница на глаз обычно не видна, а разрешение остаётся прежним. Если нужна копия без потерь, выберите формат PNG.
- **Почему JPG получается больше, чем HEIC?** HEIC сжимает фотографии эффективнее, чем JPG, поэтому тот же снимок в JPG при сопоставимом качестве весит больше. Это нормально. Если нужен файл поменьше, уменьшите качество ползунком.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а фотографии обрабатываются в вашем браузере и не отправляются на сервер.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель телефона, серийные номера и другие служебные данные удаляются. Если отметить «Сохранить все метаданные», в JPG перенесутся все данные EXIF, включая координаты.
- **Сохранятся ли поворот и цвета снимка?** Да. Фото будет повёрнуто так же, как в галерее телефона, а цветовой профиль (на iPhone это обычно Display P3) переносится в JPG, поэтому цвета не тускнеют.

#### English — `/en/heic-to-jpg`

Файл: `src/content/tools/en/heic-to-jpg.yaml`

- **title:** HEIC to JPG Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert HEIC photos from your iPhone to JPG right in your browser. Free, no sign-up, and your files never leave your device. Convert many photos at once. _(153 симв.)_
- **H1:** HEIC to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** HEIC to JPG
- **Карточка:** HEIC → JPG — Turn iPhone photos into the format that opens everywhere.
- **JSON-LD:** HEIC to JPG Converter — An online HEIC to JPG converter that runs in your browser without uploading your photos.

**How to convert HEIC to JPG**

1. Click the box above or drag your HEIC files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your photos stay with you.** Everything runs on your device. Photos are never uploaded to a server, so nobody else ever sees them.
- **You control the metadata.** By default we keep the date the photo was taken and strip the location, phone model and other details. One checkbox keeps everything.
- **MozJPEG encoding.** JPGs are made with MozJPEG, Mozilla's advanced JPEG encoder. Fine-tune the quality with the slider.
- **Batch conversion.** Convert up to 100 photos at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is a HEIC file?** HEIC is the photo format iPhones and iPads use by default. It is based on HEVC compression and stores photos more compactly than JPG, but many apps, websites and older versions of Windows can't open it.
- **How do I open HEIC files on Windows?** Windows 10 and 11 need the HEIF Image Extensions and the HEVC Video Extensions from the Microsoft Store (the latter may be paid). Converting to JPG is simpler: every app can open a JPG.
- **How do I make my iPhone take photos in JPG instead of HEIC?** Go to Settings → Camera → Formats and choose Most Compatible. New photos will be saved as JPG; the ones you already have stay HEIC, and you can convert them here.
- **Will converting to JPG reduce quality?** JPG uses lossy compression, so the image changes slightly. At the default quality of 90 the difference is usually impossible to see, and the resolution stays the same. If you need a lossless copy, pick PNG.
- **Why is the JPG bigger than the original HEIC?** HEIC compresses photos more efficiently than JPG, so the same photo at similar quality takes up more space as a JPG. That's expected. Lower the quality slider if you need smaller files.
- **Is it safe to convert my photos here?** Yes. The site only downloads the converter itself; your photos are processed in your browser and are never sent to a server.
- **What happens to the location and the date taken?** By default the date and time the photo was taken are kept, while GPS location, phone model, serial numbers and other details are removed. Tick “Keep all metadata” to copy the full EXIF data, including location.
- **Will rotation and colors be preserved?** Yes. Photos come out rotated the same way as in your phone's gallery, and the color profile (usually Display P3 on iPhones) is carried over, so colors don't look washed out.

### heic-to-png

#### Русский — `/heic-v-png`

Файл: `src/content/tools/ru/heic-to-png.yaml`

- **title:** HEIC в PNG онлайн — без потери качества, прямо в браузере _(57 симв.)_
- **description:** Конвертируйте HEIC в PNG без потери качества: бесплатно, без регистрации, файлы не загружаются на сервер. Подходит для редактирования и печати. _(143 симв.)_
- **H1:** Конвертер HEIC в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** HEIC в PNG
- **Карточка:** HEIC → PNG — Без потери качества — для редактирования, дизайна и печати.
- **JSON-LD:** Конвертер HEIC в PNG — Онлайн-конвертер фотографий HEIC в PNG без потерь, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать HEIC в PNG**

1. Нажмите на область выше или перетащите на неё HEIC-файлы — можно сразу несколько.
2. Подождите немного: файлы конвертируются в вашем браузере и никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Без потери качества.** PNG хранит каждый пиксель без сжатия с потерями — удобно, если снимок дальше пойдёт в редактор или на печать.
- **Метаданные под вашим контролем.** По умолчанию сохраняется дата съёмки, а геолокация и другие сведения удаляются. Если нужно, сохраните всё одной галочкой.
- **Сразу много файлов.** Добавьте до 100 фото за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Чем PNG отличается от JPG?** PNG сохраняет изображение без потерь: ни один пиксель не меняется. JPG сжимает с потерями, зато файлы получаются в разы меньше. Для обмена фото обычно удобнее JPG, для редактирования и печати — PNG.
- **Почему PNG-файлы такие большие?** Сжатие без потерь не может отбросить мелкие детали, а на фотографиях их очень много. Снимок iPhone на 24 Мп в PNG весит несколько десятков мегабайт. Если важен размер, выберите JPG.
- **Что такое HEIC?** HEIC — формат фотографий, в котором по умолчанию снимают iPhone и iPad. Он хранит снимки компактно, но открывается не везде: многие программы и сайты его не понимают.
- **Сохраняется ли прозрачность?** Да. Если в HEIC-файле есть прозрачность (альфа-канал), она переносится в PNG. Обычные снимки с камеры прозрачности не содержат.
- **Сохранятся ли поворот и цвета снимка?** Да. Фото будет повёрнуто так же, как в галерее телефона, а цветовой профиль (на iPhone это обычно Display P3) встраивается в PNG, поэтому цвета не тускнеют.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а фотографии обрабатываются в вашем браузере и не отправляются на сервер.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель телефона и другие служебные данные удаляются. Если отметить «Сохранить все метаданные», в PNG перенесутся все данные EXIF, включая координаты.

#### English — `/en/heic-to-png`

Файл: `src/content/tools/en/heic-to-png.yaml`

- **title:** HEIC to PNG Converter — Lossless, in Your Browser _(49 симв.)_
- **description:** Convert HEIC to PNG without losing quality. Free, no sign-up, and your files are never uploaded. Great for editing, design and printing. _(136 симв.)_
- **H1:** HEIC to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** HEIC to PNG
- **Карточка:** HEIC → PNG — Lossless copies for editing, design and printing.
- **JSON-LD:** HEIC to PNG Converter — An online HEIC to PNG converter that creates lossless images in your browser without uploading your photos.

**How to convert HEIC to PNG**

1. Click the box above or drag your HEIC files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your photos stay with you.** Everything runs on your device. Photos are never uploaded to a server, so nobody else ever sees them.
- **No quality loss.** PNG keeps every pixel exactly as it is — handy when the photo is headed for an editor or a printer.
- **You control the metadata.** By default we keep the date the photo was taken and strip the location and other details. One checkbox keeps everything.
- **Batch conversion.** Convert up to 100 photos at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What's the difference between PNG and JPG?** PNG is lossless: not a single pixel changes. JPG uses lossy compression but makes files several times smaller. JPG is usually better for sharing photos, PNG for editing and printing.
- **Why are the PNG files so large?** Lossless compression can't throw away fine detail, and photos are full of it. A 24 MP iPhone photo saved as PNG takes tens of megabytes. If file size matters, choose JPG.
- **What is a HEIC file?** HEIC is the photo format iPhones and iPads use by default. It stores photos compactly, but many apps and websites can't open it.
- **Is transparency preserved?** Yes. If a HEIC file has transparency (an alpha channel), it is carried over to the PNG. Regular camera photos don't have transparency.
- **Will rotation and colors be preserved?** Yes. Photos come out rotated the same way as in your phone's gallery, and the color profile (usually Display P3 on iPhones) is embedded in the PNG, so colors don't look washed out.
- **Is it safe to convert my photos here?** Yes. The site only downloads the converter itself; your photos are processed in your browser and are never sent to a server.
- **What happens to the location and the date taken?** By default the date and time the photo was taken are kept, while GPS location, phone model and other details are removed. Tick “Keep all metadata” to copy the full EXIF data, including location.

## Другие страницы

### Главная

#### Русский

Файл: `src/content/pages/ru/home.yaml`

- **title:** Конвертер фото онлайн — HEIC в JPG и PNG прямо в браузере _(57 симв.)_
- **description:** Бесплатные онлайн-конвертеры фото: HEIC в JPG и PNG. Без регистрации и без загрузки на сервер — всё работает в вашем браузере. _(126 симв.)_
- **h1:** Конвертер фото прямо в браузере
- **intro:** Переводите снимки с iPhone из HEIC в привычные форматы. Конвертация идёт на вашем устройстве: файлы не загружаются на сервер, а дата съёмки сохраняется.
- **toolsTitle:** Конвертеры
- **features:**
  - **Без загрузки на сервер.** Фотографии обрабатываются в браузере и не покидают ваше устройство.
  - **Без регистрации.** Откройте нужный конвертер и сразу выберите файлы.
  - **Бесплатно.** Конвертируйте столько фото, сколько нужно.

#### English

Файл: `src/content/pages/en/home.yaml`

- **title:** Free Online Image Converter — HEIC to JPG and PNG _(49 симв.)_
- **description:** Free online photo converters: HEIC to JPG and HEIC to PNG. No sign-up and no uploads — everything runs in your browser. _(119 симв.)_
- **h1:** Convert photos right in your browser
- **intro:** Turn iPhone HEIC photos into formats that open everywhere. Conversion happens on your device: files are never uploaded, and the date taken is kept.
- **toolsTitle:** Converters
- **features:**
  - **No uploads.** Photos are processed in your browser and never leave your device.
  - **No sign-up.** Open a converter and pick your files — that's it.
  - **Free.** Convert as many photos as you need.

### Лицензии

#### Русский

Файл: `src/content/pages/ru/licenses.yaml`

- **title:** Лицензии сторонних компонентов _(30 симв.)_
- **description:** Открытые библиотеки, на которых работает конвертер: лицензии, тексты лицензий и ссылки на исходный код. _(103 симв.)_
- **h1:** Лицензии
- **breadcrumb:** Лицензии
- **intro:** Конвертер работает на открытых библиотеках. Ниже — список компонентов, которые загружаются в браузер, их лицензии и ссылки на исходный код.
- **columns:** Компонент · Для чего · Лицензия · Исходный код
- **lgpl:** libheif и libde265 распространяются по лицензии GNU LGPL версии 3. Они загружаются в браузер отдельным модулем WebAssembly без изменений; исходный код этих версий доступен по ссылкам в таблице, полные тексты GNU LGPL и GNU GPL (на которую LGPL ссылается) приведены ниже.
- **patents:** Формат HEVC (H.265), на котором основан HEIC, может быть защищён патентами.
- **fullTexts:** Полные тексты лицензий

#### English

Файл: `src/content/pages/en/licenses.yaml`

- **title:** Third-Party Licenses _(20 симв.)_
- **description:** The open-source libraries this converter is built on, with their licenses, full license texts and links to the source code. _(123 симв.)_
- **h1:** Licenses
- **breadcrumb:** Licenses
- **intro:** This converter is built on open-source libraries. Below are the components that run in your browser, their licenses and links to their source code.
- **columns:** Component · Used for · License · Source code
- **lgpl:** libheif and libde265 are distributed under the GNU LGPL version 3. They are loaded into your browser unmodified as a separate WebAssembly module; the source code of these exact versions is linked in the table, and the full texts of the GNU LGPL and the GNU GPL (which the LGPL refers to) are included below.
- **patents:** The HEVC (H.265) format that HEIC is based on may be covered by patents.
- **fullTexts:** Full license texts

### Контакты

Адрес почты: roman.palcev@gmail.com (`src/config/site.ts`, `CONTACT_EMAIL`).

#### Русский

Файл: `src/content/pages/ru/contacts.yaml`

- **title:** Контакты _(8 симв.)_
- **description:** Как связаться с автором конвертера: вопросы, ошибки конвертации и предложения новых форматов. _(93 симв.)_
- **h1:** Контакты
- **breadcrumb:** Контакты
- **intro:** Пишите, если файл не конвертируется, вы нашли ошибку или хотите предложить новый формат.
- **emailLabel:** Электронная почта
- **note:** Если файл не получается сконвертировать, укажите в письме устройство, браузер и сообщение, которое показано в строке файла.

#### English

Файл: `src/content/pages/en/contacts.yaml`

- **title:** Contact _(7 симв.)_
- **description:** How to reach the author of this converter: questions, conversion problems and requests for new formats. _(103 симв.)_
- **h1:** Contact
- **breadcrumb:** Contact
- **intro:** Get in touch if a file won't convert, you've found a bug or you'd like another format supported.
- **emailLabel:** Email
- **note:** If a file won't convert, please mention your device, your browser and the message shown next to the file.

## Строки интерфейса (виджет, шапка, 404)

Файл: `src/i18n/ui.ts`

| Ключ | RU | EN |
|---|---|---|
| `nav.home` | Главная | Home |
| `nav.siteLinks` | Разделы сайта | Site sections |
| `nav.licenses` | Лицензии | Licenses |
| `nav.contacts` | Контакты | Contact |
| `nav.switchLanguage` | Сменить язык | Change language |
| `nav.skipToContent` | Перейти к содержимому | Skip to content |
| `nav.breadcrumbs` | Навигационная цепочка | Breadcrumbs |
| `footer.privacy` | Файлы обрабатываются прямо в браузере и никуда не загружаются. | Files are processed right in your browser and never uploaded anywhere. |
| `tool.relatedTitle` | Другие конвертеры | More converters |
| `widget.dropTitle` | Перетащите {format}-файлы сюда | Drop {format} files here |
| `widget.dropAction` | или нажмите, чтобы выбрать | or click to choose |
| `widget.dropHint` | Можно сразу много файлов — до 100 за раз | Add many files at once — up to 100 |
| `widget.dropActive` | Отпустите, чтобы добавить файлы | Release to add files |
| `widget.settings` | Настройки | Settings |
| `widget.format` | Формат | Format |
| `widget.quality` | Качество | Quality |
| `widget.keepMetadata` | Сохранить все метаданные (включая геолокацию) | Keep all metadata (including location) |
| `widget.keepMetadataHint` | По умолчанию дата съёмки сохраняется, а геолокация удаляется | By default the capture date is kept and the location is removed |
| `widget.pngWarning` | PNG сохраняет снимок без потерь, поэтому файлы получаются большими: фото на 24 Мп весит десятки мегабайт. | PNG is lossless, so files are large: a 24 MP photo takes tens of megabytes. |
| `widget.noscript` | Для работы конвертера нужен включённый JavaScript. | The converter needs JavaScript to be enabled. |
| `widget.loading` | Загружаем конвертер… | Loading the converter… |
| `widget.progress` | Конвертируем {current} из {total}… | Converting {current} of {total}… |
| `widget.summary` | Готово: {done} из {total}. | Done: {done} of {total}. |
| `widget.summaryErrors` | Не удалось: {failed}. | Failed: {failed}. |
| `widget.batchLimit` | За один раз можно добавить до {max} файлов — взяли первые {max}. | You can add up to {max} files at a time — the first {max} were taken. |
| `widget.unsupportedBrowser` | Этот браузер не поддерживает технологии, нужные конвертеру (WebAssembly и модульные Web Worker). Обновите браузер или откройте сайт в другом. | This browser lacks features the converter needs (WebAssembly and module Web Workers). Please update it or use another browser. |
| `widget.loadFailed` | Не удалось загрузить конвертер. Проверьте соединение и обновите страницу. | Could not load the converter. Check your connection and reload the page. |
| `widget.queued` | В очереди | Queued |
| `widget.converting` | Конвертируется… | Converting… |
| `widget.done` | Готово | Done |
| `widget.failed` | Ошибка | Error |
| `widget.sizes` | {before} → {after} | {before} → {after} |
| `widget.download` | Скачать | Download |
| `widget.downloadLabel` | Скачать {name} | Download {name} |
| `widget.downloadAll` | Скачать всё (ZIP) | Download all (ZIP) |
| `widget.zipPreparing` | Собираем ZIP… | Preparing ZIP… |
| `widget.zipFailed` | Не удалось собрать ZIP. Скачайте файлы по одному. | Could not create the ZIP. Please download the files one by one. |
| `widget.clear` | Очистить | Clear |
| `widget.reconvert` | Конвертировать заново с новыми настройками | Convert again with the new settings |
| `widget.settingsChanged` | Новые настройки применятся к следующим файлам. | New settings will apply to the next files. |
| `widget.iphoneJpegHint` | Если вы выбирали фото на iPhone, система могла сама преобразовать его в JPEG. | If you picked it on an iPhone, iOS may have converted it to JPEG. |
| `widget.units.b` | Б | B |
| `widget.units.kb` | КБ | KB |
| `widget.units.mb` | МБ | MB |
| `widget.units.gb` | ГБ | GB |
| `widget.errors.not-image` | Не удалось распознать файл как изображение. Поддерживаются {formats}. | This file doesn't look like an image. Supported: {formats}. |
| `widget.errors.avif-unsupported` | Формат AVIF пока не поддерживается. | AVIF is not supported yet. |
| `widget.errors.already-jpeg` | Файл уже в формате JPG — выберите другой формат выше. | This file is already a JPG — pick another format above. |
| `widget.errors.already-png` | Файл уже в формате PNG — выберите другой формат выше. | This file is already a PNG — pick another format above. |
| `widget.errors.unsupported-image` | Этот формат изображений пока не поддерживается. Поддерживаются {formats}. | This image format isn't supported yet. Supported: {formats}. |
| `widget.errors.decode-failed` | Не удалось прочитать файл — возможно, он повреждён. | Could not read the file — it may be damaged. |
| `widget.errors.unsupported-variant` | Этот вариант формата не поддерживается. | This variant of the format isn't supported. |
| `widget.errors.out-of-memory` | Браузеру не хватило памяти для этого файла. Закройте другие вкладки и попробуйте снова. | The browser ran out of memory for this file. Close other tabs and try again. |
| `widget.errors.internal` | Что-то пошло не так. Попробуйте ещё раз. | Something went wrong. Please try again. |
| `widget.warnings.hdr-tone` | HDR-снимок: цвета могут немного отличаться от оригинала. | HDR photo: colors may differ slightly from the original. |
| `widget.warnings.exif-unreadable` | Метаданные исходного файла повреждены и не сохранены. | The original metadata is damaged and was not kept. |
| `widget.warnings.exif-makernote-dropped` | Служебные данные камеры (MakerNote) не поместились и удалены. | Camera maker data (MakerNote) did not fit and was removed. |
| `widget.warnings.exif-reduced-to-dates` | Метаданные не поместились — сохранены только даты. | Metadata did not fit — only the dates were kept. |
| `widget.warnings.icc-too-large` | Цветовой профиль слишком большой и не сохранён. | The color profile is too large and was not kept. |
| `notFound.title` | Страница не найдена | Page not found |
| `notFound.text` | Такой страницы нет. Возможно, адрес изменился или в нём опечатка. | This page does not exist. The address may have changed or contain a typo. |
| `notFound.toHome` | На главную | Go to the home page |
