// Типы модуля webp_enc (собран из codecs/webp, см. BUILD.txt).
export interface WebpEncoderModule {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  /** Файл WebP или 0; result — 2 × int32: размер и код WebPEncodingError. */
  _webp_encode_rgba(rgba: number, width: number, height: number, quality: number, lossless: number, level: number, result: number): number;
  _webp_free(ptr: number): void;
  _webp_encoder_version(): number;
}

export default function createWebpEncoder(options?: Record<string, unknown>): Promise<WebpEncoderModule>;
