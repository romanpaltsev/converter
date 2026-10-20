# Фикстуры для тестов

Все файлы здесь синтетические (без личных данных), генерируются командой `npm run fixtures`
(Docker-образ `tests/fixtures/generate`: Debian forky, heif-enc 1.23.6, exiftool, ImageMagick, cjpeg, apngasm, qpdf, ffmpeg).
Результат закоммичен, перегенерировать нужно только при изменении `generate/generate.sh`. Генератор разбит на секции:
Секции: `heic`, `jpeg-png`, `webp`, `avif`, `gif`, `bmp`, `tiff`, `jxl`, `pdf`, `media`. `npm run fixtures -- jpeg-png` пересоздаёт только JPEG/PNG, не трогая HEIC (heif-enc другой версии изменил бы их побайтно).

| Файл | Что проверяем |
|---|---|
| `basic.heic` | 1200×800, цвет задан nclx (sRGB), без EXIF; цветные квадранты |
| `exif-gps.heic` | 1200×800, ICC Display P3; EXIF: даты, OffsetTime*, SubSecTimeOriginal, Make/Model/LensModel/SerialNumber, GPS; XMP. EXIF записан exiftool (префикс `Exif\0\0`, как у Apple) |
| `rotated.heic` | хранится 800×600 + irot, EXIF Orientation = 6 (как у iPhone); на экране 600×800, квадранты: ЛВ красный, ПВ зелёный, ЛН синий, ПН жёлтый |
| `transposed.heic` | то же, но Orientation = 5 (irot + imir) |
| `nclx-p3.heic` | цвет задан только nclx: Display P3 (primaries 12), ICC нет |
| `10bit.heic` | 10 бит на канал |
| `hdr-pq.heic` | 10 бит, BT.2020 + PQ (HDR-режим камер) |
| `alpha.heic` | 800×600 с альфа-каналом |
| `multi.heic` | два изображения: основное 640×480, второе 1280×960 |
| `sequence.heic` | последовательность (бренды `msf1`/`hevc`) + основное изображение 640×480 |
| `grid-24mp.heic` | 6000×4000, grid из тайлов 512×512, ICC P3, даты |
| `grid-48mp.heic` | 8064×6048, grid из тайлов 512×512, ICC P3, даты |
| `not-heic.heic` | PNG с расширением .heic: формат определяется по сигнатуре, файл конвертируется как PNG |
| `garbage.heic` | мусор |
| `photo.avif` | AVIF 1200×800 без ICC и EXIF (→ sRGB); на HEIC-странице конвертируется своим декодером |
| `photo.jpg` | JPEG 1200×800 без ICC и EXIF (→ sRGB); на выходе JPG — «уже в формате JPG» |
| `exif-gps.jpg` | 1200×800, ICC Display P3, даты, GPS, Make/Model/SerialNumber, XMP |
| `rotated.jpg`, `transposed.jpg`, `mirrored.jpg` | хранятся повёрнутыми, EXIF Orientation 6, 5 и 2; на экране 600×800 с квадрантами |
| `gray.jpg`, `progressive.jpg` | оттенки серого (1 компонент); progressive (SOF2) |
| `cmyk.jpg`, `12bit.jpg`, `lossless.jpg`, `arith.jpg` | CMYK, 12 бит (SOF1), lossless (SOF3), арифметическое кодирование (SOF9) — понятные ошибки |
| `exif-gps.png` | 1200×800, iCCP Display P3, eXIf (даты, GPS, камера), XMP в iTXt, текстовые чанки |
| `rotated.png` | eXIf Orientation 6, на экране 600×800 |
| `alpha.png`, `palette-trns.png` | RGBA и палитра с прозрачностью tRNS (красный круг на прозрачном фоне) |
| `16bit.png`, `gray.png`, `interlaced.png` | 16 бит на канал, оттенки серого, чересстрочный (Adam7) |
| `animated.png` | APNG из двух кадров, основной — квадранты 640×480 |
| `exif-gps.webp` | 1200×800, VP8X: ICCP Display P3 (webpmux), EXIF с датами, GPS и камерой (exiftool) |
| `basic.webp` | простой VP8 без VP8X и метаданных (→ sRGB) |
| `rotated.webp`, `exif-prefixed.webp` | хранятся повёрнутыми, Orientation 6; во втором чанк EXIF с префиксом «Exif\0\0» |
| `lossless-alpha.webp`, `lossy-alpha.webp` | красный круг на прозрачном фоне: VP8L и VP8X + ALPH |
| `animated.webp` | два кадра, первый — квадранты 640×480 |
| `exif-gps.avif` | 1200×800, ICC Display P3, EXIF с датами, GPS и камерой, XMP (exiftool) |
| `rotated.avif` | хранится 800×600 + irot; на экране 600×800 с квадрантами |
| `nclx-p3.avif`, `10bit.avif`, `hdr-pq.avif` | цвет только в nclx (Display P3); 10 бит; 10 бит BT.2020 + PQ |
| `alpha.avif` | красный круг на прозрачном фоне (альфа — вспомогательное изображение) |
| `animated.avif` | последовательность из двух кадров (бренд `avis`) + основное изображение — квадранты 640×480 |
| `basic.gif`, `interlaced.gif` | квадранты 1200×800, палитра из 4 цветов; второй — чересстрочный (пиксели те же) |
| `alpha.gif` | красный круг на прозрачном фоне 800×600 (прозрачный индекс палитры) |
| `animated.gif` | два кадра 640×480, первый — квадранты |
| `offset.gif` | холст 400×300, кадр 200×100 со смещением +100+50 — вокруг прозрачно |
| `basic.bmp`, `palette4.bmp`, `rle8.bmp`, `rgb565.bmp` | квадранты 400×300: 24 бита; палитра 4 бита; палитра 8 бит с RLE8; 16 бит 565 (маски, V5) |
| `mono.bmp` | 1 бит, 64×32: левая половина чёрная |
| `alpha.bmp` | 32 бита с альфой (V5, BITFIELDS): красный круг на прозрачном фоне 200×150 |
| `p3.bmp` | 24 бита, встроенный ICC Display P3 (V5, PROFILE_EMBEDDED) |
| `basic.tif`, `deflate.tif`, `packbits.tif`, `jpeg.tif`, `raw.tif` | квадранты 400×300: LZW; Deflate + предиктор 2; PackBits; JPEG; без сжатия, big-endian |
| `tiled.tif`, `16bit.tif` | тайлы 128×128 (крайние выходят за изображение); 16 бит, big-endian, Deflate |
| `gray.tif`, `mono-g4.tif`, `palette.tif` | серый 8 бит; 1 бит CCITT G4 (64×32, левая половина чёрная); палитра 2 бита |
| `alpha.tif`, `alpha-assoc.tif` | 16 бит с альфой: обычной и предумноженной — красный круг на прозрачном фоне 200×150 |
| `multipage.tif`, `cmyk.tif` | две страницы (первая — квадранты); CMYK — понятная ошибка |
| `exif-gps.tif`, `rotated.tif` | ICC P3, даты, GPS, камера (exiftool); хранится повёрнутым 400×300, Orientation 6 → 300×400 |
| `basic.jxl`, `codestream.jxl` | квадранты 1200×800 без потерь: контейнер; «голый» кодовый поток |
| `alpha.jxl`, `animated.jxl` | красный круг на прозрачном фоне 800×600; анимация из animated.png |
| `exif-gps.jxl`, `exif-brotli.jxl` | перепаковка exif-gps.jpg (ICC P3, даты, GPS): Exif несжатый; Exif в brob (brotli) |
| `rotated.jxl` | перепаковка rotated.jpg: Orientation 6 в заголовке кодового потока → 600×800 |
| `too-wide.png` | 16400×8 — шире предела WebP (16 383 точки) |
| `quadrants.pdf` | страница 600×400 pt, на ней картинка 600×400 с квадрантами (без потерь) |
| `text.pdf` | A4: синий прямоугольник и «Hello PDF» шрифтом Helvetica без встраивания — нужны стандартные шрифты pdf.js |
| `two-pages.pdf` | квадранты (страница повёрнута `/Rotate 90`) + текст |
| `encrypted.pdf`, `garbage.pdf` | под паролем (AES-256; при каждой генерации файл другой — случайная соль шифрования); заголовок PDF и мусор — понятные ошибки |
| `tone.wav`, `tone.mp3`, `tone.flac`, `tone.ogg`, `tone.opus`, `tone.m4a`, `tone.aac` | 3 с стерео 44,1 кГц (слева 440 Гц, справа 660 Гц): PCM 16 бит, MP3 128 кбит/с, FLAC, Vorbis, Opus 96 кбит/с, AAC 128 кбит/с в M4A и ADTS; теги title «Test tone», artist «Synthetic», album «Fixtures» (у ADTS тегов нет) |
| `clip.mp4`, `clip.webm`, `clip.mov` | 2 с 320×240 25 к/с (testsrc) со звуком 440 Гц 48 кГц: H.264 + AAC, VP9 + Opus, H.264 + AAC в MOV |
| `silent.mp4` | то же видео без звуковой дорожки — ошибка «нет звука» |
| `garbage.mp3` | заголовок ID3 и мусор вместо кадров |
| `exif/big-endian.tiff`, `exif/little-endian.tiff` | сырые EXIF-блоки (TIFF) с датами, GPS, Make/Model, Orientation = 6 — для unit-тестов |

Реальные снимки владельца — только в `private/` (исключена из git).
