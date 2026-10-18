// Декодер WebP для конвертера: основное изображение или первый кадр анимации → RGBA 8 бит (без премультипликации).
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include <emscripten/emscripten.h>

#include "webp/decode.h"
#include "webp/demux.h"

EMSCRIPTEN_KEEPALIVE int webp_decoder_version(void) { return WebPGetDecoderVersion(); }

// Возвращает буфер width*height*4 (освобождать webp_free) или NULL.
// info[0] — ширина, info[1] — высота, info[2] — 1, если файл анимированный; при ошибке info[2] — код VP8StatusCode
// (или -1, если не удался разбор анимации).
EMSCRIPTEN_KEEPALIVE uint8_t* webp_decode_rgba(const uint8_t* data, size_t size, int* info) {
  WebPBitstreamFeatures features;
  VP8StatusCode status = WebPGetFeatures(data, size, &features);
  if (status != VP8_STATUS_OK) {
    info[2] = status;
    return NULL;
  }
  if (features.has_animation) {
    WebPData webp = {data, size};
    WebPAnimDecoderOptions options;
    if (!WebPAnimDecoderOptionsInit(&options)) {
      info[2] = -1;
      return NULL;
    }
    options.color_mode = MODE_RGBA;
    options.use_threads = 0;
    WebPAnimDecoder* decoder = WebPAnimDecoderNew(&webp, &options);
    if (decoder == NULL) {
      info[2] = -1;
      return NULL;
    }
    WebPAnimInfo anim;
    uint8_t* frame = NULL;
    int timestamp = 0;
    uint8_t* rgba = NULL;
    if (WebPAnimDecoderGetInfo(decoder, &anim) && WebPAnimDecoderGetNext(decoder, &frame, &timestamp)) {
      const size_t bytes = (size_t)anim.canvas_width * anim.canvas_height * 4;
      rgba = (uint8_t*)malloc(bytes);
      if (rgba != NULL) {
        memcpy(rgba, frame, bytes);
        info[0] = (int)anim.canvas_width;
        info[1] = (int)anim.canvas_height;
        info[2] = 1;
      } else {
        info[2] = VP8_STATUS_OUT_OF_MEMORY;
      }
    } else {
      info[2] = -1;
    }
    WebPAnimDecoderDelete(decoder);
    return rgba;
  }
  const size_t stride = (size_t)features.width * 4;
  const size_t bytes = stride * features.height;
  uint8_t* rgba = (uint8_t*)malloc(bytes);
  if (rgba == NULL) {
    info[2] = VP8_STATUS_OUT_OF_MEMORY;
    return NULL;
  }
  if (WebPDecodeRGBAInto(data, size, rgba, bytes, (int)stride) == NULL) {
    free(rgba);
    info[2] = VP8_STATUS_BITSTREAM_ERROR;
    return NULL;
  }
  info[0] = features.width;
  info[1] = features.height;
  info[2] = 0;
  return rgba;
}

EMSCRIPTEN_KEEPALIVE void webp_free(void* ptr) { free(ptr); }
