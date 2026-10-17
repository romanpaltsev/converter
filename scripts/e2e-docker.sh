#!/usr/bin/env bash
# Прогон e2e в официальном образе Playwright: внутри есть все браузеры и их системные зависимости
# (локально WebKit и Firefox без sudo не поставить). Аргументы передаются в `playwright test`.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('@playwright/test/package.json').version")
docker run --rm --init --ipc=host --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI -e E2E_BASE_URL \
  --add-host=host.docker.internal:host-gateway \
  -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:v${VERSION}-noble" npx playwright test "$@"
