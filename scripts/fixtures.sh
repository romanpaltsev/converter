#!/usr/bin/env bash
# Пересоздаёт синтетические фикстуры в tests/fixtures (нужен Docker). Аргумент — секции (heic,jpeg-png,webp,avif,gif,bmp,tiff), по умолчанию все.
set -euo pipefail
cd "$(dirname "$0")/.."
docker build -q -t converter-fixtures tests/fixtures/generate >/dev/null
docker run --rm -e HOME=/tmp --user "$(id -u):$(id -g)" \
  -v "$PWD/tests/fixtures:/out" \
  -v "$PWD/src/converter/color/icc:/icc:ro" \
  -v "$PWD/tests/fixtures/generate:/gen:ro" \
  converter-fixtures bash /gen/generate.sh "$@"
