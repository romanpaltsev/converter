// Кодировщик AVIF для конвертера: RGBA 8 бит → AVIF (libheif + libaom). В отличие от JPEG/PNG/WebP метаданные
// пишет сам libheif — ICC (бокс colr/prof) и Exif (элемент метаданных), поэтому они передаются сюда.
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#include <emscripten/emscripten.h>

#include "libheif/heif.h"

struct output {
  uint8_t* data;
  size_t size;
};

static struct heif_error ok_error(void) {
  struct heif_error error = {heif_error_Ok, heif_suberror_Unspecified, "Success"};
  return error;
}

// heif_context_write отдаёт файл целиком одним вызовом: копируем его в свою кучу
static struct heif_error write_output(struct heif_context* ctx, const void* data, size_t size, void* userdata) {
  (void)ctx;
  struct output* out = (struct output*)userdata;
  out->data = (uint8_t*)malloc(size);
  if (!out->data) {
    struct heif_error error = {heif_error_Memory_allocation_error, heif_suberror_Unspecified, "out of memory"};
    return error;
  }
  memcpy(out->data, data, size);
  out->size = size;
  return ok_error();
}

EMSCRIPTEN_KEEPALIVE int avif_encoder_version(void) { return (int)heif_get_version_number(); }

// quality — 0–100; speed — скорость libaom 0–9 (выше — быстрее и чуть хуже); icc/exif — может быть NULL.
// exif — структура TIFF (с «II»/«MM»), смещение до неё libheif допишет сам.
// Возвращает файл (освобождать free) или NULL; result[0] — размер, result[1] — код heif_error_code, result[2] — подкод.
EMSCRIPTEN_KEEPALIVE uint8_t* avif_encode_rgba(const uint8_t* rgba, int width, int height, int has_alpha, int quality,
                                               int speed, const uint8_t* icc, int icc_size, const uint8_t* exif,
                                               int exif_size, int* result) {
  static int initialized = 0;
  if (!initialized) {
    heif_init(NULL);
    initialized = 1;
  }
  result[0] = result[1] = result[2] = 0;
  struct heif_context* ctx = heif_context_alloc();
  struct heif_encoder* encoder = NULL;
  struct heif_image* image = NULL;
  struct heif_image_handle* handle = NULL;
  struct heif_encoding_options* options = NULL;
  struct output out = {NULL, 0};
  struct heif_error error = ok_error();

  if (!ctx) {
    result[1] = heif_error_Memory_allocation_error;
    return NULL;
  }
  error = heif_context_get_encoder_for_format(ctx, heif_compression_AV1, &encoder);
  if (error.code) goto done;
  error = heif_encoder_set_lossy_quality(encoder, quality);
  if (error.code) goto done;
  error = heif_encoder_set_parameter_integer(encoder, "speed", speed);
  if (error.code) goto done;
  // 4:2:0 — как у фотографий в JPEG и у большинства AVIF в вебе: файл заметно меньше, на фото разницы не видно
  error = heif_encoder_set_parameter_string(encoder, "chroma", "420");
  if (error.code) goto done;

  error = heif_image_create(width, height, heif_colorspace_RGB,
                            has_alpha ? heif_chroma_interleaved_RGBA : heif_chroma_interleaved_RGB, &image);
  if (error.code) goto done;
  error = heif_image_add_plane(image, heif_channel_interleaved, width, height, 8);
  if (error.code) goto done;
  {
    int stride = 0;
    uint8_t* plane = heif_image_get_plane(image, heif_channel_interleaved, &stride);
    const int channels = has_alpha ? 4 : 3;
    for (int y = 0; y < height; y++) {
      const uint8_t* src = rgba + (size_t)y * width * 4;
      uint8_t* dst = plane + (size_t)y * stride;
      if (has_alpha) {
        memcpy(dst, src, (size_t)width * 4);
      } else {
        for (int x = 0; x < width; x++) memcpy(dst + x * channels, src + x * 4, 3);
      }
    }
  }
  if (icc && icc_size > 0) {
    error = heif_image_set_raw_color_profile(image, "prof", icc, (size_t)icc_size);
    if (error.code) goto done;
  }

  options = heif_encoding_options_alloc();
  error = heif_context_encode_image(ctx, image, encoder, options, &handle);
  if (error.code) goto done;
  if (exif && exif_size > 0) {
    error = heif_context_add_exif_metadata(ctx, handle, exif, exif_size);
    if (error.code) goto done;
  }
  {
    struct heif_writer writer = {1, write_output};
    error = heif_context_write(ctx, &writer, &out);
  }

done:
  result[0] = (int)out.size;
  result[1] = error.code;
  result[2] = error.subcode;
  if (error.code && out.data) {
    free(out.data);
    out.data = NULL;
  }
  if (options) heif_encoding_options_free(options);
  if (handle) heif_image_handle_release(handle);
  if (image) heif_image_release(image);
  if (encoder) heif_encoder_release(encoder);
  heif_context_free(ctx);
  return out.data;
}
