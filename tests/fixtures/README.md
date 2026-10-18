# Фикстуры для тестов

Все файлы здесь синтетические (без личных данных), генерируются командой `npm run fixtures`
(Docker-образ `tests/fixtures/generate`: Debian forky, heif-enc 1.23.6, exiftool, ImageMagick, cjpeg, apngasm).
Результат закоммичен, перегенерировать нужно только при изменении `generate/generate.sh`. Генератор разбит на секции:
`npm run fixtures -- jpeg-png` пересоздаёт только JPEG/PNG, не трогая HEIC (heif-enc другой версии изменил бы их побайтно).

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
| `photo.avif` | AVIF (пока не поддерживается) |
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
| `exif/big-endian.tiff`, `exif/little-endian.tiff` | сырые EXIF-блоки (TIFF) с датами, GPS, Make/Model, Orientation = 6 — для unit-тестов |

Реальные снимки владельца — только в `private/` (исключена из git).
