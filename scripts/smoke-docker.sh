#!/usr/bin/env bash
# Проверка Docker-образа: сборка, запуск через docker compose и проверки curl'ом
# (страницы, редиректы, 404 на двух языках, заголовки, MIME и gzip для WASM).
# Флаг --e2e дополнительно прогоняет e2e-тесты против контейнера (в образе Playwright).
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=${SMOKE_PORT:-18090}
PROJECT=converter-smoke
BASE="http://127.0.0.1:$PORT"
export HOST_PORT=$PORT
FAILED=0

cleanup() { docker compose -p "$PROJECT" down --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "== сборка и запуск образа (порт $PORT)"
docker compose -p "$PROJECT" up -d --build --wait

check() { # описание, ожидаемое (подстрока), фактическое
  if [[ "$3" == *"$2"* ]]; then echo "  ok    $1"; else echo "  FAIL  $1: ожидали «$2», получили «$3»"; FAILED=1; fi
}
status() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
header() { curl -s -D - -o /dev/null "${@:2}" | tr -d '\r' | grep -i "^$1:" | head -1 | cut -d' ' -f2-; }

echo "== страницы"
for path in / /heic-v-jpg /heic-v-png /jpg-v-png /png-v-jpg /licenses /contacts \
  /en/ /en/heic-to-jpg /en/heic-to-png /en/jpg-to-png /en/png-to-jpg /en/licenses /en/contacts /robots.txt /sitemap-index.xml /favicon.svg; do
  check "GET $path" 200 "$(status "$BASE$path")"
done

echo "== редиректы и 404"
check "/heic-v-jpg/ → 301" 301 "$(status "$BASE/heic-v-jpg/")"
check "/heic-v-jpg/ → Location" "/heic-v-jpg" "$(header location "$BASE/heic-v-jpg/")"
check "/en → 301 /en/" "/en/" "$(header location "$BASE/en")"
check "/nope → 404" 404 "$(status "$BASE/nope")"
check "/nope — русская 404" "Страница не найдена" "$(curl -s "$BASE/nope")"
check "/en/nope — английская 404" "Page not found" "$(curl -s "$BASE/en/nope")"
check "/404.html напрямую → 404" 404 "$(status "$BASE/404.html")"
check "POST / → 405" 405 "$(status -X POST "$BASE/")"

echo "== заголовки"
check "CSP" "script-src 'self' 'wasm-unsafe-eval'" "$(header content-security-policy "$BASE/heic-v-jpg")"
check "nosniff" "nosniff" "$(header x-content-type-options "$BASE/")"
check "Referrer-Policy" "strict-origin-when-cross-origin" "$(header referrer-policy "$BASE/")"
check "Permissions-Policy" "camera=()" "$(header permissions-policy "$BASE/")"
check "HTML: no-cache" "no-cache" "$(header cache-control "$BASE/heic-v-jpg")"
check "404: CSP" "default-src 'self'" "$(header content-security-policy "$BASE/nope")"
if [[ "${PUBLIC_INDEXING:-false}" == "true" ]]; then
  check "X-Robots-Tag отсутствует" "" "$(header x-robots-tag "$BASE/")"
else
  check "X-Robots-Tag" "noindex, nofollow" "$(header x-robots-tag "$BASE/")"
  check "robots.txt запрещает индексацию" "Disallow: /" "$(curl -s "$BASE/robots.txt")"
fi

echo "== WASM и ассеты"
WASM=$(curl -s "$BASE/heic-v-jpg" | grep -o '/_astro/[^"]*\.js' | head -1)
WORKER=$(curl -s "$BASE$WASM" | grep -o 'convert\.worker-[^"`]*\.js' | head -1)
LIBHEIF=$(docker compose -p "$PROJECT" exec -T web sh -c 'ls /usr/share/nginx/html/_astro/ | grep "^libheif-.*\.wasm$"')
check "worker найден" ".js" "$WORKER"
check "worker: CSP" "'wasm-unsafe-eval'" "$(header content-security-policy "$BASE/_astro/$WORKER")"
check "wasm: application/wasm" "application/wasm" "$(header content-type "$BASE/_astro/$LIBHEIF")"
check "wasm: immutable" "public, max-age=31536000, immutable" "$(header cache-control "$BASE/_astro/$LIBHEIF")"
check "wasm: gzip" "gzip" "$(header content-encoding "$BASE/_astro/$LIBHEIF" -H 'Accept-Encoding: gzip')"
check "html: gzip" "gzip" "$(header content-encoding "$BASE/heic-v-jpg" -H 'Accept-Encoding: gzip')"

if [[ "${1:-}" == "--e2e" ]]; then
  echo "== e2e против контейнера"
  E2E_NETWORK="${PROJECT}_default" E2E_BASE_URL="http://web" bash scripts/e2e-docker.sh --project=chromium --project=firefox --project=webkit || FAILED=1
fi

if [[ $FAILED -ne 0 ]]; then echo "SMOKE: есть ошибки"; exit 1; fi
echo "SMOKE: всё в порядке"
