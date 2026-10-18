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

### heic-to-webp

#### Русский — `/heic-v-webp`

Файл: `src/content/tools/ru/heic-to-webp.yaml`

- **title:** HEIC в WebP онлайн — для сайтов, бесплатно и без загрузки _(57 симв.)_
- **description:** Конвертируйте фото HEIC с iPhone в WebP прямо в браузере: с потерями или без, бесплатно и без регистрации. Файлы не загружаются на сервер. _(138 симв.)_
- **H1:** Конвертер HEIC в WebP
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** HEIC в WebP
- **Карточка:** HEIC → WebP — Фото с iPhone — в формат для сайтов и веб-приложений.
- **JSON-LD:** Конвертер HEIC в WebP — Онлайн-конвертер фотографий HEIC в WebP, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать HEIC в WebP**

1. Нажмите на область выше или перетащите на неё HEIC-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте WebP по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **С потерями или без.** Настройте качество ползунком или включите режим «Без потерь», если нужна точная копия.
- **Метаданные под вашим контролем.** По умолчанию сохраняется дата съёмки, а геолокация, модель телефона и другие сведения удаляются. Если нужно, сохраните всё одной галочкой.
- **Сразу много файлов.** Добавьте до 100 фото за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое WebP и зачем он нужен?** WebP — формат изображений от Google, который понимают все современные браузеры. Его используют на сайтах: при сопоставимом качестве фотографии в WebP обычно занимают меньше места, чем в JPG, и страницы загружаются быстрее.
- **Откроется ли WebP на телефоне и компьютере?** WebP поддерживают все современные браузеры, а также Android, iOS и macOS. Некоторые программы и старые фоторедакторы его не открывают — для них лучше выбрать JPG.
- **С потерями или без потерь — что выбрать?** Для фотографий обычно достаточно сжатия с потерями: при качестве 90 (значение по умолчанию) разница на глаз не видна. Режим «Без потерь» сохраняет пиксели точно, но файлы получаются заметно больше.
- **Что такое HEIC?** HEIC — формат фотографий, в котором по умолчанию снимают iPhone и iPad. Он хранит снимки компактно, но открывается не везде: многие сайты и программы его не понимают.
- **Сохранятся ли поворот и цвета снимка?** Да. Фото будет повёрнуто так же, как в галерее телефона, а цветовой профиль (на iPhone это обычно Display P3) переносится в WebP.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель телефона, серийные номера и другие служебные данные удаляются. Если отметить «Сохранить все метаданные», в WebP перенесутся все данные EXIF, включая координаты.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а фотографии обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/heic-to-webp`

Файл: `src/content/tools/en/heic-to-webp.yaml`

- **title:** HEIC to WebP Converter — For the Web, Free, No Upload _(53 симв.)_
- **description:** Convert HEIC photos from your iPhone to WebP right in your browser, lossy or lossless. Free, no sign-up, and your files never leave your device. _(144 симв.)_
- **H1:** HEIC to WebP Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** HEIC to WebP
- **Карточка:** HEIC → WebP — iPhone photos in a format made for websites and web apps.
- **JSON-LD:** HEIC to WebP Converter — An online HEIC to WebP converter that runs in your browser without uploading your photos.

**How to convert HEIC to WebP**

1. Click the box above or drag your HEIC files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each WebP separately or grab them all in one ZIP file.

**Why use this converter**

- **Your photos stay with you.** Everything runs on your device. Photos are never uploaded to a server, so nobody else ever sees them.
- **Lossy or lossless.** Set the quality with the slider, or switch on Lossless when you need an exact copy.
- **You control the metadata.** By default we keep the date the photo was taken and strip the location, phone model and other details. One checkbox keeps everything.
- **Batch conversion.** Convert up to 100 photos at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is WebP, and why use it?** WebP is an image format from Google that every modern browser supports. Websites use it because, at comparable quality, photos usually take up less space as WebP than as JPG, so pages load faster.
- **Will WebP open on my phone and computer?** Every modern browser supports WebP, and so do Android, iOS and macOS. Some apps and older photo editors can't open it — pick JPG for those.
- **Lossy or lossless — which should I choose?** For photos, lossy compression is usually enough: at the default quality of 90 the difference is invisible. Lossless keeps every pixel exactly, but the files are much larger.
- **What is a HEIC file?** HEIC is the photo format iPhones and iPads use by default. It stores photos compactly, but many websites and apps can't open it.
- **Will rotation and colors be preserved?** Yes. Photos come out rotated the same way as in your phone's gallery, and the color profile (usually Display P3 on iPhones) is carried over to the WebP.
- **What happens to the location and the date taken?** By default the date and time the photo was taken are kept, while GPS location, phone model, serial numbers and other details are removed. Tick “Keep all metadata” to copy the full EXIF data, including location.
- **Is it safe to convert my photos here?** Yes. The site only downloads the converter itself; your photos are processed in your browser and are never sent to a server.

### jpg-to-png

#### Русский — `/jpg-v-png`

Файл: `src/content/tools/ru/jpg-to-png.yaml`

- **title:** JPG в PNG онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте JPG в PNG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. Сохраняются поворот, цветовой профиль и дата съёмки. _(154 симв.)_
- **H1:** Конвертер JPG в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPG в PNG
- **Карточка:** JPG → PNG — Чтобы дальше редактировать картинку без новых потерь качества.
- **JSON-LD:** Конвертер JPG в PNG — Онлайн-конвертер изображений JPG в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JPG в PNG**

1. Нажмите на область выше или перетащите на неё JPG-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Поворот и цвета как в оригинале.** Если фото повёрнуто с помощью EXIF, PNG получится уже повёрнутым. Цветовой профиль переносится, поэтому цвета не меняются.
- **Метаданные под вашим контролем.** По умолчанию сохраняется дата съёмки, а геолокация, модель камеры и другие сведения удаляются. Если нужно, сохраните всё одной галочкой.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить JPG в PNG?** PNG хранит изображение без потерь: JPG при каждом новом сохранении теряет немного качества, а PNG — нет. Поэтому PNG удобен, если картинку дальше будут редактировать, или если сайт либо программа принимают только PNG.
- **Станет ли качество лучше?** Нет. Конвертация не возвращает детали, которые JPG потерял при сжатии: PNG сохранит изображение ровно таким, какое оно сейчас, и дальше не будет его портить.
- **Почему PNG весит больше, чем JPG?** PNG сжимает без потерь, а фотографии с мелкими деталями так сжимаются хуже, поэтому файл обычно получается в несколько раз больше. Для фото, которые не нужно редактировать, удобнее оставить JPG.
- **Появится ли прозрачный фон?** Нет. В JPG нет прозрачности, поэтому фон останется таким же, как на исходной картинке. Прозрачность можно добавить потом в графическом редакторе — PNG её поддерживает.
- **Сохранятся ли поворот и цвета?** Да. Если камера записала поворот в EXIF, PNG получится уже повёрнутым как надо. Цветовой профиль (например, Display P3) переносится в PNG.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель камеры, серийные номера и другие служебные данные удаляются. Если отметить «Сохранить все метаданные», в PNG перенесутся все данные EXIF, включая координаты.
- **Какие JPG не поддерживаются?** Редкие варианты формата: JPEG в цветовой модели CMYK (обычно это макеты для печати), 12-битные, lossless и с арифметическим кодированием. Для них конвертер покажет понятное сообщение.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jpg-to-png`

Файл: `src/content/tools/en/jpg-to-png.yaml`

- **title:** JPG to PNG Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert JPG images to PNG right in your browser. Free, no sign-up, and your files never leave your device. Rotation, color profile and capture date are kept. _(157 симв.)_
- **H1:** JPG to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JPG to PNG
- **Карточка:** JPG → PNG — Keep editing an image without losing any more quality.
- **JSON-LD:** JPG to PNG Converter — An online JPG to PNG converter that runs in your browser without uploading your images.

**How to convert JPG to PNG**

1. Click the box above or drag your JPG files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Rotation and colors preserved.** If a photo is rotated via EXIF, the PNG comes out already rotated. The color profile is carried over, so colors don't shift.
- **You control the metadata.** By default we keep the date the photo was taken and strip the location, camera model and other details. One checkbox keeps everything.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **Why convert JPG to PNG?** PNG is lossless: a JPG loses a little quality every time it's saved again, a PNG doesn't. That makes PNG handy for images you're going to edit, or for sites and apps that only accept PNG.
- **Will the quality get better?** No. Converting can't bring back detail the JPG lost when it was compressed. The PNG keeps the image exactly as it is now and won't degrade it any further.
- **Why is the PNG bigger than the JPG?** PNG compression is lossless, and detailed photos don't compress well that way, so the file is usually several times larger. For photos you don't plan to edit, JPG is the more practical format.
- **Will the background become transparent?** No. JPG has no transparency, so the background stays exactly as it was. You can add transparency later in an image editor — PNG supports it.
- **Are rotation and colors preserved?** Yes. If the camera stored the rotation in EXIF, the PNG comes out already rotated correctly. The color profile (such as Display P3) is copied into the PNG.
- **What happens to the location and the date taken?** By default the date and time the photo was taken are kept, while GPS location, camera model, serial numbers and other details are removed. Tick “Keep all metadata” to copy the full EXIF data, including location.
- **Which JPGs aren't supported?** A few rare variants: CMYK JPEGs (usually print layouts), 12-bit, lossless and arithmetic-coded JPEGs. For those the converter shows a clear message.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### jpg-to-webp

#### Русский — `/jpg-v-webp`

Файл: `src/content/tools/ru/jpg-to-webp.yaml`

- **title:** JPG в WebP онлайн — картинки для сайта, бесплатно _(49 симв.)_
- **description:** Конвертируйте JPG в WebP прямо в браузере: качество настраивается, до 100 файлов за раз, файлы не загружаются на сервер. Бесплатно и без регистрации. _(149 симв.)_
- **H1:** Конвертер JPG в WebP
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPG в WebP
- **Карточка:** JPG → WebP — Картинки для сайта: настраиваемое качество, много файлов сразу.
- **JSON-LD:** Конвертер JPG в WebP — Онлайн-конвертер изображений JPG в WebP, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JPG в WebP**

1. Нажмите на область выше или перетащите на неё JPG-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте WebP по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Качество под контролем.** Настройте качество ползунком; размер до и после конвертации виден в строке каждого файла.
- **Поворот и цвета как в оригинале.** Если фото повёрнуто с помощью EXIF, WebP получится уже повёрнутым. Цветовой профиль переносится, поэтому цвета не меняются.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить JPG в WebP?** WebP поддерживают все современные браузеры, поэтому его используют на сайтах: при сопоставимом качестве фотографии в WebP обычно занимают меньше места, чем в JPG, и страницы загружаются быстрее.
- **Будет ли WebP меньше исходного JPG?** Обычно да, но не всегда: если исходный JPG уже сильно сжат, выигрыш бывает небольшим. Размер до и после показан в строке файла — при необходимости уменьшите качество ползунком.
- **Станет ли качество лучше?** Нет. Конвертация не возвращает детали, потерянные при сжатии JPG, а сжатие с потерями ещё немного меняет картинку. При качестве 90 (значение по умолчанию) разница обычно не видна.
- **Стоит ли включать «Без потерь»?** Для фотографий из JPG — обычно нет: файл без потерь получится больше исходного. Этот режим полезен для графики, скриншотов и картинок, которые будут дальше редактировать.
- **Сохранятся ли поворот и цвета?** Да. Если камера записала поворот в EXIF, WebP получится уже повёрнутым как надо. Цветовой профиль (например, Display P3) переносится в WebP.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, а геолокация, модель камеры и другие сведения удаляются. Если отметить «Сохранить все метаданные», в WebP перенесутся все данные EXIF, включая координаты.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jpg-to-webp`

Файл: `src/content/tools/en/jpg-to-webp.yaml`

- **title:** JPG to WebP Converter — Web-Ready Images, Free _(46 симв.)_
- **description:** Convert JPG to WebP right in your browser. Adjustable quality, up to 100 files at once, and your files never leave your device. Free, no sign-up. _(145 симв.)_
- **H1:** JPG to WebP Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JPG to WebP
- **Карточка:** JPG → WebP — Images for your website: adjustable quality, many files at once.
- **JSON-LD:** JPG to WebP Converter — An online JPG to WebP converter that runs in your browser without uploading your images.

**How to convert JPG to WebP**

1. Click the box above or drag your JPG files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each WebP separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Quality under control.** Set the quality with the slider; each file's row shows its size before and after conversion.
- **Rotation and colors preserved.** If a photo is rotated via EXIF, the WebP comes out already rotated. The color profile is carried over, so colors don't shift.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **Why convert JPG to WebP?** Every modern browser supports WebP, which is why websites use it: at comparable quality, photos usually take up less space as WebP than as JPG, so pages load faster.
- **Will the WebP be smaller than the original JPG?** Usually, but not always: if the JPG is already heavily compressed, the savings can be small. Each file's row shows the size before and after — lower the quality slider if you need a smaller file.
- **Will the quality get better?** No. Converting can't bring back detail the JPG lost, and lossy compression changes the image a little more. At the default quality of 90 the difference is usually invisible.
- **Should I turn on Lossless?** For photos that start out as JPG, usually not: a lossless file ends up larger than the original. Lossless is useful for graphics, screenshots and images you'll keep editing.
- **Are rotation and colors preserved?** Yes. If the camera stored the rotation in EXIF, the WebP comes out already rotated correctly. The color profile (such as Display P3) is copied into the WebP.
- **What happens to the metadata?** By default the capture date is kept, while the location, camera model and other details are removed. Tick “Keep all metadata” to copy the full EXIF data, including location.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### png-to-jpg

#### Русский — `/png-v-jpg`

Файл: `src/content/tools/ru/png-to-jpg.yaml`

- **title:** PNG в JPG онлайн — бесплатно и прямо в браузере _(47 симв.)_
- **description:** Конвертируйте PNG в JPG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. Прозрачный фон станет белым, качество настраивается. _(154 симв.)_
- **H1:** Конвертер PNG в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PNG в JPG
- **Карточка:** PNG → JPG — Когда нужен JPG: для сайтов, почты и печати фотографий.
- **JSON-LD:** Конвертер PNG в JPG — Онлайн-конвертер изображений PNG в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать PNG в JPG**

1. Нажмите на область выше или перетащите на неё PNG-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность — на белом фоне.** В JPG нет прозрачности, поэтому прозрачные области аккуратно ложатся на белый фон, а не становятся чёрными.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить PNG в JPG?** JPG понимают практически все программы, сайты и сервисы, а фотографии в нём обычно занимают заметно меньше места, чем в PNG. Это удобно, если файл нужно отправить по почте, загрузить на сайт с ограничением размера или напечатать.
- **Станет ли файл меньше?** Для фотографий — обычно да: JPG сжимает их с потерями. А схемы, скриншоты с текстом и картинки с крупными однотонными областями PNG часто хранит компактнее — для них JPG может оказаться не меньше.
- **Теряется ли качество?** JPG сжимает изображение с потерями, поэтому картинка немного меняется. При качестве 90 (значение по умолчанию) на фотографиях разница обычно не видна. На тексте и тонких линиях могут появиться заметные артефакты — такие картинки лучше оставить в PNG.
- **Что будет с прозрачным фоном?** В JPG нет прозрачности, поэтому прозрачные области становятся белыми. Если прозрачность нужна, оставьте PNG.
- **А если PNG анимированный?** Анимация в JPG не переносится: сохранится первый кадр, а в строке файла появится предупреждение.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в PNG, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Текстовые комментарии PNG в JPG не переносятся.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/png-to-jpg`

Файл: `src/content/tools/en/png-to-jpg.yaml`

- **title:** PNG to JPG Converter — Free and Private, in Your Browser _(56 симв.)_
- **description:** Convert PNG images to JPG right in your browser. Free, no sign-up, and your files never leave your device. Transparent areas turn white; quality is adjustable. _(159 симв.)_
- **H1:** PNG to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** PNG to JPG
- **Карточка:** PNG → JPG — When you need a JPG: for websites, email and printing photos.
- **JSON-LD:** PNG to JPG Converter — An online PNG to JPG converter that runs in your browser without uploading your images.

**How to convert PNG to JPG**

1. Click the box above or drag your PNG files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency goes white.** JPG has no transparency, so transparent areas are placed neatly on a white background instead of turning black.
- **MozJPEG encoding.** JPGs are made with MozJPEG, Mozilla's advanced JPEG encoder. Fine-tune the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **Why convert PNG to JPG?** Almost every app, website and service accepts JPG, and photos usually take up much less space as JPG than as PNG. That helps when you need to email a file, upload it to a site with a size limit or print it.
- **Will the file get smaller?** For photos, usually yes: JPG uses lossy compression. Diagrams, screenshots with text and images with large flat areas are often stored more compactly as PNG, though, so for those a JPG may not be smaller.
- **Will I lose quality?** JPG compression is lossy, so the image changes slightly. At the default quality of 90 the difference is usually invisible on photos. Text and thin lines can show visible artifacts — keep such images as PNG.
- **What happens to a transparent background?** JPG has no transparency, so transparent areas turn white. If you need transparency, keep the PNG.
- **What if the PNG is animated?** JPG can't hold animation: the first frame is saved, and the file's row shows a warning.
- **What happens to the metadata?** By default the capture date is kept if the PNG has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. PNG text comments aren't carried over to the JPG.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### png-to-webp

#### Русский — `/png-v-webp`

Файл: `src/content/tools/ru/png-to-webp.yaml`

- **title:** PNG в WebP онлайн — с прозрачностью, с потерями или без _(55 симв.)_
- **description:** Конвертируйте PNG в WebP прямо в браузере: прозрачность сохраняется, есть режим без потерь, файлы не загружаются на сервер. Бесплатно. _(134 симв.)_
- **H1:** Конвертер PNG в WebP
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PNG в WebP
- **Карточка:** PNG → WebP — С прозрачностью — для сайтов и интерфейсов.
- **JSON-LD:** Конвертер PNG в WebP — Онлайн-конвертер изображений PNG в WebP с потерями и без, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать PNG в WebP**

1. Нажмите на область выше или перетащите на неё PNG-файлы — можно сразу несколько.
2. Выберите качество или включите «Без потерь» и подождите: конвертация идёт прямо в браузере.
3. Скачайте WebP по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность сохраняется.** WebP поддерживает прозрачность, как PNG, — и в режиме с потерями, и без потерь.
- **С потерями или без.** Без потерь — для графики, иконок и скриншотов; с потерями — для фотографий, когда важнее размер.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить PNG в WebP?** WebP поддерживают все современные браузеры, он хранит прозрачность, как PNG, а файлы обычно получаются меньше. Поэтому на сайтах его используют вместо PNG.
- **Сохранится ли прозрачность?** Да — и при сжатии с потерями, и без потерь.
- **С потерями или без потерь — что выбрать?** Без потерь — для логотипов, иконок, скриншотов и графики с текстом: пиксели сохраняются точно. С потерями — для фотографий и сложных изображений: файл будет заметно меньше.
- **Будет ли WebP меньше PNG?** Обычно да, особенно при сжатии с потерями. Размер до и после показан в строке каждого файла.
- **А если PNG анимированный?** Анимация не переносится: сохранится первый кадр, а в строке файла появится предупреждение.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в PNG, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/png-to-webp`

Файл: `src/content/tools/en/png-to-webp.yaml`

- **title:** PNG to WebP Converter — Keeps Transparency, Lossy or Lossless _(61 симв.)_
- **description:** Convert PNG to WebP right in your browser. Transparency is kept, lossless mode is available, and your files never leave your device. Free. _(138 симв.)_
- **H1:** PNG to WebP Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** PNG to WebP
- **Карточка:** PNG → WebP — Keeps transparency — for websites and app interfaces.
- **JSON-LD:** PNG to WebP Converter — An online lossy and lossless PNG to WebP converter that runs in your browser without uploading your images.

**How to convert PNG to WebP**

1. Click the box above or drag your PNG files onto it — you can add many at once.
2. Pick a quality or switch on Lossless, then wait a moment while your browser converts them.
3. Download each WebP separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency preserved.** WebP supports transparency just like PNG — in both lossy and lossless mode.
- **Lossy or lossless.** Lossless for graphics, icons and screenshots; lossy for photos when file size matters more.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **Why convert PNG to WebP?** Every modern browser supports WebP, it keeps transparency like PNG, and the files are usually smaller. That's why websites use it instead of PNG.
- **Is transparency preserved?** Yes — with both lossy and lossless compression.
- **Lossy or lossless — which should I choose?** Lossless for logos, icons, screenshots and graphics with text: every pixel is kept exactly. Lossy for photos and complex images: the file will be much smaller.
- **Will the WebP be smaller than the PNG?** Usually, especially with lossy compression. Each file's row shows its size before and after conversion.
- **What if the PNG is animated?** Animation isn't kept: the first frame is saved, and the file's row shows a warning.
- **What happens to the metadata?** By default the capture date is kept if the PNG has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### webp-to-jpg

#### Русский — `/webp-v-jpg`

Файл: `src/content/tools/ru/webp-to-jpg.yaml`

- **title:** WebP в JPG онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте картинки WebP в JPG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. JPG откроется в любой программе. _(144 симв.)_
- **H1:** Конвертер WebP в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** WebP в JPG
- **Карточка:** WebP → JPG — Картинки с сайтов — в формат, который открывается везде.
- **JSON-LD:** Конвертер WebP в JPG — Онлайн-конвертер изображений WebP в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать WebP в JPG**

1. Нажмите на область выше или перетащите на неё WebP-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность — на белом фоне.** В JPG нет прозрачности, поэтому прозрачные области WebP аккуратно ложатся на белый фон, а не становятся чёрными.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое WebP?** WebP — формат изображений от Google, который используют многие сайты: картинки в нём занимают меньше места. Но его открывают не все программы, фоторедакторы и сервисы, поэтому скачанную с сайта картинку часто удобнее перевести в JPG.
- **Почему картинка с сайта скачивается в WebP?** Сайты отдают картинки в WebP, чтобы страницы грузились быстрее, и браузер сохраняет файл в том же формате. Конвертация в JPG делает картинку пригодной для любых программ.
- **Теряется ли качество?** JPG сжимает с потерями, поэтому картинка немного меняется. При качестве 90 (значение по умолчанию) разница обычно не видна. Если исходный WebP был без потерь и нужна точная копия, выберите PNG.
- **Почему JPG больше, чем WebP?** WebP обычно сжимает эффективнее JPG, поэтому та же картинка в JPG при сопоставимом качестве весит больше. Это нормально; уменьшите качество ползунком, если нужен файл поменьше.
- **Что будет с прозрачностью и анимацией?** В JPG нет прозрачности, поэтому прозрачные области становятся белыми. Анимация тоже не переносится: сохранится первый кадр, а в строке файла появится предупреждение.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в WebP, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/webp-to-jpg`

Файл: `src/content/tools/en/webp-to-jpg.yaml`

- **title:** WebP to JPG Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert WebP images to JPG right in your browser. Free, no sign-up, and your files never leave your device. The JPG opens in any app. _(133 симв.)_
- **H1:** WebP to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** WebP to JPG
- **Карточка:** WebP → JPG — Images saved from websites, in a format that opens everywhere.
- **JSON-LD:** WebP to JPG Converter — An online WebP to JPG converter that runs in your browser without uploading your images.

**How to convert WebP to JPG**

1. Click the box above or drag your WebP files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency goes white.** JPG has no transparency, so transparent areas of the WebP are placed neatly on a white background instead of turning black.
- **MozJPEG encoding.** JPGs are made with MozJPEG, Mozilla's advanced JPEG encoder. Fine-tune the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is WebP?** WebP is an image format from Google that many websites use because it keeps images small. Not every app, photo editor or service can open it, though, so an image saved from a website is often easier to use as a JPG.
- **Why do images from websites download as WebP?** Websites serve images as WebP so pages load faster, and your browser saves the file in the same format. Converting it to JPG makes it work in any app.
- **Will I lose quality?** JPG compression is lossy, so the image changes slightly. At the default quality of 90 the difference is usually invisible. If the original WebP was lossless and you need an exact copy, pick PNG.
- **Why is the JPG bigger than the WebP?** WebP usually compresses more efficiently than JPG, so the same image at similar quality takes up more space as a JPG. That's expected — lower the quality slider if you need a smaller file.
- **What happens to transparency and animation?** JPG has no transparency, so transparent areas turn white. Animation isn't kept either: the first frame is saved, and the file's row shows a warning.
- **What happens to the metadata?** By default the capture date is kept if the WebP has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### webp-to-png

#### Русский — `/webp-v-png`

Файл: `src/content/tools/ru/webp-to-png.yaml`

- **title:** WebP в PNG онлайн — с прозрачностью и без потерь _(48 симв.)_
- **description:** Конвертируйте WebP в PNG без новых потерь качества: прозрачность сохраняется, файлы не загружаются на сервер. Бесплатно и без регистрации. _(138 симв.)_
- **H1:** Конвертер WebP в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** WebP в PNG
- **Карточка:** WebP → PNG — С прозрачностью и без потерь — для редактирования и дизайна.
- **JSON-LD:** Конвертер WebP в PNG — Онлайн-конвертер изображений WebP в PNG без потерь, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать WebP в PNG**

1. Нажмите на область выше или перетащите на неё WebP-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность сохраняется.** PNG поддерживает прозрачность так же, как WebP, поэтому прозрачный фон останется прозрачным.
- **Без новых потерь.** PNG сохраняет пиксели без изменений: при конвертации качество не ухудшается.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое WebP?** WebP — формат изображений от Google, популярный на сайтах: картинки в нём занимают мало места. Но многие программы и редакторы его до сих пор не открывают, поэтому картинку удобнее перевести в распространённый формат, например PNG.
- **Когда лучше PNG, а когда JPG?** PNG — если важны прозрачность или точная копия без потерь: для логотипов, иконок, скриншотов и картинок, которые будут дальше редактировать. JPG — для фотографий, когда важен небольшой размер файла.
- **Сохранится ли прозрачность?** Да. PNG поддерживает прозрачность, поэтому прозрачные области WebP останутся прозрачными.
- **Почему PNG больше, чем WebP?** PNG сжимает без потерь, а WebP часто хранит картинки с потерями и сжимает эффективнее, поэтому PNG обычно весит больше. Для фотографий, где важнее размер, выберите JPG.
- **А если WebP анимированный?** Анимация в PNG не переносится: сохранится первый кадр, а в строке файла появится предупреждение.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в WebP, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/webp-to-png`

Файл: `src/content/tools/en/webp-to-png.yaml`

- **title:** WebP to PNG Converter — With Transparency, No Quality Loss _(58 симв.)_
- **description:** Convert WebP to PNG without losing any more quality. Transparency is kept and your files never leave your device. Free, no sign-up. _(131 симв.)_
- **H1:** WebP to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** WebP to PNG
- **Карточка:** WebP → PNG — Lossless, with transparency — ready for editing and design.
- **JSON-LD:** WebP to PNG Converter — An online lossless WebP to PNG converter that runs in your browser without uploading your images.

**How to convert WebP to PNG**

1. Click the box above or drag your WebP files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency preserved.** PNG supports transparency just like WebP, so a transparent background stays transparent.
- **No further quality loss.** PNG keeps the pixels exactly as they are, so converting doesn't degrade the image.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is WebP?** WebP is Google's image format, popular on websites because images stay small. Many apps and editors still can't open it, which is why converting to a common format such as PNG helps.
- **PNG or JPG — which should I pick?** Pick PNG when you need transparency or an exact, lossless copy: logos, icons, screenshots and images you'll keep editing. Pick JPG for photos when a small file matters more.
- **Is transparency preserved?** Yes. PNG supports transparency, so transparent areas of the WebP stay transparent.
- **Why is the PNG bigger than the WebP?** PNG is lossless, while WebP often stores images lossily and compresses them more efficiently, so the PNG is usually larger. For photos where size matters, choose JPG.
- **What if the WebP is animated?** Animation isn't carried over to PNG: the first frame is saved, and the file's row shows a warning.
- **What happens to the metadata?** By default the capture date is kept if the WebP has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

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
| `widget.lossless` | Без потерь | Lossless |
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
| `widget.errors.already-webp` | Файл уже в формате WebP — выберите другой формат выше. | This file is already a WebP — pick another format above. |
| `widget.errors.too-large-for-webp` | WebP вмещает изображения не больше 16 383 точек по стороне — выберите JPG или PNG. | WebP can't store images larger than 16,383 px per side — choose JPG or PNG. |
| `widget.errors.unsupported-image` | Этот формат изображений пока не поддерживается. Поддерживаются {formats}. | This image format isn't supported yet. Supported: {formats}. |
| `widget.errors.cmyk-unsupported` | JPEG в цветовой модели CMYK (для печати) пока не поддерживается. | CMYK JPEGs (used for print) aren't supported yet. |
| `widget.errors.decode-failed` | Не удалось прочитать файл — возможно, он повреждён. | Could not read the file — it may be damaged. |
| `widget.errors.unsupported-variant` | Этот вариант формата не поддерживается. | This variant of the format isn't supported. |
| `widget.errors.out-of-memory` | Браузеру не хватило памяти для этого файла. Закройте другие вкладки и попробуйте снова. | The browser ran out of memory for this file. Close other tabs and try again. |
| `widget.errors.internal` | Что-то пошло не так. Попробуйте ещё раз. | Something went wrong. Please try again. |
| `widget.warnings.hdr-tone` | HDR-снимок: цвета могут немного отличаться от оригинала. | HDR photo: colors may differ slightly from the original. |
| `widget.warnings.exif-unreadable` | Метаданные исходного файла повреждены и не сохранены. | The original metadata is damaged and was not kept. |
| `widget.warnings.exif-makernote-dropped` | Служебные данные камеры (MakerNote) не поместились и удалены. | Camera maker data (MakerNote) did not fit and was removed. |
| `widget.warnings.exif-reduced-to-dates` | Метаданные не поместились — сохранены только даты. | Metadata did not fit — only the dates were kept. |
| `widget.warnings.icc-too-large` | Цветовой профиль слишком большой и не сохранён. | The color profile is too large and was not kept. |
| `widget.warnings.icc-unreadable` | Цветовой профиль исходника не удалось прочитать — использован sRGB. | The original color profile couldn't be read — sRGB was used. |
| `widget.warnings.first-frame-only` | Анимация не переносится — сохранён первый кадр. | Animation isn't kept — the first frame was saved. |
| `notFound.title` | Страница не найдена | Page not found |
| `notFound.text` | Такой страницы нет. Возможно, адрес изменился или в нём опечатка. | This page does not exist. The address may have changed or contain a typo. |
| `notFound.toHome` | На главную | Go to the home page |
