#!/usr/bin/env bash
# Lighthouse (мобильный профиль) против Docker-образа сайта — с настоящим nginx (gzip, кэш).
# Chrome берётся из образа Playwright: под WSL lighthouse с локальным Chrome создаёт мусорные каталоги.
# Отчёты: test-results/lighthouse/*.report.html
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT=converter-lh
export HOST_PORT=${LH_PORT:-18091}
trap 'docker compose -p "$PROJECT" down --remove-orphans >/dev/null 2>&1 || true' EXIT
docker compose -p "$PROJECT" up -d --build --wait
VERSION=$(node -p "require('@playwright/test/package.json').version")
OUT="$PWD/test-results/lighthouse"
mkdir -p "$OUT"
# сеть контейнера сайта: адрес http://localhost — защищённый контекст, как HTTPS в продакшене
docker run --rm --network "container:${PROJECT}-web-1" --user "$(id -u):$(id -g)" -e HOME=/tmp -v "$OUT:/out" \
  "mcr.microsoft.com/playwright:v${VERSION}-noble" bash -c '
    export CHROME_PATH=$(ls -d /ms-playwright/chromium-*/chrome-linux*/chrome | head -1)
    for page in heic-v-jpg en/heic-to-jpg heic-v-png ""; do
      name=$(echo "${page:-home}" | tr / _)
      npx -y lighthouse@13.5.0 "http://localhost/$page" --quiet --chrome-flags="--headless=new --no-sandbox" \
        --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path="/out/$name"
    done'
node -e '
const fs = require("fs");
for (const file of fs.readdirSync(process.argv[1]).filter((f) => f.endsWith(".report.json"))) {
  const r = JSON.parse(fs.readFileSync(`${process.argv[1]}/${file}`, "utf8"));
  const scores = Object.entries(r.categories).map(([k, v]) => `${k} ${Math.round(v.score * 100)}`).join(", ");
  const a = r.audits;
  console.log(`${r.finalDisplayedUrl.replace("http://localhost", "")}: ${scores}; FCP ${a["first-contentful-paint"].displayValue}, LCP ${a["largest-contentful-paint"].displayValue}, TBT ${a["total-blocking-time"].displayValue}, CLS ${a["cumulative-layout-shift"].displayValue}`);
}' "$OUT"
