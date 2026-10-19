// Типы модуля avif_enc (собран из codecs/avif-enc, см. BUILD.txt).
export interface AvifEncoderModule {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  /** Файл AVIF (освобождать _free) или 0; result — 3 × int32: размер, код и подкод heif_error. */
  _avif_encode_rgba(
    rgba: number,
    width: number,
    height: number,
    hasAlpha: number,
    quality: number,
    speed: number,
    icc: number,
    iccSize: number,
    exif: number,
    exifSize: number,
    result: number,
  ): number;
  _avif_encoder_version(): number;
}

export default function createAvifEncoder(options?: Record<string, unknown>): Promise<AvifEncoderModule>;
