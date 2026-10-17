#!/usr/bin/env bash
# Прогон e2e в официальном образе Playwright: внутри есть все браузеры и их системные зависимости
# (локально WebKit и Firefox без sudo не поставить). Аргументы передаются в `playwright test`.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('@playwright/test/package.json').version")
# E2E_NETWORK — docker-сеть, в которой запущен сайт (прогон против контейнера, см. smoke-docker.sh)
NETWORK=()
if [[ -n "${E2E_NETWORK:-}" ]]; then NETWORK=(--network "$E2E_NETWORK"); fi
docker run --rm --init --ipc=host --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI -e E2E_BASE_URL "${NETWORK[@]}" \
  -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:v${VERSION}-noble" npx playwright test "$@"
