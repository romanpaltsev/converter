#!/usr/bin/env bash
# Пересобирает свои WASM-модули (нужен Docker). Готовые файлы закоммичены.
#   libwebp          → src/converter/vendor/webp  (codecs/webp)
#   libheif + dav1d  → src/converter/vendor/avif  (codecs/avif)
# Без аргументов — оба; `npm run codecs -- webp` или `-- avif` — один.
set -euo pipefail
cd "$(dirname "$0")/.."
targets=("${@:-webp avif}")
for target in ${targets[*]}; do
  case "$target" in
    webp | avif) ;;
    *) echo "неизвестный модуль: $target (webp или avif)" >&2; exit 1 ;;
  esac
  mkdir -p "src/converter/vendor/$target"
  docker build -q -t "converter-codecs-$target" "codecs/$target" >/dev/null
  docker run --rm -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
    -v "$PWD/src/converter/vendor/$target:/out" \
    -v "$PWD/codecs/$target:/gen:ro" \
    "converter-codecs-$target" bash /gen/build.sh
  cat "src/converter/vendor/$target/BUILD.txt"
done
