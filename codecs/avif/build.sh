#!/usr/bin/env bash
# Сборка декодера AVIF внутри образа emsdk (запуск: npm run codecs): dav1d (AV1) → libheif только с dav1d, без
# libde265 и кодировщиков. Модуль отдаёт тот же C API libheif, что и libheif-js для HEIC, поэтому сессия в
# pipeline/decoders/heif.ts общая. Выход — /out (src/converter/vendor/avif).
set -euo pipefail

# dav1d: без ассемблера (в WebAssembly его нет), только библиотека, 8 и 10/12 бит (bitdepth 16).
# Потоков нет: без -pthread emscripten не создаёт потоки, а dav1d при одном ядре работает в вызывающем потоке.
cd /src/dav1d
meson setup build --cross-file /gen/emscripten.cross --buildtype=release --default-library=static \
  -Denable_asm=false -Denable_tools=false -Denable_tests=false -Denable_examples=false -Denable_docs=false \
  -Dlogging=false -Dbitdepths=8,16 -Dc_args=-msimd128 >/dev/null
ninja -C build >/dev/null

# __EMSCRIPTEN_STANDALONE_WASM__ выключает в heif.cc обёртку embind (её использует libheif-js, нам нужен только C API)
cd /src/libheif
CFLAGS="-O3 -msimd128 -D__EMSCRIPTEN_STANDALONE_WASM__=1 -I/src/dav1d/build/include"
emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF \
  -DENABLE_PLUGIN_LOADING=OFF -DENABLE_MULTITHREADING_SUPPORT=OFF -DENABLE_PARALLEL_TILE_DECODING=OFF \
  -DWITH_DAV1D=ON -DWITH_DAV1D_PLUGIN=OFF \
  -DDAV1D_INCLUDE_DIR=/src/dav1d/include -DDAV1D_LIBRARY=/src/dav1d/build/src/libdav1d.a \
  -DCMAKE_C_FLAGS="$CFLAGS" -DCMAKE_CXX_FLAGS="$CFLAGS" \
  -DWITH_LIBDE265=OFF -DWITH_X265=OFF -DWITH_X264=OFF -DWITH_OpenH264_DECODER=OFF \
  -DWITH_AOM_DECODER=OFF -DWITH_AOM_ENCODER=OFF -DWITH_SvtEnc=OFF -DWITH_RAV1E=OFF \
  -DWITH_JPEG_DECODER=OFF -DWITH_JPEG_ENCODER=OFF -DWITH_OpenJPEG_DECODER=OFF -DWITH_OpenJPEG_ENCODER=OFF \
  -DWITH_OPENJPH_ENCODER=OFF -DWITH_FFMPEG_DECODER=OFF -DWITH_UNCOMPRESSED_CODEC=OFF -DWITH_WEBCODECS=OFF \
  -DWITH_LIBSHARPYUV=OFF -DWITH_HEADER_COMPRESSION=OFF -DWITH_GDK_PIXBUF=OFF \
  -DWITH_EXAMPLES=OFF -DBUILD_TESTING=OFF -DBUILD_DOCUMENTATION=OFF >/dev/null
cmake --build build -j"$(nproc)" >/dev/null

# Только функции, которые вызывает pipeline/decoders/heif.ts (и версия — для BUILD.txt).
FUNCTIONS=(
  malloc free heif_get_version heif_init
  heif_context_alloc heif_context_free heif_context_read_from_memory_without_copy heif_context_get_primary_image_handle
  heif_image_handle_release heif_image_handle_get_width heif_image_handle_get_height heif_image_handle_has_alpha_channel
  heif_image_handle_get_color_profile_type heif_image_handle_get_raw_color_profile_size
  heif_image_handle_get_raw_color_profile heif_image_handle_get_nclx_color_profile heif_nclx_color_profile_free
  heif_image_handle_get_number_of_metadata_blocks heif_image_handle_get_list_of_metadata_block_IDs
  heif_image_handle_get_metadata_size heif_image_handle_get_metadata
  heif_decode_image heif_image_release heif_image_get_width heif_image_get_height heif_image_get_plane2
)
EXPORTED=$(printf '_%s,' "${FUNCTIONS[@]}")

# Флаги — как у модулей libwebp: ES-модуль для worker'а, куча растёт до 2 ГБ.
em++ -O3 -msimd128 \
  build/libheif/libheif.a /src/dav1d/build/src/libdav1d.a \
  -o /out/avif_dec.mjs -sEXPORT_NAME=createAvifDecoder \
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sENVIRONMENT=worker \
  -sALLOW_MEMORY_GROWTH=1 -sMAXIMUM_MEMORY=2GB -sSTACK_SIZE=5MB \
  -sFILESYSTEM=0 -sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAP32,HEAPU32 \
  -sINCOMING_MODULE_JS_API=instantiateWasm,print,printErr,onAbort \
  -sEXPORTED_FUNCTIONS="${EXPORTED%,}" --no-entry

{
  echo "libheif ${LIBHEIF_VERSION} + dav1d ${DAV1D_VERSION}, $(emcc --version | head -1)"
  (cd /out && sha256sum avif_dec.mjs avif_dec.wasm)
} > /out/BUILD.txt
chown -R "${HOST_UID:-0}:${HOST_GID:-0}" /out
