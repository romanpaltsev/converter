#!/usr/bin/env bash
# Генерация синтетических фикстур (без личных данных).
# Запуск: npm run fixtures (собирает Docker-образ и выполняет этот скрипт внутри него).
# Внутри контейнера: /out — tests/fixtures, /icc — src/converter/color/icc.
set -euo pipefail

OUT=/out
ICC_P3=/icc/DisplayP3Compat-v2-magic.icc
TMP=$(mktemp -d)
cd "$TMP"

# Лимиты ImageMagick по умолчанию слишком малы для 48 Мп.
IM=(magick -limit memory 4GiB -limit map 8GiB -limit area 2GP -limit disk 16GiB)

# Шаблон с цветными квадрантами — по нему тесты проверяют ориентацию пикселей.
# Левый верхний — красный, правый верхний — зелёный, левый нижний — синий, правый нижний — жёлтый.
quadrants() { # ширина высота файл
  local w=$1 h=$2 out=$3
  local hw=$((w / 2)) hh=$((h / 2))
  "${IM[@]}" -size "${w}x${h}" xc:white \
    -fill '#e00000' -draw "rectangle 0,0 $((hw - 1)),$((hh - 1))" \
    -fill '#00b000' -draw "rectangle $hw,0 $((w - 1)),$((hh - 1))" \
    -fill '#0000e0' -draw "rectangle 0,$hh $((hw - 1)),$((h - 1))" \
    -fill '#e0e000' -draw "rectangle $hw,$hh $((w - 1)),$((h - 1))" \
    -alpha off -depth 8 "png24:$out"
}

# «Фотоподобная» детерминированная текстура: плазма + шум + подпись.
photo() { # ширина высота файл подпись
  local w=$1 h=$2 out=$3 label=$4
  "${IM[@]}" -seed 42 -size "${w}x${h}" plasma:'#5f8fc9-#d9a066' \
    \( -size "${w}x${h}" xc:gray50 -seed 7 -attenuate 0.2 +noise Gaussian -colorspace gray \) \
    -compose overlay -composite \
    -gravity center -font DejaVu-Sans -pointsize $((h / 8)) -fill white -stroke black -strokewidth 2 -annotate +0+0 "$label" \
    -alpha off -depth 8 "png24:$out"
}

# Даты съёмки (как у iPhone: локальное время + смещение).
EXIF_DATES=(
  "-DateTimeOriginal=2024:07:15 14:23:05"
  "-CreateDate=2024:07:15 14:23:05"
  "-ModifyDate=2024:07:15 14:23:05"
  "-OffsetTime=+03:00"
  "-OffsetTimeOriginal=+03:00"
  "-OffsetTimeDigitized=+03:00"
  "-SubSecTimeOriginal=123"
)
# Персональные данные, которые в режиме по умолчанию должны удаляться.
EXIF_PRIVATE=(
  "-Make=Apple"
  "-Model=iPhone 15 Pro"
  "-LensModel=iPhone 15 Pro back triple camera 6.765mm f/1.78"
  "-SerialNumber=TESTSERIAL0001"
  "-Software=Synthetic 1.0"
  "-GPSLatitude=55.7539"
  "-GPSLatitudeRef=N"
  "-GPSLongitude=37.6208"
  "-GPSLongitudeRef=E"
  "-GPSAltitude=150"
  "-GPSAltitudeRef=0"
  "-XMP-dc:Subject=synthetic-xmp-marker"
)

heic() { # выход вход [опции heif-enc...]
  local out=$1 in=$2
  shift 2
  heif-enc -q 60 "$@" -o "$OUT/$out" "$in" >/dev/null
}

echo "== basic.heic: sRGB (nclx по умолчанию), без EXIF"
quadrants 1200 800 basic.png
heic basic.heic basic.png

echo "== exif-gps.heic: ICC Display P3, даты, GPS, Make/Model, XMP (EXIF пишет exiftool, как в файлах Apple)"
photo 1200 800 exif-gps.png "EXIF + GPS"
"${IM[@]}" exif-gps.png -profile "$ICC_P3" -alpha off -depth 8 png24:exif-gps-p3.png
heic exif-gps.heic exif-gps-p3.png
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "${EXIF_PRIVATE[@]}" "-Orientation#=1" "$OUT/exif-gps.heic"

echo "== rotated.heic: EXIF Orientation=6 + irot (как у iPhone), на экране 600x800"
quadrants 600 800 rotated-display.png
"${IM[@]}" rotated-display.png -rotate -90 -quality 95 rotated-stored.jpg
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=6" rotated-stored.jpg
heic rotated.heic rotated-stored.jpg

echo "== transposed.heic: EXIF Orientation=5 (поворот + отражение), на экране 600x800"
"${IM[@]}" rotated-display.png -transpose -quality 95 transposed-stored.jpg
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=5" transposed-stored.jpg
heic transposed.heic transposed-stored.jpg

echo "== nclx-p3.heic: цвет задан только nclx (Display P3), без ICC"
heic nclx-p3.heic basic.png --colour_primaries 12 --transfer_characteristic 13 --matrix_coefficients 6 --full_range_flag 1

echo "== 10bit.heic: 10 бит на канал"
"${IM[@]}" -size 1200x800 gradient:'#102040-#f0c080' -depth 16 png48:10bit.png
heic 10bit.heic 10bit.png -b 10

echo "== hdr-pq.heic: 10 бит, BT.2020 + PQ (как HDR-режим камер)"
heic hdr-pq.heic 10bit.png -b 10 --colour_primaries 9 --transfer_characteristic 16 --matrix_coefficients 9 --full_range_flag 0

echo "== alpha.heic: с альфа-каналом"
"${IM[@]}" -size 800x600 xc:none -fill '#e00000' -draw 'circle 400,300 400,80' alpha.png
heic alpha.heic alpha.png

echo "== multi.heic: два изображения, основное — первое и меньшее (640x480)"
quadrants 640 480 multi-primary.png
photo 1280 960 multi-second.png "SECOND"
heif-enc -q 60 -o "$OUT/multi.heic" multi-primary.png multi-second.png >/dev/null

echo "== sequence.heic: последовательность кадров (серийная съёмка)"
for i in 1 2 3; do quadrants 640 480 "seq-$i.png"; done
heif-enc -q 60 -S -o "$OUT/sequence.heic" seq-1.png >/dev/null || echo "   (sequence не поддерживается heif-enc — пропущено)"

echo "== grid-24mp.heic: 6000x4000, тайлы 512, ICC P3 + даты"
photo 6000 4000 g24.png "24 MP"
"${IM[@]}" g24.png -profile "$ICC_P3" -alpha off -depth 8 png24:g24-p3.png
heic grid-24mp.heic g24-p3.png -q 45 --cut-tiles 512 -p preset=fast
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=1" "$OUT/grid-24mp.heic"

echo "== grid-48mp.heic: 8064x6048, тайлы 512, ICC P3 + даты"
photo 8064 6048 g48.png "48 MP"
"${IM[@]}" g48.png -profile "$ICC_P3" -alpha off -depth 8 png24:g48-p3.png
heic grid-48mp.heic g48-p3.png -q 45 --cut-tiles 512 -p preset=fast
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=1" "$OUT/grid-48mp.heic"

echo "== не-HEIC файлы"
cp basic.png "$OUT/not-heic.heic"
head -c 4096 /dev/zero | tr '\0' 'x' > "$OUT/garbage.heic"
heif-enc -A -q 60 -o "$OUT/photo.avif" basic.png >/dev/null
"${IM[@]}" basic.png -quality 90 "$OUT/photo.jpg"

echo "== сырые EXIF-блоки (TIFF) для unit-тестов"
mkdir -p "$OUT/exif"
# порядок байтов ExifByteOrder действует только при создании EXIF, поэтому два отдельных исходника
for order in "big-endian:Big-endian (Motorola, MM)" "little-endian:Little-endian (Intel, II)"; do
  name=${order%%:*}
  "${IM[@]}" -size 16x16 xc:gray "exif-$name.jpg"
  exiftool -q -overwrite_original "-ExifByteOrder=${order#*:}" "${EXIF_DATES[@]}" "${EXIF_PRIVATE[@]}" "-Orientation#=6" \
    "-ExifImageWidth=4032" "-ExifImageHeight=3024" "exif-$name.jpg"
  exiftool -b -EXIF "exif-$name.jpg" > "$OUT/exif/$name.tiff"
done

echo "== самопроверка: heif-dec применяет irot/imir так же, как наш конвейер"
for f in rotated transposed; do
  heif-dec "$OUT/$f.heic" "$f-check.png" >/dev/null
  "${IM[@]}" "$f-check.png" -format "$f: %wx%h TL=%[pixel:p{50,50}] BR=%[pixel:p{550,750}]\n" info:
done

ls -la "$OUT" "$OUT/exif"
rm -rf "$TMP"
