#!/usr/bin/env bash
# Сборка libwebp и двух модулей конвертера внутри образа emsdk (запуск: npm run codecs).
# webp_dec — декодер и demux (первый кадр анимации), webp_enc — кодировщик. Выход — /out (src/converter/vendor/webp).
set -euo pipefail
cd /src/libwebp

# Исправление сборки libwebp 1.6.0 под Emscripten: в начало списка SIMD добавили AVX2, а проверка «индекс ≥ 2 —
# остановиться» осталась прежней, поэтому выпадает SSE2, на который опирается код SSE4.1 (ошибка компиляции enc_sse41.c).
# Для Emscripten пропускаем AVX2 (в WebAssembly SIMD — 128 бит) и оставляем SSE4.1 и SSE2.
perl -0pi -e 's/  if\(EMSCRIPTEN AND \$\{I_SIMD\} GREATER_EQUAL 2\)\n    break\(\)\n  endif\(\)/  if(EMSCRIPTEN AND \${I_SIMD} EQUAL 0)\n    continue()\n  endif()\n  if(EMSCRIPTEN AND \${I_SIMD} GREATER_EQUAL 3)\n    break()\n  endif()/' cmake/cpu.cmake
grep -q 'I_SIMD} GREATER_EQUAL 3' cmake/cpu.cmake

emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
  -DWEBP_ENABLE_SIMD=ON -DWEBP_USE_THREAD=OFF \
  -DWEBP_BUILD_ANIM_UTILS=OFF -DWEBP_BUILD_CWEBP=OFF -DWEBP_BUILD_DWEBP=OFF -DWEBP_BUILD_GIF2WEBP=OFF \
  -DWEBP_BUILD_IMG2WEBP=OFF -DWEBP_BUILD_VWEBP=OFF -DWEBP_BUILD_WEBPINFO=OFF -DWEBP_BUILD_LIBWEBPMUX=OFF \
  -DWEBP_BUILD_WEBPMUX=OFF -DWEBP_BUILD_EXTRAS=OFF >/dev/null
cmake --build build -j"$(nproc)" >/dev/null

# Общие флаги: ES-модуль для worker'а, куча растёт до 2 ГБ, стек как у официальной сборки webp.js (5 МБ).
COMMON=(
  -O3 -msimd128 -Isrc
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker
  -sALLOW_MEMORY_GROWTH=1 -sMAXIMUM_MEMORY=2GB -sSTACK_SIZE=5MB
  -sFILESYSTEM=0 -sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAP32
  -sINCOMING_MODULE_JS_API=instantiateWasm,print,printErr,onAbort
  --no-entry
)
LIBS=(build/libwebpdemux.a build/libwebp.a build/libsharpyuv.a)

emcc "${COMMON[@]}" /gen/webp_dec.c "${LIBS[@]}" -o /out/webp_dec.mjs -sEXPORT_NAME=createWebpDecoder \
  -sEXPORTED_FUNCTIONS=_malloc,_free,_webp_decode_rgba,_webp_free,_webp_decoder_version
emcc "${COMMON[@]}" /gen/webp_enc.c "${LIBS[@]}" -o /out/webp_enc.mjs -sEXPORT_NAME=createWebpEncoder \
  -sEXPORTED_FUNCTIONS=_malloc,_free,_webp_encode_rgba,_webp_free,_webp_encoder_version

{
  echo "libwebp ${LIBWEBP_VERSION}, $(emcc --version | head -1)"
  (cd /out && sha256sum webp_dec.mjs webp_dec.wasm webp_enc.mjs webp_enc.wasm)
} > /out/BUILD.txt
chown -R "${HOST_UID:-0}:${HOST_GID:-0}" /out
