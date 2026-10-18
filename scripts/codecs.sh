#!/usr/bin/env bash
# Пересобирает WASM-модули libwebp в src/converter/vendor/webp (нужен Docker). Готовые файлы закоммичены.
set -euo pipefail
cd "$(dirname "$0")/.."
docker build -q -t converter-codecs-webp codecs/webp >/dev/null
docker run --rm -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" \
  -v "$PWD/src/converter/vendor/webp:/out" \
  -v "$PWD/codecs/webp:/gen:ro" \
  converter-codecs-webp bash /gen/build.sh
cat src/converter/vendor/webp/BUILD.txt
