#!/usr/bin/env bash
# Сборка кодировщика AVIF внутри образа emsdk (npm run codecs -- avif-enc): libaom (только кодировщик AV1, 8 бит,
# без ассемблера и потоков) → libheif только с этим кодировщиком → обёртка avif_enc.c.
# Выход — /out (src/converter/vendor/avif-enc).
set -euo pipefail

# libaom: generic — без ассемблера (в WebAssembly его нет; SIMD — авто-векторизацией -msimd128), без декодера,
# без потоков (без -pthread в WebAssembly их нет), только 8 бит (на вход всегда RGBA 8 бит — высокая глубина не нужна)
cd /src/aom
emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DAOM_TARGET_CPU=generic \
  -DCONFIG_AV1_DECODER=0 -DCONFIG_AV1_ENCODER=1 -DCONFIG_MULTITHREAD=0 -DCONFIG_RUNTIME_CPU_DETECT=0 \
  -DCONFIG_AV1_HIGHBITDEPTH=0 -DCONFIG_WEBM_IO=0 -DCONFIG_TUNE_VMAF=0 -DCONFIG_TUNE_BUTTERAUGLI=0 \
  -DENABLE_DOCS=0 -DENABLE_EXAMPLES=0 -DENABLE_TESTS=0 -DENABLE_TESTDATA=0 -DENABLE_TOOLS=0 \
  -DCMAKE_C_FLAGS="-O3 -msimd128" -DCMAKE_CXX_FLAGS="-O3 -msimd128" >/dev/null
cmake --build build -j"$(nproc)" >/dev/null

# __EMSCRIPTEN_STANDALONE_WASM__ выключает в heif.cc обёртку embind (нужен только C API)
cd /src/libheif
CFLAGS="-O3 -msimd128 -D__EMSCRIPTEN_STANDALONE_WASM__=1"
emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
  -DENABLE_PLUGIN_LOADING=OFF -DENABLE_MULTITHREADING_SUPPORT=OFF -DENABLE_PARALLEL_TILE_DECODING=OFF \
  -DWITH_AOM_ENCODER=ON -DWITH_AOM_ENCODER_PLUGIN=OFF -DWITH_AOM_DECODER=OFF \
  -DAOM_INCLUDE_DIR=/src/aom -DAOM_LIBRARY=/src/aom/build/libaom.a \
  -DCMAKE_C_FLAGS="$CFLAGS" -DCMAKE_CXX_FLAGS="$CFLAGS" \
  -DWITH_DAV1D=OFF -DWITH_LIBDE265=OFF -DWITH_X265=OFF -DWITH_X264=OFF -DWITH_OpenH264_DECODER=OFF \
  -DWITH_SvtEnc=OFF -DWITH_RAV1E=OFF \
  -DWITH_JPEG_DECODER=OFF -DWITH_JPEG_ENCODER=OFF -DWITH_OpenJPEG_DECODER=OFF -DWITH_OpenJPEG_ENCODER=OFF \
  -DWITH_OPENJPH_ENCODER=OFF -DWITH_FFMPEG_DECODER=OFF -DWITH_UNCOMPRESSED_CODEC=OFF -DWITH_WEBCODECS=OFF \
  -DWITH_LIBSHARPYUV=OFF -DWITH_HEADER_COMPRESSION=OFF -DWITH_GDK_PIXBUF=OFF \
  -DWITH_EXAMPLES=OFF -DBUILD_TESTING=OFF -DBUILD_DOCUMENTATION=OFF >/dev/null
cmake --build build -j"$(nproc)" >/dev/null

emcc -O3 -msimd128 -c /gen/avif_enc.c -o /tmp/avif_enc.o -I/src/libheif/libheif/api -I/src/libheif/build

# Флаги — как у остальных модулей: ES-модуль для worker'а, куча растёт до 2 ГБ.
em++ -O3 -msimd128 \
  /tmp/avif_enc.o build/libheif/libheif.a /src/aom/build/libaom.a \
  -o /out/avif_enc.mjs -sEXPORT_NAME=createAvifEncoder \
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker \
  -sALLOW_MEMORY_GROWTH=1 -sMAXIMUM_MEMORY=2GB -sSTACK_SIZE=5MB \
  -sFILESYSTEM=0 -sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAP32 \
  -sINCOMING_MODULE_JS_API=instantiateWasm,print,printErr,onAbort \
  -sEXPORTED_FUNCTIONS=_malloc,_free,_avif_encode_rgba,_avif_encoder_version --no-entry

{
  echo "libheif ${LIBHEIF_VERSION} + libaom ${AOM_VERSION} (только кодировщик), $(emcc --version | head -1)"
  (cd /out && sha256sum avif_enc.mjs avif_enc.wasm)
} > /out/BUILD.txt
chown -R "${HOST_UID:-0}:${HOST_GID:-0}" /out
