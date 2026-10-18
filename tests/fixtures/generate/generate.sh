#!/usr/bin/env bash
# Генерация синтетических фикстур (без личных данных).
# Запуск: npm run fixtures [-- секции] (собирает Docker-образ и выполняет этот скрипт внутри него).
# Секции через запятую: heic, jpeg-png, webp (по умолчанию — все). Секция пересоздаёт только свои файлы:
# HEIC-фикстуры не меняются побайтно, когда добавляются фикстуры других форматов.
# Внутри контейнера: /out — tests/fixtures, /icc — src/converter/color/icc.
set -euo pipefail

SECTIONS=${1:-all}
want() { [[ "$SECTIONS" == all || ",$SECTIONS," == *",$1,"* ]]; }

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

# PNG без чанков с датой создания — иначе фикстуры меняются при каждой генерации
PNG_STABLE=(-define png:exclude-chunks=date,time)

if want heic; then
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
fi

if want jpeg-png; then
# На экране у всех «повёрнутых» фикстур — 600x800 с квадрантами; хранятся они повёрнутыми, а поворот задаёт EXIF.
quadrants 600 800 display.png
quadrants 1200 800 wide.png
photo 1200 800 jpeg-photo.png "JPEG + EXIF"

echo "== exif-gps.jpg: ICC Display P3, даты, GPS, Make/Model, XMP"
"${IM[@]}" jpeg-photo.png -profile "$ICC_P3" -quality 90 "$OUT/exif-gps.jpg"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "${EXIF_PRIVATE[@]}" "-Orientation#=1" "$OUT/exif-gps.jpg"

echo "== rotated.jpg (Orientation 6), transposed.jpg (5), mirrored.jpg (2)"
"${IM[@]}" display.png -rotate -90 -quality 95 "$OUT/rotated.jpg"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=6" "$OUT/rotated.jpg"
"${IM[@]}" display.png -transpose -quality 95 "$OUT/transposed.jpg"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=5" "$OUT/transposed.jpg"
"${IM[@]}" display.png -flop -quality 95 "$OUT/mirrored.jpg"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=2" "$OUT/mirrored.jpg"

echo "== gray.jpg, progressive.jpg, cmyk.jpg"
"${IM[@]}" wide.png -colorspace Gray -quality 90 "$OUT/gray.jpg"
"${IM[@]}" wide.png -interlace JPEG -quality 90 "$OUT/progressive.jpg"
"${IM[@]}" wide.png -colorspace CMYK -quality 90 "$OUT/cmyk.jpg"

echo "== 12bit.jpg, lossless.jpg, arith.jpg (cjpeg из libjpeg-turbo)"
"${IM[@]}" wide.png -depth 8 ppm:wide.ppm
cjpeg -precision 12 wide.ppm > "$OUT/12bit.jpg"
cjpeg -lossless 1 wide.ppm > "$OUT/lossless.jpg"
cjpeg -arithmetic -quality 90 wide.ppm > "$OUT/arith.jpg"

echo "== exif-gps.png: iCCP Display P3, eXIf (даты, GPS, камера), XMP в iTXt, комментарий в tEXt"
"${IM[@]}" wide.png -profile "$ICC_P3" "${PNG_STABLE[@]}" png24:"$OUT/exif-gps.png"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "${EXIF_PRIVATE[@]}" "-Orientation#=1" "-PNG:Comment=synthetic-text-marker" "$OUT/exif-gps.png"

echo "== rotated.png: eXIf Orientation 6"
"${IM[@]}" display.png -rotate -90 "${PNG_STABLE[@]}" png24:"$OUT/rotated.png"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=6" "$OUT/rotated.png"

echo "== alpha.png, palette-trns.png (палитра + tRNS), 16bit.png, gray.png, interlaced.png"
"${IM[@]}" -size 800x600 xc:none -fill '#e00000' -draw 'circle 400,300 400,80' "${PNG_STABLE[@]}" png32:"$OUT/alpha.png"
"${IM[@]}" "$OUT/alpha.png" "${PNG_STABLE[@]}" png8:"$OUT/palette-trns.png"
"${IM[@]}" -size 1200x800 gradient:'#102040-#f0c080' -depth 16 "${PNG_STABLE[@]}" png48:"$OUT/16bit.png"
"${IM[@]}" wide.png -colorspace Gray -depth 8 -define png:color-type=0 "${PNG_STABLE[@]}" "$OUT/gray.png"
"${IM[@]}" wide.png -interlace PNG "${PNG_STABLE[@]}" png24:"$OUT/interlaced.png"

echo "== animated.png: APNG из двух кадров (основной — квадранты 640x480)"
quadrants 640 480 frame-1.png
"${IM[@]}" frame-1.png -negate "${PNG_STABLE[@]}" png24:frame-2.png
apngasm "$OUT/animated.png" frame-1.png frame-2.png 1 2 >/dev/null

echo "== самопроверка JPEG/PNG"
exiftool -s -s -s -Orientation "$OUT/rotated.jpg" "$OUT/rotated.png" "$OUT/mirrored.jpg"
exiftool -s -G1 -GPSLatitude -ICC_Profile:ProfileDescription -XMP-dc:Subject -PNG:Comment "$OUT/exif-gps.png"
for f in 12bit lossless arith cmyk; do printf '%s: ' "$f"; "${IM[@]}" identify -format '%[jpeg:colorspace] %z bit\n' "$OUT/$f.jpg" 2>/dev/null || echo "?"; done
fi

if want webp; then
quadrants 600 800 display.png
quadrants 1200 800 wide.png
photo 1200 800 webp-photo.png "WebP + EXIF"
"${IM[@]}" display.png -rotate -90 -alpha off -depth 8 png24:display-stored.png

echo "== exif-gps.webp: VP8 + ICCP Display P3 (webpmux) + EXIF: даты, GPS, камера (exiftool)"
cwebp -quiet -q 80 webp-photo.png -o photo.webp
webpmux -set icc "$ICC_P3" photo.webp -o "$OUT/exif-gps.webp"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "${EXIF_PRIVATE[@]}" "-Orientation#=1" "$OUT/exif-gps.webp"

echo "== basic.webp: простой VP8 без VP8X и метаданных"
cwebp -quiet -q 80 wide.png -o "$OUT/basic.webp"

echo "== rotated.webp: EXIF Orientation 6 (exiftool); exif-prefixed.webp: чанк EXIF с префиксом «Exif\0\0»"
cwebp -quiet -q 90 display-stored.png -o rotated-plain.webp
cp rotated-plain.webp "$OUT/rotated.webp"
exiftool -q -overwrite_original "${EXIF_DATES[@]}" "-Orientation#=6" "$OUT/rotated.webp"
{ printf 'Exif\0\0'; cat /out/exif/little-endian.tiff; } > exif-prefixed.bin
webpmux -set exif exif-prefixed.bin rotated-plain.webp -o "$OUT/exif-prefixed.webp"

echo "== lossless-alpha.webp (VP8L), lossy-alpha.webp (VP8X + ALPH)"
"${IM[@]}" -size 800x600 xc:none -fill '#e00000' -draw 'circle 400,300 400,80' png32:circle.png
cwebp -quiet -lossless circle.png -o "$OUT/lossless-alpha.webp"
cwebp -quiet -q 80 circle.png -o "$OUT/lossy-alpha.webp"

echo "== animated.webp: два кадра, первый — квадранты 640x480"
quadrants 640 480 anim-1.png
"${IM[@]}" anim-1.png -negate png24:anim-2.png
img2webp -loop 0 -d 500 anim-1.png anim-2.png -o "$OUT/animated.webp" >/dev/null

echo "== самопроверка WebP"
for f in exif-gps basic rotated exif-prefixed lossless-alpha lossy-alpha animated; do
  printf '%s: ' "$f"; webpinfo -quiet "$OUT/$f.webp" >/dev/null && echo ok
done
exiftool -s -s -s -Orientation "$OUT/rotated.webp" "$OUT/exif-prefixed.webp"
fi

ls -la "$OUT"
rm -rf "$TMP"
