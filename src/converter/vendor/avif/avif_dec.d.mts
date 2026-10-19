// Типы модуля avif_dec (libheif + dav1d, собран из codecs/avif, см. BUILD.txt). Набор функций — Libheif.
import type { Libheif } from '../../pipeline/decoders/heif';

export default function createAvifDecoder(options?: Record<string, unknown>): Promise<Libheif>;
