// Типы модуля webp_dec (собран из codecs/webp, см. BUILD.txt).
export interface WebpDecoderModule {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  /** RGBA основного изображения или первого кадра; info — 3 × int32: ширина, высота, флаг/код ошибки. */
  _webp_decode_rgba(data: number, size: number, info: number): number;
  _webp_free(ptr: number): void;
  _webp_decoder_version(): number;
}

export default function createWebpDecoder(options?: Record<string, unknown>): Promise<WebpDecoderModule>;
