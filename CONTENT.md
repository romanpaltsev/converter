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

### remove-metadata

#### Русский — `/udalit-metadannye-foto`

Файл: `src/content/tools/ru/remove-metadata.yaml`

- **title:** Удалить метаданные с фото онлайн — EXIF и геолокация _(52 симв.)_
- **description:** Удалите EXIF, геолокацию, модель телефона и другие метаданные из фото JPG, PNG, HEIC и WebP прямо в браузере — без перекодирования и загрузки на сервер. _(152 симв.)_
- **H1:** Удалить метаданные с фото
- **Подзаголовок:** EXIF, геолокация и данные камеры — без перекодирования. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Удалить метаданные
- **Карточка:** Удалить метаданные — Убрать из фото геолокацию, модель телефона и другие данные EXIF.
- **JSON-LD:** Удаление метаданных из фото — Онлайн-сервис для удаления EXIF, геолокации и других метаданных из фотографий, который работает в браузере без загрузки файлов на сервер.

**Как удалить метаданные**

1. Выберите, что удалить: все метаданные, всё, кроме даты съёмки, или только геолокацию.
2. Нажмите на область выше или перетащите на неё фото — можно сразу несколько. В строке каждого файла видно, что именно было удалено.
3. Скачайте файлы по одному или все сразу ZIP-архивом. Формат и качество снимков не меняются.

**Почему здесь**

- **Фото не загружаются на сервер.** Метаданные удаляются прямо на вашем устройстве. Никто, кроме вас, не увидит ни снимков, ни того, что в них было записано.
- **Без потери качества.** Изображение не перекодируется: удаляются только служебные данные, а пиксели остаются байт в байт. Поэтому размер файла почти не меняется.
- **Видно, что было удалено.** Для каждого файла показано, что нашлось: геолокация, модель камеры, дата, XMP, встроенная миниатюра или дополнительные изображения.
- **Все популярные форматы.** JPG, PNG, HEIC с iPhone, WebP, AVIF, GIF, TIFF и JPEG XL — до 100 файлов за раз.

**Частые вопросы**

- **Какие метаданные хранятся в фото?** Телефоны и камеры записывают в файл дату и время съёмки, модель устройства и объектива, параметры съёмки, а при включённой геолокации — координаты места. Программы добавляют свои данные: XMP с историей правок, IPTC с подписями и авторством, иногда — встроенную миниатюру.
- **Как удалить геолокацию с фото?** Выберите «Только геолокацию» и добавьте фото. Координаты будут удалены, а дата съёмки и модель камеры останутся. Блоки XMP и IPTC удаляются целиком: в них тоже бывает место съёмки.
- **Можно ли сохранить дату съёмки?** Да, выберите «Всё, кроме даты». Останутся дата и время съёмки — по ним галерея расставит снимки по порядку, — а всё остальное будет удалено.
- **Ухудшится ли качество фото?** Нет. Изображение не пересжимается: из файла убираются только служебные блоки, а сами пиксели не меняются. Поэтому и размер файла уменьшается совсем немного.
- **Почему ориентация и цвета остались прежними?** Мы специально оставляем ориентацию и цветовой профиль. Без ориентации вертикальный снимок показался бы на боку, а без профиля цвета фото с iPhone стали бы тусклее. Личных данных в них нет.
- **Что будет с HEIC и «живыми фото»?** HEIC с iPhone остаётся в формате HEIC: блоки EXIF и XMP внутри файла затираются на месте, поэтому размер файла не меняется. Видео «живых фото» с Android и дополнительные изображения внутри JPEG (карта HDR, глубина) удаляются: в них бывают свои метаданные.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а фото обрабатываются в вашем браузере и не отправляются на сервер.
- **Как проверить, что метаданных не осталось?** В строке каждого файла видно, что было удалено, а если удалять было нечего — «Метаданных не найдено». Проверить результат можно в свойствах файла или в любом просмотрщике EXIF.

#### English — `/en/remove-exif`

Файл: `src/content/tools/en/remove-metadata.yaml`

- **title:** Remove EXIF Data from Photos Online — Location and Metadata _(59 симв.)_
- **description:** Strip EXIF, GPS location, camera model and other metadata from JPG, PNG, HEIC and WebP photos right in your browser — no re-encoding, no uploads. _(145 симв.)_
- **H1:** Remove EXIF data from photos
- **Подзаголовок:** Location, camera details and other metadata — without re-encoding. Your files never leave your device.
- **Хлебные крошки:** Remove EXIF data
- **Карточка:** Remove EXIF data — Strip the location, camera model and other metadata from photos.
- **JSON-LD:** EXIF Remover — An online tool that removes EXIF, GPS location and other metadata from photos right in your browser, without uploading them.

**How to remove metadata from a photo**

1. Choose what to remove: all metadata, everything but the capture date, or just the location.
2. Click the box above or drop your photos onto it — several at once is fine. Each file shows exactly what was removed.
3. Download the files one by one or all at once as a ZIP. The format and image quality stay the same.

**Why use this EXIF remover**

- **Your photos stay on your device.** Metadata is removed right in your browser. Nobody but you sees the photos or what was stored in them.
- **No quality loss.** The image isn't re-encoded: only the metadata blocks are dropped and the pixels stay byte for byte. That's why the file size barely changes.
- **See what was removed.** Every file shows what was found: GPS location, camera model, date, XMP, an embedded thumbnail or extra images.
- **All popular formats.** JPG, PNG, iPhone HEIC, WebP, AVIF, GIF, TIFF and JPEG XL — up to 100 files at a time.

**FAQ**

- **What metadata is stored in a photo?** Phones and cameras record the capture date and time, the device and lens model, shooting settings and — if location is on — the GPS coordinates. Editing apps add their own: XMP with edit history, IPTC with captions and credits, sometimes an embedded thumbnail.
- **How do I remove the location from a photo?** Choose “Location only” and add your photos. The GPS coordinates are removed while the capture date and camera model stay. XMP and IPTC blocks are removed entirely, since they can hold the location too.
- **Can I keep the date the photo was taken?** Yes — choose “All but the date”. The capture date and time stay, so galleries keep your photos in order, and everything else is removed.
- **Does removing EXIF data reduce image quality?** No. The image isn't recompressed: only metadata blocks are taken out and the pixels don't change. That's also why the file gets only slightly smaller.
- **Why are the orientation and colors unchanged?** We deliberately keep the orientation and the color profile. Without the orientation a portrait shot would show up sideways, and without the profile iPhone photos would look duller. Neither holds personal data.
- **What happens to HEIC files and motion photos?** iPhone HEIC stays HEIC: the EXIF and XMP blocks inside are wiped in place, so the file size doesn't change. Android motion photo videos and extra images inside a JPEG (HDR gain map, depth) are removed, since they carry metadata of their own.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; your photos are processed in your browser and never sent to a server.
- **How can I check that no metadata is left?** Each file shows what was removed, or “No metadata found” if there was nothing to remove. You can double-check in the file's properties or any EXIF viewer.

### exif-viewer

#### Русский — `/posmotret-exif`

Файл: `src/content/tools/ru/exif-viewer.yaml`

- **title:** Посмотреть EXIF онлайн — метаданные фото, дата и место съёмки _(61 симв.)_
- **description:** Узнайте, когда, где и на какую камеру сделано фото: EXIF, геолокация и другие метаданные JPG, HEIC, PNG и WebP — прямо в браузере, без загрузки на сервер. _(154 симв.)_
- **H1:** Посмотреть EXIF и метаданные фото
- **Подзаголовок:** Дата, камера, параметры съёмки и место — прямо в браузере. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Посмотреть EXIF
- **Карточка:** Посмотреть EXIF — Узнать дату, камеру и место съёмки по метаданным фото.
- **JSON-LD:** Просмотр EXIF онлайн — Онлайн-сервис для просмотра EXIF и других метаданных фотографий, который работает в браузере без загрузки файлов на сервер.

**Как посмотреть метаданные фото**

1. Нажмите на область выше или перетащите на неё фото — можно сразу несколько. Подойдут JPG, HEIC, PNG, WebP, AVIF, TIFF и другие форматы.
2. Для каждого файла появится карточка: когда и на что снято, параметры съёмки, место на карте и цветовой профиль. «Все теги EXIF» — полный список.
3. Если в фото есть лишнее, нажмите «Скачать без метаданных» — получите копию без EXIF, геолокации и XMP.

**Почему здесь**

- **Фото не загружаются на сервер.** Метаданные читаются прямо в браузере. Снимки и то, что в них записано, не видит никто, кроме вас.
- **Понятно, а не только теги.** Дата съёмки, камера, выдержка, диафрагма и ISO показаны по-человечески, а полный список тегов — под спойлером.
- **Место съёмки на карте.** Если в фото есть координаты, их можно открыть в Яндекс Картах или OpenStreetMap — только когда вы сами нажмёте на ссылку.
- **Сразу и удалить.** Нашли геолокацию или серийный номер — скачайте копию без метаданных в один клик. Изображение при этом не перекодируется.

**Частые вопросы**

- **Что такое EXIF?** EXIF — служебные данные, которые камера или телефон записывает в фото: дату и время съёмки, модель устройства, выдержку, диафрагму, ISO, фокусное расстояние, ориентацию, а при включённой геолокации — координаты места.
- **Как узнать, где сделано фото?** Добавьте фото: если в нём есть координаты, в карточке появится строка «Геолокация» со ссылками на карты. Если строки нет, координаты при съёмке не записывались или были удалены — например, мессенджером или соцсетью.
- **Как узнать дату съёмки фото?** Дата и время съёмки — в строке «Снято». Это время, записанное камерой: оно не зависит от даты создания или изменения файла на диске.
- **Почему у фото нет метаданных?** Многие мессенджеры и соцсети удаляют EXIF при отправке, а скриншоты и картинки из интернета часто не содержат его вовсе. Тогда вы увидите «Метаданных не найдено».
- **Можно ли посмотреть EXIF у HEIC с iPhone?** Да. HEIC, AVIF, JPG, PNG, WebP, TIFF и JPEG XL читаются прямо в браузере — даже в тех, которые сами не умеют показывать HEIC.
- **Что за «встроенная миниатюра»?** Некоторые камеры и программы сохраняют в EXIF маленькую копию снимка. Бывает, что после обрезки фото в ней остаётся исходный кадр целиком, — поэтому её стоит проверять перед публикацией.
- **Как удалить метаданные?** Нажмите «Скачать без метаданных» в карточке файла или откройте «Удалить метаданные», чтобы обработать сразу много фото и выбрать, что оставить, — например, дату съёмки.
- **Безопасно ли это?** Да. Файлы читаются в вашем браузере и не отправляются на сервер. Координаты передаются сайту карт, только если вы сами откроете ссылку.

#### English — `/en/exif-viewer`

Файл: `src/content/tools/en/exif-viewer.yaml`

- **title:** EXIF Viewer Online — See Photo Metadata, Date and Location _(58 симв.)_
- **description:** Find out when, where and with which camera a photo was taken: view EXIF, GPS location and other metadata of JPG, HEIC, PNG and WebP files right in your browser. _(160 симв.)_
- **H1:** EXIF viewer
- **Подзаголовок:** Date, camera, settings and location — right in your browser. Your files never leave your device.
- **Хлебные крошки:** EXIF viewer
- **Карточка:** EXIF viewer — See the date, camera and location stored in a photo's metadata.
- **JSON-LD:** EXIF Viewer — An online EXIF viewer that reads photo metadata right in your browser, without uploading the files.

**How to view photo metadata**

1. Click the box above or drop your photos onto it — several at once is fine. JPG, HEIC, PNG, WebP, AVIF, TIFF and more are supported.
2. Each file gets a card: when and with what it was taken, exposure settings, the location on a map and the color profile. “All EXIF tags” shows the complete list.
3. If a photo reveals too much, click “Download without metadata” to get a copy without EXIF, location and XMP.

**Why use this EXIF viewer**

- **Photos stay on your device.** Metadata is read right in your browser. Nobody but you sees the photos or what's stored in them.
- **Readable, not just raw tags.** Date, camera, shutter speed, aperture and ISO are shown in plain words, with the full tag list one click away.
- **Location on a map.** If a photo has GPS coordinates, open them in Google Maps or OpenStreetMap — only when you click the link yourself.
- **Remove it right away.** Spotted a location or a serial number? Download a copy without metadata in one click; the image itself isn't re-encoded.

**FAQ**

- **What is EXIF data?** EXIF is information a camera or phone writes into a photo: the date and time, device model, shutter speed, aperture, ISO, focal length, orientation and — if location is on — the GPS coordinates.
- **How can I find out where a photo was taken?** Add the photo: if it has coordinates, its card shows a “Location” line with map links. If there's no such line, the location wasn't recorded or was removed — messaging apps and social networks often do that.
- **How do I find the date a photo was taken?** The capture date and time are in the “Taken” line. That's the time recorded by the camera, independent of when the file was created or modified on disk.
- **Why does my photo have no metadata?** Many messaging apps and social networks strip EXIF when sending, and screenshots or images from the web often have none at all. In that case you'll see “No metadata found”.
- **Can I view the EXIF of iPhone HEIC photos?** Yes. HEIC, AVIF, JPG, PNG, WebP, TIFF and JPEG XL are read right in your browser — even in browsers that can't display HEIC themselves.
- **What is the “embedded thumbnail”?** Some cameras and apps store a small copy of the photo inside EXIF. After cropping, it can still show the original uncropped frame, so it's worth checking before you share.
- **How do I remove the metadata?** Click “Download without metadata” on the file's card, or open “Remove EXIF data” to process many photos at once and choose what to keep, such as the capture date.
- **Is it safe?** Yes. Files are read in your browser and never sent to a server. Coordinates go to a map website only if you open a map link yourself.

### jpg-to-pdf

#### Русский — `/jpg-v-pdf`

Файл: `src/content/tools/ru/jpg-to-pdf.yaml`

- **title:** JPG в PDF онлайн — объединить фото в один PDF _(45 симв.)_
- **description:** Сделайте PDF из JPG прямо в браузере: несколько фото в один документ, страницы A4, Letter или по размеру фото. Без перекодирования и загрузки на сервер. _(152 симв.)_
- **H1:** JPG в PDF
- **Подзаголовок:** Несколько фото — в один PDF, в нужном порядке. Бесплатно, файлы не покидают ваше устройство.
- **Хлебные крошки:** JPG в PDF
- **Карточка:** JPG в PDF — Собрать фото и сканы в один PDF-документ.
- **JSON-LD:** Конвертер JPG в PDF — Онлайн-сервис, который собирает JPG-изображения в PDF прямо в браузере, без загрузки файлов на сервер.

**Как сделать PDF из JPG**

1. Нажмите на область выше или перетащите на неё JPG — можно сразу много: каждая картинка станет страницей.
2. Расставьте страницы кнопками со стрелками и выберите размер: A4, Letter или по размеру фото, с полями или без.
3. Нажмите «Скачать PDF» — документ соберётся прямо в браузере.

**Почему здесь**

- **Без потери качества.** JPG попадают в PDF как есть, без повторного сжатия: качество фото и сканов не страдает, а документ получается не больше исходных файлов.
- **Файлы остаются у вас.** PDF собирается на вашем устройстве. Сканы паспорта, договоры и личные фото не загружаются на сервер.
- **Порядок и размер страниц.** Переставьте страницы, выберите A4 или Letter — альбомные снимки лягут на альбомный лист автоматически.
- **Без лишних данных.** Геолокация, модель телефона и другие метаданные фото в PDF не попадают — только сами изображения.

**Частые вопросы**

- **Как объединить несколько JPG в один PDF?** Добавьте все фото сразу или по очереди — каждое станет отдельной страницей. Порядок меняется кнопками со стрелками в строке файла, лишнее убирается крестиком. Затем нажмите «Скачать PDF».
- **Ухудшится ли качество фото?** Нет. JPG вставляются в PDF без перекодирования — это те же данные, что и в исходном файле. Поэтому и размер PDF примерно равен сумме размеров фото.
- **Какой размер страницы выбрать?** Для печати и отправки документов — A4 (в США — Letter): картинка впишется в лист с сохранением пропорций. «По размеру фото» сделает страницу ровно под изображение — без белых полей.
- **Почему у вертикального фото страница вертикальная?** Ориентация листа выбирается по каждому снимку: портретные фото — на книжный лист, альбомные — на альбомный. Поворот из EXIF учитывается, поэтому фото не окажутся на боку.
- **Можно ли добавить PNG, HEIC и другие форматы?** Да. В один PDF можно собрать JPG, PNG, HEIC, WebP, AVIF, GIF, BMP, TIFF и JPEG XL. PNG и другие форматы без потерь сохраняются без потерь, остальные — в высоком качестве.
- **Сохранятся ли геолокация и дата съёмки?** Нет, метаданные фото в PDF не переносятся: в документе будут только изображения. Это удобно, если отправляете сканы или фото посторонним.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF собирается в вашем браузере — файлы не отправляются на сервер.
- **Есть ли ограничения?** За один раз можно добавить до 100 изображений. Размер страниц и поля можно менять и после добавления файлов — обрабатывать их заново не нужно.

#### English — `/en/jpg-to-pdf`

Файл: `src/content/tools/en/jpg-to-pdf.yaml`

- **title:** JPG to PDF Converter — Combine Photos into One PDF _(50 симв.)_
- **description:** Turn JPG images into a PDF right in your browser: combine several photos into one document with A4, Letter or fit-to-image pages. No re-encoding, no uploads. _(157 симв.)_
- **H1:** JPG to PDF
- **Подзаголовок:** Combine photos into one PDF in the order you want. Free, and your files never leave your device.
- **Хлебные крошки:** JPG to PDF
- **Карточка:** JPG to PDF — Combine photos and scans into a single PDF document.
- **JSON-LD:** JPG to PDF Converter — An online tool that combines JPG images into a PDF right in your browser, without uploading files.

**How to convert JPG to PDF**

1. Click the box above or drop your JPGs onto it — add as many as you like: each image becomes a page.
2. Reorder pages with the arrow buttons and choose the page size: A4, Letter or fit to image, with or without margins.
3. Click “Download PDF” — the document is created right in your browser.

**Why use this converter**

- **No quality loss.** JPGs go into the PDF as they are, without recompression: photos and scans keep their quality, and the PDF is no bigger than the images.
- **Files stay on your device.** The PDF is built on your device. ID scans, contracts and personal photos are never uploaded.
- **Page order and size.** Reorder pages and pick A4 or Letter — landscape shots get a landscape page automatically.
- **No hidden data.** GPS location, phone model and other photo metadata don't make it into the PDF — only the images do.

**FAQ**

- **How do I combine several JPGs into one PDF?** Add all the photos at once or one by one — each becomes a page. Change the order with the arrow buttons on a file's row and remove extras with the cross. Then click “Download PDF”.
- **Will the photo quality get worse?** No. JPGs are placed into the PDF without re-encoding — it's the same data as in the original file. That's also why the PDF is about the size of the photos combined.
- **Which page size should I pick?** A4 (or Letter in the US) for printing and documents: the image fits the page and keeps its proportions. “Fit to image” makes each page exactly the size of the picture, with no white borders.
- **Why is a portrait photo on a portrait page?** Page orientation follows each image: portrait shots get portrait pages, landscape shots get landscape ones. EXIF rotation is respected, so photos don't end up sideways.
- **Can I add PNG, HEIC and other formats?** Yes. One PDF can combine JPG, PNG, HEIC, WebP, AVIF, GIF, BMP, TIFF and JPEG XL. PNG and other lossless formats stay lossless; the rest are stored in high quality.
- **Are the location and date kept?** No, photo metadata isn't carried into the PDF — the document contains only the images. Handy when you send scans or photos to strangers.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; the PDF is created in your browser and your files are never sent to a server.
- **Are there any limits?** You can add up to 100 images at a time. The page size and margins can be changed after adding files — no need to process them again.

### png-to-pdf

#### Русский — `/png-v-pdf`

Файл: `src/content/tools/ru/png-to-pdf.yaml`

- **title:** PNG в PDF онлайн — картинки и скриншоты в один PDF _(50 симв.)_
- **description:** Соберите PNG-картинки и скриншоты в PDF прямо в браузере: без потери качества, с прозрачностью, страницы A4 или по размеру картинки. Без загрузки на сервер. _(156 симв.)_
- **H1:** PNG в PDF
- **Подзаголовок:** Скриншоты и картинки — в один PDF без потери качества. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PNG в PDF
- **Карточка:** PNG в PDF — Скриншоты и картинки PNG — в один PDF без потерь.
- **JSON-LD:** Конвертер PNG в PDF — Онлайн-сервис, который собирает PNG-изображения в PDF прямо в браузере, без загрузки файлов на сервер.

**Как сделать PDF из PNG**

1. Нажмите на область выше или перетащите на неё PNG — можно сразу много: каждая картинка станет страницей.
2. Расставьте страницы кнопками со стрелками и выберите размер: A4, Letter или по размеру картинки, с полями или без.
3. Нажмите «Скачать PDF» — документ соберётся прямо в браузере.

**Почему здесь**

- **Чёткий текст на скриншотах.** PNG сжимаются в PDF без потерь: мелкий текст, схемы и интерфейсы остаются резкими.
- **Прозрачность сохраняется.** Прозрачные области остаются прозрачными — на странице под ними будет белый лист, а не чёрный фон.
- **Файлы остаются у вас.** PDF собирается на вашем устройстве — картинки никуда не загружаются.
- **Любые форматы в одном PDF.** Вместе с PNG можно добавить JPG, HEIC, WebP и другие изображения — все станут страницами одного документа.

**Частые вопросы**

- **Как объединить несколько PNG в один PDF?** Добавьте все картинки сразу или по очереди — каждая станет отдельной страницей. Порядок меняется кнопками со стрелками в строке файла, лишнее убирается крестиком. Затем нажмите «Скачать PDF».
- **Сохраняется ли качество PNG?** Да. PNG сжимаются в PDF без потерь — пиксели те же, что в исходном файле. Чёрно-белые картинки и сканы сохраняются в оттенках серого, это уменьшает PDF.
- **Что будет с прозрачностью?** Прозрачность сохраняется: в программах просмотра PDF прозрачные области выглядят белыми — как лист бумаги.
- **Почему PDF из PNG больше, чем из JPG?** PNG хранит изображение без потерь, поэтому и в PDF оно занимает больше места. Если размер важнее, сначала сожмите картинки или переведите их в JPG.
- **Какой размер страницы выбрать?** Для печати и документов — A4 (в США — Letter): картинка впишется в лист с сохранением пропорций. «По размеру фото» сделает страницу ровно под изображение — без белых полей.
- **Можно ли добавить фото в других форматах?** Да: JPG, HEIC, WebP, AVIF, GIF, BMP, TIFF и JPEG XL. Фото JPG вставляются без перекодирования, форматы с потерями — в высоком качестве.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF собирается в вашем браузере — файлы не отправляются на сервер.

#### English — `/en/png-to-pdf`

Файл: `src/content/tools/en/png-to-pdf.yaml`

- **title:** PNG to PDF Converter — Images and Screenshots into One PDF _(58 симв.)_
- **description:** Combine PNG images and screenshots into a PDF right in your browser: lossless quality, transparency kept, A4 or fit-to-image pages. No uploads. _(143 симв.)_
- **H1:** PNG to PDF
- **Подзаголовок:** Screenshots and images into one lossless PDF. Your files never leave your device.
- **Хлебные крошки:** PNG to PDF
- **Карточка:** PNG to PDF — Put PNG screenshots and images into one lossless PDF.
- **JSON-LD:** PNG to PDF Converter — An online tool that combines PNG images into a PDF right in your browser, without uploading files.

**How to convert PNG to PDF**

1. Click the box above or drop your PNGs onto it — add as many as you like: each image becomes a page.
2. Reorder pages with the arrow buttons and choose the page size: A4, Letter or fit to image, with or without margins.
3. Click “Download PDF” — the document is created right in your browser.

**Why use this converter**

- **Crisp text in screenshots.** PNGs are compressed losslessly in the PDF: small text, diagrams and interfaces stay sharp.
- **Transparency is kept.** Transparent areas stay transparent — the page underneath shows white paper, not a black background.
- **Files stay on your device.** The PDF is built on your device; your images aren't uploaded anywhere.
- **Mix formats in one PDF.** Add JPG, HEIC, WebP and other images alongside PNG — they all become pages of one document.

**FAQ**

- **How do I combine several PNGs into one PDF?** Add all the images at once or one by one — each becomes a page. Change the order with the arrow buttons on a file's row and remove extras with the cross. Then click “Download PDF”.
- **Is the PNG quality preserved?** Yes. PNGs are compressed losslessly in the PDF — the pixels are the same as in the original. Black-and-white images and scans are stored in grayscale, which keeps the PDF smaller.
- **What happens to transparency?** Transparency is preserved: PDF viewers show transparent areas as white, like a sheet of paper.
- **Why is a PDF from PNGs bigger than from JPGs?** PNG stores images losslessly, so they take more space in the PDF too. If size matters more, compress the images first or convert them to JPG.
- **Which page size should I pick?** A4 (or Letter in the US) for printing and documents: the image fits the page and keeps its proportions. “Fit to image” makes each page exactly the size of the picture, with no white borders.
- **Can I add photos in other formats?** Yes: JPG, HEIC, WebP, AVIF, GIF, BMP, TIFF and JPEG XL. JPG photos go in without re-encoding, lossy formats in high quality.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; the PDF is created in your browser and your files are never sent to a server.

### heic-to-pdf

#### Русский — `/heic-v-pdf`

Файл: `src/content/tools/ru/heic-to-pdf.yaml`

- **title:** HEIC в PDF онлайн — фото с iPhone в один PDF _(44 симв.)_
- **description:** Соберите фото HEIC с iPhone в PDF прямо в браузере: несколько снимков в один документ, страницы A4 или по размеру фото. Без регистрации и загрузки на сервер. _(157 симв.)_
- **H1:** HEIC в PDF
- **Подзаголовок:** Фото с iPhone — в один PDF, в нужном порядке. Файлы не покидают ваше устройство.
- **Хлебные крошки:** HEIC в PDF
- **Карточка:** HEIC в PDF — Фото с iPhone — в один PDF-документ.
- **JSON-LD:** Конвертер HEIC в PDF — Онлайн-сервис, который собирает фото HEIC с iPhone в PDF прямо в браузере, без загрузки файлов на сервер.

**Как сделать PDF из HEIC**

1. Нажмите на область выше или перетащите на неё фото HEIC — можно сразу много: каждое станет страницей.
2. Расставьте страницы кнопками со стрелками и выберите размер: A4, Letter или по размеру фото, с полями или без.
3. Нажмите «Скачать PDF» — документ соберётся прямо в браузере.

**Почему здесь**

- **Прямо с iPhone.** HEIC открывается в любом браузере — даже в тех, что сами не показывают этот формат. Устанавливать ничего не нужно.
- **Цвета как на iPhone.** Цветовой профиль Display P3 сохраняется в PDF, поэтому насыщенные цвета снимков не тускнеют.
- **Файлы остаются у вас.** PDF собирается на вашем устройстве — фото никуда не загружаются.
- **Без геолокации.** Место съёмки и другие метаданные в PDF не попадают — только сами снимки.

**Частые вопросы**

- **Как перевести фото с iPhone в PDF?** Добавьте снимки HEIC (на iPhone — через «Файлы» или «Медиатеку»), расставьте их в нужном порядке и нажмите «Скачать PDF». Каждое фото станет страницей.
- **Ухудшится ли качество?** Фото HEIC сохраняются в PDF в высоком качестве (JPEG 90): на глаз отличий нет. Повороты и цвета снимков сохраняются.
- **Почему iPhone присылает JPG вместо HEIC?** При выборе фото iPhone иногда сам переводит HEIC в JPEG. Это не мешает: JPG тоже можно добавить, он попадёт в PDF без перекодирования.
- **Можно ли смешать HEIC, JPG и PNG?** Да: в один PDF можно собрать HEIC, JPG, PNG, WebP, AVIF и другие форматы.
- **Какой размер страницы выбрать?** Для документов и печати — A4 (в США — Letter); «По размеру фото» сделает каждую страницу ровно под снимок, без белых полей.
- **Что с геолокацией и датой съёмки?** В PDF попадают только изображения: геолокация, модель телефона и дата съёмки не переносятся.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF собирается в вашем браузере — файлы не отправляются на сервер.

#### English — `/en/heic-to-pdf`

Файл: `src/content/tools/en/heic-to-pdf.yaml`

- **title:** HEIC to PDF Converter — iPhone Photos into One PDF _(50 симв.)_
- **description:** Combine iPhone HEIC photos into a PDF right in your browser: several shots in one document with A4, Letter or fit-to-image pages. No sign-up, no uploads. _(153 симв.)_
- **H1:** HEIC to PDF
- **Подзаголовок:** iPhone photos into one PDF, in the order you want. Your files never leave your device.
- **Хлебные крошки:** HEIC to PDF
- **Карточка:** HEIC to PDF — Turn iPhone photos into one PDF document.
- **JSON-LD:** HEIC to PDF Converter — An online tool that combines iPhone HEIC photos into a PDF right in your browser, without uploading files.

**How to convert HEIC to PDF**

1. Click the box above or drop your HEIC photos onto it — add as many as you like: each photo becomes a page.
2. Reorder pages with the arrow buttons and choose the page size: A4, Letter or fit to image, with or without margins.
3. Click “Download PDF” — the document is created right in your browser.

**Why use this converter**

- **Straight from your iPhone.** HEIC opens in any browser, even ones that can't display the format themselves. Nothing to install.
- **Colors as on iPhone.** The Display P3 color profile is kept in the PDF, so vivid colors don't look washed out.
- **Files stay on your device.** The PDF is built on your device; your photos aren't uploaded anywhere.
- **No location data.** The location and other metadata don't make it into the PDF — only the photos themselves.

**FAQ**

- **How do I turn iPhone photos into a PDF?** Add your HEIC photos (on an iPhone, via Files or the Photo Library), put them in order and click “Download PDF”. Each photo becomes a page.
- **Will the quality get worse?** HEIC photos are stored in the PDF in high quality (JPEG 90), with no visible difference. Rotation and colors are preserved.
- **Why does my iPhone send JPG instead of HEIC?** When you pick photos, iOS sometimes converts HEIC to JPEG itself. That's fine: JPGs can be added too and go into the PDF without re-encoding.
- **Can I mix HEIC, JPG and PNG?** Yes: one PDF can combine HEIC, JPG, PNG, WebP, AVIF and other formats.
- **Which page size should I pick?** A4 or Letter for documents and printing; “Fit to image” makes each page exactly the size of the photo, with no white borders.
- **What about the location and the date taken?** Only the images go into the PDF: location, phone model and the date taken aren't carried over.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; the PDF is created in your browser and your files are never sent to a server.

### merge-pdf

#### Русский — `/obedinit-pdf`

Файл: `src/content/tools/ru/merge-pdf.yaml`

- **title:** Объединить PDF онлайн — несколько файлов в один PDF _(51 симв.)_
- **description:** Объедините несколько PDF в один документ прямо в браузере: в нужном порядке, без потери качества, без регистрации и загрузки файлов на сервер. _(142 симв.)_
- **H1:** Объединить PDF
- **Подзаголовок:** Несколько документов — в один PDF, в нужном порядке. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Объединить PDF
- **Карточка:** Объединить PDF — Склеить несколько PDF в один документ.
- **JSON-LD:** Объединение PDF онлайн — Онлайн-сервис, который объединяет PDF-файлы в один документ прямо в браузере, без загрузки файлов на сервер.

**Как объединить PDF**

1. Нажмите на область выше или перетащите на неё PDF-файлы — у каждого появятся превью и число страниц.
2. Расставьте документы в нужном порядке стрелками, лишние уберите крестиком.
3. Нажмите «Объединить PDF» — готовый документ сразу скачается.

**Почему здесь**

- **Документы остаются у вас.** PDF объединяются прямо в браузере — договоры, выписки и сканы не загружаются на сервер.
- **Без потери качества.** Страницы копируются как есть: текст остаётся текстом, а картинки не пересжимаются.
- **Порядок под контролем.** Превью первой страницы и число страниц помогают расставить документы, не открывая их.
- **Бесплатно и без регистрации.** До 100 документов за раз, без водяных знаков.

**Частые вопросы**

- **Как объединить несколько PDF в один?** Добавьте файлы, расставьте их стрелками в нужном порядке и нажмите «Объединить PDF». Страницы попадут в документ в том же порядке.
- **Ухудшится ли качество?** Нет. Страницы переносятся без перерисовки: текст остаётся текстом — его можно выделять и искать, — а картинки остаются прежними.
- **Можно ли объединить PDF с паролем?** Нет: защищённый паролем PDF нужно сначала открыть и сохранить копию без пароля. Такой файл будет отмечен в списке и в документ не попадёт.
- **Можно ли добавить картинки?** Для этого есть «JPG в PDF»: соберите картинки в PDF, а затем объедините его с другими документами здесь.
- **Сохранятся ли оглавление и формы?** Страницы, их текст, картинки и пометки переносятся. Оглавление (закладки) исходных документов и интерактивные поля форм могут не сохраниться.
- **Сколько файлов можно объединить?** До 100 документов за раз. Большие PDF объединяются дольше и требуют больше памяти — на телефоне их лучше объединять частями.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF объединяются в вашем браузере и не отправляются на сервер.

#### English — `/en/merge-pdf`

Файл: `src/content/tools/en/merge-pdf.yaml`

- **title:** Merge PDF Online — Combine PDF Files into One _(45 симв.)_
- **description:** Combine several PDFs into one document right in your browser: in the order you want, without quality loss, no sign-up and no uploads. _(133 симв.)_
- **H1:** Merge PDF
- **Подзаголовок:** Combine documents into one PDF in the order you want. Your files never leave your device.
- **Хлебные крошки:** Merge PDF
- **Карточка:** Merge PDF — Combine several PDFs into one document.
- **JSON-LD:** PDF Merger — An online tool that merges PDF files into one document right in your browser, without uploading files.

**How to merge PDF files**

1. Click the box above or drop your PDFs onto it — each file gets a preview and a page count.
2. Put the documents in order with the arrows and remove extras with the cross.
3. Click “Merge PDFs” — the combined document downloads right away.

**Why use this tool**

- **Documents stay on your device.** PDFs are merged right in your browser — contracts, statements and scans are never uploaded.
- **No quality loss.** Pages are copied as they are: text stays text and images aren't recompressed.
- **Easy ordering.** A first-page preview and the page count help you order documents without opening them.
- **Free, no sign-up.** Merge up to 100 documents at a time, with no watermarks.

**FAQ**

- **How do I combine several PDFs into one?** Add the files, put them in order with the arrows and click “Merge PDFs”. The pages go into the document in the same order.
- **Will the quality get worse?** No. Pages are carried over without re-rendering: text stays text — you can still select and search it — and images stay the same.
- **Can I merge password-protected PDFs?** No — open such a PDF and save a copy without the password first. A protected file is marked in the list and left out of the result.
- **Can I add images?** Use “JPG to PDF” for that: turn the images into a PDF, then merge it with your other documents here.
- **Are bookmarks and forms kept?** Pages with their text, images and annotations are carried over. The outline (bookmarks) of the original documents and interactive form fields may not be kept.
- **How many files can I merge?** Up to 100 documents at a time. Large PDFs take longer and need more memory — on a phone, merge them in parts.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; the PDFs are merged in your browser and never sent to a server.

### pdf-to-jpg

#### Русский — `/pdf-v-jpg`

Файл: `src/content/tools/ru/pdf-to-jpg.yaml`

- **title:** PDF в JPG онлайн — сохранить страницы PDF как картинки _(54 симв.)_
- **description:** Переведите PDF в JPG прямо в браузере: каждая страница — отдельная картинка, 72, 150 или 300 dpi. Без регистрации и загрузки файлов на сервер. _(142 симв.)_
- **H1:** PDF в JPG
- **Подзаголовок:** Каждая страница — отдельная картинка. Бесплатно, файлы не покидают ваше устройство.
- **Хлебные крошки:** PDF в JPG
- **Карточка:** PDF в JPG — Сохранить страницы PDF как картинки JPG.
- **JSON-LD:** Конвертер PDF в JPG — Онлайн-сервис, который сохраняет страницы PDF как изображения JPG прямо в браузере, без загрузки файлов на сервер.

**Как перевести PDF в JPG**

1. Выберите разрешение: 150 dpi — для экрана и почты, 300 dpi — для печати. Формат можно сменить на PNG или WebP.
2. Нажмите на область выше или перетащите на неё PDF — можно сразу несколько. Страницы появятся по мере готовности.
3. Скачайте страницы по одной или все сразу ZIP-архивом.

**Почему здесь**

- **Документы остаются у вас.** PDF открывается и рисуется прямо в браузере — договоры, выписки и сканы не загружаются на сервер.
- **Чёткие страницы.** 300 dpi — как у сканера: мелкий текст и таблицы читаются даже на печати.
- **Все страницы сразу.** Каждая страница сохраняется отдельной картинкой с номером в имени файла, а все вместе — одним ZIP-архивом.
- **JPG, PNG или WebP.** JPG — для фото и почты, PNG — для текста и схем без потерь, WebP — компактнее JPG.

**Частые вопросы**

- **Как сохранить одну страницу PDF как картинку?** Добавьте PDF — каждая страница появится отдельной строкой. Скачайте нужную кнопкой «Скачать» в её строке.
- **Какое разрешение выбрать?** 150 dpi подходит для экрана, мессенджеров и почты. Для печати и мелкого текста выберите 300 dpi — картинки будут чётче, но и тяжелее. 72 dpi — самые маленькие файлы.
- **Что лучше: JPG или PNG?** Для страниц с фотографиями — JPG: файлы меньше. Для текста, таблиц и схем — PNG: буквы останутся резкими, без ореолов сжатия.
- **Можно ли открыть PDF с паролем?** Нет: защищённый паролем PDF нужно сначала открыть и сохранить копию без пароля. Если файл защищён, об этом будет сказано в его строке.
- **Можно ли будет выделить текст на картинке?** Нет. Страница сохраняется как изображение: текст будет виден, но выделить или найти его в картинке нельзя.
- **Сколько страниц можно сохранить?** До 300 страниц из одного PDF и до 100 файлов за раз. Очень большие страницы (например, чертежи) сохраняются с меньшим разрешением — в строке будет пометка.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/pdf-to-jpg`

Файл: `src/content/tools/en/pdf-to-jpg.yaml`

- **title:** PDF to JPG Converter — Save PDF Pages as Images _(47 симв.)_
- **description:** Convert PDF to JPG right in your browser: every page becomes a separate image at 72, 150 or 300 dpi. No sign-up and no uploads. _(127 симв.)_
- **H1:** PDF to JPG
- **Подзаголовок:** Every page becomes a separate image. Free, and your files never leave your device.
- **Хлебные крошки:** PDF to JPG
- **Карточка:** PDF to JPG — Save PDF pages as JPG images.
- **JSON-LD:** PDF to JPG Converter — An online tool that saves PDF pages as JPG images right in your browser, without uploading files.

**How to convert PDF to JPG**

1. Pick a resolution: 150 dpi for screens and email, 300 dpi for printing. You can switch the format to PNG or WebP.
2. Click the box above or drop your PDFs onto it — several at once is fine. Pages appear as they're ready.
3. Download pages one by one or all at once as a ZIP.

**Why use this converter**

- **Documents stay on your device.** The PDF is opened and rendered right in your browser — contracts, statements and scans are never uploaded.
- **Sharp pages.** 300 dpi is scanner quality: small print and tables stay readable, even on paper.
- **All pages at once.** Each page is saved as its own image with the page number in the file name, and everything downloads as one ZIP.
- **JPG, PNG or WebP.** JPG for photos and email, PNG for lossless text and diagrams, WebP for files smaller than JPG.

**FAQ**

- **How do I save one page of a PDF as an image?** Add the PDF — every page shows up as its own row. Download the one you need with the “Download” button on its row.
- **Which resolution should I choose?** 150 dpi works for screens, messengers and email. For printing and small print choose 300 dpi: images are sharper but heavier. 72 dpi gives the smallest files.
- **JPG or PNG — which is better?** JPG for pages with photos: files are smaller. PNG for text, tables and diagrams: letters stay crisp, without compression halos.
- **Can I open a password-protected PDF?** No — open the PDF and save a copy without the password first. If a file is protected, its row will say so.
- **Will the text be selectable in the image?** No. Pages are saved as pictures: the text is visible, but you can't select or search it in the image.
- **How many pages can I convert?** Up to 300 pages per PDF and up to 100 files at a time. Very large pages, such as drawings, are saved at a lower resolution, and the row notes it.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; your PDF is processed in your browser and never sent to a server.

### pdf-to-png

#### Русский — `/pdf-v-png`

Файл: `src/content/tools/ru/pdf-to-png.yaml`

- **title:** PDF в PNG онлайн — страницы PDF в картинки без потерь _(53 симв.)_
- **description:** Переведите PDF в PNG прямо в браузере: каждая страница — отдельная картинка без потерь, 72, 150 или 300 dpi. Без регистрации и загрузки на сервер. _(146 симв.)_
- **H1:** PDF в PNG
- **Подзаголовок:** Страницы PDF — в картинки без потери качества. Файлы не покидают ваше устройство.
- **Хлебные крошки:** PDF в PNG
- **Карточка:** PDF в PNG — Страницы PDF — в картинки PNG без потерь.
- **JSON-LD:** Конвертер PDF в PNG — Онлайн-сервис, который сохраняет страницы PDF как изображения PNG прямо в браузере, без загрузки файлов на сервер.

**Как перевести PDF в PNG**

1. Выберите разрешение: 150 dpi — для экрана, 300 dpi — для печати и мелкого текста.
2. Нажмите на область выше или перетащите на неё PDF — можно сразу несколько. Страницы появятся по мере готовности.
3. Скачайте страницы по одной или все сразу ZIP-архивом.

**Почему здесь**

- **Чёткий текст.** PNG хранит картинку без потерь: буквы, линии и таблицы остаются резкими, без артефактов сжатия.
- **Документы остаются у вас.** PDF открывается и рисуется прямо в браузере — договоры, выписки и сканы не загружаются на сервер.
- **Все страницы сразу.** Каждая страница сохраняется отдельной картинкой с номером в имени файла, а все вместе — одним ZIP-архивом.
- **Для презентаций и инструкций.** Страницу PDF в PNG удобно вставить в презентацию, документ или инструкцию.

**Частые вопросы**

- **Чем PNG лучше JPG для страниц PDF?** PNG сжимает без потерь, поэтому текст и линии остаются идеально чёткими. JPG меньше по размеру и лучше подходит для страниц с фотографиями.
- **Почему PNG-файлы такие большие?** Картинка без потерь весит больше, особенно при 300 dpi. Если важен размер, выберите 150 dpi или формат JPG.
- **Какое разрешение выбрать?** 150 dpi подходит для экрана и презентаций. Для печати и мелкого текста выберите 300 dpi. 72 dpi — самые маленькие файлы.
- **Будет ли у картинок прозрачный фон?** Нет, страницы сохраняются на белом фоне — как на бумаге.
- **Можно ли открыть PDF с паролем?** Нет: защищённый паролем PDF нужно сначала открыть и сохранить копию без пароля. Если файл защищён, об этом будет сказано в его строке.
- **Сколько страниц можно сохранить?** До 300 страниц из одного PDF и до 100 файлов за раз. Очень большие страницы (например, чертежи) сохраняются с меньшим разрешением — в строке будет пометка.
- **Безопасно ли это?** Да. С сайта загружается только сам инструмент, а PDF обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/pdf-to-png`

Файл: `src/content/tools/en/pdf-to-png.yaml`

- **title:** PDF to PNG Converter — Lossless Images of PDF Pages _(51 симв.)_
- **description:** Convert PDF to PNG right in your browser: every page becomes a separate lossless image at 72, 150 or 300 dpi. No sign-up and no uploads. _(136 симв.)_
- **H1:** PDF to PNG
- **Подзаголовок:** PDF pages into lossless images. Your files never leave your device.
- **Хлебные крошки:** PDF to PNG
- **Карточка:** PDF to PNG — Turn PDF pages into lossless PNG images.
- **JSON-LD:** PDF to PNG Converter — An online tool that saves PDF pages as PNG images right in your browser, without uploading files.

**How to convert PDF to PNG**

1. Pick a resolution: 150 dpi for screens, 300 dpi for printing and small print.
2. Click the box above or drop your PDFs onto it — several at once is fine. Pages appear as they're ready.
3. Download pages one by one or all at once as a ZIP.

**Why use this converter**

- **Crisp text.** PNG is lossless: letters, lines and tables stay sharp, with no compression artifacts.
- **Documents stay on your device.** The PDF is opened and rendered right in your browser — contracts, statements and scans are never uploaded.
- **All pages at once.** Each page is saved as its own image with the page number in the file name, and everything downloads as one ZIP.
- **For slides and guides.** A PDF page as a PNG is easy to drop into a presentation, a document or a how-to guide.

**FAQ**

- **Why PNG rather than JPG for PDF pages?** PNG is lossless, so text and lines stay perfectly crisp. JPG files are smaller and suit pages with photos better.
- **Why are the PNG files so large?** Lossless images take more space, especially at 300 dpi. If size matters, pick 150 dpi or the JPG format.
- **Which resolution should I choose?** 150 dpi works for screens and presentations. For printing and small print choose 300 dpi. 72 dpi gives the smallest files.
- **Will the images have a transparent background?** No, pages are saved on a white background, just like paper.
- **Can I open a password-protected PDF?** No — open the PDF and save a copy without the password first. If a file is protected, its row will say so.
- **How many pages can I convert?** Up to 300 pages per PDF and up to 100 files at a time. Very large pages, such as drawings, are saved at a lower resolution, and the row notes it.
- **Is it safe?** Yes. Only the tool itself is loaded from the site; your PDF is processed in your browser and never sent to a server.

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

### mp4-to-mp3

#### Русский — `/mp4-v-mp3`

Файл: `src/content/tools/ru/mp4-to-mp3.yaml`

- **title:** MP4 в MP3 онлайн — извлечь звук из видео бесплатно _(50 симв.)_
- **description:** Извлеките звук из видео MP4 в MP3 прямо в браузере: бесплатно, без регистрации, видео не загружается на сервер. Подходят и MOV, WebM, MKV. _(138 симв.)_
- **H1:** Конвертер MP4 в MP3
- **Подзаголовок:** Звук из видео — в MP3. Бесплатно, без регистрации, файлы не покидают ваше устройство.
- **Хлебные крошки:** MP4 в MP3
- **Карточка:** MP4 → MP3 — Звук из видео — в MP3 для плеера и телефона.
- **JSON-LD:** Конвертер MP4 в MP3 — Онлайн-конвертер видео MP4 в MP3, который извлекает звук прямо в браузере без загрузки файлов на сервер.

**Как конвертировать MP4 в MP3**

1. Нажмите на область выше или перетащите на неё MP4-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **Только звук, без лишней работы.** Картинка видео не декодируется — из файла берётся звуковая дорожка, поэтому даже длинный ролик обрабатывается быстро.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что получится из видео?** Из видео берётся только звуковая дорожка: картинка не декодируется и в MP3 не попадает. Если в ролике несколько дорожек, например озвучки на разных языках, берётся основная.
- **Какие видео подходят?** MP4, MOV, WebM и MKV со звуком в распространённых кодеках — AAC, MP3, Opus, Vorbis, FLAC. Если браузер не умеет читать звук файла, в строке появится сообщение об этом.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Можно ли извлечь звук без перекодирования?** MP3 всегда кодируется заново. Если нужен звук без дополнительных потерь, выберите M4A: звук AAC из MP4 переносится в M4A как есть.
- **Что, если в видео нет звука?** Тогда конвертировать нечего — в строке файла появится сообщение «В файле нет звуковой дорожки».
- **Есть ли ограничение по размеру видео?** Жёсткого ограничения нет: видео читается по частям, а в памяти держится только готовый MP3. Длинный фильм обрабатывается дольше — ход виден в процентах.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/mp4-to-mp3`

Файл: `src/content/tools/en/mp4-to-mp3.yaml`

- **title:** MP4 to MP3 Converter — Extract Audio from Video, Free _(53 симв.)_
- **description:** Extract the audio from MP4 videos to MP3 right in your browser. Free, no sign-up, and your videos never leave your device. MOV, WebM and MKV work too. _(150 симв.)_
- **H1:** MP4 to MP3 Converter
- **Подзаголовок:** Audio from video, as MP3. Free, no sign-up, your files never leave your device.
- **Хлебные крошки:** MP4 to MP3
- **Карточка:** MP4 → MP3 — The soundtrack of a video, as an MP3 for any player.
- **JSON-LD:** MP4 to MP3 Converter — An online MP4 to MP3 converter that extracts audio in your browser without uploading your videos.

**How to convert MP4 to MP3**

1. Click the box above or drag your MP4 files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **Just the audio, no wasted work.** The picture is never decoded — only the audio track is taken from the file, so even long videos are quick.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What do I get from a video?** Only the audio track. The picture is not decoded and does not end up in the MP3. If the video has several audio tracks, such as dubs in different languages, the main one is used.
- **Which videos work?** MP4, MOV, WebM and MKV with audio in common codecs — AAC, MP3, Opus, Vorbis, FLAC. If your browser can't read a file's audio, you'll see a message in that file's row.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Can I extract the audio without re-encoding?** MP3 is always encoded anew. If you want no extra quality loss, pick M4A instead: AAC audio from an MP4 is copied into the M4A as is.
- **What if the video has no sound?** Then there's nothing to convert — the file's row will say “The file has no audio track”.
- **Is there a size limit?** No hard limit: the video is read in chunks and only the finished MP3 is kept in memory. A long film just takes longer, and progress is shown as a percentage.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### wav-to-mp3

#### Русский — `/wav-v-mp3`

Файл: `src/content/tools/ru/wav-to-mp3.yaml`

- **title:** WAV в MP3 онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте WAV в MP3 прямо в браузере: бесплатно, без регистрации, записи не загружаются на сервер. Битрейт от 128 до 320 кбит/с. _(132 симв.)_
- **H1:** Конвертер WAV в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** WAV в MP3
- **Карточка:** WAV → MP3 — Записи без сжатия — в компактный MP3.
- **JSON-LD:** Конвертер WAV в MP3 — Онлайн-конвертер аудио WAV в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать WAV в MP3**

1. Нажмите на область выше или перетащите на неё WAV-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить WAV в MP3?** WAV хранит звук без сжатия: минута стерео при 44,1 кГц занимает около 10 МБ. Та же минута в MP3 при 192 кбит/с — около 1,4 МБ, а на слух разница для большинства записей незаметна.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Теряется ли качество?** MP3 сжимает с потерями: убираются детали, которые плохо слышны. При 192–320 кбит/с разница обычно не слышна. Для архива и монтажа лучше оставить WAV или выбрать FLAC — он сжимает без потерь.
- **Что будет с многоканальной записью?** MP3 бывает только моно или стерео, поэтому запись с большим числом каналов сводится в стерео.
- **Сохранятся ли название и исполнитель?** Да. Теги исходного файла — название, исполнитель, альбом и другие — переносятся в новый файл.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/wav-to-mp3`

Файл: `src/content/tools/en/wav-to-mp3.yaml`

- **title:** WAV to MP3 Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert WAV to MP3 right in your browser. Free, no sign-up, and your recordings never leave your device. Bitrate from 128 to 320 kbps. _(134 симв.)_
- **H1:** WAV to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** WAV to MP3
- **Карточка:** WAV → MP3 — Uncompressed recordings, as compact MP3s.
- **JSON-LD:** WAV to MP3 Converter — An online WAV to MP3 converter that runs in your browser without uploading your files.

**How to convert WAV to MP3**

1. Click the box above or drag your WAV files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert WAV to MP3?** WAV stores audio uncompressed: a minute of 44.1 kHz stereo takes about 10 MB. The same minute as a 192 kbps MP3 is about 1.4 MB, and for most recordings you won't hear the difference.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Will I lose quality?** MP3 is lossy: it drops details that are hard to hear. At 192–320 kbps the difference is usually inaudible. For archiving and editing, keep the WAV or choose FLAC, which compresses without loss.
- **What happens to multichannel audio?** MP3 is mono or stereo only, so recordings with more channels are mixed down to stereo.
- **Are the title and artist kept?** Yes. The tags of the original file — title, artist, album and others — are copied to the new file.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### m4a-to-mp3

#### Русский — `/m4a-v-mp3`

Файл: `src/content/tools/ru/m4a-to-mp3.yaml`

- **title:** M4A в MP3 онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте M4A в MP3 прямо в браузере: записи диктофона iPhone, музыку и аудиокниги. Бесплатно, без регистрации, файлы не загружаются на сервер. _(147 симв.)_
- **H1:** Конвертер M4A в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** M4A в MP3
- **Карточка:** M4A → MP3 — Записи iPhone и iTunes — в MP3 для любого плеера.
- **JSON-LD:** Конвертер M4A в MP3 — Онлайн-конвертер аудио M4A в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать M4A в MP3**

1. Нажмите на область выше или перетащите на неё M4A-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое M4A?** M4A — это звук AAC в контейнере MP4. В нём сохраняют записи «Диктофона» на iPhone, музыку из iTunes и многие программы. MP3 же открывается в любом плеере, автомагнитоле и на старых устройствах.
- **Подойдут ли записи с диктофона iPhone?** Да, записи «Диктофона» — это файлы M4A, они конвертируются как обычно. Для речи хватит битрейта 128 кбит/с.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Теряется ли качество?** И AAC, и MP3 сжимают с потерями, поэтому при конвертации качество немного снижается. Чтобы потери не были заметны, выберите битрейт не ниже исходного.
- **Конвертируются ли покупки из iTunes?** Старые покупки iTunes с защитой от копирования (DRM) браузер прочитать не может. Песни без защиты конвертируются как обычные файлы.
- **Сохранятся ли название и исполнитель?** Да. Теги исходного файла — название, исполнитель, альбом и другие — переносятся в новый файл.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/m4a-to-mp3`

Файл: `src/content/tools/en/m4a-to-mp3.yaml`

- **title:** M4A to MP3 Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert M4A to MP3 right in your browser: iPhone voice memos, music and audiobooks. Free, no sign-up, and your files never leave your device. _(141 симв.)_
- **H1:** M4A to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** M4A to MP3
- **Карточка:** M4A → MP3 — iPhone and iTunes audio, as MP3 for any player.
- **JSON-LD:** M4A to MP3 Converter — An online M4A to MP3 converter that runs in your browser without uploading your files.

**How to convert M4A to MP3**

1. Click the box above or drag your M4A files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What is M4A?** M4A is AAC audio in an MP4 container. iPhone Voice Memos, iTunes music and many apps save in it. MP3, on the other hand, plays in any player, car stereo or older device.
- **Do iPhone voice memos work?** Yes, Voice Memos recordings are M4A files and convert like any other. For speech, 128 kbps is plenty.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Will I lose quality?** Both AAC and MP3 are lossy, so converting costs a little quality. To keep the loss unnoticeable, choose a bitrate no lower than the original's.
- **Can I convert iTunes purchases?** Older iTunes purchases with copy protection (DRM) can't be read by the browser. Songs without DRM convert like any other file.
- **Are the title and artist kept?** Yes. The tags of the original file — title, artist, album and others — are copied to the new file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### flac-to-mp3

#### Русский — `/flac-v-mp3`

Файл: `src/content/tools/ru/flac-to-mp3.yaml`

- **title:** FLAC в MP3 онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте FLAC в MP3 прямо в браузере: бесплатно, без регистрации, музыка не загружается на сервер. Битрейт до 320 кбит/с, теги сохраняются. _(144 симв.)_
- **H1:** Конвертер FLAC в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** FLAC в MP3
- **Карточка:** FLAC → MP3 — Музыка без потерь — в MP3 для телефона и плеера.
- **JSON-LD:** Конвертер FLAC в MP3 — Онлайн-конвертер аудио FLAC в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать FLAC в MP3**

1. Нажмите на область выше или перетащите на неё FLAC-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить FLAC в MP3?** FLAC сжимает без потерь, поэтому файлы большие. MP3 в несколько раз меньше и открывается на любом устройстве — удобно для телефона, автомагнитолы и старых плееров.
- **Какой битрейт выбрать для музыки?** Для музыки из FLAC лучше 256 или 320 кбит/с: 320 — максимум для MP3. 192 кбит/с — разумный компромисс, если важен размер.
- **Теряется ли качество?** MP3 сжимает с потерями, поэтому файл уже не будет точной копией. При 256–320 кбит/с разница обычно не слышна. Исходные FLAC стоит сохранить — из них всегда можно сделать новый MP3.
- **Что будет с многоканальной записью?** MP3 бывает только моно или стерео, поэтому запись с большим числом каналов сводится в стерео.
- **Сохранятся ли название и исполнитель?** Да. Теги исходного файла — название, исполнитель, альбом и другие — переносятся в новый файл.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/flac-to-mp3`

Файл: `src/content/tools/en/flac-to-mp3.yaml`

- **title:** FLAC to MP3 Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert FLAC to MP3 right in your browser. Free, no sign-up, and your music never leaves your device. Up to 320 kbps, tags are kept. _(132 симв.)_
- **H1:** FLAC to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** FLAC to MP3
- **Карточка:** FLAC → MP3 — Lossless music, as MP3 for your phone and player.
- **JSON-LD:** FLAC to MP3 Converter — An online FLAC to MP3 converter that runs in your browser without uploading your files.

**How to convert FLAC to MP3**

1. Click the box above or drag your FLAC files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert FLAC to MP3?** FLAC is lossless, so the files are big. An MP3 is several times smaller and plays on any device — handy for phones, car stereos and older players.
- **Which bitrate is best for music?** For music from FLAC, 256 or 320 kbps is best; 320 is the MP3 maximum. 192 kbps is a sensible compromise when size matters.
- **Will I lose quality?** MP3 is lossy, so the file won't be an exact copy anymore. At 256–320 kbps the difference is usually inaudible. Keep your FLAC originals — you can always make a new MP3 from them.
- **What happens to multichannel audio?** MP3 is mono or stereo only, so recordings with more channels are mixed down to stereo.
- **Are the title and artist kept?** Yes. The tags of the original file — title, artist, album and others — are copied to the new file.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### ogg-to-mp3

#### Русский — `/ogg-v-mp3`

Файл: `src/content/tools/ru/ogg-to-mp3.yaml`

- **title:** OGG в MP3 онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте OGG в MP3 прямо в браузере: музыку и голосовые сообщения Telegram. Бесплатно, без регистрации, файлы не загружаются на сервер. _(140 симв.)_
- **H1:** Конвертер OGG в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** OGG в MP3
- **Карточка:** OGG → MP3 — Голосовые и музыка OGG — в MP3, который откроется везде.
- **JSON-LD:** Конвертер OGG в MP3 — Онлайн-конвертер аудио OGG в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать OGG в MP3**

1. Нажмите на область выше или перетащите на неё OGG-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое OGG?** OGG — контейнер, в котором обычно хранят звук Vorbis или Opus. Его используют игры, некоторые сайты и Telegram для голосовых сообщений. Но не все плееры и программы его открывают, а MP3 понимают везде.
- **Подойдут ли голосовые сообщения из Telegram?** Да. Сохранённые голосовые сообщения Telegram — это Opus в OGG, конвертер их читает. Для речи хватит битрейта 128 кбит/с.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Теряется ли качество?** И Vorbis, и Opus, и MP3 сжимают с потерями, поэтому при конвертации качество немного снижается. Чтобы потери не были заметны, выберите битрейт 192 кбит/с или выше.
- **Сохранятся ли название и исполнитель?** Да. Теги исходного файла — название, исполнитель, альбом и другие — переносятся в новый файл.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/ogg-to-mp3`

Файл: `src/content/tools/en/ogg-to-mp3.yaml`

- **title:** OGG to MP3 Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert OGG to MP3 right in your browser: music and Telegram voice messages. Free, no sign-up, and your files never leave your device. _(134 симв.)_
- **H1:** OGG to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** OGG to MP3
- **Карточка:** OGG → MP3 — OGG music and voice messages, as MP3 that plays everywhere.
- **JSON-LD:** OGG to MP3 Converter — An online OGG to MP3 converter that runs in your browser without uploading your files.

**How to convert OGG to MP3**

1. Click the box above or drag your OGG files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What is OGG?** OGG is a container that usually holds Vorbis or Opus audio. Games, some websites and Telegram voice messages use it. Not every player or app opens it, while MP3 works everywhere.
- **Do Telegram voice messages work?** Yes. Saved Telegram voice messages are Opus in OGG, and the converter reads them. For speech, 128 kbps is plenty.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Will I lose quality?** Vorbis, Opus and MP3 are all lossy, so converting costs a little quality. To keep the loss unnoticeable, choose 192 kbps or higher.
- **Are the title and artist kept?** Yes. The tags of the original file — title, artist, album and others — are copied to the new file.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### opus-to-mp3

#### Русский — `/opus-v-mp3`

Файл: `src/content/tools/ru/opus-to-mp3.yaml`

- **title:** OPUS в MP3 онлайн — голосовые сообщения в MP3 бесплатно _(55 симв.)_
- **description:** Конвертируйте OPUS в MP3 прямо в браузере: голосовые сообщения WhatsApp и Telegram. Бесплатно, без регистрации, файлы не загружаются на сервер. _(143 симв.)_
- **H1:** Конвертер OPUS в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** OPUS в MP3
- **Карточка:** OPUS → MP3 — Голосовые WhatsApp и Telegram — в MP3.
- **JSON-LD:** Конвертер OPUS в MP3 — Онлайн-конвертер аудио OPUS в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать OPUS в MP3**

1. Нажмите на область выше или перетащите на неё OPUS-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое Opus?** Opus — современный кодек для речи и музыки. Им сжимают голосовые сообщения WhatsApp и Telegram, звонки и звук многих видео в интернете. Файлы .opus открывают не все плееры и программы, а MP3 понимают везде.
- **Подойдут ли голосовые сообщения WhatsApp?** Да. Голосовые сообщения, сохранённые или пересланные из WhatsApp, — это файлы Opus, конвертер их читает. Для речи хватит битрейта 128 кбит/с.
- **Почему MP3 больше исходного файла?** Opus сжимает речь гораздо эффективнее MP3, поэтому голосовое сообщение в MP3 займёт больше места при сопоставимом качестве. Это нормально.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Сохранятся ли название и исполнитель?** Да. Теги исходного файла — название, исполнитель, альбом и другие — переносятся в новый файл.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/opus-to-mp3`

Файл: `src/content/tools/en/opus-to-mp3.yaml`

- **title:** OPUS to MP3 Converter — Voice Messages to MP3, Free _(51 симв.)_
- **description:** Convert OPUS to MP3 right in your browser: WhatsApp and Telegram voice messages. Free, no sign-up, and your files never leave your device. _(138 симв.)_
- **H1:** OPUS to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** OPUS to MP3
- **Карточка:** OPUS → MP3 — WhatsApp and Telegram voice messages, as MP3.
- **JSON-LD:** OPUS to MP3 Converter — An online OPUS to MP3 converter that runs in your browser without uploading your files.

**How to convert OPUS to MP3**

1. Click the box above or drag your OPUS files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What is Opus?** Opus is a modern codec for speech and music. WhatsApp and Telegram voice messages, calls and the audio of many online videos use it. Not every player or app opens .opus files, while MP3 works everywhere.
- **Do WhatsApp voice messages work?** Yes. Voice messages saved or shared from WhatsApp are Opus files, and the converter reads them. For speech, 128 kbps is plenty.
- **Why is the MP3 bigger than the original?** Opus compresses speech far more efficiently than MP3, so a voice message takes more space as an MP3 at comparable quality. That's expected.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Are the title and artist kept?** Yes. The tags of the original file — title, artist, album and others — are copied to the new file.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### aac-to-mp3

#### Русский — `/aac-v-mp3`

Файл: `src/content/tools/ru/aac-to-mp3.yaml`

- **title:** AAC в MP3 онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте AAC в MP3 прямо в браузере: бесплатно, без регистрации, файлы не загружаются на сервер. Битрейт от 128 до 320 кбит/с. _(131 симв.)_
- **H1:** Конвертер AAC в MP3
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** AAC в MP3
- **Карточка:** AAC → MP3 — Звук AAC — в MP3 для старых плееров и автомагнитол.
- **JSON-LD:** Конвертер AAC в MP3 — Онлайн-конвертер аудио AAC в MP3, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать AAC в MP3**

1. Нажмите на область выше или перетащите на неё AAC-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте MP3 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **MP3 с битрейтом на выбор.** MP3 кодируется LAME — кодировщиком, который используют большинство программ. Битрейт — 128, 192, 256 или 320 кбит/с.
- **Теги сохраняются.** Название, исполнитель, альбом и другие теги переносятся в новый файл.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что такое AAC?** AAC — кодек, которым сжат звук в большинстве видео MP4, в записях iPhone и в музыке Apple. Файлы .aac — это поток AAC без контейнера; их открывают не все плееры и автомагнитолы, а MP3 понимают везде.
- **Можно ли обойтись без перекодирования?** Да, если подходит M4A: выберите его в меню формата, и поток AAC переложится в контейнер M4A как есть, без потерь. Такой файл понимают iPhone, Android и большинство плееров.
- **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, его используют музыкальные сервисы. 320 кбит/с — максимум для MP3: качество чуть выше, файл больше. Для речи, подкастов и лекций хватит 128 кбит/с.
- **Теряется ли качество?** И AAC, и MP3 сжимают с потерями, поэтому при конвертации качество немного снижается. Чтобы потери не были заметны, выберите битрейт не ниже исходного.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/aac-to-mp3`

Файл: `src/content/tools/en/aac-to-mp3.yaml`

- **title:** AAC to MP3 Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert AAC to MP3 right in your browser. Free, no sign-up, and your files never leave your device. Bitrate from 128 to 320 kbps. _(129 симв.)_
- **H1:** AAC to MP3 Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** AAC to MP3
- **Карточка:** AAC → MP3 — AAC audio, as MP3 for older players and car stereos.
- **JSON-LD:** AAC to MP3 Converter — An online AAC to MP3 converter that runs in your browser without uploading your files.

**How to convert AAC to MP3**

1. Click the box above or drag your AAC files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP3 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **MP3 at the bitrate you choose.** MP3 is encoded with LAME, the encoder most audio apps use. Choose 128, 192, 256 or 320 kbps.
- **Tags are kept.** Title, artist, album and other tags are carried over to the new file.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What is AAC?** AAC is the codec behind the audio of most MP4 videos, iPhone recordings and Apple Music. A .aac file is a bare AAC stream with no container; not every player or car stereo opens it, while MP3 works everywhere.
- **Can I avoid re-encoding?** Yes, if M4A works for you: pick it in the format menu and the AAC stream is moved into an M4A container as is, with no loss. iPhones, Android and most players understand it.
- **Which bitrate should I pick?** 192 kbps is a good choice for music and matches what streaming services use. 320 kbps is the maximum for MP3: slightly better quality, bigger file. For speech, podcasts and lectures, 128 kbps is plenty.
- **Will I lose quality?** Both AAC and MP3 are lossy, so converting costs a little quality. To keep the loss unnoticeable, choose a bitrate no lower than the original's.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### mp3-to-wav

#### Русский — `/mp3-v-wav`

Файл: `src/content/tools/ru/mp3-to-wav.yaml`

- **title:** MP3 в WAV онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте MP3 в WAV прямо в браузере: для монтажа, звуковых редакторов и устройств без поддержки MP3. Бесплатно, без регистрации и загрузки на сервер. _(154 симв.)_
- **H1:** Конвертер MP3 в WAV
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** MP3 в WAV
- **Карточка:** MP3 → WAV — MP3 — в WAV для монтажа и звуковых редакторов.
- **JSON-LD:** Конвертер MP3 в WAV — Онлайн-конвертер аудио MP3 в WAV, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать MP3 в WAV**

1. Нажмите на область выше или перетащите на неё MP3-файлы — можно сразу несколько.
2. Подождите: звук перекодируется прямо в браузере, файлы никуда не отправляются. Ход виден в процентах.
3. Скачайте WAV по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Записи не загружаются на сервер, поэтому их не слышит никто, кроме вас.
- **Совместимый WAV.** Звук сохраняется в PCM 16 бит с частотой и числом каналов исходного MP3 — такой WAV открывает любая программа.
- **Дальше без потерь.** MP3 раскодируется один раз, а WAV хранит звук без сжатия: при монтаже и повторных сохранениях качество больше не теряется.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить MP3 в WAV?** WAV нужен программам монтажа, звуковым редакторам, семплерам и устройствам, которые не понимают MP3. Звук в WAV хранится без сжатия, поэтому его удобно редактировать.
- **Станет ли качество лучше?** Нет. WAV точно передаёт то, что было в MP3, но детали, утраченные при сжатии в MP3, не вернутся. Зато при дальнейшей обработке качество больше не теряется.
- **Почему WAV намного больше MP3?** WAV хранит звук без сжатия: минута стерео при 44,1 кГц — около 10 МБ. Поэтому WAV обычно в 4–11 раз больше исходного MP3, в зависимости от его битрейта.
- **Какой получится WAV?** PCM 16 бит с той же частотой и тем же числом каналов, что у MP3, — обычно 44,1 кГц, стерео. Такой формат поддерживают все программы и устройства.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а записи обрабатываются в вашем браузере и не отправляются на сервер.

#### English — `/en/mp3-to-wav`

Файл: `src/content/tools/en/mp3-to-wav.yaml`

- **title:** MP3 to WAV Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert MP3 to WAV right in your browser for video editors, audio editors and devices that don't play MP3. Free, no sign-up, no uploads. _(136 симв.)_
- **H1:** MP3 to WAV Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** MP3 to WAV
- **Карточка:** MP3 → WAV — MP3, as WAV for editing and audio software.
- **JSON-LD:** MP3 to WAV Converter — An online MP3 to WAV converter that runs in your browser without uploading your files.

**How to convert MP3 to WAV**

1. Click the box above or drag your MP3 files onto it — you can add many at once.
2. Wait while your browser re-encodes the audio — nothing gets uploaded. Progress is shown as a percentage.
3. Download each WAV separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Recordings are never uploaded, so nobody but you can hear them.
- **A WAV that opens everywhere.** Audio is saved as 16-bit PCM at the sample rate and channel count of the original MP3 — any app can open it.
- **No further loss.** The MP3 is decoded once and WAV stores it uncompressed, so editing and re-saving no longer cost quality.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert MP3 to WAV?** Video editors, audio editors, samplers and some devices need WAV or don't understand MP3. WAV stores audio uncompressed, which makes it easy to edit.
- **Will the quality improve?** No. The WAV reproduces the MP3 exactly, but details lost when the MP3 was made won't come back. From here on, though, editing costs no further quality.
- **Why is the WAV so much bigger?** WAV is uncompressed: a minute of 44.1 kHz stereo is about 10 MB. So the WAV is usually 4–11 times larger than the MP3, depending on its bitrate.
- **What kind of WAV do I get?** 16-bit PCM with the same sample rate and channel count as the MP3 — usually 44.1 kHz stereo. Every app and device supports it.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your recordings are processed in your browser and never sent to a server.

### mov-to-mp4

#### Русский — `/mov-v-mp4`

Файл: `src/content/tools/ru/mov-to-mp4.yaml`

- **title:** MOV в MP4 онлайн — видео с iPhone в MP4 бесплатно _(49 симв.)_
- **description:** Конвертируйте видео MOV с iPhone и камер в MP4 прямо в браузере: бесплатно, без регистрации, видео не загружается на сервер. _(124 симв.)_
- **H1:** Конвертер MOV в MP4
- **Подзаголовок:** Видео с iPhone — в MP4, который открывается везде. Бесплатно, без загрузки на сервер.
- **Хлебные крошки:** MOV в MP4
- **Карточка:** MOV → MP4 — Видео с iPhone и камер — в MP4 для любых устройств.
- **JSON-LD:** Конвертер MOV в MP4 — Онлайн-конвертер видео MOV в MP4, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать MOV в MP4**

1. Нажмите на область выше или перетащите на неё MOV-файлы — можно сразу несколько.
2. Подождите: видео обрабатывается прямо в браузере и никуда не отправляется. Ход виден в процентах.
3. Скачайте MP4 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Видео остаётся у вас.** Конвертация выполняется на вашем устройстве. Видео не загружается на сервер, поэтому его не видит никто, кроме вас.
- **Без перекодирования, когда можно.** Если в MOV видео H.264 и звук AAC, файл перепаковывается в MP4 за секунды и без потерь качества.
- **H.264 — для совместимости.** Видео HEVC с iPhone перекодируется в H.264: такой MP4 открывают Windows, Android, телевизоры и любые сайты.
- **Сразу много файлов.** Добавьте несколько видео за раз и скачайте результат по одному или одним ZIP-архивом.

**Частые вопросы**

- **Чем MOV отличается от MP4?** Оба формата — контейнеры, внутри которых обычно одно и то же: видео H.264 или HEVC и звук AAC. MOV — формат Apple, MP4 — общий стандарт, который понимают практически все устройства, программы и сайты.
- **Что будет с видео с iPhone?** iPhone по умолчанию снимает в HEVC (H.265). Чтобы MP4 открывался везде, такое видео перекодируется в H.264. Если в MOV уже H.264 — он просто перепаковывается, без потерь и быстро.
- **Почему конвертация идёт долго?** Перекодирование видео — тяжёлая работа, и она идёт прямо на вашем устройстве. Минута видео обрабатывается от десятков секунд до нескольких минут — в зависимости от разрешения и компьютера. Ход виден в процентах.
- **Как уменьшить размер файла?** Выберите качество «Среднее» или «Низкое» и размер кадра поменьше — 720p или 480p. 720p означает, что короткая сторона кадра — 720 точек: у вертикального видео это ширина.
- **Сохранится ли звук?** Да. Звук AAC переносится как есть, другой звук перекодируется в AAC. Если браузер не умеет звук файла, видео сохранится без звука, а в строке файла появится предупреждение.
- **В каком браузере работает?** В свежих Chrome, Edge, Firefox и Safari: видео кодируется встроенными в браузер кодеками (WebCodecs). Если браузер не умеет нужный кодек, в строке файла появится сообщение об этом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а видео обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/mov-to-mp4`

Файл: `src/content/tools/en/mov-to-mp4.yaml`

- **title:** MOV to MP4 Converter — iPhone Videos to MP4, Free _(49 симв.)_
- **description:** Convert MOV videos from your iPhone or camera to MP4 right in your browser. Free, no sign-up, and your videos never leave your device. _(134 симв.)_
- **H1:** MOV to MP4 Converter
- **Подзаголовок:** iPhone videos as MP4 that plays everywhere. Free, no uploads.
- **Хлебные крошки:** MOV to MP4
- **Карточка:** MOV → MP4 — iPhone and camera videos, as MP4 for any device.
- **JSON-LD:** MOV to MP4 Converter — An online MOV to MP4 converter that runs in your browser without uploading your videos.

**How to convert MOV to MP4**

1. Click the box above or drag your MOV files onto it — you can add many at once.
2. Wait while your browser processes the video — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP4 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your video stays with you.** Conversion runs on your device. Your video is never uploaded, so nobody but you can see it.
- **No re-encoding when possible.** If the MOV holds H.264 video and AAC audio, it's repackaged into MP4 in seconds with no quality loss.
- **H.264 for compatibility.** HEVC video from an iPhone is re-encoded to H.264, so the MP4 opens on Windows, Android, TVs and any website.
- **Many files at once.** Add several videos at a time and download them one by one or as a single ZIP.

**Frequently asked questions**

- **What's the difference between MOV and MP4?** Both are containers that usually hold the same things: H.264 or HEVC video and AAC audio. MOV is Apple's format; MP4 is the common standard that virtually every device, app and website understands.
- **What happens to iPhone videos?** iPhones record in HEVC (H.265) by default. To make the MP4 open everywhere, such video is re-encoded to H.264. If the MOV already contains H.264, it's simply repackaged — fast and lossless.
- **Why does it take a while?** Re-encoding video is heavy work, and it happens right on your device. A minute of video takes from tens of seconds to a few minutes, depending on resolution and your computer. Progress is shown as a percentage.
- **How do I make the file smaller?** Choose “Medium” or “Low” quality and a smaller frame size — 720p or 480p. 720p means the short side of the frame is 720 pixels: for a vertical video that's the width.
- **Is the sound kept?** Yes. AAC audio is copied as is; other audio is re-encoded to AAC. If your browser can't handle the file's audio, the video is saved without sound and the row shows a warning.
- **Which browsers does it work in?** Up-to-date Chrome, Edge, Firefox and Safari: video is encoded with the browser's built-in codecs (WebCodecs). If your browser lacks a codec, the file's row will tell you.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your video is processed in your browser and never sent to a server.

### webm-to-mp4

#### Русский — `/webm-v-mp4`

Файл: `src/content/tools/ru/webm-to-mp4.yaml`

- **title:** WebM в MP4 онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте видео WebM в MP4 прямо в браузере: бесплатно, без регистрации, видео не загружается на сервер. MP4 откроется на любом устройстве. _(143 симв.)_
- **H1:** Конвертер WebM в MP4
- **Подзаголовок:** Бесплатно и без регистрации. Видео не покидает ваше устройство.
- **Хлебные крошки:** WebM в MP4
- **Карточка:** WebM → MP4 — Видео с сайтов и записи экрана — в MP4 для любых устройств.
- **JSON-LD:** Конвертер WebM в MP4 — Онлайн-конвертер видео WebM в MP4, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать WebM в MP4**

1. Нажмите на область выше или перетащите на неё WebM-файлы — можно сразу несколько.
2. Подождите: видео обрабатывается прямо в браузере и никуда не отправляется. Ход виден в процентах.
3. Скачайте MP4 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Видео остаётся у вас.** Конвертация выполняется на вашем устройстве. Видео не загружается на сервер, поэтому его не видит никто, кроме вас.
- **H.264 и AAC.** Видео VP9 или VP8 перекодируется в H.264, звук Opus — в AAC: такой MP4 открывают iPhone, Windows, телевизоры и редакторы.
- **Качество и размер на выбор.** Выберите качество и размер кадра — от исходного до 480p, чтобы уменьшить файл.
- **Сразу много файлов.** Добавьте несколько видео за раз и скачайте результат по одному или одним ZIP-архивом.

**Частые вопросы**

- **Что такое WebM?** WebM — открытый формат видео от Google: внутри обычно видео VP9 или VP8 и звук Opus. Его используют YouTube, браузерные записи экрана и многие сайты. Но iPhone, старые телевизоры и некоторые редакторы его не открывают — MP4 понимают везде.
- **Что будет с видео и звуком?** Видео перекодируется в H.264, звук — в AAC. Это стандартная пара для MP4, которую поддерживают практически все устройства.
- **Почему конвертация идёт долго?** Перекодирование видео — тяжёлая работа, и она идёт прямо на вашем устройстве. Минута видео обрабатывается от десятков секунд до нескольких минут — в зависимости от разрешения и компьютера. Ход виден в процентах.
- **Как уменьшить размер файла?** Выберите качество «Среднее» или «Низкое» и размер кадра поменьше — 720p или 480p. 720p означает, что короткая сторона кадра — 720 точек: у вертикального видео это ширина.
- **Подойдут ли записи экрана?** Да. Записи экрана из браузера и некоторых программ сохраняются в WebM — конвертер переводит их в MP4, который можно отправить куда угодно.
- **В каком браузере работает?** В свежих Chrome, Edge, Firefox и Safari: видео кодируется встроенными в браузер кодеками (WebCodecs). Если браузер не умеет нужный кодек, в строке файла появится сообщение об этом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а видео обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/webm-to-mp4`

Файл: `src/content/tools/en/webm-to-mp4.yaml`

- **title:** WebM to MP4 Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert WebM videos to MP4 right in your browser. Free, no sign-up, and your videos never leave your device. The MP4 plays on any device. _(137 симв.)_
- **H1:** WebM to MP4 Converter
- **Подзаголовок:** Free, no sign-up. Your video never leaves your device.
- **Хлебные крошки:** WebM to MP4
- **Карточка:** WebM → MP4 — Web videos and screen recordings, as MP4 for any device.
- **JSON-LD:** WebM to MP4 Converter — An online WebM to MP4 converter that runs in your browser without uploading your videos.

**How to convert WebM to MP4**

1. Click the box above or drag your WebM files onto it — you can add many at once.
2. Wait while your browser processes the video — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP4 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your video stays with you.** Conversion runs on your device. Your video is never uploaded, so nobody but you can see it.
- **H.264 and AAC.** VP9 or VP8 video is re-encoded to H.264 and Opus audio to AAC, so iPhones, Windows, TVs and editors can open the MP4.
- **Pick quality and size.** Choose the quality and frame size — from original down to 480p — to make the file smaller.
- **Many files at once.** Add several videos at a time and download them one by one or as a single ZIP.

**Frequently asked questions**

- **What is WebM?** WebM is Google's open video format, usually VP9 or VP8 video with Opus audio. YouTube, browser screen recorders and many websites use it. iPhones, older TVs and some editors can't open it, while MP4 works everywhere.
- **What happens to the video and audio?** The video is re-encoded to H.264 and the audio to AAC — the standard MP4 pairing that virtually every device supports.
- **Why does it take a while?** Re-encoding video is heavy work, and it happens right on your device. A minute of video takes from tens of seconds to a few minutes, depending on resolution and your computer. Progress is shown as a percentage.
- **How do I make the file smaller?** Choose “Medium” or “Low” quality and a smaller frame size — 720p or 480p. 720p means the short side of the frame is 720 pixels: for a vertical video that's the width.
- **Do screen recordings work?** Yes. Screen recordings made in the browser and by some apps are saved as WebM — the converter turns them into MP4 you can share anywhere.
- **Which browsers does it work in?** Up-to-date Chrome, Edge, Firefox and Safari: video is encoded with the browser's built-in codecs (WebCodecs). If your browser lacks a codec, the file's row will tell you.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your video is processed in your browser and never sent to a server.

### mkv-to-mp4

#### Русский — `/mkv-v-mp4`

Файл: `src/content/tools/ru/mkv-to-mp4.yaml`

- **title:** MKV в MP4 онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте видео MKV в MP4 прямо в браузере: бесплатно, без регистрации, видео не загружается на сервер. H.264 перепаковывается без потерь. _(142 симв.)_
- **H1:** Конвертер MKV в MP4
- **Подзаголовок:** Бесплатно и без регистрации. Видео не покидает ваше устройство.
- **Хлебные крошки:** MKV в MP4
- **Карточка:** MKV → MP4 — Видео MKV — в MP4 для телефона, телевизора и редакторов.
- **JSON-LD:** Конвертер MKV в MP4 — Онлайн-конвертер видео MKV в MP4, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать MKV в MP4**

1. Нажмите на область выше или перетащите на неё MKV-файлы — можно сразу несколько.
2. Подождите: видео обрабатывается прямо в браузере и никуда не отправляется. Ход виден в процентах.
3. Скачайте MP4 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Видео остаётся у вас.** Конвертация выполняется на вашем устройстве. Видео не загружается на сервер, поэтому его не видит никто, кроме вас.
- **Без перекодирования, когда можно.** Если в MKV видео H.264 и звук AAC или MP3, файл перепаковывается в MP4 за секунды и без потерь качества.
- **Остальное — в H.264.** Видео в других кодеках перекодируется в H.264, звук — в AAC: такой MP4 открывается везде.
- **Сразу много файлов.** Добавьте несколько видео за раз и скачайте результат по одному или одним ZIP-архивом.

**Частые вопросы**

- **Чем MKV отличается от MP4?** MKV (Matroska) — контейнер, который вмещает несколько дорожек звука и субтитров. MP4 проще, зато его понимают практически все телефоны, телевизоры, редакторы и сайты.
- **Что будет с дорожками и субтитрами?** В MP4 переносятся основная видеодорожка и основная звуковая. Остальные звуковые дорожки и субтитры не переносятся.
- **Почему в MP4 нет звука?** В фильмах MKV звук часто в AC-3, E-AC-3 или DTS — браузеры такие кодеки не декодируют. Тогда видео сохраняется без звука, а в строке файла появляется предупреждение.
- **Почему конвертация идёт долго?** Перекодирование видео — тяжёлая работа, и она идёт прямо на вашем устройстве. Минута видео обрабатывается от десятков секунд до нескольких минут — в зависимости от разрешения и компьютера. Ход виден в процентах.
- **Как уменьшить размер файла?** Выберите качество «Среднее» или «Низкое» и размер кадра поменьше — 720p или 480p. 720p означает, что короткая сторона кадра — 720 точек: у вертикального видео это ширина.
- **В каком браузере работает?** В свежих Chrome, Edge, Firefox и Safari: видео кодируется встроенными в браузер кодеками (WebCodecs). Если браузер не умеет нужный кодек, в строке файла появится сообщение об этом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а видео обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/mkv-to-mp4`

Файл: `src/content/tools/en/mkv-to-mp4.yaml`

- **title:** MKV to MP4 Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert MKV videos to MP4 right in your browser. Free, no sign-up, and your videos never leave your device. H.264 is repackaged losslessly. _(139 симв.)_
- **H1:** MKV to MP4 Converter
- **Подзаголовок:** Free, no sign-up. Your video never leaves your device.
- **Хлебные крошки:** MKV to MP4
- **Карточка:** MKV → MP4 — MKV video, as MP4 for phones, TVs and editors.
- **JSON-LD:** MKV to MP4 Converter — An online MKV to MP4 converter that runs in your browser without uploading your videos.

**How to convert MKV to MP4**

1. Click the box above or drag your MKV files onto it — you can add many at once.
2. Wait while your browser processes the video — nothing gets uploaded. Progress is shown as a percentage.
3. Download each MP4 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your video stays with you.** Conversion runs on your device. Your video is never uploaded, so nobody but you can see it.
- **No re-encoding when possible.** If the MKV holds H.264 video and AAC or MP3 audio, it's repackaged into MP4 in seconds with no quality loss.
- **Everything else to H.264.** Video in other codecs is re-encoded to H.264 and audio to AAC, so the MP4 opens everywhere.
- **Many files at once.** Add several videos at a time and download them one by one or as a single ZIP.

**Frequently asked questions**

- **What's the difference between MKV and MP4?** MKV (Matroska) is a container that can hold several audio and subtitle tracks. MP4 is simpler, but virtually every phone, TV, editor and website understands it.
- **What happens to tracks and subtitles?** The main video track and the main audio track go into the MP4. Other audio tracks and subtitles are not carried over.
- **Why does the MP4 have no sound?** Movies in MKV often have AC-3, E-AC-3 or DTS audio, which browsers can't decode. In that case the video is saved without sound and the file's row shows a warning.
- **Why does it take a while?** Re-encoding video is heavy work, and it happens right on your device. A minute of video takes from tens of seconds to a few minutes, depending on resolution and your computer. Progress is shown as a percentage.
- **How do I make the file smaller?** Choose “Medium” or “Low” quality and a smaller frame size — 720p or 480p. 720p means the short side of the frame is 720 pixels: for a vertical video that's the width.
- **Which browsers does it work in?** Up-to-date Chrome, Edge, Firefox and Safari: video is encoded with the browser's built-in codecs (WebCodecs). If your browser lacks a codec, the file's row will tell you.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your video is processed in your browser and never sent to a server.

### mp4-to-webm

#### Русский — `/mp4-v-webm`

Файл: `src/content/tools/ru/mp4-to-webm.yaml`

- **title:** MP4 в WebM онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте видео MP4 в WebM (VP9 и Opus) прямо в браузере: для сайтов и веб-приложений. Бесплатно, без регистрации и загрузки на сервер. _(139 симв.)_
- **H1:** Конвертер MP4 в WebM
- **Подзаголовок:** Бесплатно и без регистрации. Видео не покидает ваше устройство.
- **Хлебные крошки:** MP4 в WebM
- **Карточка:** MP4 → WebM — Видео для сайтов — в открытом формате WebM.
- **JSON-LD:** Конвертер MP4 в WebM — Онлайн-конвертер видео MP4 в WebM, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать MP4 в WebM**

1. Нажмите на область выше или перетащите на неё MP4-файлы — можно сразу несколько.
2. Подождите: видео обрабатывается прямо в браузере и никуда не отправляется. Ход виден в процентах.
3. Скачайте WebM по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Видео остаётся у вас.** Конвертация выполняется на вашем устройстве. Видео не загружается на сервер, поэтому его не видит никто, кроме вас.
- **VP9 и Opus.** Видео кодируется в VP9, звук — в Opus: открытые кодеки без лицензионных отчислений, которые поддерживают все современные браузеры.
- **Качество и размер на выбор.** Выберите качество и размер кадра — от исходного до 480p, чтобы видео быстрее грузилось на сайте.
- **Сразу много файлов.** Добавьте несколько видео за раз и скачайте результат по одному или одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить MP4 в WebM?** WebM — открытый формат видео для интернета. Его используют на сайтах как альтернативу MP4: VP9 при том же качестве обычно даёт файл меньше, чем H.264.
- **Какие кодеки внутри?** Видео — VP9 (если браузер его не кодирует — VP8 или AV1), звук — Opus.
- **Откроется ли WebM на iPhone?** Новые версии Safari и iOS воспроизводят WebM, но старые устройства и некоторые программы — нет. Если нужна максимальная совместимость, оставьте MP4.
- **Почему конвертация идёт долго?** Перекодирование видео — тяжёлая работа, и она идёт прямо на вашем устройстве. Минута видео обрабатывается от десятков секунд до нескольких минут — в зависимости от разрешения и компьютера. Ход виден в процентах.
- **Как уменьшить размер файла?** Выберите качество «Среднее» или «Низкое» и размер кадра поменьше — 720p или 480p. 720p означает, что короткая сторона кадра — 720 точек: у вертикального видео это ширина.
- **В каком браузере работает?** В свежих Chrome, Edge, Firefox и Safari: видео кодируется встроенными в браузер кодеками (WebCodecs). Если браузер не умеет нужный кодек, в строке файла появится сообщение об этом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а видео обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/mp4-to-webm`

Файл: `src/content/tools/en/mp4-to-webm.yaml`

- **title:** MP4 to WebM Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert MP4 videos to WebM (VP9 and Opus) right in your browser for websites and web apps. Free, no sign-up, no uploads. _(120 симв.)_
- **H1:** MP4 to WebM Converter
- **Подзаголовок:** Free, no sign-up. Your video never leaves your device.
- **Хлебные крошки:** MP4 to WebM
- **Карточка:** MP4 → WebM — Videos for the web, in the open WebM format.
- **JSON-LD:** MP4 to WebM Converter — An online MP4 to WebM converter that runs in your browser without uploading your videos.

**How to convert MP4 to WebM**

1. Click the box above or drag your MP4 files onto it — you can add many at once.
2. Wait while your browser processes the video — nothing gets uploaded. Progress is shown as a percentage.
3. Download each WebM separately or grab them all in one ZIP file.

**Why use this converter**

- **Your video stays with you.** Conversion runs on your device. Your video is never uploaded, so nobody but you can see it.
- **VP9 and Opus.** Video is encoded to VP9 and audio to Opus — royalty-free codecs every modern browser supports.
- **Pick quality and size.** Choose the quality and frame size — from original down to 480p — so the video loads faster on your site.
- **Many files at once.** Add several videos at a time and download them one by one or as a single ZIP.

**Frequently asked questions**

- **Why convert MP4 to WebM?** WebM is an open video format for the web. Websites use it as an alternative to MP4: at the same quality, VP9 usually gives a smaller file than H.264.
- **Which codecs are used?** VP9 for video (VP8 or AV1 if your browser can't encode VP9) and Opus for audio.
- **Will WebM play on an iPhone?** Recent Safari and iOS versions play WebM, but older devices and some apps don't. If you need maximum compatibility, stick with MP4.
- **Why does it take a while?** Re-encoding video is heavy work, and it happens right on your device. A minute of video takes from tens of seconds to a few minutes, depending on resolution and your computer. Progress is shown as a percentage.
- **How do I make the file smaller?** Choose “Medium” or “Low” quality and a smaller frame size — 720p or 480p. 720p means the short side of the frame is 720 pixels: for a vertical video that's the width.
- **Which browsers does it work in?** Up-to-date Chrome, Edge, Firefox and Safari: video is encoded with the browser's built-in codecs (WebCodecs). If your browser lacks a codec, the file's row will tell you.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your video is processed in your browser and never sent to a server.

### mp4-to-gif

#### Русский — `/mp4-v-gif`

Файл: `src/content/tools/ru/mp4-to-gif.yaml`

- **title:** MP4 в GIF онлайн — видео в гифку бесплатно _(42 симв.)_
- **description:** Сделайте GIF из видео MP4 прямо в браузере: ширина и частота кадров на выбор. Бесплатно, без регистрации, видео не загружается на сервер. _(137 симв.)_
- **H1:** Конвертер MP4 в GIF
- **Подзаголовок:** Видео — в GIF-анимацию. Бесплатно, без регистрации, файлы не покидают ваше устройство.
- **Хлебные крошки:** MP4 в GIF
- **Карточка:** MP4 → GIF — Короткое видео — в GIF-анимацию для чатов и сайтов.
- **JSON-LD:** Конвертер MP4 в GIF — Онлайн-конвертер видео MP4 в GIF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать MP4 в GIF**

1. Нажмите на область выше или перетащите на неё MP4-файлы — можно сразу несколько.
2. Подождите: видео обрабатывается прямо в браузере и никуда не отправляется. Ход виден в процентах.
3. Скачайте GIF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Видео остаётся у вас.** Конвертация выполняется на вашем устройстве. Видео не загружается на сервер, поэтому его не видит никто, кроме вас.
- **Размер под задачу.** Ширина 320, 480 или 640 точек и 10, 15 или 20 кадров в секунду — чем меньше, тем легче файл.
- **Своя палитра у каждого кадра.** Для каждого кадра подбираются свои 256 цветов, поэтому цвета передаются точнее.
- **Сразу много файлов.** Добавьте несколько видео за раз и скачайте результат по одному или одним ZIP-архивом.

**Частые вопросы**

- **Сколько видео попадёт в GIF?** Первые 20 секунд. GIF не сжимает кадры так, как видео, и минута анимации весила бы десятки мегабайт. Если видео длиннее, в строке файла появится предупреждение.
- **Будет ли звук?** Нет, GIF — анимация без звука.
- **Как сделать GIF поменьше?** Выберите ширину 320 точек и 10 кадров в секунду. Размер GIF растёт с площадью кадра и числом кадров.
- **Какие видео подходят?** MP4, MOV, WebM и MKV — если браузер умеет декодировать их видео. Самые распространённые кодеки (H.264, VP9) поддерживают все современные браузеры.
- **Будет ли GIF повторяться?** Да, анимация повторяется бесконечно, как привыкли в чатах и соцсетях.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а видео обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/mp4-to-gif`

Файл: `src/content/tools/en/mp4-to-gif.yaml`

- **title:** MP4 to GIF Converter — Turn Video into a GIF, Free _(50 симв.)_
- **description:** Make a GIF from an MP4 video right in your browser, with the width and frame rate you choose. Free, no sign-up, and your video never leaves your device. _(152 симв.)_
- **H1:** MP4 to GIF Converter
- **Подзаголовок:** Video into a GIF animation. Free, no sign-up, your files never leave your device.
- **Хлебные крошки:** MP4 to GIF
- **Карточка:** MP4 → GIF — A short video, as a GIF for chats and websites.
- **JSON-LD:** MP4 to GIF Converter — An online MP4 to GIF converter that runs in your browser without uploading your videos.

**How to convert MP4 to GIF**

1. Click the box above or drag your MP4 files onto it — you can add many at once.
2. Wait while your browser processes the video — nothing gets uploaded. Progress is shown as a percentage.
3. Download each GIF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your video stays with you.** Conversion runs on your device. Your video is never uploaded, so nobody but you can see it.
- **Size that fits.** Width of 320, 480 or 640 pixels and 10, 15 or 20 frames per second — the smaller, the lighter the file.
- **A palette for every frame.** Each frame gets its own 256 colors, so colors come out more accurately.
- **Many files at once.** Add several videos at a time and download them one by one or as a single ZIP.

**Frequently asked questions**

- **How much of the video goes into the GIF?** The first 20 seconds. GIF doesn't compress frames the way video does, and a minute of animation would weigh tens of megabytes. If the video is longer, the file's row shows a warning.
- **Will there be sound?** No — GIF is animation without sound.
- **How do I make a smaller GIF?** Choose a width of 320 pixels and 10 frames per second. GIF size grows with the frame area and the number of frames.
- **Which videos work?** MP4, MOV, WebM and MKV, as long as your browser can decode their video. The most common codecs (H.264, VP9) work in every modern browser.
- **Does the GIF loop?** Yes, it loops forever, as people expect in chats and on social media.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your video is processed in your browser and never sent to a server.

### txt-to-pdf

#### Русский — `/txt-v-pdf`

Файл: `src/content/tools/ru/txt-to-pdf.yaml`

- **title:** TXT в PDF онлайн — текстовый файл в PDF бесплатно _(49 симв.)_
- **description:** Конвертируйте текстовые файлы TXT в PDF прямо в браузере: кириллица, переносы строк, A4. Бесплатно, без регистрации и загрузки на сервер. _(137 симв.)_
- **H1:** Конвертер TXT в PDF
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** TXT в PDF
- **Карточка:** TXT → PDF — Текстовый файл — в PDF для печати и отправки.
- **JSON-LD:** Конвертер TXT в PDF — Онлайн-конвертер TXT в PDF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать TXT в PDF**

1. Нажмите на область выше или перетащите на неё TXT-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PDF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Переносы строк сохраняются.** Каждая строка остаётся на своём месте, длинные строки переносятся по словам, пустые строки — тоже.
- **Кириллица и любая кодировка.** Кодировка определяется сама — UTF-8, UTF-16 или Windows-1251, а шрифт PDF поддерживает кириллицу.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить TXT в PDF?** PDF одинаково выглядит на любом устройстве и удобен для печати и отправки: получатель увидит текст ровно таким, каким вы его отправили.
- **Как выглядит PDF?** Страницы A4 с полями 20 мм, шрифт Liberation Sans 11 пт с кириллицей. Длинные строки переносятся по словам, текст можно выделять и копировать.
- **А если текст в другой кодировке?** Кодировка определяется сама: UTF-8, UTF-16 или Windows-1251 — в ней сохраняют файлы старые версии «Блокнота» и русский Excel.
- **Что будет с иероглифами и эмодзи?** В шрифте PDF есть латиница, кириллица и греческий. Знаков, которых в нём нет (иероглифы, эмодзи), в PDF не будет — вместо них «?», а в строке файла появится предупреждение.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/txt-to-pdf`

Файл: `src/content/tools/en/txt-to-pdf.yaml`

- **title:** TXT to PDF Converter — Text File to PDF, Free _(45 симв.)_
- **description:** Convert TXT text files to PDF right in your browser: line breaks kept, A4 pages. Free, no sign-up, and your files never leave your device. _(138 симв.)_
- **H1:** TXT to PDF Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** TXT to PDF
- **Карточка:** TXT → PDF — A text file, as a PDF for printing and sharing.
- **JSON-LD:** TXT to PDF Converter — An online TXT to PDF converter that runs in your browser without uploading your files.

**How to convert TXT to PDF**

1. Click the box above or drag your TXT files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PDF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **Line breaks are kept.** Every line stays where it was; long lines wrap at word boundaries, and blank lines are kept too.
- **Any encoding.** UTF-8, UTF-16 or Windows-1251 is detected automatically, and the PDF font covers Latin, Cyrillic and Greek.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert TXT to PDF?** A PDF looks the same on every device and is easy to print and share: the recipient sees the text exactly as you sent it.
- **What does the PDF look like?** A4 pages with 20 mm margins and 11 pt Liberation Sans. Long lines wrap at word boundaries, and the text can be selected and copied.
- **What if the text uses another encoding?** The encoding is detected automatically: UTF-8, UTF-16 or Windows-1251, which older Notepad versions and Excel in Cyrillic locales use.
- **What about CJK characters and emoji?** The PDF font covers Latin, Cyrillic and Greek. Characters it lacks (CJK, emoji) become “?” in the PDF, and the file's row shows a warning.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### md-to-pdf

#### Русский — `/md-v-pdf`

Файл: `src/content/tools/ru/md-to-pdf.yaml`

- **title:** Markdown в PDF онлайн — MD в PDF бесплатно _(42 симв.)_
- **description:** Конвертируйте Markdown (.md) в PDF прямо в браузере: заголовки, списки, таблицы и код. Бесплатно, без регистрации, файлы не загружаются на сервер. _(146 симв.)_
- **H1:** Конвертер Markdown в PDF
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Markdown в PDF
- **Карточка:** Markdown → PDF — README и заметки — в аккуратный PDF.
- **JSON-LD:** Конвертер Markdown в PDF — Онлайн-конвертер Markdown в PDF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать Markdown в PDF**

1. Нажмите на область выше или перетащите на неё Markdown-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PDF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Вся разметка.** Заголовки, жирный и курсив, списки (в том числе вложенные и с флажками), цитаты, блоки кода и таблицы.
- **Текст остаётся текстом.** PDF собирается из текста, а не из картинки: его можно выделять, искать и копировать.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что из Markdown попадёт в PDF?** Заголовки, абзацы, жирный и курсив, списки (нумерованные, маркированные, вложенные, с флажками), цитаты, блоки кода, таблицы, горизонтальные линии. Ссылки выделяются синим с подчёркиванием.
- **А картинки?** Картинки не переносятся — только текст. Если в файле были картинки, в строке файла появится предупреждение.
- **Как выглядит PDF?** Страницы A4 с полями 20 мм, шрифт Liberation Sans 11 пт с кириллицей. Длинные строки переносятся по словам, текст можно выделять и копировать.
- **Что будет с иероглифами и эмодзи?** В шрифте PDF есть латиница, кириллица и греческий. Знаков, которых в нём нет (иероглифы, эмодзи), в PDF не будет — вместо них «?», а в строке файла появится предупреждение.
- **Какой Markdown поддерживается?** Распространённый вариант GitHub Flavored Markdown: таблицы, списки задач, зачёркивание и автоссылки.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/md-to-pdf`

Файл: `src/content/tools/en/md-to-pdf.yaml`

- **title:** Markdown to PDF Converter — MD to PDF, Free _(43 симв.)_
- **description:** Convert Markdown (.md) to PDF right in your browser: headings, lists, tables and code. Free, no sign-up, and your files never leave your device. _(144 симв.)_
- **H1:** Markdown to PDF Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** Markdown to PDF
- **Карточка:** Markdown → PDF — READMEs and notes, as a clean PDF.
- **JSON-LD:** Markdown to PDF Converter — An online Markdown to PDF converter that runs in your browser without uploading your files.

**How to convert Markdown to PDF**

1. Click the box above or drag your Markdown files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PDF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **All the formatting.** Headings, bold and italic, lists (including nested and task lists), quotes, code blocks and tables.
- **Text stays text.** The PDF is built from text, not an image: you can select, search and copy it.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What ends up in the PDF?** Headings, paragraphs, bold and italic, lists (numbered, bulleted, nested, task lists), quotes, code blocks, tables and horizontal rules. Links are shown in blue and underlined.
- **What about images?** Images are not included — only the text. If the file had images, its row shows a warning.
- **What does the PDF look like?** A4 pages with 20 mm margins and 11 pt Liberation Sans. Long lines wrap at word boundaries, and the text can be selected and copied.
- **What about CJK characters and emoji?** The PDF font covers Latin, Cyrillic and Greek. Characters it lacks (CJK, emoji) become “?” in the PDF, and the file's row shows a warning.
- **Which Markdown flavor is supported?** The common GitHub Flavored Markdown: tables, task lists, strikethrough and autolinks.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### html-to-pdf

#### Русский — `/html-v-pdf`

Файл: `src/content/tools/ru/html-to-pdf.yaml`

- **title:** HTML в PDF онлайн — текст веб-страницы в PDF бесплатно _(54 симв.)_
- **description:** Конвертируйте сохранённые HTML-страницы в PDF прямо в браузере: заголовки, абзацы, списки и таблицы. Бесплатно, без регистрации и загрузки на сервер. _(149 симв.)_
- **H1:** Конвертер HTML в PDF
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** HTML в PDF
- **Карточка:** HTML → PDF — Сохранённая веб-страница — в PDF с текстом и структурой.
- **JSON-LD:** Конвертер HTML в PDF — Онлайн-конвертер HTML в PDF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать HTML в PDF**

1. Нажмите на область выше или перетащите на неё HTML-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте PDF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Структура документа.** Заголовки, абзацы, списки, цитаты, код и таблицы переносятся как в исходном файле.
- **Без мусора.** Скрипты, стили, меню и прочая служебная разметка пропускаются — в PDF только содержимое.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Будет ли PDF выглядеть как страница в браузере?** Нет: переносятся текст и структура — заголовки, абзацы, списки, таблицы, код, — но не оформление CSS, колонки и картинки. Получается аккуратный текстовый документ. Точную копию страницы даёт печать в PDF из самого браузера.
- **Подойдут ли письма и экспорт из программ?** Да, если это файл .html или .htm: письма, сохранённые страницы, отчёты и экспорт заметок конвертируются одинаково.
- **А картинки?** Картинки не переносятся — только текст. Если они были, в строке файла появится предупреждение.
- **Как выглядит PDF?** Страницы A4 с полями 20 мм, шрифт Liberation Sans 11 пт с кириллицей. Длинные строки переносятся по словам, текст можно выделять и копировать.
- **Что будет с иероглифами и эмодзи?** В шрифте PDF есть латиница, кириллица и греческий. Знаков, которых в нём нет (иероглифы, эмодзи), в PDF не будет — вместо них «?», а в строке файла появится предупреждение.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/html-to-pdf`

Файл: `src/content/tools/en/html-to-pdf.yaml`

- **title:** HTML to PDF Converter — Web Page Text to PDF, Free _(50 симв.)_
- **description:** Convert saved HTML pages to PDF right in your browser: headings, paragraphs, lists and tables. Free, no sign-up, and your files never leave your device. _(152 симв.)_
- **H1:** HTML to PDF Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** HTML to PDF
- **Карточка:** HTML → PDF — A saved web page, as a PDF with its text and structure.
- **JSON-LD:** HTML to PDF Converter — An online HTML to PDF converter that runs in your browser without uploading your files.

**How to convert HTML to PDF**

1. Click the box above or drag your HTML files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each PDF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **Document structure.** Headings, paragraphs, lists, quotes, code and tables come through as in the original file.
- **No clutter.** Scripts, styles, menus and other technical markup are skipped — the PDF holds just the content.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Will the PDF look like the page in a browser?** No: the text and structure come through — headings, paragraphs, lists, tables, code — but not the CSS styling, columns or images. You get a clean text document. For an exact copy of the page, use “Print to PDF” in your browser.
- **Do emails and app exports work?** Yes, as long as it's an .html or .htm file: emails, saved pages, reports and note exports all convert the same way.
- **What about images?** Images are not included — only the text. If there were any, the file's row shows a warning.
- **What does the PDF look like?** A4 pages with 20 mm margins and 11 pt Liberation Sans. Long lines wrap at word boundaries, and the text can be selected and copied.
- **What about CJK characters and emoji?** The PDF font covers Latin, Cyrillic and Greek. Characters it lacks (CJK, emoji) become “?” in the PDF, and the file's row shows a warning.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### md-to-html

#### Русский — `/md-v-html`

Файл: `src/content/tools/ru/md-to-html.yaml`

- **title:** Markdown в HTML онлайн — MD в HTML бесплатно _(44 симв.)_
- **description:** Конвертируйте Markdown (.md) в готовую HTML-страницу прямо в браузере: таблицы, списки задач, код. Бесплатно, без регистрации и загрузки на сервер. _(147 симв.)_
- **H1:** Конвертер Markdown в HTML
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** Markdown в HTML
- **Карточка:** Markdown → HTML — Markdown — в готовую HTML-страницу с аккуратными стилями.
- **JSON-LD:** Конвертер Markdown в HTML — Онлайн-конвертер Markdown в HTML, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать Markdown в HTML**

1. Нажмите на область выше или перетащите на неё Markdown-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте HTML по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Готовая страница.** Получается самостоятельный HTML-файл с кодировкой, заголовком и аккуратными стилями — его можно сразу открыть в браузере.
- **GitHub Flavored Markdown.** Таблицы, списки задач, зачёркивание и автоссылки — как на GitHub.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Что получится на выходе?** Файл .html со всей разметкой документа: заголовки, абзацы, списки, таблицы, код, ссылки и картинки (по тем же адресам, что в Markdown). Заголовок страницы — первый заголовок документа.
- **Можно ли вставить результат на свой сайт?** Да. Возьмите содержимое <body> — это чистая разметка без лишних классов — или используйте файл целиком.
- **Сохранится ли HTML внутри Markdown?** Да, HTML-вставки переносятся как есть.
- **А если текст в другой кодировке?** Кодировка определяется сама: UTF-8, UTF-16 или Windows-1251 — в ней сохраняют файлы старые версии «Блокнота» и русский Excel.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/md-to-html`

Файл: `src/content/tools/en/md-to-html.yaml`

- **title:** Markdown to HTML Converter — MD to HTML, Free _(45 симв.)_
- **description:** Convert Markdown (.md) to a ready-to-use HTML page right in your browser: tables, task lists, code. Free, no sign-up, and your files never leave your device. _(157 симв.)_
- **H1:** Markdown to HTML Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** Markdown to HTML
- **Карточка:** Markdown → HTML — Markdown, as a ready HTML page with clean styles.
- **JSON-LD:** Markdown to HTML Converter — An online Markdown to HTML converter that runs in your browser without uploading your files.

**How to convert Markdown to HTML**

1. Click the box above or drag your Markdown files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each HTML separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **A complete page.** You get a standalone HTML file with encoding, a title and clean default styles — open it in any browser right away.
- **GitHub Flavored Markdown.** Tables, task lists, strikethrough and autolinks — just like on GitHub.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What do I get?** An .html file with all of the document's markup: headings, paragraphs, lists, tables, code, links and images (at the same addresses as in the Markdown). The page title is the document's first heading.
- **Can I put the result on my site?** Yes. Take the contents of <body> — clean markup without extra classes — or use the whole file.
- **Is HTML inside the Markdown kept?** Yes, embedded HTML is carried over as is.
- **What if the text uses another encoding?** The encoding is detected automatically: UTF-8, UTF-16 or Windows-1251, which older Notepad versions and Excel in Cyrillic locales use.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### csv-to-xlsx

#### Русский — `/csv-v-xlsx`

Файл: `src/content/tools/ru/csv-to-xlsx.yaml`

- **title:** CSV в Excel (XLSX) онлайн — бесплатно, без загрузки _(51 симв.)_
- **description:** Конвертируйте CSV в Excel XLSX прямо в браузере: разделитель и кодировка определяются сами, числа остаются числами. Бесплатно, без регистрации и загрузки на сервер. _(164 симв.)_
- **H1:** Конвертер CSV в XLSX
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** CSV в XLSX
- **Карточка:** CSV → XLSX — Выгрузка CSV — в таблицу Excel без кракозябр.
- **JSON-LD:** Конвертер CSV в XLSX — Онлайн-конвертер CSV в XLSX, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать CSV в XLSX**

1. Нажмите на область выше или перетащите на неё CSV-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте XLSX по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Без кракозябр.** Кодировка (UTF-8 или Windows-1251) и разделитель (запятая, точка с запятой, табуляция) определяются сами.
- **Числа — числами.** Числа в XLSX сразу числовые, а коды с ведущими нулями остаются текстом.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить CSV в XLSX?** Excel открывает CSV по своим правилам: путает кодировку, разделитель, превращает коды в числа и теряет ведущие нули. В XLSX всё уже разложено по столбцам — файл открывается одинаково везде.
- **Какой разделитель нужен?** Любой: запятая, точка с запятой или табуляция определяются автоматически по содержимому файла. Подходит и TSV.
- **Что будет с числами?** Числа становятся числами: с ними можно считать. Значения с ведущими нулями — коды, телефоны, индексы — остаются текстом, чтобы нули не пропали.
- **А если текст в другой кодировке?** Кодировка определяется сама: UTF-8, UTF-16 или Windows-1251 — в ней сохраняют файлы старые версии «Блокнота» и русский Excel.
- **А даты?** Даты переносятся текстом в том виде, в каком записаны в CSV, — без пересчёта в другой формат.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/csv-to-xlsx`

Файл: `src/content/tools/en/csv-to-xlsx.yaml`

- **title:** CSV to Excel (XLSX) Converter — Free, No Upload _(47 симв.)_
- **description:** Convert CSV to Excel XLSX right in your browser: delimiter and encoding are detected, numbers stay numbers. Free, no sign-up, and your files never leave your device. _(165 симв.)_
- **H1:** CSV to XLSX Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** CSV to XLSX
- **Карточка:** CSV → XLSX — A CSV export, as a proper Excel spreadsheet.
- **JSON-LD:** CSV to XLSX Converter — An online CSV to XLSX converter that runs in your browser without uploading your files.

**How to convert CSV to XLSX**

1. Click the box above or drag your CSV files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each XLSX separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **No garbled text.** The encoding (UTF-8 or Windows-1251) and the delimiter (comma, semicolon or tab) are detected automatically.
- **Numbers stay numbers.** Numbers are numeric in the XLSX right away, while codes with leading zeros stay text.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert CSV to XLSX?** Excel opens CSV by its own rules: it may misread the encoding or delimiter, turn codes into numbers and drop leading zeros. An XLSX already has everything in columns and opens the same everywhere.
- **Which delimiter does it need?** Any: comma, semicolon or tab is detected from the file's contents. TSV works too.
- **What happens to numbers?** Numbers become real numbers you can calculate with. Values with leading zeros — codes, phone numbers, ZIP codes — stay text so the zeros aren't lost.
- **What if the text uses another encoding?** The encoding is detected automatically: UTF-8, UTF-16 or Windows-1251, which older Notepad versions and Excel in Cyrillic locales use.
- **What about dates?** Dates are carried over as text, exactly as written in the CSV, without converting them to another format.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### xlsx-to-csv

#### Русский — `/xlsx-v-csv`

Файл: `src/content/tools/ru/xlsx-to-csv.yaml`

- **title:** Excel (XLSX) в CSV онлайн — бесплатно, без загрузки _(51 симв.)_
- **description:** Конвертируйте таблицы Excel XLSX в CSV прямо в браузере: UTF-8, разделитель на выбор, даты в понятном виде. Бесплатно, без регистрации и загрузки на сервер. _(156 симв.)_
- **H1:** Конвертер XLSX в CSV
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** XLSX в CSV
- **Карточка:** XLSX → CSV — Таблица Excel — в CSV для импорта и программ.
- **JSON-LD:** Конвертер XLSX в CSV — Онлайн-конвертер XLSX в CSV, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать XLSX в CSV**

1. Нажмите на область выше или перетащите на неё XLSX-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте CSV по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Разделитель на выбор.** Точка с запятой — для русского Excel, запятая — для программ и Google Таблиц, табуляция — для TSV.
- **Значения, а не формулы.** В CSV попадают значения ячеек, как их показывает Excel, даты — в виде 2024-07-15.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Какой лист попадёт в CSV?** Первый лист книги. CSV — один лист, поэтому, если листов несколько, в строке файла появится предупреждение.
- **Что будет с формулами?** В CSV записываются значения, которые Excel сохранил в файле при последнем пересчёте, а не сами формулы.
- **Как записываются даты?** Даты — в виде 2024-07-15, дата со временем — 2024-07-15 14:30:00: так их понимают и программы, и Excel.
- **Почему разделитель — точка с запятой?** Русский Excel открывает CSV с точкой с запятой, а с запятой показывает всё в одном столбце. Для Google Таблиц и программ выберите в настройках запятую.
- **В какой кодировке CSV?** В UTF-8 с меткой BOM — Excel открывает такой файл без кракозябр.
- **Подойдёт ли старый формат XLS?** Нет, только XLSX — формат Excel 2007 и новее. Файл XLS можно пересохранить в XLSX в самом Excel.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/xlsx-to-csv`

Файл: `src/content/tools/en/xlsx-to-csv.yaml`

- **title:** Excel (XLSX) to CSV Converter — Free, No Upload _(47 симв.)_
- **description:** Convert Excel XLSX spreadsheets to CSV right in your browser: UTF-8, your choice of delimiter, readable dates. Free, no sign-up, and your files never leave your device. _(168 симв.)_
- **H1:** XLSX to CSV Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** XLSX to CSV
- **Карточка:** XLSX → CSV — An Excel spreadsheet, as CSV for imports and apps.
- **JSON-LD:** XLSX to CSV Converter — An online XLSX to CSV converter that runs in your browser without uploading your files.

**How to convert XLSX to CSV**

1. Click the box above or drag your XLSX files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each CSV separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **Your choice of delimiter.** Comma for apps and Google Sheets, semicolon for Excel in many European locales, tab for TSV.
- **Values, not formulas.** The CSV gets cell values as Excel shows them, with dates written as 2024-07-15.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Which sheet goes into the CSV?** The workbook's first sheet. A CSV holds one sheet, so if there are several, the file's row shows a warning.
- **What happens to formulas?** The CSV gets the values Excel saved in the file at its last recalculation, not the formulas themselves.
- **How are dates written?** Dates as 2024-07-15, dates with time as 2024-07-15 14:30:00 — understood by both apps and Excel.
- **Which delimiter should I choose?** Comma works for Google Sheets, most apps and English-language Excel. Excel in many European locales expects a semicolon — pick it in the settings if Excel shows everything in one column.
- **Which encoding is the CSV in?** UTF-8 with a BOM, so Excel opens it without garbled characters.
- **Does the old XLS format work?** No, only XLSX — the format of Excel 2007 and later. You can re-save an XLS file as XLSX in Excel.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### json-to-csv

#### Русский — `/json-v-csv`

Файл: `src/content/tools/ru/json-to-csv.yaml`

- **title:** JSON в CSV онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте JSON в CSV прямо в браузере: массив объектов становится таблицей со столбцами по ключам. Бесплатно, без регистрации и загрузки на сервер. _(151 симв.)_
- **H1:** Конвертер JSON в CSV
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** JSON в CSV
- **Карточка:** JSON → CSV — Массив JSON — в таблицу CSV для Excel.
- **JSON-LD:** Конвертер JSON в CSV — Онлайн-конвертер JSON в CSV, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать JSON в CSV**

1. Нажмите на область выше или перетащите на неё JSON-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте CSV по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Столбцы по ключам.** Все ключи объектов становятся столбцами в порядке появления — даже если у разных объектов они разные.
- **Готово для Excel.** CSV в UTF-8 с меткой BOM и разделителем на выбор открывается в Excel без кракозябр.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Какой JSON подходит?** Массив объектов ([{"имя": …}, …]) — каждый объект становится строкой, ключи — столбцами. Подходят и массив массивов, и объект, внутри которого один такой массив.
- **Что будет с вложенными объектами?** Вложенные объекты и массивы записываются в ячейку как текст JSON, а в строке файла появляется предупреждение.
- **Почему разделитель — точка с запятой?** Русский Excel открывает CSV с точкой с запятой, а с запятой показывает всё в одном столбце. Для Google Таблиц и программ выберите в настройках запятую.
- **Что, если в JSON нет таблицы?** Если это не массив объектов или массивов, конвертировать нечего — в строке файла появится сообщение об этом.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/json-to-csv`

Файл: `src/content/tools/en/json-to-csv.yaml`

- **title:** JSON to CSV Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert JSON to CSV right in your browser: an array of objects becomes a table with a column for each key. Free, no sign-up, and your files never leave your device. _(164 симв.)_
- **H1:** JSON to CSV Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** JSON to CSV
- **Карточка:** JSON → CSV — A JSON array, as a CSV table for Excel.
- **JSON-LD:** JSON to CSV Converter — An online JSON to CSV converter that runs in your browser without uploading your files.

**How to convert JSON to CSV**

1. Click the box above or drag your JSON files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each CSV separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **Columns from keys.** Every key becomes a column in order of appearance — even when objects have different keys.
- **Ready for Excel.** UTF-8 CSV with a BOM and your choice of delimiter opens in Excel without garbled text.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Which JSON works?** An array of objects ([{"name": …}, …]) — each object becomes a row and its keys become columns. An array of arrays, or an object that holds one such array, works too.
- **What happens to nested objects?** Nested objects and arrays are written into the cell as JSON text, and the file's row shows a warning.
- **Which delimiter should I choose?** Comma works for Google Sheets, most apps and English-language Excel. Excel in many European locales expects a semicolon — pick it in the settings if Excel shows everything in one column.
- **What if the JSON isn't a table?** If it's not an array of objects or arrays, there's nothing to convert — the file's row will say so.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### csv-to-json

#### Русский — `/csv-v-json`

Файл: `src/content/tools/ru/csv-to-json.yaml`

- **title:** CSV в JSON онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте CSV в JSON прямо в браузере: первая строка — ключи, числа — числами. Бесплатно, без регистрации, файлы не загружаются на сервер. _(142 симв.)_
- **H1:** Конвертер CSV в JSON
- **Подзаголовок:** Бесплатно и без регистрации. Файлы не покидают ваше устройство.
- **Хлебные крошки:** CSV в JSON
- **Карточка:** CSV → JSON — Таблица CSV — в массив объектов JSON.
- **JSON-LD:** Конвертер CSV в JSON — Онлайн-конвертер CSV в JSON, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать CSV в JSON**

1. Нажмите на область выше или перетащите на неё CSV-файлы — можно сразу несколько.
2. Подождите немного: конвертация идёт прямо в браузере, файлы никуда не отправляются.
3. Скачайте JSON по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Файлы остаются у вас.** Конвертация выполняется на вашем устройстве. Документы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Массив объектов.** Первая строка — ключи, каждая следующая — объект. Такой JSON сразу подходит для кода и API.
- **Разделитель и кодировка — сами.** Запятая, точка с запятой или табуляция и кодировка UTF-8 или Windows-1251 определяются автоматически.
- **Сразу много файлов.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Какой получится JSON?** Массив объектов: ключи — из первой строки CSV, значения — из следующих строк. JSON отформатирован с отступами, чтобы его было удобно читать.
- **Что будет с числами?** Числа становятся числами: с ними можно считать. Значения с ведущими нулями — коды, телефоны, индексы — остаются текстом, чтобы нули не пропали.
- **Что, если в заголовке пустая ячейка?** Столбец без названия получает ключ column_N, где N — его номер.
- **А если текст в другой кодировке?** Кодировка определяется сама: UTF-8, UTF-16 или Windows-1251 — в ней сохраняют файлы старые версии «Блокнота» и русский Excel.
- **Сколько файлов можно конвертировать за раз?** До 100 файлов за раз. Готовые файлы можно скачать по одному или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а файл обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/csv-to-json`

Файл: `src/content/tools/en/csv-to-json.yaml`

- **title:** CSV to JSON Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert CSV to JSON right in your browser: the first row becomes keys, numbers stay numbers. Free, no sign-up, and your files never leave your device. _(150 симв.)_
- **H1:** CSV to JSON Converter
- **Подзаголовок:** Free, no sign-up. Your files never leave your device.
- **Хлебные крошки:** CSV to JSON
- **Карточка:** CSV → JSON — A CSV table, as a JSON array of objects.
- **JSON-LD:** CSV to JSON Converter — An online CSV to JSON converter that runs in your browser without uploading your files.

**How to convert CSV to JSON**

1. Click the box above or drag your CSV files onto it — you can add many at once.
2. Wait a moment while your browser converts them. Nothing gets uploaded.
3. Download each JSON separately or grab them all in one ZIP file.

**Why use this converter**

- **Your files stay with you.** Conversion runs on your device. Documents are never uploaded, so nobody but you can see them.
- **An array of objects.** The first row gives the keys and every following row becomes an object — ready for code and APIs.
- **Delimiter and encoding detected.** Comma, semicolon or tab and UTF-8 or Windows-1251 encoding are detected automatically.
- **Many files at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **What does the JSON look like?** An array of objects: keys from the first CSV row, values from the rows below. The JSON is indented so it's easy to read.
- **What happens to numbers?** Numbers become real numbers you can calculate with. Values with leading zeros — codes, phone numbers, ZIP codes — stay text so the zeros aren't lost.
- **What if a header cell is empty?** A column without a name gets the key column_N, where N is its number.
- **What if the text uses another encoding?** The encoding is detected automatically: UTF-8, UTF-16 or Windows-1251, which older Notepad versions and Excel in Cyrillic locales use.
- **How many files can I convert at once?** Up to 100 files per batch. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your file is processed in your browser and never sent to a server.

### fb2-to-epub

#### Русский — `/fb2-v-epub`

Файл: `src/content/tools/ru/fb2-to-epub.yaml`

- **title:** FB2 в EPUB онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте книги FB2 в EPUB прямо в браузере: обложка, главы, оглавление и иллюстрации. Подходят и .fb2.zip. Бесплатно и без загрузки на сервер. _(147 симв.)_
- **H1:** Конвертер FB2 в EPUB
- **Подзаголовок:** Книги FB2 — для Apple Books, Google Play Книг, Kindle и других читалок. Бесплатно, без регистрации.
- **Хлебные крошки:** FB2 в EPUB
- **Карточка:** FB2 → EPUB — Книги FB2 — в EPUB для iPhone, Android и Kindle.
- **JSON-LD:** Конвертер FB2 в EPUB — Онлайн-конвертер электронных книг FB2 в EPUB, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать FB2 в EPUB**

1. Нажмите на область выше или перетащите на неё книги FB2 — можно сразу несколько.
2. Подождите немного: книга конвертируется прямо в браузере и никуда не отправляется.
3. Скачайте EPUB по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Книги остаются у вас.** Конвертация выполняется на вашем устройстве. Файлы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Главы и оглавление.** Название, авторы, аннотация, обложка, главы и иллюстрации переносятся, а оглавление собирается по главам.
- **EPUB 3 для любых читалок.** Книга собирается в EPUB 3 с оглавлением и для новых, и для старых читалок.
- **Сразу много книг.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить FB2 в EPUB?** FB2 популярен в русскоязычных библиотеках, но Apple Books, Google Play Книги, Kobo и Kindle его не открывают. EPUB — общий стандарт электронных книг, его читают почти все устройства и программы.
- **Подойдёт ли EPUB для Kindle?** Да. Новые Kindle принимают EPUB через «Отправить на Kindle» (Send to Kindle) — Amazon сам переведёт книгу в свой формат.
- **Подойдут ли файлы .fb2.zip?** Да. Книги FB2 часто раздают в ZIP-архиве — конвертер сам найдёт файл внутри. Кодировка тоже определяется сама, в том числе windows-1251 у старых книг.
- **Что будет с картинками?** Обложка и иллюстрации в JPEG и PNG переносятся. Картинки в других форматах читалки поддерживают плохо, поэтому они пропускаются, а в строке файла появляется предупреждение.
- **Сохранится ли оформление?** Сохраняются структура и начертание: главы и их заголовки, жирный и курсив, эпиграфы, стихи, цитаты, таблицы. Оформление текста задаёт сама читалка — шрифт и его размер можно настроить в ней.
- **Можно ли конвертировать несколько книг?** Да, до 100 файлов за раз. Готовые книги можно скачать по одной или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а книга обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/fb2-to-epub`

Файл: `src/content/tools/en/fb2-to-epub.yaml`

- **title:** FB2 to EPUB Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert FB2 ebooks to EPUB right in your browser: cover, chapters, table of contents and illustrations. .fb2.zip works too. Free and no uploads. _(144 симв.)_
- **H1:** FB2 to EPUB Converter
- **Подзаголовок:** FB2 books for Apple Books, Google Play Books, Kindle and other readers. Free, no sign-up.
- **Хлебные крошки:** FB2 to EPUB
- **Карточка:** FB2 → EPUB — FB2 books, as EPUB for iPhone, Android and Kindle.
- **JSON-LD:** FB2 to EPUB Converter — An online FB2 to EPUB ebook converter that runs in your browser without uploading your files.

**How to convert FB2 to EPUB**

1. Click the box above or drag your FB2 books onto it — you can add many at once.
2. Wait a moment while your browser converts the book. Nothing gets uploaded.
3. Download each EPUB separately or grab them all in one ZIP file.

**Why use this converter**

- **Your books stay with you.** Conversion runs on your device. Files are never uploaded, so nobody but you can see them.
- **Chapters and contents.** Title, authors, description, cover, chapters and illustrations come through, and the table of contents is built from the chapters.
- **EPUB 3 for any reader.** The book is built as EPUB 3 with a table of contents for both new and older readers.
- **Many books at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert FB2 to EPUB?** FB2 is popular in Russian-language libraries, but Apple Books, Google Play Books, Kobo and Kindle don't open it. EPUB is the common ebook standard that almost every device and app reads.
- **Will the EPUB work on a Kindle?** Yes. Newer Kindles accept EPUB through Send to Kindle — Amazon converts the book to its own format.
- **Do .fb2.zip files work?** Yes. FB2 books are often shared as ZIP archives — the converter finds the file inside. The encoding is detected automatically too, including windows-1251 used by older books.
- **What happens to images?** The cover and illustrations in JPEG and PNG come through. Images in other formats are poorly supported by readers, so they are skipped and the file's row shows a warning.
- **Is the formatting kept?** The structure and styling are kept: chapters and their headings, bold and italic, epigraphs, poems, quotes and tables. The text's look is set by your reader app — you can adjust the font and size there.
- **Can I convert several books?** Yes, up to 100 files at once. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your book is processed in your browser and never sent to a server.

### epub-to-fb2

#### Русский — `/epub-v-fb2`

Файл: `src/content/tools/ru/epub-to-fb2.yaml`

- **title:** EPUB в FB2 онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте книги EPUB в FB2 прямо в браузере: обложка, главы и иллюстрации сохраняются. Бесплатно, без регистрации и загрузки на сервер. _(139 симв.)_
- **H1:** Конвертер EPUB в FB2
- **Подзаголовок:** Книги EPUB — для читалок и программ, которые понимают FB2. Бесплатно, без регистрации.
- **Хлебные крошки:** EPUB в FB2
- **Карточка:** EPUB → FB2 — Книги EPUB — в FB2 для PocketBook, ONYX и программ-читалок.
- **JSON-LD:** Конвертер EPUB в FB2 — Онлайн-конвертер электронных книг EPUB в FB2, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать EPUB в FB2**

1. Нажмите на область выше или перетащите на неё книги EPUB — можно сразу несколько.
2. Подождите немного: книга конвертируется прямо в браузере и никуда не отправляется.
3. Скачайте FB2 по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Книги остаются у вас.** Конвертация выполняется на вашем устройстве. Файлы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Главы и оглавление.** Название, авторы, аннотация, обложка, главы и иллюстрации переносятся, а оглавление собирается по главам.
- **Один файл.** FB2 — один XML-файл: картинки хранятся внутри, его удобно отправлять и складывать в библиотеку.
- **Сразу много книг.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить EPUB в FB2?** Многие читалки и программы, популярные в России, — PocketBook, ONYX, FBReader, «Литрес: Читай» — лучше всего работают с FB2: в нём удобные примечания и оглавление.
- **Что сохранится?** Название, авторы, язык, обложка, главы с заголовками, абзацы с жирным и курсивом, цитаты, списки, таблицы и иллюстрации в JPEG и PNG.
- **Что будет с картинками?** Обложка и иллюстрации в JPEG и PNG переносятся. Картинки в других форматах читалки поддерживают плохо, поэтому они пропускаются, а в строке файла появляется предупреждение.
- **Подойдут ли купленные книги?** Книги с защитой от копирования (DRM) прочитать нельзя. Книги без защиты — из библиотек, личные и большинство бесплатных — конвертируются как обычно.
- **Почему у меня жанр «unrecognised»?** В EPUB нет жанров FB2, поэтому в книге указывается «unrecognised» — так делают и другие конвертеры. Жанр можно поправить в библиотеке-каталогизаторе.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а книга обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/epub-to-fb2`

Файл: `src/content/tools/en/epub-to-fb2.yaml`

- **title:** EPUB to FB2 Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert EPUB ebooks to FB2 right in your browser: cover, chapters and illustrations are kept. Free, no sign-up, and your files never leave your device. _(151 симв.)_
- **H1:** EPUB to FB2 Converter
- **Подзаголовок:** EPUB books for readers and apps that use FB2. Free, no sign-up.
- **Хлебные крошки:** EPUB to FB2
- **Карточка:** EPUB → FB2 — EPUB books, as FB2 for PocketBook, ONYX and reader apps.
- **JSON-LD:** EPUB to FB2 Converter — An online EPUB to FB2 ebook converter that runs in your browser without uploading your files.

**How to convert EPUB to FB2**

1. Click the box above or drag your EPUB books onto it — you can add many at once.
2. Wait a moment while your browser converts the book. Nothing gets uploaded.
3. Download each FB2 separately or grab them all in one ZIP file.

**Why use this converter**

- **Your books stay with you.** Conversion runs on your device. Files are never uploaded, so nobody but you can see them.
- **Chapters and contents.** Title, authors, description, cover, chapters and illustrations come through, and the table of contents is built from the chapters.
- **A single file.** FB2 is one XML file with images inside — easy to share and to add to your library.
- **Many books at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert EPUB to FB2?** Many readers and apps popular in Eastern Europe — PocketBook, ONYX, FBReader — work best with FB2, which has handy footnotes and contents.
- **What is kept?** Title, authors, language, cover, chapters with headings, paragraphs with bold and italic, quotes, lists, tables and JPEG and PNG illustrations.
- **What happens to images?** The cover and illustrations in JPEG and PNG come through. Images in other formats are poorly supported by readers, so they are skipped and the file's row shows a warning.
- **Do purchased books work?** Books with copy protection (DRM) can't be read. DRM-free books — from libraries, your own and most free ones — convert as usual.
- **Why is the genre “unrecognised”?** EPUB has no FB2 genres, so the book gets “unrecognised”, as other converters do. You can fix the genre in your library manager.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your book is processed in your browser and never sent to a server.

### fb2-to-pdf

#### Русский — `/fb2-v-pdf`

Файл: `src/content/tools/ru/fb2-to-pdf.yaml`

- **title:** FB2 в PDF онлайн — бесплатно, без загрузки на сервер _(52 симв.)_
- **description:** Конвертируйте книги FB2 в PDF прямо в браузере: обложка, главы с новой страницы, иллюстрации. Подходят и .fb2.zip. Бесплатно и без загрузки на сервер. _(150 симв.)_
- **H1:** Конвертер FB2 в PDF
- **Подзаголовок:** Книги FB2 — в PDF для печати, компьютера и планшета. Бесплатно, без регистрации.
- **Хлебные крошки:** FB2 в PDF
- **Карточка:** FB2 → PDF — Книги FB2 — в PDF для печати и чтения на компьютере.
- **JSON-LD:** Конвертер FB2 в PDF — Онлайн-конвертер электронных книг FB2 в PDF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать FB2 в PDF**

1. Нажмите на область выше или перетащите на неё книги FB2 — можно сразу несколько.
2. Подождите немного: книга конвертируется прямо в браузере и никуда не отправляется.
3. Скачайте PDF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Книги остаются у вас.** Конвертация выполняется на вашем устройстве. Файлы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Главы с новой страницы.** Титул с обложкой, названием и авторами, затем главы — каждая с новой страницы, с заголовками и иллюстрациями.
- **Кириллица и выделение текста.** Текст набран шрифтом с кириллицей и остаётся текстом: его можно выделять, искать и копировать.
- **Сразу много книг.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить FB2 в PDF?** PDF открывается на любом компьютере, планшете и телефоне без отдельной читалки и одинаково выглядит при печати.
- **Как выглядит PDF?** Страницы A4: титул с обложкой, названием и авторами, затем главы — каждая с новой страницы. Текст набран шрифтом с кириллицей, его можно выделять и искать, иллюстрации — на своих местах.
- **Подойдут ли файлы .fb2.zip?** Да. Книги FB2 часто раздают в ZIP-архиве — конвертер сам найдёт файл внутри. Кодировка тоже определяется сама, в том числе windows-1251 у старых книг.
- **Где примечания?** Примечания из FB2 собираются в отдельную главу в конце книги.
- **Что будет с картинками?** Обложка и иллюстрации в JPEG и PNG переносятся. Картинки в других форматах читалки поддерживают плохо, поэтому они пропускаются, а в строке файла появляется предупреждение.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а книга обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/fb2-to-pdf`

Файл: `src/content/tools/en/fb2-to-pdf.yaml`

- **title:** FB2 to PDF Converter — Free, Private, No Upload _(47 симв.)_
- **description:** Convert FB2 ebooks to PDF right in your browser: cover, each chapter on a new page, illustrations. .fb2.zip works too. Free and no uploads. _(139 симв.)_
- **H1:** FB2 to PDF Converter
- **Подзаголовок:** FB2 books as PDF for printing, computers and tablets. Free, no sign-up.
- **Хлебные крошки:** FB2 to PDF
- **Карточка:** FB2 → PDF — FB2 books, as PDF for printing and reading on a computer.
- **JSON-LD:** FB2 to PDF Converter — An online FB2 to PDF ebook converter that runs in your browser without uploading your files.

**How to convert FB2 to PDF**

1. Click the box above or drag your FB2 books onto it — you can add many at once.
2. Wait a moment while your browser converts the book. Nothing gets uploaded.
3. Download each PDF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your books stay with you.** Conversion runs on your device. Files are never uploaded, so nobody but you can see them.
- **Chapters on new pages.** A title page with the cover, title and authors, then the chapters — each on a new page, with headings and illustrations.
- **Selectable text.** The text stays text: you can select, search and copy it, Cyrillic included.
- **Many books at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert FB2 to PDF?** A PDF opens on any computer, tablet or phone without a reader app and prints the same everywhere.
- **What does the PDF look like?** A4 pages: a title page with the cover, title and authors, then the chapters — each starting on a new page. The text is selectable and searchable, and illustrations stay in place.
- **Do .fb2.zip files work?** Yes. FB2 books are often shared as ZIP archives — the converter finds the file inside. The encoding is detected automatically too, including windows-1251 used by older books.
- **Where are the footnotes?** Footnotes from the FB2 are collected into a separate chapter at the end of the book.
- **What happens to images?** The cover and illustrations in JPEG and PNG come through. Images in other formats are poorly supported by readers, so they are skipped and the file's row shows a warning.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your book is processed in your browser and never sent to a server.

### epub-to-pdf

#### Русский — `/epub-v-pdf`

Файл: `src/content/tools/ru/epub-to-pdf.yaml`

- **title:** EPUB в PDF онлайн — бесплатно, без загрузки на сервер _(53 симв.)_
- **description:** Конвертируйте книги EPUB в PDF прямо в браузере: обложка, главы с новой страницы, иллюстрации. Бесплатно, без регистрации и загрузки на сервер. _(143 симв.)_
- **H1:** Конвертер EPUB в PDF
- **Подзаголовок:** Книги EPUB — в PDF для печати, компьютера и планшета. Бесплатно, без регистрации.
- **Хлебные крошки:** EPUB в PDF
- **Карточка:** EPUB → PDF — Книги EPUB — в PDF для печати и чтения на компьютере.
- **JSON-LD:** Конвертер EPUB в PDF — Онлайн-конвертер электронных книг EPUB в PDF, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать EPUB в PDF**

1. Нажмите на область выше или перетащите на неё книги EPUB — можно сразу несколько.
2. Подождите немного: книга конвертируется прямо в браузере и никуда не отправляется.
3. Скачайте PDF по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Книги остаются у вас.** Конвертация выполняется на вашем устройстве. Файлы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Главы с новой страницы.** Титул с обложкой, названием и авторами, затем главы — каждая с новой страницы, с заголовками и иллюстрациями.
- **Кириллица и выделение текста.** Текст набран шрифтом с кириллицей и остаётся текстом: его можно выделять, искать и копировать.
- **Сразу много книг.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить EPUB в PDF?** PDF открывается на любом компьютере и телефоне без читалки, его удобно печатать и отправлять.
- **Как выглядит PDF?** Страницы A4: титул с обложкой, названием и авторами, затем главы — каждая с новой страницы. Текст набран шрифтом с кириллицей, его можно выделять и искать, иллюстрации — на своих местах.
- **Сохранится ли вёрстка книги?** Сохраняются текст и структура: главы, заголовки, абзацы, начертание, списки, цитаты, таблицы и иллюстрации. Оформление из CSS книги — шрифты, отступы, колонки — не переносится: PDF набирается единообразно.
- **Что будет с картинками?** Обложка и иллюстрации в JPEG и PNG переносятся. Картинки в других форматах читалки поддерживают плохо, поэтому они пропускаются, а в строке файла появляется предупреждение.
- **Подойдут ли купленные книги?** Книги с защитой от копирования (DRM) прочитать нельзя. Книги без защиты — из библиотек, личные и большинство бесплатных — конвертируются как обычно.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а книга обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/epub-to-pdf`

Файл: `src/content/tools/en/epub-to-pdf.yaml`

- **title:** EPUB to PDF Converter — Free, Private, No Upload _(48 симв.)_
- **description:** Convert EPUB ebooks to PDF right in your browser: cover, each chapter on a new page, illustrations. Free, no sign-up, and your files never leave your device. _(157 симв.)_
- **H1:** EPUB to PDF Converter
- **Подзаголовок:** EPUB books as PDF for printing, computers and tablets. Free, no sign-up.
- **Хлебные крошки:** EPUB to PDF
- **Карточка:** EPUB → PDF — EPUB books, as PDF for printing and reading on a computer.
- **JSON-LD:** EPUB to PDF Converter — An online EPUB to PDF ebook converter that runs in your browser without uploading your files.

**How to convert EPUB to PDF**

1. Click the box above or drag your EPUB books onto it — you can add many at once.
2. Wait a moment while your browser converts the book. Nothing gets uploaded.
3. Download each PDF separately or grab them all in one ZIP file.

**Why use this converter**

- **Your books stay with you.** Conversion runs on your device. Files are never uploaded, so nobody but you can see them.
- **Chapters on new pages.** A title page with the cover, title and authors, then the chapters — each on a new page, with headings and illustrations.
- **Selectable text.** The text stays text: you can select, search and copy it.
- **Many books at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert EPUB to PDF?** A PDF opens on any computer or phone without a reader app and is easy to print and share.
- **What does the PDF look like?** A4 pages: a title page with the cover, title and authors, then the chapters — each starting on a new page. The text is selectable and searchable, and illustrations stay in place.
- **Is the book's layout kept?** The text and structure are kept: chapters, headings, paragraphs, styling, lists, quotes, tables and illustrations. The book's CSS design — fonts, margins, columns — is not: the PDF is typeset uniformly.
- **What happens to images?** The cover and illustrations in JPEG and PNG come through. Images in other formats are poorly supported by readers, so they are skipped and the file's row shows a warning.
- **Do purchased books work?** Books with copy protection (DRM) can't be read. DRM-free books — from libraries, your own and most free ones — convert as usual.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your book is processed in your browser and never sent to a server.

### fb2-to-txt

#### Русский — `/fb2-v-txt`

Файл: `src/content/tools/ru/fb2-to-txt.yaml`

- **title:** FB2 в TXT онлайн — книга в текстовый файл бесплатно _(51 симв.)_
- **description:** Конвертируйте книги FB2 в обычный текст TXT прямо в браузере: подходят и .fb2.zip. Бесплатно, без регистрации и загрузки на сервер. _(131 симв.)_
- **H1:** Конвертер FB2 в TXT
- **Подзаголовок:** Книга FB2 — в простой текст, который откроется везде. Бесплатно, без регистрации.
- **Хлебные крошки:** FB2 в TXT
- **Карточка:** FB2 → TXT — Книги FB2 — в обычный текстовый файл.
- **JSON-LD:** Конвертер FB2 в TXT — Онлайн-конвертер электронных книг FB2 в TXT, который работает в браузере без загрузки файлов на сервер.

**Как конвертировать FB2 в TXT**

1. Нажмите на область выше или перетащите на неё книги FB2 — можно сразу несколько.
2. Подождите немного: книга конвертируется прямо в браузере и никуда не отправляется.
3. Скачайте TXT по одному или все сразу одним ZIP-архивом.

**Почему здесь**

- **Книги остаются у вас.** Конвертация выполняется на вашем устройстве. Файлы не загружаются на сервер, поэтому их не видит никто, кроме вас.
- **Чистый текст.** Без разметки и картинок: название, авторы, аннотация и главы, разделённые пустыми строками.
- **UTF-8.** Текстовый файл сохраняется в UTF-8 — кириллица читается в любом редакторе.
- **Сразу много книг.** Добавьте до 100 файлов за раз и скачайте результат одним ZIP-архивом.

**Частые вопросы**

- **Зачем переводить FB2 в TXT?** Обычный текст открывается в любом редакторе и на любом устройстве, его удобно искать, анализировать и загружать в программы, которые не понимают FB2.
- **Что попадёт в TXT?** Название, авторы, аннотация, заголовки глав, абзацы, эпиграфы, стихи и примечания. Картинки и оформление в обычный текст не переносятся.
- **В какой кодировке файл?** В UTF-8. Исходная книга может быть в любой кодировке — она определяется сама.
- **Подойдут ли файлы .fb2.zip?** Да. Книги FB2 часто раздают в ZIP-архиве — конвертер сам найдёт файл внутри. Кодировка тоже определяется сама, в том числе windows-1251 у старых книг.
- **Можно ли конвертировать несколько книг?** Да, до 100 файлов за раз. Готовые книги можно скачать по одной или все сразу одним ZIP-архивом.
- **Безопасно ли это?** Да. С сайта загружается только сам конвертер, а книга обрабатывается в вашем браузере и не отправляется на сервер.

#### English — `/en/fb2-to-txt`

Файл: `src/content/tools/en/fb2-to-txt.yaml`

- **title:** FB2 to TXT Converter — Ebook to Plain Text, Free _(48 симв.)_
- **description:** Convert FB2 ebooks to plain TXT text right in your browser; .fb2.zip works too. Free, no sign-up, and your files never leave your device. _(137 симв.)_
- **H1:** FB2 to TXT Converter
- **Подзаголовок:** An FB2 book as plain text that opens anywhere. Free, no sign-up.
- **Хлебные крошки:** FB2 to TXT
- **Карточка:** FB2 → TXT — FB2 books, as a plain text file.
- **JSON-LD:** FB2 to TXT Converter — An online FB2 to TXT ebook converter that runs in your browser without uploading your files.

**How to convert FB2 to TXT**

1. Click the box above or drag your FB2 books onto it — you can add many at once.
2. Wait a moment while your browser converts the book. Nothing gets uploaded.
3. Download each TXT separately or grab them all in one ZIP file.

**Why use this converter**

- **Your books stay with you.** Conversion runs on your device. Files are never uploaded, so nobody but you can see them.
- **Clean text.** No markup or images: title, authors, description and chapters separated by blank lines.
- **UTF-8.** The text file is saved as UTF-8, so Cyrillic reads correctly in any editor.
- **Many books at once.** Add up to 100 files at a time and download the results as one ZIP.

**Frequently asked questions**

- **Why convert FB2 to TXT?** Plain text opens in any editor on any device and is easy to search, analyze or load into apps that don't understand FB2.
- **What goes into the TXT?** Title, authors, description, chapter headings, paragraphs, epigraphs, poems and footnotes. Images and formatting don't carry over to plain text.
- **Which encoding is the file in?** UTF-8. The original book can use any encoding — it's detected automatically.
- **Do .fb2.zip files work?** Yes. FB2 books are often shared as ZIP archives — the converter finds the file inside. The encoding is detected automatically too, including windows-1251 used by older books.
- **Can I convert several books?** Yes, up to 100 files at once. Download them one by one or all together in a single ZIP file.
- **Is it safe?** Yes. Only the converter itself is loaded from the site; your book is processed in your browser and never sent to a server.

## Страницы разделов

### images — `/konverter-izobrazhenij`, `/en/image-converter`

#### Русский

Файл: `src/content/pages/ru/category-images.yaml`

- **category:** images
- **title:** Конвертер изображений онлайн — HEIC, JPG, PNG, WebP, AVIF _(57 симв.)_
- **description:** Бесплатный конвертер изображений в браузере: HEIC, JPG, PNG, WebP, AVIF, GIF, BMP, TIFF и JPEG XL в JPG, PNG, WebP, AVIF или ICO. Без регистрации и загрузки на сервер. _(167 симв.)_
- **h1:** Конвертер изображений
- **subtitle:** HEIC, JPG, PNG, WebP, AVIF, GIF, BMP, TIFF и JPEG XL — в нужный формат прямо в браузере.
- **breadcrumb:** Конвертер изображений
- **menu:** Конвертер изображений
- **toolsTitle:** Конвертеры изображений
- **intro:** Фото с iPhone в HEIC, картинки с сайтов в WebP и AVIF, сканы в TIFF — всё переводится в JPG, PNG, WebP, AVIF или иконку ICO. Цветовой профиль переносится, поворот по EXIF применяется, а метаданные можно сохранить или оставить только дату съёмки.
- **Частые вопросы:**
  - **Какие форматы поддерживаются?** На входе — HEIC и HEIF, AVIF, JPG, PNG, WebP, GIF, BMP, TIFF и JPEG XL. На выходе — JPG, PNG, WebP, AVIF, ICO, а ещё PDF: каждую картинку можно сохранить отдельным документом.
  - **Что будет с качеством?** JPG, WebP и AVIF сжимают с потерями — качество настраивается ползунком, по умолчанию 90. PNG сохраняет каждый пиксель без потерь.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Это бесплатно?** Да, без регистрации и без ограничений по числу конвертаций. За раз можно добавить до 100 файлов.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-images.yaml`

- **category:** images
- **title:** Image Converter Online — HEIC, JPG, PNG, WebP, AVIF _(51 симв.)_
- **description:** Free image converter in your browser: HEIC, JPG, PNG, WebP, AVIF, GIF, BMP, TIFF and JPEG XL to JPG, PNG, WebP, AVIF or ICO. No sign-up, no uploads. _(148 симв.)_
- **h1:** Image Converter
- **subtitle:** HEIC, JPG, PNG, WebP, AVIF, GIF, BMP, TIFF and JPEG XL — to the format you need, right in your browser.
- **breadcrumb:** Image Converter
- **menu:** Image converter
- **toolsTitle:** Image converters
- **intro:** iPhone photos in HEIC, web images in WebP and AVIF, scans in TIFF — everything converts to JPG, PNG, WebP, AVIF or an ICO icon. The color profile is kept, EXIF rotation is applied, and you can keep all metadata or just the capture date.
- **Frequently asked questions:**
  - **Which formats are supported?** Input: HEIC and HEIF, AVIF, JPG, PNG, WebP, GIF, BMP, TIFF and JPEG XL. Output: JPG, PNG, WebP, AVIF, ICO — plus PDF, saving each image as its own document.
  - **What about quality?** JPG, WebP and AVIF are lossy — set the quality with the slider, 90 by default. PNG keeps every pixel without loss.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Is it free?** Yes, with no sign-up and no limit on conversions. You can add up to 100 files at a time.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### photo — `/obrabotka-foto`, `/en/photo-tools`

#### Русский

Файл: `src/content/pages/ru/category-photo.yaml`

- **category:** photo
- **title:** Обработка фото онлайн — сжать, изменить размер, убрать EXIF _(59 симв.)_
- **description:** Бесплатные инструменты для фото в браузере: сжатие до нужного размера, изменение размера, удаление и просмотр метаданных. Без регистрации и загрузки на сервер. _(159 симв.)_
- **h1:** Обработка фото
- **subtitle:** Сжатие, изменение размера и метаданные — формат файла остаётся прежним.
- **breadcrumb:** Обработка фото
- **menu:** Обработка фото
- **toolsTitle:** Инструменты для фото
- **intro:** Уменьшите вес фото для почты и сайта — по качеству или до нужного размера в КБ и МБ, — подгоните размер под соцсети, уберите геолокацию и модель телефона перед публикацией или посмотрите, что записано в EXIF. Всё работает прямо в браузере.
- **Частые вопросы:**
  - **Чем сжатие отличается от изменения размера?** Сжатие уменьшает вес файла, не меняя число пикселей: подбирается качество. Изменение размера уменьшает само изображение — например, до 1920 точек по длинной стороне.
  - **Что такое метаданные фото?** Сведения, которые камера записывает в файл: дата и время, модель телефона, настройки съёмки и часто геолокация. Перед публикацией их стоит удалить.
  - **Это бесплатно?** Да, без регистрации и без ограничений по числу конвертаций. За раз можно добавить до 100 файлов.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-photo.yaml`

- **category:** photo
- **title:** Photo Tools Online — Compress, Resize, Remove EXIF _(50 симв.)_
- **description:** Free photo tools in your browser: compress to a target size, resize, remove or view metadata. No sign-up and no uploads. _(120 симв.)_
- **h1:** Photo Tools
- **subtitle:** Compression, resizing and metadata — the file keeps its format.
- **breadcrumb:** Photo Tools
- **menu:** Photo tools
- **toolsTitle:** Photo tools
- **intro:** Shrink photos for email and websites — by quality or to a target size in KB or MB — resize them for social media, strip the location and phone model before sharing, or see what's recorded in EXIF. Everything runs right in your browser.
- **Frequently asked questions:**
  - **How is compressing different from resizing?** Compression lowers the file size without changing the pixel count by picking the quality. Resizing makes the image itself smaller — for example, 1920 pixels on the long side.
  - **What is photo metadata?** Information the camera writes into the file: date and time, phone model, shooting settings and often the location. It's worth removing before you post a photo.
  - **Is it free?** Yes, with no sign-up and no limit on conversions. You can add up to 100 files at a time.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### pdf — `/instrumenty-pdf`, `/en/pdf-tools`

#### Русский

Файл: `src/content/pages/ru/category-pdf.yaml`

- **category:** pdf
- **title:** Инструменты PDF онлайн — картинки в PDF, PDF в JPG, объединение _(63 симв.)_
- **description:** Бесплатные инструменты PDF в браузере: картинки в PDF, страницы PDF в JPG и PNG, объединение PDF. Без регистрации и загрузки на сервер. _(135 симв.)_
- **h1:** Инструменты PDF
- **subtitle:** Картинки в PDF, страницы PDF в картинки и объединение документов.
- **breadcrumb:** Инструменты PDF
- **menu:** Инструменты PDF
- **toolsTitle:** Инструменты PDF
- **intro:** Соберите фото и сканы в один PDF или сохраните каждую картинку отдельным документом, превратите страницы PDF в JPG или PNG с нужным разрешением, объедините несколько PDF в один. Документы не покидают ваше устройство.
- **Частые вопросы:**
  - **Как собрать несколько картинок в один PDF?** Откройте «JPG в PDF», добавьте файлы и расставьте их стрелками — каждая картинка станет страницей. Здесь же каждая картинка превращается в свой отдельный PDF.
  - **Можно ли открыть PDF с паролем?** Нет: документы с паролем не открываются, в строке файла появится сообщение об этом.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-pdf.yaml`

- **category:** pdf
- **title:** PDF Tools Online — Images to PDF, PDF to JPG, Merge PDF _(55 симв.)_
- **description:** Free PDF tools in your browser: images to PDF, PDF pages to JPG and PNG, merging PDFs. No sign-up and no uploads. _(113 симв.)_
- **h1:** PDF Tools
- **subtitle:** Images to PDF, PDF pages to images and merging documents.
- **breadcrumb:** PDF Tools
- **menu:** PDF tools
- **toolsTitle:** PDF tools
- **intro:** Put photos and scans into one PDF or save each image as its own document, turn PDF pages into JPG or PNG at the resolution you need, and merge several PDFs into one. Your documents never leave your device.
- **Frequently asked questions:**
  - **How do I put several images into one PDF?** Open “JPG to PDF”, add your files and order them with the arrows — each image becomes a page. On this page, each image becomes its own separate PDF.
  - **Can I open a password-protected PDF?** No: password-protected documents can't be opened, and the file's row will say so.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### audio — `/konverter-audio`, `/en/audio-converter`

#### Русский

Файл: `src/content/pages/ru/category-audio.yaml`

- **category:** audio
- **title:** Конвертер аудио онлайн — MP3, WAV, M4A, OGG, FLAC _(49 симв.)_
- **description:** Бесплатный аудиоконвертер в браузере: MP3, WAV, M4A, OGG, FLAC, Opus и AAC друг в друга, звук из видео в MP3. Без регистрации и загрузки на сервер. _(147 симв.)_
- **h1:** Конвертер аудио
- **subtitle:** MP3, WAV, M4A, OGG и FLAC — и звук из видео — прямо в браузере.
- **breadcrumb:** Конвертер аудио
- **menu:** Конвертер аудио
- **toolsTitle:** Конвертеры аудио
- **intro:** Переводите музыку, голосовые сообщения и записи диктофона между MP3, WAV, M4A, OGG и FLAC, извлекайте звук из видео. Битрейт — от 128 до 320 кбит/с, теги (название, исполнитель, альбом) переносятся, а если кодек тот же — звук копируется без перекодирования.
- **Частые вопросы:**
  - **Какие форматы поддерживаются?** На входе — MP3, WAV, FLAC, OGG, Opus, AAC, M4A, а ещё звук из видео MP4, MOV, WebM и MKV. На выходе — MP3, WAV, M4A, OGG (Opus) и FLAC.
  - **Какой битрейт выбрать?** 192 кбит/с — хороший выбор для музыки, 320 кбит/с — максимум для MP3. Для речи и подкастов хватит 128 кбит/с.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-audio.yaml`

- **category:** audio
- **title:** Audio Converter Online — MP3, WAV, M4A, OGG, FLAC _(49 симв.)_
- **description:** Free audio converter in your browser: MP3, WAV, M4A, OGG, FLAC, Opus and AAC to each other, audio from video to MP3. No sign-up, no uploads. _(140 симв.)_
- **h1:** Audio Converter
- **subtitle:** MP3, WAV, M4A, OGG and FLAC — and audio from video — right in your browser.
- **breadcrumb:** Audio Converter
- **menu:** Audio converter
- **toolsTitle:** Audio converters
- **intro:** Convert music, voice messages and voice memos between MP3, WAV, M4A, OGG and FLAC, or extract the audio from a video. Bitrate from 128 to 320 kbps, tags (title, artist, album) are kept, and when the codec is the same the audio is copied without re-encoding.
- **Frequently asked questions:**
  - **Which formats are supported?** Input: MP3, WAV, FLAC, OGG, Opus, AAC, M4A, plus the audio of MP4, MOV, WebM and MKV videos. Output: MP3, WAV, M4A, OGG (Opus) and FLAC.
  - **Which bitrate should I pick?** 192 kbps is a good choice for music and 320 kbps is the MP3 maximum. For speech and podcasts, 128 kbps is plenty.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### video — `/konverter-video`, `/en/video-converter`

#### Русский

Файл: `src/content/pages/ru/category-video.yaml`

- **category:** video
- **title:** Конвертер видео онлайн — MOV, MKV, WebM в MP4, видео в GIF _(58 симв.)_
- **description:** Бесплатный видеоконвертер в браузере: MOV, MKV и WebM в MP4, MP4 в WebM, видео в GIF и звук из видео. Без регистрации и загрузки на сервер. _(139 симв.)_
- **h1:** Конвертер видео
- **subtitle:** MOV, MKV и WebM в MP4, MP4 в WebM и видео в GIF — прямо в браузере.
- **breadcrumb:** Конвертер видео
- **menu:** Конвертер видео
- **toolsTitle:** Конвертеры видео
- **intro:** Видео с iPhone и камер, записи экрана и фильмы переводятся в MP4 (H.264 и AAC) или WebM (VP9 и Opus) с нужным качеством и размером кадра, короткие ролики — в GIF. Если кодеки подходят, видео перепаковывается за секунды и без потерь.
- **Частые вопросы:**
  - **Какие форматы поддерживаются?** На входе — MP4, MOV, WebM и MKV. На выходе — MP4, WebM и GIF, а ещё звук в MP3, WAV, M4A, OGG и FLAC.
  - **Почему конвертация идёт долго?** Видео перекодируется прямо на вашем устройстве встроенными кодеками браузера. Минута видео обрабатывается от десятков секунд до нескольких минут; MOV и MKV с H.264 перепаковываются в MP4 за секунды.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-video.yaml`

- **category:** video
- **title:** Video Converter Online — MOV, MKV, WebM to MP4, Video to GIF _(60 симв.)_
- **description:** Free video converter in your browser: MOV, MKV and WebM to MP4, MP4 to WebM, video to GIF and audio from video. No sign-up, no uploads. _(135 симв.)_
- **h1:** Video Converter
- **subtitle:** MOV, MKV and WebM to MP4, MP4 to WebM and video to GIF — right in your browser.
- **breadcrumb:** Video Converter
- **menu:** Video converter
- **toolsTitle:** Video converters
- **intro:** iPhone and camera videos, screen recordings and movies convert to MP4 (H.264 and AAC) or WebM (VP9 and Opus) at the quality and frame size you pick, and short clips become GIFs. When the codecs fit, the video is repackaged in seconds without loss.
- **Frequently asked questions:**
  - **Which formats are supported?** Input: MP4, MOV, WebM and MKV. Output: MP4, WebM and GIF, plus audio as MP3, WAV, M4A, OGG and FLAC.
  - **Why does it take a while?** Video is re-encoded right on your device with the browser's built-in codecs. A minute of video takes from tens of seconds to a few minutes; MOV and MKV with H.264 are repackaged into MP4 in seconds.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### documents — `/konverter-dokumentov`, `/en/document-converter`

#### Русский

Файл: `src/content/pages/ru/category-documents.yaml`

- **category:** documents
- **title:** Конвертер документов онлайн — TXT, Markdown, HTML в PDF, CSV в Excel _(68 симв.)_
- **description:** Бесплатный конвертер документов в браузере: TXT, Markdown и HTML в PDF, Markdown в HTML, CSV, Excel XLSX и JSON друг в друга. Без загрузки на сервер. _(149 симв.)_
- **h1:** Конвертер документов
- **subtitle:** Текст в PDF и таблицы CSV, Excel и JSON друг в друга — прямо в браузере.
- **breadcrumb:** Конвертер документов
- **menu:** Конвертер документов
- **toolsTitle:** Конвертеры документов
- **intro:** Текстовые файлы, заметки в Markdown и сохранённые веб-страницы превращаются в аккуратный PDF с кириллицей, Markdown — в готовую HTML-страницу. Таблицы CSV, Excel и JSON переводятся друг в друга: разделитель и кодировка определяются сами, числа остаются числами.
- **Частые вопросы:**
  - **Какие форматы поддерживаются?** Текст: TXT, Markdown и HTML — в PDF, Markdown — и в HTML, HTML — и в TXT. Таблицы: CSV (и TSV), Excel XLSX и JSON — друг в друга.
  - **А документы Word?** Пока нет: чтобы точно перенести вёрстку DOCX в PDF, нужен целый офисный пакет. Если документ можно сохранить как HTML или TXT, сконвертируйте его в PDF здесь.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-documents.yaml`

- **category:** documents
- **title:** Document Converter Online — TXT, Markdown, HTML to PDF, CSV to Excel _(68 симв.)_
- **description:** Free document converter in your browser: TXT, Markdown and HTML to PDF, Markdown to HTML, and CSV, Excel XLSX and JSON to each other. No uploads. _(145 симв.)_
- **h1:** Document Converter
- **subtitle:** Text to PDF, and CSV, Excel and JSON tables to each other — right in your browser.
- **breadcrumb:** Document Converter
- **menu:** Document converter
- **toolsTitle:** Document converters
- **intro:** Text files, Markdown notes and saved web pages become clean PDFs, and Markdown becomes a ready-to-use HTML page. CSV, Excel and JSON tables convert into each other: the delimiter and encoding are detected automatically, and numbers stay numbers.
- **Frequently asked questions:**
  - **Which formats are supported?** Text: TXT, Markdown and HTML to PDF, Markdown to HTML too, HTML to TXT too. Tables: CSV (and TSV), Excel XLSX and JSON to each other.
  - **What about Word documents?** Not yet: faithfully turning DOCX layout into PDF takes a whole office suite. If you can save the document as HTML or TXT, convert it to PDF here.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

### ebooks — `/konverter-elektronnyh-knig`, `/en/ebook-converter`

#### Русский

Файл: `src/content/pages/ru/category-ebooks.yaml`

- **category:** ebooks
- **title:** Конвертер электронных книг онлайн — FB2, EPUB, PDF _(50 симв.)_
- **description:** Бесплатный конвертер электронных книг в браузере: FB2 в EPUB и обратно, FB2 и EPUB в PDF, FB2 в TXT. Без регистрации и загрузки на сервер. _(138 симв.)_
- **h1:** Конвертер электронных книг
- **subtitle:** FB2 и EPUB друг в друга, в PDF и в обычный текст — прямо в браузере.
- **breadcrumb:** Конвертер электронных книг
- **menu:** Конвертер электронных книг
- **toolsTitle:** Конвертеры электронных книг
- **intro:** Книги из русскоязычных библиотек в FB2 открываются на iPhone, Android и Kindle после перевода в EPUB, а EPUB — в читалках, которые любят FB2. Обложка, авторы, аннотация, главы, иллюстрации и примечания переносятся; книгу можно сохранить и в PDF для печати.
- **Частые вопросы:**
  - **Какие форматы поддерживаются?** На входе — FB2 (в том числе .fb2.zip) и EPUB. На выходе — EPUB, FB2, PDF и TXT.
  - **Подойдут ли купленные книги?** Книги с защитой от копирования (DRM) прочитать нельзя. Книги без защиты — из библиотек, личные и бесплатные — конвертируются как обычно.
  - **Как пользоваться?** Выберите файлы или перетащите их на страницу, затем у каждого файла выберите формат — или сразу для всех. Готовые файлы можно скачать по одному или одним ZIP-архивом.
  - **Файлы загружаются на сервер?** Нет. Конвертер работает прямо в браузере: файлы обрабатываются на вашем устройстве и никуда не отправляются.

#### English

Файл: `src/content/pages/en/category-ebooks.yaml`

- **category:** ebooks
- **title:** eBook Converter Online — FB2, EPUB, PDF _(39 симв.)_
- **description:** Free ebook converter in your browser: FB2 to EPUB and back, FB2 and EPUB to PDF, FB2 to TXT. No sign-up and no uploads. _(119 симв.)_
- **h1:** eBook Converter
- **subtitle:** FB2 and EPUB to each other, to PDF and to plain text — right in your browser.
- **breadcrumb:** eBook Converter
- **menu:** eBook converter
- **toolsTitle:** eBook converters
- **intro:** FB2 books from Russian-language libraries open on iPhone, Android and Kindle once converted to EPUB, and EPUB books open in readers that prefer FB2. Cover, authors, description, chapters, illustrations and footnotes come through, and you can also save a book as PDF for printing.
- **Frequently asked questions:**
  - **Which formats are supported?** Input: FB2 (including .fb2.zip) and EPUB. Output: EPUB, FB2, PDF and TXT.
  - **Do purchased books work?** Books with copy protection (DRM) can't be read. DRM-free books — from libraries, your own and free ones — convert as usual.
  - **How does it work?** Pick files or drop them onto the page, then choose a format for each file — or one for all of them. Download the results one by one or as a single ZIP.
  - **Are my files uploaded?** No. The converter runs right in your browser: files are processed on your device and never sent anywhere.

## Другие страницы

### Главная

#### Русский

Файл: `src/content/pages/ru/home.yaml`

- **title:** Конвертер файлов онлайн — фото, PDF, аудио и видео в браузере _(61 симв.)_
- **description:** Бесплатный онлайн-конвертер файлов: изображения HEIC, JPG, PNG, WebP, PDF, аудио MP3, WAV, M4A, видео MP4, MOV и GIF. Без регистрации и загрузки на сервер. _(155 симв.)_
- **h1:** Конвертер файлов онлайн
- **subtitle:** Выберите файлы, затем формат — конвертация идёт прямо в браузере. Бесплатно, без регистрации и без загрузки на сервер.
- **intro:** Здесь собраны конвертеры для разных типов файлов: изображения переводятся между HEIC, AVIF, JPG, PNG, WebP и другими форматами, PDF — в картинки и обратно, аудио — между MP3, WAV, M4A, OGG и FLAC, видео — в MP4, WebM и GIF, а из видео можно извлечь звук. Тексты TXT, Markdown и HTML превращаются в PDF, таблицы CSV, Excel и JSON — друг в друга, электронные книги FB2 и EPUB — друг в друга и в PDF. Для фото есть сжатие до нужного размера, изменение размера, просмотр и удаление метаданных. Всё работает на вашем устройстве: файлы не загружаются на сервер.
- **sections:**
  - **images:** Изображения — Конвертеры между HEIC, AVIF, JPG, PNG, WebP, GIF, BMP, TIFF, JPEG XL и ICO.
  - **photo:** Обработка фото — Сжатие, изменение размера и метаданные — формат файла остаётся прежним.
  - **pdf:** PDF — Картинки в PDF, страницы PDF в картинки и объединение документов.
  - **audio:** Аудио — MP3, WAV, M4A, OGG и FLAC — в том числе звук из видео.
  - **video:** Видео — MOV, WebM и MKV в MP4, MP4 в WebM и видео в GIF.
  - **documents:** Документы — TXT, Markdown и HTML в PDF, Markdown в HTML, таблицы CSV, Excel и JSON друг в друга.
  - **ebooks:** Электронные книги — FB2 и EPUB друг в друга, в PDF и в обычный текст.
- **featuresTitle:** Почему здесь
- **features:**
  - **Без загрузки на сервер.** Файлы обрабатываются прямо в браузере и не покидают ваше устройство.
  - **Все популярные форматы.** Изображения, PDF, документы, таблицы и книги FB2 и EPUB, аудио MP3, WAV, M4A, FLAC и видео MP4, MOV, WebM.
  - **Много файлов сразу.** До 100 файлов за раз, скачать можно одним ZIP-архивом.
  - **Метаданные под контролем.** По умолчанию дата съёмки сохраняется, а геолокация удаляется.
  - **Без регистрации.** Откройте сайт и сразу выберите файлы.
  - **Бесплатно.** Конвертируйте столько файлов, сколько нужно.

#### English

Файл: `src/content/pages/en/home.yaml`

- **title:** Free Online File Converter — Images, PDF, Audio and Video _(57 симв.)_
- **description:** Free online file converter: HEIC, JPG, PNG, WebP images, PDF, MP3, WAV, M4A audio, MP4, MOV and GIF video. No sign-up, no uploads — it all runs in your browser. _(160 симв.)_
- **h1:** Online file converter
- **subtitle:** Pick your files, then a format — conversion runs right in your browser. Free, no sign-up, no uploads.
- **intro:** Converters for different kinds of files in one place: images between HEIC, AVIF, JPG, PNG, WebP and other formats, PDFs to images and back, audio between MP3, WAV, M4A, OGG and FLAC, video to MP4, WebM and GIF, plus audio extracted from video. TXT, Markdown and HTML become PDFs, CSV, Excel and JSON tables convert into each other, and FB2 and EPUB ebooks convert into each other and to PDF. For photos there is compression to a target size, resizing, and viewing or removing metadata. Everything happens on your device: files are never uploaded.
- **sections:**
  - **images:** Images — Converters between HEIC, AVIF, JPG, PNG, WebP, GIF, BMP, TIFF, JPEG XL and ICO.
  - **photo:** Photo tools — Compression, resizing and metadata — the file keeps its format.
  - **pdf:** PDF — Images to PDF, PDF pages to images and merging documents.
  - **audio:** Audio — MP3, WAV, M4A, OGG and FLAC — including audio from video.
  - **video:** Video — MOV, WebM and MKV to MP4, MP4 to WebM, and video to GIF.
  - **documents:** Documents — TXT, Markdown and HTML to PDF, Markdown to HTML, and CSV, Excel and JSON tables to each other.
  - **ebooks:** eBooks — FB2 and EPUB to each other, to PDF and to plain text.
- **featuresTitle:** Why use it
- **features:**
  - **No uploads.** Files are processed right in your browser and never leave your device.
  - **All the popular formats.** Images, PDFs, documents, spreadsheets and FB2 and EPUB ebooks, MP3, WAV, M4A and FLAC audio, and MP4, MOV and WebM video.
  - **Many files at once.** Up to 100 files per batch, downloaded as a single ZIP if you like.
  - **Metadata under control.** By default the capture date is kept and the location is removed.
  - **No sign-up.** Open the site and pick your files — that's it.
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
- **lgpl:** libheif и libde265 распространяются по лицензии GNU LGPL версии 3. Они загружаются в браузер отдельным модулем WebAssembly без изменений; исходный код этих версий доступен по ссылкам в таблице, полные тексты GNU LGPL и GNU GPL (на которую LGPL ссылается) приведены ниже. Так же, отдельными неизменёнными модулями, загружаются кодировщики MP3 (LAME, GNU LGPL 2.0) и AAC (FFmpeg, GNU LGPL 2.1) — только при выборе этих форматов; их обёртки и библиотека Mediabunny распространяются по Mozilla Public License 2.0, исходный код — по ссылкам в таблице.
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
- **lgpl:** libheif and libde265 are distributed under the GNU LGPL version 3. They are loaded into your browser unmodified as a separate WebAssembly module; the source code of these exact versions is linked in the table, and the full texts of the GNU LGPL and the GNU GPL (which the LGPL refers to) are included below. In the same way, as separate unmodified modules, the MP3 (LAME, GNU LGPL 2.0) and AAC (FFmpeg, GNU LGPL 2.1) encoders are loaded — only when you pick those formats; their wrappers and the Mediabunny library are distributed under the Mozilla Public License 2.0, with source code linked in the table.
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
| `nav.convert` | Конвертировать | Convert |
| `nav.allTools` | Все инструменты | All tools |
| `nav.groups.images` | Изображения | Images |
| `nav.groups.photo` | Обработка фото | Photo tools |
| `nav.groups.pdf` | PDF | PDF |
| `nav.groups.audio` | Аудио | Audio |
| `nav.groups.video` | Видео | Video |
| `nav.groups.documents` | Документы | Documents |
| `nav.groups.ebooks` | Электронные книги | eBooks |
| `nav.groups.about` | О сайте | About |
| `footer.privacy` | Файлы обрабатываются прямо в браузере и никуда не загружаются. | Files are processed right in your browser and never uploaded anywhere. |
| `tool.relatedTitle` | Другие конвертеры | More converters |
| `widget.dropTitle` | Выберите {format}-файлы | Choose {format} files |
| `widget.dropTitleAny` | Выберите изображения | Choose images |
| `widget.dropTitleUniversal` | Выберите файлы | Choose files |
| `widget.originalFormat` | Исходный | Original |
| `widget.icoHint` | В иконку войдут размеры от 16 до 256 пикселей (не больше исходника); прямоугольная картинка впишется в квадрат с прозрачными полями. Метаданные в ICO не сохраняются. | The icon gets sizes from 16 to 256 pixels (no larger than the original); a non-square image is fitted into a square with transparent margins. ICO keeps no metadata. |
| `widget.avifHint` | AVIF кодируется заметно дольше других форматов: большой снимок — десятки секунд. | AVIF takes much longer to encode than other formats: tens of seconds for a large photo. |
| `widget.targetTo` | в | to |
| `widget.chooseTarget` | Выбрать | Choose |
| `widget.targetLabel` | {target} — формат для {name} | {target} — format for {name} |
| `widget.allTo` | Все файлы в | All files to |
| `widget.allLabel` | {target} — формат для всех файлов | {target} — format for all files |
| `widget.targetMenu` | Формат результата | Output format |
| `widget.targetGroups.image` | Изображение | Image |
| `widget.targetGroups.document` | Документ | Document |
| `widget.targetGroups.table` | Таблица | Spreadsheet |
| `widget.targetGroups.book` | Книга | eBook |
| `widget.targetGroups.video` | Видео | Video |
| `widget.targetGroups.audio` | Аудио | Audio |
| `widget.pdfCombineHint` | Каждая картинка станет отдельным PDF. Один документ из нескольких картинок — | Each image becomes its own PDF. For one document from several images, use |
| `widget.pdfCombineLink` | «JPG в PDF» | JPG to PDF |
| `widget.waiting` | Выберите формат | Choose a format |
| `widget.sameFormat` | Файл уже в формате {target}. | The file is already in {target} format. |
| `widget.waitingStatus` | Ждут выбора формата: {count}. | Waiting for a format: {count}. |
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
| `widget.stripWhat` | Удалить | Remove |
| `widget.stripModes.all` | Все метаданные | All metadata |
| `widget.stripModes.keep-dates` | Всё, кроме даты | All but the date |
| `widget.stripModes.location` | Только геолокацию | Location only |
| `widget.stripHints.all` | Ориентация и цветовой профиль остаются: без них снимок покажется иначе. Само изображение не перекодируется. | Orientation and the color profile stay: without them the photo would look different. The image itself isn't re-encoded. |
| `widget.stripHints.keep-dates` | Останутся дата и время съёмки — по ним галерея расставит снимки по порядку. | The capture date and time stay, so galleries keep your photos in order. |
| `widget.stripHints.location` | Координаты удаляются из EXIF, а блоки XMP и IPTC — целиком: в них тоже бывает место съёмки. Камера и дата остаются. | Coordinates are removed from EXIF, and XMP and IPTC blocks entirely: they can hold the location too. Camera and date stay. |
| `widget.removed` | Удалено: {list}. | Removed: {list}. |
| `widget.nothingFound` | Метаданных не найдено — файл не изменён. | No metadata found — the file is unchanged. |
| `widget.removedKinds.location` | геолокация | location |
| `widget.removedKinds.camera` | камера и объектив | camera and lens |
| `widget.removedKinds.serial` | серийные номера | serial numbers |
| `widget.removedKinds.author` | автор и подписи | author and captions |
| `widget.removedKinds.dates` | дата съёмки | capture date |
| `widget.removedKinds.settings` | параметры съёмки | shooting settings |
| `widget.removedKinds.software` | программы | software |
| `widget.removedKinds.makernote` | служебные данные камеры | camera maker data |
| `widget.removedKinds.thumbnail` | встроенная миниатюра | embedded thumbnail |
| `widget.removedKinds.exif` | прочие данные EXIF | other EXIF data |
| `widget.removedKinds.xmp` | XMP | XMP |
| `widget.removedKinds.iptc` | IPTC | IPTC |
| `widget.removedKinds.comment` | комментарии | comments |
| `widget.removedKinds.text` | текстовые поля | text fields |
| `widget.removedKinds.extra-images` | дополнительные изображения (HDR, глубина, видео) | extra images (HDR, depth, video) |
| `widget.removedKinds.c2pa` | Content Credentials | Content Credentials |
| `widget.removedKinds.other` | прочие служебные данные | other service data |
| `widget.pageSize` | Страница | Page |
| `widget.pageSizes.a4` | A4 | A4 |
| `widget.pageSizes.letter` | Letter | Letter |
| `widget.pageSizes.image` | По размеру фото | Fit to image |
| `widget.margin` | Поля | Margins |
| `widget.margins.none` | Без полей | None |
| `widget.margins.small` | Узкие | Small |
| `widget.pdfHint` | JPG попадают в PDF без перекодирования, остальные форматы — в высоком качестве. Метаданные фото (геолокация, камера) в документ не попадают. | JPGs go into the PDF without re-encoding, other formats in high quality. Photo metadata (location, camera) is left out. |
| `widget.downloadPdf` | Скачать PDF | Download PDF |
| `widget.mergePdf` | Объединить PDF | Merge PDFs |
| `widget.mergeHint` | Документы объединятся в том порядке, в котором стоят в списке. Порядок меняют стрелки у файлов. | Documents are merged in the order of the list. Use the arrows on the files to change it. |
| `widget.mergeFailed` | Не удалось объединить PDF. Попробуйте ещё раз или уберите файл, на котором возникает ошибка. | Couldn't merge the PDFs. Try again or remove the file that causes the error. |
| `widget.pdfPreparing` | Собираем PDF… | Creating PDF… |
| `widget.pdfFailed` | Не удалось собрать PDF. Попробуйте ещё раз. | Couldn't create the PDF. Please try again. |
| `widget.pageNumber` | Стр. {number} | Page {number} |
| `widget.passthrough` | без перекодирования | not re-encoded |
| `widget.resolution` | Разрешение | Resolution |
| `widget.dpi` | {value} dpi | {value} dpi |
| `widget.pdfRenderHint` | Страницы сохраняются картинками на белом фоне: 150 dpi — для экрана и почты, 300 dpi — для печати. | Pages are saved as images on a white background: 150 dpi for screens and email, 300 dpi for printing. |
| `widget.pdfPages` | PDF · страниц: {count} | PDF · pages: {count} |
| `widget.audioBitrate` | Битрейт, кбит/с | Bitrate, kbps |
| `widget.audioHint` | 192 кбит/с — как у музыкальных сервисов, 320 — максимум для MP3. Теги (название, исполнитель, альбом) сохраняются; из видео берётся только звук. | 192 kbps matches music streaming services, 320 is the maximum for MP3. Tags (title, artist, album) are kept; from a video only the audio is taken. |
| `widget.audioCopied` | без перекодирования | no re-encoding |
| `widget.videoQuality` | Качество видео | Video quality |
| `widget.videoQualities.high` | Высокое | High |
| `widget.videoQualities.medium` | Среднее | Medium |
| `widget.videoQualities.low` | Низкое | Low |
| `widget.videoHeight` | Размер кадра | Frame size |
| `widget.videoOriginal` | Исходный | Original |
| `widget.videoHint` | MOV и MKV с H.264 и AAC перепаковываются в MP4 без перекодирования — быстро и без потерь. Остальное перекодируется в браузере: это долго, минута видео — от десятков секунд до нескольких минут. 720p — короткая сторона кадра 720 точек. | MOV and MKV with H.264 and AAC are repackaged into MP4 without re-encoding — fast and lossless. Everything else is re-encoded in your browser, which is slow: a minute of video takes from tens of seconds to a few minutes. 720p means the short side of the frame is 720 pixels. |
| `widget.gifWidth` | Ширина GIF, пикс. | GIF width, px |
| `widget.csvDelimiter` | Разделитель CSV | CSV delimiter |
| `widget.csvDelimiters.;` | Точка с запятой | Semicolon |
| `widget.csvDelimiters.,` | Запятая | Comma |
| `widget.csvDelimiters.	` | Табуляция | Tab |
| `widget.csvHint` | Русский Excel открывает CSV с точкой с запятой; запятая — для Google Таблиц, программ и других стран. Файл сохраняется в UTF-8. | Comma works for Google Sheets, most apps and English-language Excel; Excel in many European locales expects a semicolon. The file is saved as UTF-8. |
| `widget.docPages` | страниц: {count} | pages: {count} |
| `widget.docRows` | строк: {count} | rows: {count} |
| `widget.gifFps` | Кадров в секунду | Frames per second |
| `widget.gifHint` | В GIF попадают первые 20 секунд видео, без звука. Ширина и частота кадров сильно влияют на размер файла. | The GIF gets the first 20 seconds of the video, without sound. Width and frame rate have a big impact on file size. |
| `widget.pdfRendering` | Страница {page} из {total}… | Page {page} of {total}… |
| `widget.pageOf` | Стр. {number} из {total} | Page {number} of {total} |
| `widget.moveUp` | Переместить выше: {name} | Move up: {name} |
| `widget.moveDown` | Переместить ниже: {name} | Move down: {name} |
| `widget.removeFile` | Убрать из списка: {name} | Remove from the list: {name} |
| `widget.report.taken` | Снято | Taken |
| `widget.report.camera` | Камера | Camera |
| `widget.report.lens` | Объектив | Lens |
| `widget.report.exposure` | Съёмка | Exposure |
| `widget.report.location` | Геолокация | Location |
| `widget.report.software` | Программа | Software |
| `widget.report.author` | Автор | Author |
| `widget.report.copyright` | Авторские права | Copyright |
| `widget.report.serial` | Серийный номер | Serial number |
| `widget.report.colorProfile` | Цветовой профиль | Color profile |
| `widget.report.more` | Ещё в файле | Also in the file |
| `widget.report.nothing` | Метаданных не найдено. | No metadata found. |
| `widget.report.compressed` | EXIF в этом файле сжат, прочитать его не получится. Удалить — можно. | This file's EXIF is compressed and can't be read. It can still be removed. |
| `widget.report.allTags` | Все теги EXIF ({count}) | All EXIF tags ({count}) |
| `widget.report.tag` | Тег | Tag |
| `widget.report.value` | Значение | Value |
| `widget.report.binary` | двоичные данные, {size} | binary data, {size} |
| `widget.report.groups.ifd0` | Основные | Main |
| `widget.report.groups.exif` | EXIF | EXIF |
| `widget.report.groups.gps` | GPS | GPS |
| `widget.report.groups.interop` | Совместимость | Interoperability |
| `widget.report.groups.ifd1` | Миниатюра | Thumbnail |
| `widget.report.north` | с. ш. | N |
| `widget.report.south` | ю. ш. | S |
| `widget.report.east` | в. д. | E |
| `widget.report.west` | з. д. | W |
| `widget.report.altitude` | высота {value} м | altitude {value} m |
| `widget.report.maps` | Показать на карте: | Show on a map: |
| `widget.report.mapsHint` | откроется сайт карт | opens a map website |
| `widget.report.mapLinks.0.name` | Яндекс Карты | Google Maps |
| `widget.report.mapLinks.0.url` | https://yandex.ru/maps/?pt={lon},{lat}&z=16&l=map | https://www.google.com/maps/search/?api=1&query={lat},{lon} |
| `widget.report.mapLinks.1.name` | OpenStreetMap | OpenStreetMap |
| `widget.report.mapLinks.1.url` | https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=16/{lat}/{lon} | https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=16/{lat}/{lon} |
| `widget.report.seconds` | {value} с | {value} s |
| `widget.report.millimeters` | {value} мм | {value} mm |
| `widget.report.equivalent` | {value} мм в экв. 35 мм | {value} mm equiv. on 35 mm |
| `widget.report.download` | Скачать без метаданных | Download without metadata |
| `widget.report.downloadLabel` | Скачать без метаданных: {name} | Download without metadata: {name} |
| `widget.report.thumbnail` | Встроенная миниатюра | Embedded thumbnail |
| `widget.dropAction` | или перетащите их сюда | or drop them here |
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
| `widget.convertingPercent` | Конвертируется… {percent} | Converting… {percent} |
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
| `widget.errors.already-jpeg` | Файл уже в формате JPG — выберите другой формат. | This file is already a JPG — pick another format. |
| `widget.errors.already-png` | Файл уже в формате PNG — выберите другой формат. | This file is already a PNG — pick another format. |
| `widget.errors.already-webp` | Файл уже в формате WebP — выберите другой формат. | This file is already a WebP — pick another format. |
| `widget.errors.already-avif` | Файл уже в формате AVIF — выберите другой формат. | This file is already an AVIF — pick another format. |
| `widget.errors.too-large-for-webp` | WebP вмещает изображения не больше 16 383 точек по стороне — выберите JPG или PNG. | WebP can't store images larger than 16,383 px per side — choose JPG or PNG. |
| `widget.errors.unsupported-image` | Этот формат изображений пока не поддерживается. Поддерживаются {formats}. | This image format isn't supported yet. Supported: {formats}. |
| `widget.errors.cmyk-unsupported` | Изображения в цветовой модели CMYK (для печати) пока не поддерживаются. | CMYK images (used for print) aren't supported yet. |
| `widget.errors.decode-failed` | Не удалось прочитать файл — возможно, он повреждён. | Could not read the file — it may be damaged. |
| `widget.errors.unsupported-variant` | Этот вариант формата не поддерживается. | This variant of the format isn't supported. |
| `widget.errors.out-of-memory` | Браузеру не хватило памяти для этого файла. Закройте другие вкладки и попробуйте снова. | The browser ran out of memory for this file. Close other tabs and try again. |
| `widget.errors.pdf-input` | Это PDF-документ, а не картинка. Чтобы сохранить его страницы как изображения, откройте «PDF в JPG». | This is a PDF document, not an image. To save its pages as images, open “PDF to JPG”. |
| `widget.errors.not-pdf` | Это не PDF-файл. | This isn't a PDF file. |
| `widget.errors.pdf-encrypted` | PDF защищён паролем. Снимите пароль (например, сохраните копию без защиты) и попробуйте снова. | This PDF is password-protected. Remove the password (for example, save an unprotected copy) and try again. |
| `widget.errors.pdf-unsupported` | Этот браузер не умеет рисовать страницы PDF. Обновите браузер или откройте сайт в другом. | This browser can't render PDF pages. Please update it or use another browser. |
| `widget.errors.no-audio` | В файле нет звуковой дорожки. | The file has no audio track. |
| `widget.errors.no-video` | В файле нет видео — это аудио. Выберите аудиоформат. | The file has no video — it is audio. Pick an audio format. |
| `widget.errors.not-table` | В файле нет таблицы: нужен массив объектов или массивов (JSON) или хотя бы одна строка. | The file has no table: it needs an array of objects or arrays (JSON) or at least one row. |
| `widget.errors.media-decode-unsupported` | Этот браузер не умеет читать звук этого файла (кодек не поддерживается). Попробуйте другой браузер, например свежий Chrome или Edge. | This browser can't read the audio in this file (unsupported codec). Try another browser, such as an up-to-date Chrome or Edge. |
| `widget.errors.media-stalled` | Браузер перестал отвечать при обработке звука. Попробуйте другой формат или другой браузер. | The browser stopped responding while processing the audio. Try another format or another browser. |
| `widget.errors.media-encode-unsupported` | Этот браузер не умеет сохранять в этот формат. Выберите другой формат или откройте сайт в другом браузере, например в свежем Chrome или Edge. | This browser can't save to this format. Pick another format or try another browser, such as an up-to-date Chrome or Edge. |
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
| `widget.warnings.exif-compressed-removed` | EXIF в этом файле сжат, и выборочно его не поправить — он удалён целиком, вместе с датой. | This file's EXIF is compressed and can't be edited selectively, so it was removed entirely, date included. |
| `widget.warnings.pdf-page-downscaled` | Страница очень большая — сохранена с меньшим разрешением. | The page is very large, so it was saved at a lower resolution. |
| `widget.warnings.pdf-page-limit` | Страниц слишком много — сохранены первые {limit}. | Too many pages — the first {limit} were saved. |
| `widget.warnings.audio-dropped` | Звук не сохранён: браузер не умеет кодировать его для этого формата. Видео — без звука. | The sound wasn't kept: this browser can't encode it for this format. The video has no sound. |
| `widget.warnings.gif-trimmed` | Видео длиннее 20 секунд — в GIF попало начало. | The video is longer than 20 seconds — the GIF has the beginning. |
| `widget.warnings.missing-glyphs` | Некоторых знаков (например, иероглифов или эмодзи) нет в шрифте PDF — они заменены на «?». | Some characters (such as CJK or emoji) are missing from the PDF font and were replaced with “?”. |
| `widget.warnings.images-dropped` | Картинки из документа не переносятся — только текст. | Images from the document are not carried over — only the text. |
| `widget.warnings.sheets-first-only` | В книге несколько листов — сконвертирован первый. | The workbook has several sheets — the first one was converted. |
| `widget.warnings.json-nested` | Вложенные объекты и массивы записаны в ячейки как текст JSON. | Nested objects and arrays were written into cells as JSON text. |
| `notFound.title` | Страница не найдена | Page not found |
| `notFound.text` | Такой страницы нет. Возможно, адрес изменился или в нём опечатка. | This page does not exist. The address may have changed or contain a typo. |
| `notFound.toHome` | На главную | Go to the home page |
