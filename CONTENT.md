# CONTENT.md — тексты сайта

> **Файл генерируется** командой `npm run content` — не правьте его вручную.
> Тексты страниц лежат в `src/content/**/*.yaml`, короткие строки интерфейса — в `src/i18n/ui.ts`.
> После правки перегенерируйте файл: тест `content.test.ts` проверяет, что он актуален.

Все тексты — **черновики для проверки владельцем**. Правила: без кликбейта и выдуманных цифр;
английские тексты пишутся как оригинальные (под запросы «heic to jpg» и т. п.), а не как перевод.
Не обещаем «файлы меньше за счёт MozJPEG» — см. CLAUDE.md, раздел «Тексты».

## Страницы-конвертеры

### compress-image

#### Русский — `/szhat-foto`

Файл: `src/content/tools/ru/compress-image.yaml`

- **title:** Сжать фото онлайн — до нужного размера, без загрузки на сервер _(62 симв.)_
- **description:** Уменьшите вес фото и картинок JPG, PNG, WebP, HEIC и AVIF прямо в браузере: по качеству или до нужного размера в КБ и МБ. Бесплатно, без регистрации. _(149 симв.)_
- **H1:** Сжать фото онлайн
- **Подзаголовок:** По качеству или до нужного размера. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Сжать фото
- **Карточка:** Сжать фото — Уменьшить вес снимка — по качеству или до нужного размера в КБ и МБ.
- **JSON-LD:** Сжатие фото онлайн — Онлайн-сервис для сжатия фотографий и картинок, который работает в браузере без загрузки файлов на сервер.

**Как сжать фото**

1. Выберите режим: «По качеству» — ползунком, или «До размера» — укажите, сколько килобайт или мегабайт должен весить файл.
2. Нажмите на область выше или перетащите на неё фото — можно сразу несколько. Сжатие идёт прямо в браузере.
3. Скачайте файлы по одному или все сразу ZIP-архивом. В строке каждого файла видно, насколько он уменьшился.

**Почему здесь**

- **Файлы остаются у вас.** Сжатие выполняется на вашем устройстве. Фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Точно в нужный размер.** Нужен файл не больше 500 КБ или 1 МБ для анкеты или сайта? Укажите размер — качество подберётся само.
- **Формат сохраняется.** JPG остаётся JPG, PNG — PNG, WebP — WebP. Фото HEIC с iPhone и AVIF сохраняются в JPG. При желании формат можно сменить.
- **Сразу много файлов.** Сожмите до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Как сжать фото до нужного размера, например до 1 МБ?** Выберите режим «До размера», введите число и единицу — КБ или МБ — и добавьте фото. Конвертер несколько раз пересожмёт снимок с разным качеством и сохранит вариант с наибольшим качеством, который укладывается в заданный размер.
- **Почему файл получился меньше, чем я указал?** Размер подбирается так, чтобы точно не превысить лимит, поэтому файл обычно немного меньше заданного. Килобайт и мегабайт считаются десятичными (1 МБ = 1 000 000 байт), чтобы файл прошёл проверку на любом сайте.
- **Что делать, если файл не сжимается до нужного размера?** Если даже при минимальном качестве файл больше лимита, сохранится самый маленький вариант, а в строке файла появится подсказка. Тогда уменьшите изображение в пикселях — от разрешения размер файла зависит сильнее всего.
- **Сильно ли ухудшится качество?** При качестве 75 (значение по умолчанию) разница с оригиналом на фотографиях обычно почти не заметна, а файл получается заметно легче. Чем ниже качество, тем меньше файл и тем заметнее артефакты сжатия.
- **Можно ли сжать PNG?** Да, но PNG хранит изображение без потерь, поэтому сильно уменьшить его нельзя. Если прозрачность не нужна, выберите JPG; если нужна — WebP: он сохраняет прозрачность и весит в разы меньше.
- **Почему файл не стал меньше?** Если исходник уже был сильно сжат, повторное сжатие почти ничего не даёт. Уменьшите качество или выберите формат WebP — в строке файла видно, как изменился размер.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель телефона и другие служебные данные удаляются — заодно это немного уменьшает файл. Чтобы перенести все метаданные, отметьте «Сохранить все метаданные».
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а фотографии обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/compress-image`

Файл: `src/content/tools/en/compress-image.yaml`

- **title:** Compress Images Online — To a Target Size, No Upload _(52 симв.)_
- **description:** Reduce the file size of JPG, PNG, WebP, HEIC and AVIF images right in your browser: by quality or to an exact size in KB or MB. Free, no sign-up. _(145 симв.)_
- **H1:** Compress Images Online
- **Подзаголовок:** By quality or to a target file size. Your files never leave your device.
- **Хлебные крошки:** Compress images
- **Карточка:** Compress images — Make photos lighter — by quality or to a target size in KB or MB.
- **JSON-LD:** Image Compressor — An online image compressor that runs in your browser without uploading your photos.

**How to compress an image**

1. Pick a mode: “By quality” with the slider, or “To file size” — enter how many kilobytes or megabytes the file may take.
2. Click the box above or drag your images onto it — you can add many at once. Everything happens in your browser.
3. Download the files one by one or all at once as a ZIP. Each file's row shows how much smaller it got.

**Why use this compressor**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Hit an exact file size.** Need a file under 500 KB or 1 MB for a form or a website? Enter the limit and the quality is picked for you.
- **The format stays the same.** JPG stays JPG, PNG stays PNG, WebP stays WebP. HEIC photos from an iPhone and AVIF images are saved as JPG. You can switch formats if you like.
- **Batch compression.** Compress up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **How do I compress a photo to a specific size, like 1 MB?** Choose “To file size”, enter the number and the unit — KB or MB — and add your photos. The compressor encodes each image a few times at different qualities and keeps the highest quality that fits the limit.
- **Why is the file smaller than the size I entered?** The size is chosen so the file never goes over the limit, so it usually ends up a bit smaller. Kilobytes and megabytes are decimal (1 MB = 1,000,000 bytes) so the file passes the check on any website.
- **What if the image can't be compressed to that size?** If the file is still too large even at the lowest quality, the smallest version is saved and its row shows a hint. Reduce the image's dimensions in that case — resolution affects file size the most.
- **Will the quality drop a lot?** At the default quality of 75 the difference is usually hard to notice on photos, while the file gets much lighter. The lower the quality, the smaller the file and the more visible the compression artifacts.
- **Can I compress a PNG?** Yes, but PNG is lossless, so it can't shrink much. If you don't need transparency, choose JPG; if you do, choose WebP — it keeps transparency and is many times smaller.
- **Why didn't the file get smaller?** If the original was already heavily compressed, compressing it again gains little. Lower the quality or choose WebP — each file's row shows how its size changed.
- **What happens to the location and the date taken?** By default the capture date is kept, while the location, phone model and other details are removed — which also trims the file a little. Tick “Keep all metadata” to copy everything.
- **Is it safe to compress my photos here?** Yes. The site only downloads the tool itself; your images are processed in your browser and are never sent to a server.

### resize-image

#### Русский — `/izmenit-razmer-foto`

Файл: `src/content/tools/ru/resize-image.yaml`

- **title:** Изменить размер фото онлайн — в пикселях или процентах _(54 симв.)_
- **description:** Уменьшите фото и картинки JPG, PNG, WebP, HEIC и AVIF до нужного размера в пикселях или процентах прямо в браузере. Бесплатно, без регистрации и загрузки. _(154 симв.)_
- **H1:** Изменить размер фото онлайн
- **Подзаголовок:** По длинной стороне, в процентах или до точных размеров. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Изменить размер фото
- **Карточка:** Изменить размер — Уменьшить фото до нужных пикселей — по стороне, в процентах или точно.
- **JSON-LD:** Изменение размера фото онлайн — Онлайн-сервис для уменьшения фотографий и картинок, который работает в браузере без загрузки файлов на сервер.

**Как изменить размер фото**

1. Выберите, как уменьшить: до длины длинной стороны (например, 1920 точек), в процентах или до точной ширины и высоты.
2. Нажмите на область выше или перетащите на неё фото — можно сразу несколько. Всё происходит прямо в браузере.
3. Скачайте файлы по одному или все сразу ZIP-архивом. В строке каждого файла видны размеры до и после.

**Почему здесь**

- **Файлы остаются у вас.** Фото уменьшаются на вашем устройстве. Они не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Аккуратное уменьшение.** Используется фильтр Lanczos — тот же, что в графических редакторах: мелкие детали остаются чёткими, без «лесенок» на краях.
- **Формат и поворот сохраняются.** JPG остаётся JPG, PNG — PNG с прозрачностью. Фото HEIC с iPhone и AVIF сохраняются в JPG. Снимок поворачивается так же, как в галерее.
- **Сразу много файлов.** Уменьшите до 100 изображений за раз с одинаковыми настройками и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Как уменьшить фото до 1920 пикселей?** Оставьте режим «По длинной стороне» и выберите 1920 — или впишите своё число. Длинная сторона станет 1920 точек, а короткая уменьшится пропорционально: снимок 4032 × 3024 превратится в 1920 × 1440.
- **Чем отличаются режимы?** «По длинной стороне» удобен для пачки фото разной ориентации: и горизонтальные, и вертикальные снимки станут не больше заданного. «В процентах» уменьшает каждое изображение во столько же раз. «Ширина и высота» вписывает изображение в рамку, а без галочки «Сохранять пропорции» растягивает точно до неё.
- **Можно ли увеличить изображение?** Нет, изображения только уменьшаются: при увеличении новых деталей не появляется, файл лишь становится больше. Если фото уже меньше заданного размера, оно сохранит свои размеры, а в строке файла появится пояснение.
- **Ухудшится ли качество?** Уменьшенное фото содержит меньше точек, но выглядит чётким: используется фильтр Lanczos. JPG и WebP сохраняются с качеством 90 — его можно изменить ползунком. PNG сохраняется без потерь.
- **Уменьшится ли вес файла?** Да, обычно заметно: если уменьшить фото вдвое по каждой стороне, точек станет вчетверо меньше. Чтобы уложиться в конкретный размер в килобайтах, воспользуйтесь страницей «Сжать фото».
- **Сохранится ли прозрачность?** Да, если выбрать «Исходный» формат для PNG и WebP или формат PNG либо WebP явно. В JPG прозрачных областей нет — они станут белыми.
- **Что происходит с геолокацией и датой съёмки?** По умолчанию дата и время съёмки сохраняются, а геолокация, модель телефона и другие служебные данные удаляются. Чтобы перенести все метаданные, отметьте «Сохранить все метаданные».
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а фотографии обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/resize-image`

Файл: `src/content/tools/en/resize-image.yaml`

- **title:** Resize Images Online — By Pixels or Percentage, No Upload _(57 симв.)_
- **description:** Resize JPG, PNG, WebP, HEIC and AVIF images to the pixel dimensions or percentage you need, right in your browser. Free, no sign-up, no upload. _(143 симв.)_
- **H1:** Resize Images Online
- **Подзаголовок:** By the longest side, by percentage or to exact dimensions. Your files never leave your device.
- **Хлебные крошки:** Resize images
- **Карточка:** Resize images — Shrink photos to the pixels you need — by side, by percentage or exactly.
- **JSON-LD:** Image Resizer — An online image resizer that runs in your browser without uploading your photos.

**How to resize an image**

1. Choose how to resize: by the longest side (for example 1920 pixels), by percentage, or to an exact width and height.
2. Click the box above or drag your images onto it — you can add many at once. Everything happens in your browser.
3. Download the files one by one or all at once as a ZIP. Each file's row shows its dimensions before and after.

**Why use this resizer**

- **Your files stay with you.** Images are resized on your device. They are never uploaded to a server, so nobody else ever sees them.
- **Clean downscaling.** Resizing uses the Lanczos filter found in photo editors, so fine detail stays crisp, without jagged edges.
- **Format and rotation are kept.** JPG stays JPG, PNG stays PNG with its transparency. HEIC photos from an iPhone and AVIF images are saved as JPG. Photos are rotated just as in your gallery.
- **Batch resizing.** Resize up to 100 images at a time with the same settings and download them as a single ZIP file.

**Frequently asked questions**

- **How do I resize a photo to 1920 pixels?** Keep “Longest side” and pick 1920, or type your own number. The longest side becomes 1920 pixels and the other one shrinks proportionally: a 4032 × 3024 photo becomes 1920 × 1440.
- **What's the difference between the modes?** “Longest side” works best for a batch of landscape and portrait photos — none of them ends up larger than the limit. “Percentage” shrinks every image by the same factor. “Width and height” fits the image within a box, or stretches it to exactly that box if “Keep aspect ratio” is unticked.
- **Can I make an image bigger?** No, images are only made smaller: enlarging doesn't add detail, it just makes the file bigger. If a photo is already smaller than the requested size, it keeps its dimensions and its row explains why.
- **Will the quality suffer?** A smaller image has fewer pixels but stays sharp thanks to the Lanczos filter. JPG and WebP are saved at quality 90, which you can change with the slider. PNG is saved losslessly.
- **Will the file get lighter?** Yes, usually a lot: halving each side leaves a quarter of the pixels. To hit a specific size in kilobytes, use the “Compress images” page.
- **Is transparency preserved?** Yes, with the “Original” format for PNG and WebP, or when you pick PNG or WebP explicitly. JPG has no transparency, so transparent areas turn white.
- **What happens to the location and the date taken?** By default the capture date is kept, while the location, phone model and other details are removed. Tick “Keep all metadata” to copy everything.
- **Is it safe to resize my photos here?** Yes. The site only downloads the tool itself; your images are processed in your browser and are never sent to a server.

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

### avif-to-jpg

#### Русский — `/avif-v-jpg`

Файл: `src/content/tools/ru/avif-to-jpg.yaml`

- **title:** AVIF в JPG онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте картинки AVIF в JPG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. JPG откроется в любой программе. _(144 симв.)_
- **H1:** Конвертер AVIF в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** AVIF в JPG
- **Карточка:** AVIF → JPG — Новый формат картинок с сайтов — в JPG, который открывается везде.
- **JSON-LD:** Конвертер AVIF в JPG — Онлайн-конвертер изображений AVIF в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать AVIF в JPG**

1. Нажмите на область выше или перетащите на неё AVIF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Цвета как в оригинале.** Цветовой профиль AVIF переносится в JPG, поэтому снимки с широким цветовым охватом не тускнеют.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое AVIF?** AVIF — современный формат изображений на основе видеокодека AV1. Сайты используют его, потому что картинки в нём занимают мало места. Но его открывают ещё не все программы, фоторедакторы и сервисы, поэтому картинку удобнее перевести в JPG.
- **Почему картинка с сайта скачивается в AVIF?** Сайты отдают картинки в AVIF, чтобы страницы грузились быстрее, и браузер сохраняет файл в том же формате. Конвертация в JPG делает картинку пригодной для любых программ.
- **Теряется ли качество?** JPG сжимает с потерями, поэтому картинка немного меняется. При качестве 90 (значение по умолчанию) разница обычно не видна. Если нужна точная копия без новых потерь, выберите PNG.
- **Почему JPG больше, чем AVIF?** AVIF сжимает намного эффективнее JPG, поэтому та же картинка в JPG при сопоставимом качестве весит больше. Это нормально; уменьшите качество ползунком, если нужен файл поменьше.
- **Что будет с прозрачностью, HDR и анимацией?** В JPG нет прозрачности, поэтому прозрачные области становятся белыми. HDR-изображения сохраняются в обычном диапазоне — цвета могут немного отличаться, и в строке файла появится предупреждение. У анимированного AVIF сохраняется основной кадр.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в AVIF, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/avif-to-jpg`

Файл: `src/content/tools/en/avif-to-jpg.yaml`

- **title:** AVIF to JPG Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert AVIF images to JPG right in your browser. Free, no sign-up, and your files never leave your device. The JPG opens in any app. _(133 симв.)_
- **H1:** AVIF to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** AVIF to JPG
- **Карточка:** AVIF → JPG — The newest web image format, as a JPG that opens everywhere.
- **JSON-LD:** AVIF to JPG Converter — An online AVIF to JPG converter that runs in your browser without uploading your images.

**How to convert AVIF to JPG**

1. Click the box above or drag your AVIF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **True-to-original colors.** The AVIF's color profile is carried over to the JPG, so wide-gamut images don't come out looking dull.
- **MozJPEG encoding.** JPGs are made with MozJPEG, Mozilla's advanced JPEG encoder. Fine-tune the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is AVIF?** AVIF is a modern image format based on the AV1 video codec. Websites use it because it keeps images very small. Many apps, photo editors and services still can't open it, though, so it's often easier to work with the image as a JPG.
- **Why do images from websites download as AVIF?** Websites serve images as AVIF so pages load faster, and your browser saves the file in the same format. Converting it to JPG makes it work in any app.
- **Will I lose quality?** JPG compression is lossy, so the image changes slightly. At the default quality of 90 the difference is usually invisible. If you need an exact copy with no further loss, pick PNG.
- **Why is the JPG bigger than the AVIF?** AVIF compresses far more efficiently than JPG, so the same image at similar quality takes up more space as a JPG. That's expected — lower the quality slider if you need a smaller file.
- **What about transparency, HDR and animation?** JPG has no transparency, so transparent areas turn white. HDR images are saved in standard range — colors may differ slightly, and the file's row shows a warning. For an animated AVIF, the main frame is saved.
- **What happens to the metadata?** By default the capture date is kept if the AVIF has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### avif-to-png

#### Русский — `/avif-v-png`

Файл: `src/content/tools/ru/avif-to-png.yaml`

- **title:** AVIF в PNG онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте картинки AVIF в PNG прямо в браузере: прозрачность сохраняется, файлы не загружаются на сервер. Бесплатно и без регистрации. _(138 симв.)_
- **H1:** Конвертер AVIF в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** AVIF в PNG
- **Карточка:** AVIF → PNG — Без новых потерь и с прозрачностью — для редактирования.
- **JSON-LD:** Конвертер AVIF в PNG — Онлайн-конвертер изображений AVIF в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать AVIF в PNG**

1. Нажмите на область выше или перетащите на неё AVIF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность сохраняется.** PNG поддерживает прозрачность так же, как AVIF, поэтому прозрачный фон останется прозрачным.
- **Без новых потерь.** PNG сохраняет пиксели без изменений: при конвертации качество не ухудшается.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое AVIF?** AVIF — современный формат изображений на основе видеокодека AV1. Сайты используют его, потому что картинки в нём занимают мало места. Но многие программы и редакторы его пока не открывают, поэтому картинку удобнее перевести в распространённый формат, например PNG.
- **Когда лучше PNG, а когда JPG?** PNG — если важны прозрачность или точная копия без потерь: для логотипов, иконок, скриншотов и картинок, которые будут дальше редактировать. JPG — для фотографий, когда важен небольшой размер файла.
- **Сохранится ли прозрачность?** Да. PNG поддерживает прозрачность, поэтому прозрачные области AVIF останутся прозрачными.
- **Почему PNG намного больше, чем AVIF?** PNG сжимает без потерь, а AVIF хранит картинки с потерями и сжимает очень эффективно, поэтому PNG может весить в разы больше. Для фотографий, где важнее размер, выберите JPG.
- **А если AVIF в HDR или с глубиной цвета 10 бит?** PNG сохраняется с 8 битами на канал и в обычном диапазоне яркости. У HDR-изображений цвета могут немного отличаться — в строке файла появится предупреждение. У анимированного AVIF сохраняется основной кадр.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, если она есть в AVIF, а геолокация и другие сведения удаляются. Если отметить «Сохранить все метаданные», перенесутся все данные EXIF. Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/avif-to-png`

Файл: `src/content/tools/en/avif-to-png.yaml`

- **title:** AVIF to PNG Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert AVIF images to PNG right in your browser. Transparency is kept and your files never leave your device. Free, no sign-up. _(128 симв.)_
- **H1:** AVIF to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** AVIF to PNG
- **Карточка:** AVIF → PNG — No further loss and transparency kept — ready for editing.
- **JSON-LD:** AVIF to PNG Converter — An online AVIF to PNG converter that runs in your browser without uploading your images.

**How to convert AVIF to PNG**

1. Click the box above or drag your AVIF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency is kept.** PNG supports transparency just like AVIF, so transparent backgrounds stay transparent.
- **No further loss.** PNG stores pixels exactly as they are, so converting doesn't reduce the quality.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is AVIF?** AVIF is a modern image format based on the AV1 video codec. Websites use it because it keeps images very small. Many apps and editors still can't open it, though, so it's often easier to convert the image to a widely supported format such as PNG.
- **Should I pick PNG or JPG?** Pick PNG when you need transparency or an exact lossless copy: logos, icons, screenshots and images you'll keep editing. Pick JPG for photos when a small file matters more.
- **Is transparency kept?** Yes. PNG supports transparency, so transparent areas of the AVIF stay transparent.
- **Why is the PNG so much bigger than the AVIF?** PNG is lossless, while AVIF stores images with very efficient lossy compression, so a PNG can be several times larger. For photos where size matters more, pick JPG.
- **What if the AVIF is HDR or 10-bit?** The PNG is saved with 8 bits per channel in standard dynamic range. Colors of HDR images may differ slightly, and the file's row shows a warning. For an animated AVIF, the main frame is saved.
- **What happens to the metadata?** By default the capture date is kept if the AVIF has one, while the location and other details are removed. Tick “Keep all metadata” to copy the full EXIF data. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

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

### jpg-to-ico

#### Русский — `/jpg-v-ico`

Файл: `src/content/tools/ru/jpg-to-ico.yaml`

- **title:** JPG в ICO онлайн — иконка и фавикон из фото, без загрузки _(57 симв.)_
- **description:** Сделайте иконку ICO из JPG прямо в браузере: фавикон для сайта или иконку Windows, все размеры от 16 до 256 пикселей в одном файле. Бесплатно и без регистрации. _(160 симв.)_
- **H1:** Конвертер JPG в ICO
- **Подзаголовок:** Фавикон и иконка Windows. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPG в ICO
- **Карточка:** JPG → ICO — Иконка или фавикон из фотографии — все размеры в одном файле.
- **JSON-LD:** Конвертер JPG в ICO — Онлайн-конвертер JPG в ICO для фавиконов и иконок, который работает в браузере без загрузки файлов на сервер.

**Как сделать ICO из JPG**

1. Нажмите на область выше или перетащите на неё JPG — лучше квадратную картинку от 256 × 256 пикселей.
2. Подождите немного: иконка собирается прямо в браузере, файлы никуда не отправляются.
3. Скачайте ICO по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Иконка собирается на вашем устройстве. Фото не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Все размеры в одном файле.** В ICO попадают размеры 16, 32, 48, 64, 128 и 256 пикселей — система и браузер сами выберут подходящий.
- **Поворот учитывается.** Фото с телефона поворачивается так же, как в галерее, а прямоугольный снимок аккуратно вписывается в квадрат.
- **Чёткие маленькие размеры.** Каждый размер уменьшается отдельно фильтром Lanczos, поэтому даже иконка 16 × 16 не выглядит размытой кашей.

**Частые вопросы**

- **Как сделать фавикон для сайта?** Сконвертируйте логотип в ICO, назовите файл favicon.ico и положите в корень сайта. Браузеры найдут его сами; для надёжности добавьте в код страницы строку <link rel="icon" href="/favicon.ico">.
- **Какие размеры будут в иконке?** 16, 32, 48, 64, 128 и 256 пикселей — но не больше исходной картинки: иконку из маленького изображения не раздуваем.
- **Что будет с прямоугольным фото?** Иконки квадратные, поэтому фото целиком впишется в квадрат, а по краям появятся прозрачные поля. Если нужна иконка без полей, заранее обрежьте фото до квадрата.
- **Будет ли у иконки прозрачный фон?** У JPG прозрачности нет, поэтому фон фото останется в иконке. Прозрачными будут только поля вокруг прямоугольного снимка. Для логотипа на прозрачном фоне используйте PNG.
- **Подойдёт ли иконка для Windows?** Да. ICO с размерами до 256 × 256 подходит для ярлыков, папок и программ в Windows 7, 10 и 11.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jpg-to-ico`

Файл: `src/content/tools/en/jpg-to-ico.yaml`

- **title:** JPG to ICO Converter — Icon and Favicon from a Photo _(52 симв.)_
- **description:** Make an ICO icon from a JPG right in your browser: a website favicon or a Windows icon with every size from 16 to 256 pixels in one file. Free, no upload. _(154 симв.)_
- **H1:** JPG to ICO Converter
- **Подзаголовок:** Favicons and Windows icons. Your files never leave your device.
- **Хлебные крошки:** JPG to ICO
- **Карточка:** JPG → ICO — An icon or favicon from a photo — every size in one file.
- **JSON-LD:** JPG to ICO Converter — An online JPG to ICO converter for favicons and icons that runs in your browser without uploading your photos.

**How to convert JPG to ICO**

1. Click the box above or drag your JPG onto it — ideally a square image of 256 × 256 pixels or more.
2. Wait a moment while your browser builds the icon. Nothing gets uploaded.
3. Download each ICO separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** The icon is built on your device. Photos are never uploaded to a server, so nobody else ever sees them.
- **Every size in one file.** The ICO holds 16, 32, 48, 64, 128 and 256 pixel versions — the system and the browser pick the one they need.
- **Rotation is respected.** A phone photo is rotated just as in your gallery, and a non-square shot is neatly fitted into a square.
- **Crisp small sizes.** Each size is downscaled separately with the Lanczos filter, so even the 16 × 16 icon doesn't turn into a blurry mess.

**Frequently asked questions**

- **How do I make a favicon for my website?** Convert your logo to ICO, name the file favicon.ico and put it in the root of your site. Browsers find it on their own; to be safe, add <link rel="icon" href="/favicon.ico"> to your pages.
- **Which sizes are in the icon?** 16, 32, 48, 64, 128 and 256 pixels — but none larger than the original image, so a small picture isn't blown up.
- **What happens to a non-square photo?** Icons are square, so the whole photo is fitted into a square with transparent margins around it. Crop the photo to a square first if you want an icon without margins.
- **Will the icon have a transparent background?** JPG has no transparency, so the photo's background stays in the icon; only the margins around a non-square photo are transparent. Use a PNG for a logo on a transparent background.
- **Will the icon work on Windows?** Yes. An ICO with sizes up to 256 × 256 works for shortcuts, folders and apps on Windows 7, 10 and 11.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### jpg-to-avif

#### Русский — `/jpg-v-avif`

Файл: `src/content/tools/ru/jpg-to-avif.yaml`

- **title:** JPG в AVIF онлайн — лёгкие картинки для сайта, без загрузки _(59 симв.)_
- **description:** Конвертируйте фото JPG в AVIF прямо в браузере: современный формат для сайтов, который при том же качестве обычно легче JPG. Бесплатно, без регистрации. _(152 симв.)_
- **H1:** Конвертер JPG в AVIF
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPG в AVIF
- **Карточка:** JPG → AVIF — Фото для сайта — в современный формат, который обычно легче JPG.
- **JSON-LD:** Конвертер JPG в AVIF — Онлайн-конвертер изображений JPG в AVIF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JPG в AVIF**

1. Нажмите на область выше или перетащите на неё JPG-файлы — можно сразу несколько.
2. Подождите: кодирование AVIF идёт прямо в браузере и занимает больше времени, чем JPG или WebP.
3. Скачайте AVIF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Легче при том же качестве.** AVIF основан на видеокодеке AV1 и обычно сжимает фотографии сильнее, чем JPG. Размер до и после виден в строке каждого файла.
- **Цвета и метаданные.** Цветовой профиль переносится в AVIF. По умолчанию сохраняется дата съёмки, а геолокация удаляется.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое AVIF?** AVIF — современный формат изображений на основе видеокодека AV1. Его поддерживают все современные браузеры, поэтому он удобен для сайтов: страницы грузятся быстрее.
- **Насколько AVIF меньше JPG?** Зависит от снимка и выбранного качества. Обычно AVIF заметно легче JPG при сопоставимом качестве, но сжатый JPG может уменьшиться не так сильно. Размер до и после показан в строке каждого файла.
- **Почему кодирование такое долгое?** Кодировщик AV1 тщательно подбирает, как сжать каждый участок изображения. В браузере он работает в один поток, поэтому большое фото может кодироваться десятки секунд. Зато всё происходит на вашем устройстве.
- **Какое качество выбрать?** Значение по умолчанию — 75: на фотографиях разница с оригиналом обычно незаметна. Для превью и фонов можно уменьшить, для детальных снимков — увеличить.
- **Откроется ли AVIF на компьютере?** AVIF открывают современные браузеры и многие программы, в том числе просмотрщик фото в Windows 11 и macOS. Для старых программ надёжнее оставить JPG.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jpg-to-avif`

Файл: `src/content/tools/en/jpg-to-avif.yaml`

- **title:** JPG to AVIF Converter — Lighter Images for the Web, No Upload _(61 симв.)_
- **description:** Convert JPG photos to AVIF right in your browser: a modern web format that's usually lighter than JPG at the same quality. Free, no sign-up. _(140 симв.)_
- **H1:** JPG to AVIF Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JPG to AVIF
- **Карточка:** JPG → AVIF — Web photos in a modern format that's usually lighter than JPG.
- **JSON-LD:** JPG to AVIF Converter — An online JPG to AVIF converter that runs in your browser without uploading your images.

**How to convert JPG to AVIF**

1. Click the box above or drag your JPG files onto it — you can add many at once.
2. Wait a bit: AVIF encoding happens in your browser and takes longer than JPG or WebP.
3. Download each AVIF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Photos are never uploaded to a server, so nobody else ever sees them.
- **Lighter at the same quality.** AVIF is based on the AV1 video codec and usually compresses photos better than JPG. Each file's row shows the size before and after.
- **Colors and metadata.** The color profile is copied into the AVIF. By default the capture date is kept and the location is removed.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is AVIF?** AVIF is a modern image format based on the AV1 video codec. Every modern browser supports it, which makes it great for websites: pages load faster.
- **How much smaller is AVIF than JPG?** It depends on the photo and the quality you pick. AVIF is usually noticeably lighter than JPG at similar quality, though an already heavily compressed JPG may shrink less. Each file's row shows the size before and after.
- **Why does encoding take so long?** The AV1 encoder works hard to find the best way to compress every part of the image. In the browser it runs on a single thread, so a large photo can take tens of seconds. In return, everything stays on your device.
- **Which quality should I choose?** The default of 75 is usually indistinguishable from the original on photos. Go lower for thumbnails and backgrounds, higher for very detailed shots.
- **Will AVIF open on my computer?** Modern browsers and many apps open AVIF, including the Photos app on Windows 11 and Preview on macOS. For older software, JPG is the safer choice.
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

### png-to-ico

#### Русский — `/png-v-ico`

Файл: `src/content/tools/ru/png-to-ico.yaml`

- **title:** PNG в ICO онлайн — фавикон и иконка, без загрузки на сервер _(59 симв.)_
- **description:** Сделайте иконку ICO из PNG прямо в браузере: фавикон для сайта или иконку Windows, все размеры от 16 до 256 пикселей в одном файле. Бесплатно и без регистрации. _(160 симв.)_
- **H1:** Конвертер PNG в ICO
- **Подзаголовок:** Фавикон и иконка Windows. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PNG в ICO
- **Карточка:** PNG → ICO — Фавикон для сайта или иконка Windows — все размеры в одном файле.
- **JSON-LD:** Конвертер PNG в ICO — Онлайн-конвертер PNG в ICO для фавиконов и иконок, который работает в браузере без загрузки файлов на сервер.

**Как сделать ICO из PNG**

1. Нажмите на область выше или перетащите на неё PNG — лучше квадратную картинку от 256 × 256 пикселей.
2. Подождите немного: иконка собирается прямо в браузере, файлы никуда не отправляются.
3. Скачайте ICO по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Иконка собирается на вашем устройстве. Картинки не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Все размеры в одном файле.** В ICO попадают размеры 16, 32, 48, 64, 128 и 256 пикселей — система и браузер сами выберут подходящий.
- **Прозрачность сохраняется.** Прозрачный фон PNG остаётся прозрачным в иконке, а прямоугольная картинка аккуратно вписывается в квадрат.
- **Чёткие маленькие размеры.** Каждый размер уменьшается отдельно фильтром Lanczos, поэтому даже иконка 16 × 16 не выглядит размытой кашей.

**Частые вопросы**

- **Как сделать фавикон для сайта?** Сконвертируйте логотип в ICO, назовите файл favicon.ico и положите в корень сайта. Браузеры найдут его сами; для надёжности добавьте в код страницы строку <link rel="icon" href="/favicon.ico">.
- **Какие размеры будут в иконке?** 16, 32, 48, 64, 128 и 256 пикселей — но не больше исходной картинки: иконку из маленького изображения не раздуваем. Из картинки меньше 16 пикселей получится один размер 16 × 16.
- **Что будет с прямоугольной картинкой?** Иконки квадратные, поэтому картинка целиком впишется в квадрат, а по краям появятся прозрачные поля. Ничего не обрезается.
- **Сохранится ли прозрачность?** Да. Каждый размер хранится внутри ICO как PNG с прозрачностью — так иконки хранят Windows и все современные браузеры.
- **Подойдёт ли иконка для Windows?** Да. ICO с размерами до 256 × 256 подходит для ярлыков, папок и программ в Windows 7, 10 и 11.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/png-to-ico`

Файл: `src/content/tools/en/png-to-ico.yaml`

- **title:** PNG to ICO Converter — Favicon and Icon Maker, No Upload _(56 симв.)_
- **description:** Make an ICO icon from a PNG right in your browser: a website favicon or a Windows icon with every size from 16 to 256 pixels in one file. Free, no sign-up. _(155 симв.)_
- **H1:** PNG to ICO Converter
- **Подзаголовок:** Favicons and Windows icons. Your files never leave your device.
- **Хлебные крошки:** PNG to ICO
- **Карточка:** PNG → ICO — A website favicon or a Windows icon — every size in one file.
- **JSON-LD:** PNG to ICO Converter — An online PNG to ICO converter for favicons and icons that runs in your browser without uploading your images.

**How to convert PNG to ICO**

1. Click the box above or drag your PNG onto it — ideally a square image of 256 × 256 pixels or more.
2. Wait a moment while your browser builds the icon. Nothing gets uploaded.
3. Download each ICO separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** The icon is built on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Every size in one file.** The ICO holds 16, 32, 48, 64, 128 and 256 pixel versions — the system and the browser pick the one they need.
- **Transparency is kept.** A transparent PNG background stays transparent in the icon, and a non-square image is neatly fitted into a square.
- **Crisp small sizes.** Each size is downscaled separately with the Lanczos filter, so even the 16 × 16 icon doesn't turn into a blurry mess.

**Frequently asked questions**

- **How do I make a favicon for my website?** Convert your logo to ICO, name the file favicon.ico and put it in the root of your site. Browsers find it on their own; to be safe, add <link rel="icon" href="/favicon.ico"> to your pages.
- **Which sizes are in the icon?** 16, 32, 48, 64, 128 and 256 pixels — but none larger than the original image, so a small picture isn't blown up. An image under 16 pixels becomes a single 16 × 16 icon.
- **What happens to a non-square image?** Icons are square, so the whole image is fitted into a square with transparent margins around it. Nothing is cropped.
- **Is transparency preserved?** Yes. Each size is stored inside the ICO as a PNG with transparency — the way Windows and all modern browsers store icons.
- **Will the icon work on Windows?** Yes. An ICO with sizes up to 256 × 256 works for shortcuts, folders and apps on Windows 7, 10 and 11.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### png-to-avif

#### Русский — `/png-v-avif`

Файл: `src/content/tools/ru/png-to-avif.yaml`

- **title:** PNG в AVIF онлайн — с прозрачностью, без загрузки на сервер _(59 симв.)_
- **description:** Конвертируйте картинки PNG в AVIF прямо в браузере: прозрачность сохраняется, а файлы обычно становятся в разы легче. Бесплатно, без регистрации. _(145 симв.)_
- **H1:** Конвертер PNG в AVIF
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PNG в AVIF
- **Карточка:** PNG → AVIF — С прозрачностью и в разы легче — для сайтов и интерфейсов.
- **JSON-LD:** Конвертер PNG в AVIF — Онлайн-конвертер изображений PNG в AVIF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать PNG в AVIF**

1. Нажмите на область выше или перетащите на неё PNG-файлы — можно сразу несколько.
2. Подождите: кодирование AVIF идёт прямо в браузере и занимает больше времени, чем JPG или WebP.
3. Скачайте AVIF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность сохраняется.** AVIF поддерживает прозрачность, поэтому прозрачный фон PNG остаётся прозрачным.
- **В разы легче.** PNG хранит изображение без потерь, а AVIF сжимает его с потерями — для фотографий и сложных картинок файл обычно становится в разы меньше.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое AVIF?** AVIF — современный формат изображений на основе видеокодека AV1. Его поддерживают все современные браузеры, поэтому он удобен для сайтов: страницы грузятся быстрее.
- **Сохранится ли прозрачность?** Да. AVIF хранит альфа-канал, поэтому прозрачные области PNG остаются прозрачными.
- **Подходит ли AVIF для скриншотов и логотипов?** Для фотографий и сложных иллюстраций — да. Для скриншотов с мелким текстом и логотипов с чёткими краями сжатие с потерями может дать заметные артефакты — их лучше оставить в PNG или поднять качество.
- **Почему кодирование такое долгое?** Кодировщик AV1 тщательно подбирает, как сжать каждый участок изображения. В браузере он работает в один поток, поэтому большая картинка может кодироваться десятки секунд.
- **Какое качество выбрать?** Значение по умолчанию — 75: на фотографиях разница с оригиналом обычно незаметна. Для картинок с текстом и тонкими линиями лучше поднять качество.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/png-to-avif`

Файл: `src/content/tools/en/png-to-avif.yaml`

- **title:** PNG to AVIF Converter — Keeps Transparency, No Upload _(53 симв.)_
- **description:** Convert PNG images to AVIF right in your browser: transparency is kept and files usually get several times lighter. Free, no sign-up. _(133 симв.)_
- **H1:** PNG to AVIF Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** PNG to AVIF
- **Карточка:** PNG → AVIF — With transparency and much lighter — for websites and interfaces.
- **JSON-LD:** PNG to AVIF Converter — An online PNG to AVIF converter that runs in your browser without uploading your images.

**How to convert PNG to AVIF**

1. Click the box above or drag your PNG files onto it — you can add many at once.
2. Wait a bit: AVIF encoding happens in your browser and takes longer than JPG or WebP.
3. Download each AVIF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency is kept.** AVIF supports transparency, so a transparent PNG background stays transparent.
- **Several times lighter.** PNG stores images losslessly, while AVIF uses lossy compression — photos and complex images usually get several times smaller.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is AVIF?** AVIF is a modern image format based on the AV1 video codec. Every modern browser supports it, which makes it great for websites: pages load faster.
- **Is transparency preserved?** Yes. AVIF stores an alpha channel, so transparent areas of the PNG stay transparent.
- **Is AVIF good for screenshots and logos?** For photos and complex illustrations, yes. Screenshots with small text and logos with sharp edges may show visible artifacts with lossy compression — keep those as PNG or raise the quality.
- **Why does encoding take so long?** The AV1 encoder works hard to find the best way to compress every part of the image. In the browser it runs on a single thread, so a large image can take tens of seconds.
- **Which quality should I choose?** The default of 75 is usually indistinguishable from the original on photos. Raise it for images with text and thin lines.
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

### gif-to-jpg

#### Русский — `/gif-v-jpg`

Файл: `src/content/tools/ru/gif-to-jpg.yaml`

- **title:** GIF в JPG онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте картинки GIF в JPG прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. Можно сразу много файлов. _(136 симв.)_
- **H1:** Конвертер GIF в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** GIF в JPG
- **Карточка:** GIF → JPG — Картинку GIF — в обычное фото, которое принимают везде.
- **JSON-LD:** Конвертер GIF в JPG — Онлайн-конвертер изображений GIF в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать GIF в JPG**

1. Нажмите на область выше или перетащите на неё GIF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность — на белом фоне.** В JPG нет прозрачности, поэтому прозрачные области GIF ложатся на белый фон, а не становятся чёрными.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что будет с анимированным GIF?** JPG хранит только одно изображение, поэтому сохранится первый кадр анимации — тот, что виден до начала проигрывания. В строке файла появится пояснение.
- **Станет ли картинка лучше?** Нет. GIF хранит не больше 256 цветов, и конвертация не вернёт недостающие оттенки: JPG будет выглядеть так же, как исходный GIF.
- **Будет ли JPG меньше, чем GIF?** Для фотографий и картинок с плавными переходами — обычно да. Для схем, логотипов и рисунков с крупными однотонными областями GIF бывает компактнее; в строке каждого файла видно, как изменился размер.
- **Что делать, если нужна прозрачность?** В JPG прозрачных областей нет — они станут белыми. Чтобы сохранить прозрачность, выберите формат PNG или WebP.
- **Сохранятся ли цвета?** Да. Цвета палитры GIF переносятся как есть, а в JPG встраивается профиль sRGB, поэтому картинка выглядит одинаково во всех программах.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/gif-to-jpg`

Файл: `src/content/tools/en/gif-to-jpg.yaml`

- **title:** GIF to JPG Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert GIF images to JPG right in your browser. Free, no sign-up, and your files never leave your device. Convert many images at once. _(135 симв.)_
- **H1:** GIF to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** GIF to JPG
- **Карточка:** GIF → JPG — Turn a GIF into a regular image that's accepted everywhere.
- **JSON-LD:** GIF to JPG Converter — An online GIF to JPG converter that runs in your browser without uploading your images.

**How to convert GIF to JPG**

1. Click the box above or drag your GIF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency on white.** JPG has no transparency, so transparent areas of the GIF are placed on a white background instead of turning black.
- **MozJPEG encoding.** JPGs are created with Mozilla's MozJPEG encoder. You can adjust the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What happens to an animated GIF?** A JPG holds a single image, so the first frame of the animation is saved — the one you see before it starts playing. The file's row tells you about it.
- **Will the image look better?** No. A GIF has at most 256 colors, and converting can't bring back missing shades: the JPG looks just like the original GIF.
- **Will the JPG be smaller than the GIF?** For photos and images with smooth gradients, usually yes. Diagrams, logos and drawings with large flat areas are often more compact as GIF; each file's row shows how the size changed.
- **What if I need transparency?** JPG has no transparent areas — they turn white. To keep transparency, choose PNG or WebP.
- **Are the colors preserved?** Yes. The GIF's palette colors are copied as they are, and the JPG gets an sRGB profile, so the image looks the same in every app.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### gif-to-png

#### Русский — `/gif-v-png`

Файл: `src/content/tools/ru/gif-to-png.yaml`

- **title:** GIF в PNG онлайн — с прозрачностью, без загрузки на сервер _(58 симв.)_
- **description:** Конвертируйте картинки GIF в PNG прямо в браузере: прозрачность сохраняется, файлы не загружаются на сервер. Бесплатно и без регистрации. _(137 симв.)_
- **H1:** Конвертер GIF в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** GIF в PNG
- **Карточка:** GIF → PNG — Без потерь и с прозрачностью — для сайтов и редактирования.
- **JSON-LD:** Конвертер GIF в PNG — Онлайн-конвертер изображений GIF в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать GIF в PNG**

1. Нажмите на область выше или перетащите на неё GIF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Прозрачность сохраняется.** Прозрачные области GIF остаются прозрачными в PNG — картинку можно класть на любой фон.
- **Без потерь.** PNG хранит каждый пиксель точно, поэтому изображение не меняется ни на один оттенок.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что будет с анимированным GIF?** Сохранится первый кадр анимации — тот, что виден до начала проигрывания. Анимацию PNG-файл здесь не получит, в строке файла появится пояснение.
- **Сохранится ли прозрачность?** Да. Прозрачные пиксели GIF остаются прозрачными в PNG. Если GIF меньше своего холста, свободная часть холста тоже будет прозрачной — так же, как в браузере.
- **Изменится ли качество?** Нет. PNG хранит изображение без потерь, поэтому все пиксели останутся точно такими же, как в GIF.
- **Почему PNG бывает больше GIF?** GIF хранит не больше 256 цветов, а PNG здесь сохраняется полноцветным, поэтому файл иногда получается немного больше. Изображение при этом не меняется.
- **Зачем переводить GIF в PNG?** PNG понимают все редакторы и сайты, он удобен для дальнейшей обработки и не ограничен 256 цветами — правки не будут портиться дизерингом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/gif-to-png`

Файл: `src/content/tools/en/gif-to-png.yaml`

- **title:** GIF to PNG Converter — Keeps Transparency, No Upload _(52 симв.)_
- **description:** Convert GIF images to PNG right in your browser. Transparency is kept and your files never leave your device. Free, no sign-up. _(127 симв.)_
- **H1:** GIF to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** GIF to PNG
- **Карточка:** GIF → PNG — Lossless, with transparency — for websites and editing.
- **JSON-LD:** GIF to PNG Converter — An online GIF to PNG converter that runs in your browser without uploading your images.

**How to convert GIF to PNG**

1. Click the box above or drag your GIF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Transparency is kept.** Transparent areas of the GIF stay transparent in the PNG, so you can place the image on any background.
- **Lossless.** PNG stores every pixel exactly, so the image doesn't change by a single shade.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What happens to an animated GIF?** The first frame of the animation is saved — the one you see before it starts playing. The PNG won't be animated, and the file's row tells you about it.
- **Is transparency preserved?** Yes. Transparent GIF pixels stay transparent in the PNG. If the GIF is smaller than its canvas, the empty part of the canvas is transparent too — just like in a browser.
- **Will the quality change?** No. PNG is lossless, so every pixel stays exactly as it was in the GIF.
- **Why can the PNG be bigger than the GIF?** A GIF has at most 256 colors, while the PNG here is saved in full color, so the file is sometimes a bit larger. The image itself doesn't change.
- **Why convert GIF to PNG?** Every editor and website understands PNG, it's handy for further editing, and it isn't limited to 256 colors — so your edits won't get dithered.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### bmp-to-jpg

#### Русский — `/bmp-v-jpg`

Файл: `src/content/tools/ru/bmp-to-jpg.yaml`

- **title:** BMP в JPG онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте изображения BMP в JPG прямо в браузере: файл станет в разы легче. Бесплатно, без регистрации, файлы не загружаются на сервер. _(139 симв.)_
- **H1:** Конвертер BMP в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** BMP в JPG
- **Карточка:** BMP → JPG — Тяжёлый BMP — в лёгкий JPG для почты, сайтов и мессенджеров.
- **JSON-LD:** Конвертер BMP в JPG — Онлайн-конвертер изображений BMP в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать BMP в JPG**

1. Нажмите на область выше или перетащите на неё BMP-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Файл в разы легче.** BMP обычно хранит изображение без сжатия, а JPG сжимает его — для фотографий и скриншотов разница в размере обычно многократная.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое BMP?** BMP — старый формат изображений Windows. Обычно он хранит каждый пиксель без сжатия, поэтому файлы получаются большими, и многие сайты и мессенджеры их не принимают.
- **Насколько уменьшится файл?** Зависит от изображения, но обычно в разы: BMP обычно не сжат. Размер до и после виден в строке каждого файла.
- **Теряется ли качество?** JPG сжимает с потерями, поэтому изображение немного меняется. При качестве 90 (значение по умолчанию) разница на глаз обычно не видна. Если нужна точная копия, выберите PNG — он тоже заметно легче BMP.
- **Какие BMP поддерживаются?** Почти все, что встречаются на практике: 1, 4, 8, 16, 24 и 32 бита на пиксель, со сжатием RLE и без, включая файлы с прозрачностью и встроенным цветовым профилем.
- **Что будет с прозрачностью?** В JPG прозрачности нет, поэтому прозрачные области ложатся на белый фон. Чтобы сохранить прозрачность, выберите PNG или WebP.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/bmp-to-jpg`

Файл: `src/content/tools/en/bmp-to-jpg.yaml`

- **title:** BMP to JPG Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert BMP images to JPG right in your browser and make them many times lighter. Free, no sign-up, and your files never leave your device. _(139 симв.)_
- **H1:** BMP to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** BMP to JPG
- **Карточка:** BMP → JPG — Turn a bulky BMP into a light JPG for email, websites and chat.
- **JSON-LD:** BMP to JPG Converter — An online BMP to JPG converter that runs in your browser without uploading your images.

**How to convert BMP to JPG**

1. Click the box above or drag your BMP files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Much smaller files.** BMP usually stores images uncompressed, while JPG compresses them — for photos and screenshots the difference is usually several times.
- **MozJPEG encoding.** JPGs are created with Mozilla's MozJPEG encoder. You can adjust the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is a BMP file?** BMP is an old Windows image format. It usually stores every pixel uncompressed, so files are large, and many websites and messaging apps don't accept them.
- **How much smaller will the file get?** It depends on the image, but usually several times smaller, since BMP is usually uncompressed. Each file's row shows the size before and after.
- **Will I lose quality?** JPG compression is lossy, so the image changes slightly. At the default quality of 90 the difference is usually invisible. If you need an exact copy, choose PNG — it's also much lighter than BMP.
- **Which BMP files are supported?** Practically all you'll come across: 1, 4, 8, 16, 24 and 32 bits per pixel, with or without RLE compression, including files with transparency and an embedded color profile.
- **What happens to transparency?** JPG has no transparency, so transparent areas are placed on a white background. To keep transparency, choose PNG or WebP.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### bmp-to-png

#### Русский — `/bmp-v-png`

Файл: `src/content/tools/ru/bmp-to-png.yaml`

- **title:** BMP в PNG онлайн — без потерь, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте изображения BMP в PNG прямо в браузере: без потери качества и заметно легче. Бесплатно, без регистрации, файлы не загружаются на сервер. _(150 симв.)_
- **H1:** Конвертер BMP в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** BMP в PNG
- **Карточка:** BMP → PNG — Без потерь и легче — для скриншотов, схем и редактирования.
- **JSON-LD:** Конвертер BMP в PNG — Онлайн-конвертер изображений BMP в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать BMP в PNG**

1. Нажмите на область выше или перетащите на неё BMP-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Без потерь.** PNG хранит каждый пиксель точно, как BMP, но сжимает данные — изображение не меняется, а файл становится легче.
- **Прозрачность сохраняется.** Если в BMP есть альфа-канал, прозрачные области остаются прозрачными в PNG.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое BMP?** BMP — старый формат изображений Windows. Обычно он хранит каждый пиксель без сжатия, поэтому файлы получаются большими, и многие сайты и мессенджеры их не принимают.
- **Изменится ли изображение?** Нет. PNG сжимает без потерь: все пиксели останутся точно такими же, как в BMP.
- **Насколько уменьшится файл?** Скриншоты, схемы и рисунки с однотонными областями сжимаются в PNG очень сильно. Фотографии — заметно слабее; для них может быть удобнее JPG.
- **Какие BMP поддерживаются?** Почти все, что встречаются на практике: 1, 4, 8, 16, 24 и 32 бита на пиксель, со сжатием RLE и без, включая файлы с прозрачностью и встроенным цветовым профилем.
- **Сохранятся ли цвета?** Да. Если в BMP встроен цветовой профиль, он переносится в PNG; если нет — используется sRGB, как и в самом BMP.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/bmp-to-png`

Файл: `src/content/tools/en/bmp-to-png.yaml`

- **title:** BMP to PNG Converter — Lossless, Private, No Upload _(51 симв.)_
- **description:** Convert BMP images to PNG right in your browser: no quality loss and much smaller files. Free, no sign-up, and your files never leave your device. _(146 симв.)_
- **H1:** BMP to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** BMP to PNG
- **Карточка:** BMP → PNG — Lossless and lighter — for screenshots, diagrams and editing.
- **JSON-LD:** BMP to PNG Converter — An online BMP to PNG converter that runs in your browser without uploading your images.

**How to convert BMP to PNG**

1. Click the box above or drag your BMP files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Lossless.** PNG keeps every pixel exactly like BMP but compresses the data, so the image stays the same while the file gets lighter.
- **Transparency is kept.** If the BMP has an alpha channel, transparent areas stay transparent in the PNG.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is a BMP file?** BMP is an old Windows image format. It usually stores every pixel uncompressed, so files are large, and many websites and messaging apps don't accept them.
- **Will the image change?** No. PNG compression is lossless: every pixel stays exactly as it was in the BMP.
- **How much smaller will the file get?** Screenshots, diagrams and drawings with flat areas compress very well as PNG. Photos compress much less; JPG may suit them better.
- **Which BMP files are supported?** Practically all you'll come across: 1, 4, 8, 16, 24 and 32 bits per pixel, with or without RLE compression, including files with transparency and an embedded color profile.
- **Are the colors preserved?** Yes. If the BMP has an embedded color profile, it's copied into the PNG; otherwise sRGB is used, just like in the BMP itself.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### tiff-to-jpg

#### Русский — `/tiff-v-jpg`

Файл: `src/content/tools/ru/tiff-to-jpg.yaml`

- **title:** TIFF в JPG онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте сканы и фото TIFF в JPG прямо в браузере: файл станет в разы легче. Бесплатно, без регистрации, файлы не загружаются на сервер. _(141 симв.)_
- **H1:** Конвертер TIFF в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** TIFF в JPG
- **Карточка:** TIFF → JPG — Сканы и фото TIFF — в лёгкий JPG для почты и сайтов.
- **JSON-LD:** Конвертер TIFF в JPG — Онлайн-конвертер изображений TIFF в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать TIFF в JPG**

1. Нажмите на область выше или перетащите на неё TIFF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Сканы документов и фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Файл заметно легче.** TIFF обычно хранит изображение без сжатия или со сжатием без потерь, а JPG сжимает его — для фото и сканов файл становится в разы меньше.
- **Цвета и поворот сохраняются.** Встроенный цветовой профиль переносится в JPG, а снимок поворачивается так, как задано в файле.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое TIFF?** TIFF — формат для сканов, полиграфии и профессиональной фотографии. Он хранит изображение без потерь, поэтому файлы получаются большими, и многие сайты и мессенджеры их не принимают.
- **Что будет с многостраничным TIFF?** Сохранится первая страница, а в строке файла появится пояснение. Если нужны все страницы, разделите файл на отдельные изображения.
- **Какие TIFF поддерживаются?** Почти все обычные: без сжатия и со сжатием LZW, Deflate (ZIP), PackBits, JPEG и CCITT (факсы и чёрно-белые сканы), 1–16 бит на канал, с прозрачностью и без. Изображения в CMYK и RAW-снимки камер (DNG, CR2, NEF) пока не поддерживаются — в строке файла будет понятная ошибка.
- **Теряется ли качество?** JPG сжимает с потерями, поэтому изображение немного меняется. При качестве 90 (значение по умолчанию) разница на глаз обычно не видна. Если нужна точная копия, выберите PNG.
- **Что происходит с метаданными?** По умолчанию сохраняется только дата съёмки, а геолокация, модель камеры и другие сведения удаляются. Чтобы перенести их все, отметьте «Сохранить все метаданные». Цветовой профиль переносится всегда.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/tiff-to-jpg`

Файл: `src/content/tools/en/tiff-to-jpg.yaml`

- **title:** TIFF to JPG Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert TIFF scans and photos to JPG right in your browser and make them many times lighter. Free, no sign-up, and your files never leave your device. _(150 симв.)_
- **H1:** TIFF to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** TIFF to JPG
- **Карточка:** TIFF → JPG — TIFF scans and photos as light JPGs for email and the web.
- **JSON-LD:** TIFF to JPG Converter — An online TIFF to JPG converter that runs in your browser without uploading your images.

**How to convert TIFF to JPG**

1. Click the box above or drag your TIFF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Scanned documents and photos are never uploaded to a server, so nobody else ever sees them.
- **Much smaller files.** TIFF usually stores images uncompressed or with lossless compression, while JPG compresses them — scans and photos get several times smaller.
- **Colors and rotation are kept.** An embedded color profile is copied into the JPG, and the image is rotated as specified in the file.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is a TIFF file?** TIFF is a format for scans, printing and professional photography. It stores images losslessly, so files are large, and many websites and messaging apps don't accept them.
- **What happens to a multi-page TIFF?** The first page is saved and the file's row tells you about it. If you need every page, split the file into separate images first.
- **Which TIFF files are supported?** Practically all common ones: uncompressed, LZW, Deflate (ZIP), PackBits, JPEG and CCITT (fax and black-and-white scans), 1–16 bits per channel, with or without transparency. CMYK images and camera RAW files (DNG, CR2, NEF) aren't supported yet — the file's row shows a clear message.
- **Will I lose quality?** JPG compression is lossy, so the image changes slightly. At the default quality of 90 the difference is usually invisible. If you need an exact copy, choose PNG.
- **What happens to the metadata?** By default only the capture date is kept, while the location, camera model and other details are removed. Tick “Keep all metadata” to copy everything. The color profile is always kept.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### tiff-to-png

#### Русский — `/tiff-v-png`

Файл: `src/content/tools/ru/tiff-to-png.yaml`

- **title:** TIFF в PNG онлайн — без потерь, без загрузки на сервер _(54 симв.)_
- **description:** Конвертируйте изображения TIFF в PNG прямо в браузере: без потери качества, с прозрачностью. Бесплатно, без регистрации, файлы не загружаются на сервер. _(152 симв.)_
- **H1:** Конвертер TIFF в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** TIFF в PNG
- **Карточка:** TIFF → PNG — Без потерь и с прозрачностью — формат, который открывается везде.
- **JSON-LD:** Конвертер TIFF в PNG — Онлайн-конвертер изображений TIFF в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать TIFF в PNG**

1. Нажмите на область выше или перетащите на неё TIFF-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Сканы документов и фотографии не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Без потерь.** PNG хранит каждый пиксель точно, поэтому изображение не меняется. 16-битные TIFF сохраняются с 8 битами на канал.
- **Прозрачность сохраняется.** Если в TIFF есть альфа-канал, прозрачные области остаются прозрачными в PNG.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое TIFF?** TIFF — формат для сканов, полиграфии и профессиональной фотографии. Его понимают не все программы и сайты, а PNG открывается везде.
- **Изменится ли изображение?** Пиксели переносятся без потерь. Единственное отличие — у 16-битных TIFF на выходе 8 бит на канал: на экране разницы не видно, но для глубокой цветокоррекции лучше оставить исходник.
- **Что будет с многостраничным TIFF?** Сохранится первая страница, а в строке файла появится пояснение. Если нужны все страницы, разделите файл на отдельные изображения.
- **Какие TIFF поддерживаются?** Почти все обычные: без сжатия и со сжатием LZW, Deflate (ZIP), PackBits, JPEG и CCITT (факсы и чёрно-белые сканы), 1–16 бит на канал, с прозрачностью и без. Изображения в CMYK и RAW-снимки камер (DNG, CR2, NEF) пока не поддерживаются.
- **Сохранятся ли цвета?** Да. Встроенный цветовой профиль переносится в PNG; если профиля нет, используется sRGB.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/tiff-to-png`

Файл: `src/content/tools/en/tiff-to-png.yaml`

- **title:** TIFF to PNG Converter — Lossless, Private, No Upload _(52 симв.)_
- **description:** Convert TIFF images to PNG right in your browser: lossless, with transparency. Free, no sign-up, and your files never leave your device. _(136 симв.)_
- **H1:** TIFF to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** TIFF to PNG
- **Карточка:** TIFF → PNG — Lossless, with transparency — a format that opens everywhere.
- **JSON-LD:** TIFF to PNG Converter — An online TIFF to PNG converter that runs in your browser without uploading your images.

**How to convert TIFF to PNG**

1. Click the box above or drag your TIFF files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Scanned documents and photos are never uploaded to a server, so nobody else ever sees them.
- **Lossless.** PNG keeps every pixel exactly, so the image doesn't change. 16-bit TIFFs are saved with 8 bits per channel.
- **Transparency is kept.** If the TIFF has an alpha channel, transparent areas stay transparent in the PNG.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is a TIFF file?** TIFF is a format for scans, printing and professional photography. Not every app or website understands it, while PNG opens everywhere.
- **Will the image change?** Pixels are copied losslessly. The only difference is that 16-bit TIFFs come out with 8 bits per channel: you won't see it on screen, but keep the original for heavy color grading.
- **What happens to a multi-page TIFF?** The first page is saved and the file's row tells you about it. If you need every page, split the file into separate images first.
- **Which TIFF files are supported?** Practically all common ones: uncompressed, LZW, Deflate (ZIP), PackBits, JPEG and CCITT (fax and black-and-white scans), 1–16 bits per channel, with or without transparency. CMYK images and camera RAW files (DNG, CR2, NEF) aren't supported yet.
- **Are the colors preserved?** Yes. An embedded color profile is copied into the PNG; without one, sRGB is used.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### jxl-to-jpg

#### Русский — `/jxl-v-jpg`

Файл: `src/content/tools/ru/jxl-to-jpg.yaml`

- **title:** JPEG XL в JPG онлайн — бесплатно, без загрузки на сервер _(56 симв.)_
- **description:** Конвертируйте изображения JPEG XL (.jxl) в JPG прямо в браузере, чтобы открыть их где угодно. Бесплатно, без регистрации, файлы не загружаются на сервер. _(153 симв.)_
- **H1:** Конвертер JPEG XL в JPG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPEG XL в JPG
- **Карточка:** JPEG XL → JPG — Новый формат .jxl — в JPG, который открывается везде.
- **JSON-LD:** Конвертер JPEG XL в JPG — Онлайн-конвертер изображений JPEG XL в JPG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JPEG XL в JPG**

1. Нажмите на область выше или перетащите на неё файлы .jxl — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JPG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Цвета и поворот сохраняются.** Цветовой профиль переносится в JPG, а снимок поворачивается так, как задано в файле JPEG XL.
- **Сжатие MozJPEG.** JPG создаётся кодировщиком MozJPEG от Mozilla. Качество настраивается ползунком.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое JPEG XL?** JPEG XL (.jxl) — новый формат изображений: он сжимает лучше JPG и умеет хранить снимки без потерь. Но открывают его пока не все программы и браузеры, поэтому для пересылки и публикации удобнее JPG.
- **Почему JPG получается больше, чем JXL?** JPEG XL сжимает эффективнее, поэтому тот же снимок в JPG при сопоставимом качестве весит больше. Это нормально; если нужен файл поменьше, уменьшите качество ползунком.
- **Что будет с анимацией?** JPG хранит одно изображение, поэтому из анимированного JXL сохранится первый кадр, а в строке файла появится пояснение.
- **Что происходит с метаданными?** По умолчанию сохраняется дата съёмки, а геолокация и сведения о камере удаляются; галочка «Сохранить все метаданные» переносит всё. Метаданные, сжатые внутри JXL (так по умолчанию делает cjxl), пока не читаются — тогда в JPG их не будет. Цветовой профиль переносится всегда.
- **Что делать с прозрачностью?** В JPG прозрачности нет, поэтому прозрачные области ложатся на белый фон. Чтобы сохранить прозрачность, выберите PNG или WebP.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jxl-to-jpg`

Файл: `src/content/tools/en/jxl-to-jpg.yaml`

- **title:** JPEG XL to JPG Converter — Free, Private, No Upload _(51 симв.)_
- **description:** Convert JPEG XL (.jxl) images to JPG right in your browser so they open anywhere. Free, no sign-up, and your files never leave your device. _(139 симв.)_
- **H1:** JPEG XL to JPG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JPEG XL to JPG
- **Карточка:** JPEG XL → JPG — The new .jxl format as a JPG that opens everywhere.
- **JSON-LD:** JPEG XL to JPG Converter — An online JPEG XL to JPG converter that runs in your browser without uploading your images.

**How to convert JPEG XL to JPG**

1. Click the box above or drag your .jxl files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JPG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Colors and rotation are kept.** The color profile is copied into the JPG, and the image is rotated as specified in the JPEG XL file.
- **MozJPEG encoding.** JPGs are created with Mozilla's MozJPEG encoder. You can adjust the quality with the slider.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is JPEG XL?** JPEG XL (.jxl) is a new image format: it compresses better than JPG and can store images losslessly. Not every app or browser opens it yet, so JPG is handier for sharing and publishing.
- **Why is the JPG bigger than the JXL?** JPEG XL compresses more efficiently, so the same image at similar quality takes more space as a JPG. That's expected; lower the quality slider if you need a smaller file.
- **What happens to an animation?** A JPG holds a single image, so the first frame of an animated JXL is saved and the file's row tells you about it.
- **What happens to the metadata?** By default the capture date is kept, while the location and camera details are removed; tick “Keep all metadata” to copy everything. Metadata compressed inside the JXL (what cjxl does by default) can't be read yet, so it won't appear in the JPG. The color profile is always kept.
- **What about transparency?** JPG has no transparency, so transparent areas are placed on a white background. To keep transparency, choose PNG or WebP.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

### jxl-to-png

#### Русский — `/jxl-v-png`

Файл: `src/content/tools/ru/jxl-to-png.yaml`

- **title:** JPEG XL в PNG онлайн — без потерь, без загрузки на сервер _(57 симв.)_
- **description:** Конвертируйте изображения JPEG XL (.jxl) в PNG прямо в браузере: без потерь и с прозрачностью. Бесплатно, без регистрации, файлы не загружаются на сервер. _(154 симв.)_
- **H1:** Конвертер JPEG XL в PNG
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JPEG XL в PNG
- **Карточка:** JPEG XL → PNG — Без потерь и с прозрачностью — формат, который открывается везде.
- **JSON-LD:** Конвертер JPEG XL в PNG — Онлайн-конвертер изображений JPEG XL в PNG, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JPEG XL в PNG**

1. Нажмите на область выше или перетащите на неё файлы .jxl — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PNG по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Изображения не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Без потерь.** PNG хранит каждый пиксель точно, поэтому изображение не теряет качества при конвертации.
- **Прозрачность сохраняется.** Прозрачные области JPEG XL остаются прозрачными в PNG.
- **Сразу много файлов.** Добавьте до 100 изображений за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое JPEG XL?** JPEG XL (.jxl) — новый формат изображений: он сжимает лучше JPG и PNG и умеет хранить снимки без потерь. Но открывают его пока не все программы и сайты, а PNG понимают везде.
- **Почему PNG намного больше, чем JXL?** JPEG XL сжимает гораздо эффективнее, а PNG хранит фотографию без потерь, поэтому файл может стать в разы больше. Если важен размер, выберите JPG или WebP.
- **Изменится ли изображение?** Пиксели переносятся без потерь. Если JXL хранит больше 8 бит на канал, PNG сохранится с 8 битами: на экране разницы не видно.
- **Что будет с анимацией?** Сохранится первый кадр анимированного JXL, а в строке файла появится пояснение.
- **Сохранятся ли цвета?** Да. Цветовой профиль изображения переносится в PNG, поэтому цвета не тускнеют.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а изображения обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/jxl-to-png`

Файл: `src/content/tools/en/jxl-to-png.yaml`

- **title:** JPEG XL to PNG Converter — Lossless, Private, No Upload _(55 симв.)_
- **description:** Convert JPEG XL (.jxl) images to PNG right in your browser: lossless, with transparency. Free, no sign-up, and your files never leave your device. _(146 симв.)_
- **H1:** JPEG XL to PNG Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JPEG XL to PNG
- **Карточка:** JPEG XL → PNG — Lossless, with transparency — a format that opens everywhere.
- **JSON-LD:** JPEG XL to PNG Converter — An online JPEG XL to PNG converter that runs in your browser without uploading your images.

**How to convert JPEG XL to PNG**

1. Click the box above or drag your .jxl files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PNG separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Everything runs on your device. Images are never uploaded to a server, so nobody else ever sees them.
- **Lossless.** PNG keeps every pixel exactly, so the image loses no quality in conversion.
- **Transparency is kept.** Transparent areas of the JPEG XL stay transparent in the PNG.
- **Batch conversion.** Convert up to 100 images at a time and download them as a single ZIP file.

**Frequently asked questions**

- **What is JPEG XL?** JPEG XL (.jxl) is a new image format: it compresses better than JPG and PNG and can store images losslessly. Not every app or website opens it yet, while PNG works everywhere.
- **Why is the PNG so much bigger than the JXL?** JPEG XL compresses far more efficiently, while PNG stores photos losslessly, so the file can get several times larger. If size matters, choose JPG or WebP.
- **Will the image change?** Pixels are copied losslessly. If the JXL stores more than 8 bits per channel, the PNG is saved with 8 bits: you won't see the difference on screen.
- **What happens to an animation?** The first frame of an animated JXL is saved and the file's row tells you about it.
- **Are the colors preserved?** Yes. The image's color profile is copied into the PNG, so colors don't look washed out.
- **Is it safe to convert my images here?** Yes. The site only downloads the converter itself; your images are processed in your browser and are never sent to a server.

## Другие страницы

### Главная

#### Русский

Файл: `src/content/pages/ru/home.yaml`

- **title:** Конвертер изображений онлайн — HEIC, AVIF, JPG, PNG и WebP в браузере _(69 симв.)_
- **description:** Бесплатные онлайн-конвертеры изображений: HEIC, AVIF, JPG, PNG и WebP. Без регистрации и без загрузки на сервер — всё работает в вашем браузере. _(144 симв.)_
- **h1:** Конвертер изображений прямо в браузере
- **intro:** Переводите фото и картинки между форматами HEIC, AVIF, JPG, PNG и WebP и сжимайте их до нужного размера. Всё происходит на вашем устройстве: файлы не загружаются на сервер, а дата съёмки сохраняется.
- **editToolsTitle:** Сжатие и размер
- **toolsTitle:** Конвертеры
- **features:**
  - **Без загрузки на сервер.** Изображения обрабатываются в браузере и не покидают ваше устройство.
  - **Без регистрации.** Откройте нужный конвертер и сразу выберите файлы.
  - **Бесплатно.** Конвертируйте столько файлов, сколько нужно.

#### English

Файл: `src/content/pages/en/home.yaml`

- **title:** Free Online Image Converter — HEIC, AVIF, JPG, PNG and WebP _(59 симв.)_
- **description:** Free online image converters for HEIC, AVIF, JPG, PNG and WebP. No sign-up and no uploads — everything runs in your browser. _(124 симв.)_
- **h1:** Convert images right in your browser
- **intro:** Convert photos and pictures between HEIC, AVIF, JPG, PNG and WebP, and compress them to the size you need. Everything happens on your device: files are never uploaded, and the date taken is kept.
- **editToolsTitle:** Compress and resize
- **toolsTitle:** Converters
- **features:**
  - **No uploads.** Images are processed in your browser and never leave your device.
  - **No sign-up.** Open a converter and pick your files — that's it.
  - **Free.** Convert as many files as you need.

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
- **patents:** Формат HEVC (H.265), на котором основан HEIC, может быть защищён патентами. Для WebP и AV1 (AVIF) авторы кодеков дают бесплатную патентную лицензию — её тексты приведены ниже.
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
- **patents:** The HEVC (H.265) format that HEIC is based on may be covered by patents. For WebP and AV1 (AVIF), the codec authors grant a royalty-free patent license — its texts are included below.
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
| `widget.dropTitleAny` | Перетащите изображения сюда | Drop images here |
| `widget.originalFormat` | Исходный | Original |
| `widget.icoHint` | В иконку войдут размеры от 16 до 256 пикселей (не больше исходника); прямоугольная картинка впишется в квадрат с прозрачными полями. Метаданные в ICO не сохраняются. | The icon gets sizes from 16 to 256 pixels (no larger than the original); a non-square image is fitted into a square with transparent margins. ICO keeps no metadata. |
| `widget.originalHint` | Формат файла сохраняется; HEIC, AVIF, JPEG XL и TIFF сохраняются в JPG, GIF и BMP — в PNG. | The file keeps its format; HEIC, AVIF, JPEG XL and TIFF are saved as JPG, GIF and BMP as PNG. |
| `widget.compression` | Сжатие | Compression |
| `widget.byQuality` | По качеству | By quality |
| `widget.byTarget` | До размера | To file size |
| `widget.targetSize` | Не больше | At most |
| `widget.targetUnit` | Единица размера | Size unit |
| `widget.targetHint` | Качество подберётся само: файл вместе с метаданными не превысит этот размер. | Quality is picked automatically so the file, metadata included, stays within this size. |
| `widget.pngCompressWarning` | PNG сжимается только без потерь, поэтому файл уменьшится ненамного. Чтобы файл стал заметно меньше, выберите JPG или WebP. | PNG is compressed losslessly only, so the file won't shrink much. For a much smaller file, choose JPG or WebP. |
| `widget.progressProcess` | Обрабатываем: готово {done} из {total}… | Processing: {done} of {total} done… |
| `widget.processing` | Обрабатывается… | Processing… |
| `widget.reprocess` | Обработать заново с новыми настройками | Process again with the new settings |
| `widget.qualityUsed` | качество {quality} | quality {quality} |
| `widget.resize` | Размер | Size |
| `widget.resizeLongSide` | По длинной стороне | Longest side |
| `widget.resizePercent` | В процентах | Percentage |
| `widget.resizeBox` | Ширина и высота | Width and height |
| `widget.resizeHint` | Изображения только уменьшаются: те, что уже меньше, сохранят свой размер. | Images are only made smaller: ones that are already smaller keep their size. |
| `widget.longSide` | Сторона | Side |
| `widget.presets` | Готовые размеры | Preset sizes |
| `widget.pixels` | пикс. | px |
| `widget.scale` | Масштаб | Scale |
| `widget.width` | Ширина | Width |
| `widget.height` | Высота | Height |
| `widget.keepAspect` | Сохранять пропорции | Keep aspect ratio |
| `widget.boxHint` | С пропорциями изображение впишется в эти размеры, без них — растянется точно до них. Одну сторону можно оставить пустой. | With the aspect ratio kept, the image fits within these dimensions; without it, it is stretched to exactly them. You can leave one side empty. |
| `widget.dimensions` | {width}×{height} | {width}×{height} |
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
| `widget.progress` | Конвертируем: готово {done} из {total}… | Converting: {done} of {total} done… |
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
| `widget.errors.already-jpeg` | Файл уже в формате JPG — выберите другой формат выше. | This file is already a JPG — pick another format above. |
| `widget.errors.already-png` | Файл уже в формате PNG — выберите другой формат выше. | This file is already a PNG — pick another format above. |
| `widget.errors.already-webp` | Файл уже в формате WebP — выберите другой формат выше. | This file is already a WebP — pick another format above. |
| `widget.errors.already-avif` | Файл уже в формате AVIF — выберите другой формат выше. | This file is already an AVIF — pick another format above. |
| `widget.errors.too-large-for-webp` | WebP вмещает изображения не больше 16 383 точек по стороне — выберите JPG или PNG. | WebP can't store images larger than 16,383 px per side — choose JPG or PNG. |
| `widget.errors.unsupported-image` | Этот формат изображений пока не поддерживается. Поддерживаются {formats}. | This image format isn't supported yet. Supported: {formats}. |
| `widget.errors.cmyk-unsupported` | Изображения в цветовой модели CMYK (для печати) пока не поддерживаются. | CMYK images (used for print) aren't supported yet. |
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
| `widget.warnings.first-page-only` | Многостраничный файл — сохранена первая страница. | Multi-page file — the first page was saved. |
| `widget.warnings.target-not-reached` | Даже с минимальным качеством файл больше заданного размера — сохранён самый маленький вариант. Уменьшите изображение в пикселях. | Even at the lowest quality the file is larger than the limit — the smallest version was saved. Try reducing the image's dimensions. |
| `widget.warnings.target-lossless` | У PNG и WebP без потерь нет настройки качества, поэтому подобрать размер нельзя. Выберите JPG или WebP. | PNG and lossless WebP have no quality setting, so the size can't be matched. Choose JPG or WebP. |
| `widget.warnings.not-smaller` | Файл не стал меньше: исходник уже хорошо сжат. | The file didn't get smaller: the original is already well compressed. |
| `widget.warnings.not-resized` | Изображение уже не больше заданного размера — размер не изменён. | The image is already no larger than the requested size — its size was kept. |
| `notFound.title` | Страница не найдена | Page not found |
| `notFound.text` | Такой страницы нет. Возможно, адрес изменился или в нём опечатка. | This page does not exist. The address may have changed or contain a typo. |
| `notFound.toHome` | На главную | Go to the home page |
