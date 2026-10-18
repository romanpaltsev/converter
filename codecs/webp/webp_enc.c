// Кодировщик WebP для конвертера: RGBA 8 бит → WebP с потерями или без. Метаданные (ICCP, EXIF) добавляет TypeScript.
#include <stddef.h>
#include <stdint.h>

#include <emscripten/emscripten.h>

#include "webp/encode.h"

EMSCRIPTEN_KEEPALIVE int webp_encoder_version(void) { return WebPGetEncoderVersion(); }

// quality — 0–100 (с потерями); lossless — 1 без потерь, тогда level — усилие сжатия 0–9 (как cwebp -z).
// Возвращает файл (освобождать webp_free) или NULL; result[0] — размер, result[1] — код WebPEncodingError.
EMSCRIPTEN_KEEPALIVE uint8_t* webp_encode_rgba(const uint8_t* rgba, int width, int height, float quality, int lossless,
                                               int level, int* result) {
  WebPConfig config;
  if (!WebPConfigInit(&config)) {
    result[1] = -1;
    return NULL;
  }
  if (lossless) {
    if (!WebPConfigLosslessPreset(&config, level)) {
      result[1] = -1;
      return NULL;
    }
  } else {
    config.quality = quality;
    config.method = 4;
  }
  config.thread_level = 0;
  if (!WebPValidateConfig(&config)) {
    result[1] = -1;
    return NULL;
  }

  WebPPicture picture;
  if (!WebPPictureInit(&picture)) {
    result[1] = -1;
    return NULL;
  }
  picture.width = width;
  picture.height = height;
  picture.use_argb = 1;
  if (!WebPPictureImportRGBA(&picture, rgba, width * 4)) {
    result[1] = VP8_ENC_ERROR_OUT_OF_MEMORY;
    return NULL;
  }
  WebPMemoryWriter writer;
  WebPMemoryWriterInit(&writer);
  picture.writer = WebPMemoryWrite;
  picture.custom_ptr = &writer;
  const int ok = WebPEncode(&config, &picture);
  result[1] = ok ? 0 : picture.error_code;
  WebPPictureFree(&picture);
  if (!ok) {
    WebPMemoryWriterClear(&writer);
    return NULL;
  }
  result[0] = (int)writer.size;
  return writer.mem;
}

EMSCRIPTEN_KEEPALIVE void webp_free(void* ptr) { WebPFree(ptr); }
