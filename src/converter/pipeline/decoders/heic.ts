// Декодер HEIC на libheif (WASM). Вызываем C API напрямую: высокоуровневая обёртка libheif-js
// не отдаёт ICC-профиль, nclx и блок Exif. Раскладка структур — для wasm32 (указатели и size_t по 4 байта).
// Функции, возвращающие struct heif_error, на wasm32 принимают первым аргументом указатель на результат (12 байт).

import createLibheif from 'libheif-js/libheif-wasm/libheif.js';
import libheifWasmUrl from 'libheif-js/libheif-wasm/libheif.wasm?url';
import type { Nclx } from '../../color/nclx';
import { tiffFromHeifExif } from '../../metadata/heif-exif';
import { ConvertError, type DecodedImage, type Decoder, type DecoderSession, type ErrorCode } from '../types';
import { compileWasm } from '../wasm';

interface Libheif {
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  _heif_init(err: number, params: number): void;
  _heif_context_alloc(): number;
  _heif_context_free(ctx: number): void;
  _heif_context_read_from_memory_without_copy(err: number, ctx: number, data: number, size: number, options: number): void;
  _heif_context_get_primary_image_handle(err: number, ctx: number, outHandle: number): void;
  _heif_image_handle_release(handle: number): void;
  _heif_image_handle_get_width(handle: number): number;
  _heif_image_handle_get_height(handle: number): number;
  _heif_image_handle_has_alpha_channel(handle: number): number;
  _heif_image_handle_get_color_profile_type(handle: number): number;
  _heif_image_handle_get_raw_color_profile_size(handle: number): number;
  _heif_image_handle_get_raw_color_profile(err: number, handle: number, out: number): void;
  _heif_image_handle_get_nclx_color_profile(err: number, handle: number, outNclx: number): void;
  _heif_nclx_color_profile_free(nclx: number): void;
  _heif_image_handle_get_number_of_metadata_blocks(handle: number, typeFilter: number): number;
  _heif_image_handle_get_list_of_metadata_block_IDs(handle: number, typeFilter: number, ids: number, count: number): number;
  _heif_image_handle_get_metadata_size(handle: number, id: number): number;
  _heif_image_handle_get_metadata(err: number, handle: number, id: number, out: number): void;
  _heif_decode_image(err: number, handle: number, outImage: number, colorspace: number, chroma: number, options: number): void;
  _heif_image_release(image: number): void;
  _heif_image_get_width(image: number, channel: number): number;
  _heif_image_get_height(image: number, channel: number): number;
  _heif_image_get_plane2(image: number, channel: number, outStride: number): number;
}

const COLORSPACE_RGB = 1;
const CHROMA_INTERLEAVED_RGBA = 11;
const CHANNEL_INTERLEAVED = 10;
const PROFILE_PROF = 0x70726f66; // 'prof'
const PROFILE_RICC = 0x72494343; // 'rICC'

// коды heif_error_code
const HEIF_OK = 0;
const HEIF_UNSUPPORTED_FILETYPE = 3;
const HEIF_UNSUPPORTED_FEATURE = 4;
const HEIF_MEMORY_ALLOCATION_ERROR = 6;
const HEIF_COLOR_PROFILE_DOES_NOT_EXIST = 10;
const HEIF_SUBERROR_SECURITY_LIMIT = 1000;

let libPromise: Promise<Libheif> | null = null;

function loadLibheif(): Promise<Libheif> {
  if (!libPromise) {
    libPromise = (async () => {
      const compiled = await compileWasm(libheifWasmUrl);
      const lib = await new Promise<Libheif>((resolve, reject) => {
        // emscripten использует переданный объект как Module; сборка синхронная (WASM_ASYNC_COMPILATION=0),
        // поэтому экземпляр создаём синхронно из заранее скомпилированного модуля
        const moduleObject: Record<string, unknown> = {
          instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => unknown) {
            return receive(new WebAssembly.Instance(compiled, imports), compiled);
          },
          onRuntimeInitialized: () => resolve(moduleObject as unknown as Libheif),
          onAbort: (reason: unknown) => reject(new Error(`libheif: abort ${String(reason)}`)),
          print: () => {},
          printErr: () => {},
        };
        createLibheif(moduleObject);
      });
      const err = lib._malloc(12);
      lib._heif_init(err, 0);
      lib._free(err);
      return lib;
    })();
    libPromise.catch(() => (libPromise = null));
  }
  return libPromise;
}

function readCString(lib: Libheif, ptr: number): string {
  if (!ptr) return '';
  const heap = lib.HEAPU8;
  let end = ptr;
  while (end < heap.length && heap[end] !== 0) end++;
  return new TextDecoder().decode(heap.subarray(ptr, end));
}

function errorCodeFor(code: number, subcode: number): ErrorCode {
  if (code === HEIF_MEMORY_ALLOCATION_ERROR) return 'out-of-memory';
  if (code === HEIF_UNSUPPORTED_FEATURE || code === HEIF_UNSUPPORTED_FILETYPE || subcode === HEIF_SUBERROR_SECURITY_LIMIT) {
    return 'unsupported-variant';
  }
  return 'decode-failed';
}

class HeicSession implements DecoderSession {
  readonly width: number;
  readonly height: number;
  private readonly input: number;
  private readonly scratch: number; // heif_error (12) + выходной указатель (4) + stride (4) + "Exif\0" (8)
  private readonly context: number;
  private handle = 0;

  constructor(
    private readonly lib: Libheif,
    bytes: Uint8Array,
  ) {
    this.input = lib._malloc(bytes.length);
    this.scratch = lib._malloc(32);
    this.context = lib._heif_context_alloc();
    if (!this.input || !this.scratch || !this.context) {
      this.close();
      throw new ConvertError('out-of-memory', 'libheif: не удалось выделить память');
    }
    try {
      lib.HEAPU8.set(bytes, this.input);
      lib._heif_context_read_from_memory_without_copy(this.err, this.context, this.input, bytes.length, 0);
      this.check('чтение файла');
      lib._heif_context_get_primary_image_handle(this.err, this.context, this.out);
      this.check('основное изображение');
      this.handle = lib.HEAPU32[this.out >> 2]!;
      this.width = lib._heif_image_handle_get_width(this.handle);
      this.height = lib._heif_image_handle_get_height(this.handle);
    } catch (error) {
      this.close();
      throw error;
    }
  }

  private get err() {
    return this.scratch;
  }
  private get out() {
    return this.scratch + 12;
  }
  private get strideOut() {
    return this.scratch + 16;
  }
  private get exifFilter() {
    return this.scratch + 20;
  }

  private errorCode(): number {
    return this.lib.HEAP32[this.err >> 2]!;
  }

  private check(what: string): void {
    const code = this.errorCode();
    if (code === HEIF_OK) return;
    const subcode = this.lib.HEAP32[(this.err + 4) >> 2]!;
    const message = readCString(this.lib, this.lib.HEAPU32[(this.err + 8) >> 2]!);
    throw new ConvertError(errorCodeFor(code, subcode), `libheif (${what}): ${message} [${code}/${subcode}]`);
  }

  private readIcc(): Uint8Array | null {
    const { lib } = this;
    const type = lib._heif_image_handle_get_color_profile_type(this.handle) >>> 0;
    if (type !== PROFILE_PROF && type !== PROFILE_RICC) return null;
    const size = lib._heif_image_handle_get_raw_color_profile_size(this.handle);
    if (size <= 0) return null;
    const ptr = lib._malloc(size);
    try {
      lib._heif_image_handle_get_raw_color_profile(this.err, this.handle, ptr);
      if (this.errorCode() !== HEIF_OK) return null;
      return lib.HEAPU8.slice(ptr, ptr + size);
    } finally {
      lib._free(ptr);
    }
  }

  private readNclx(): Nclx | null {
    const { lib } = this;
    lib._heif_image_handle_get_nclx_color_profile(this.err, this.handle, this.out);
    const code = this.errorCode();
    if (code === HEIF_COLOR_PROFILE_DOES_NOT_EXIST || code !== HEIF_OK) return null;
    const ptr = lib.HEAPU32[this.out >> 2]!;
    // struct heif_color_profile_nclx: version u8 @0, color_primaries @4, transfer @8, matrix @12, full_range u8 @16
    const nclx: Nclx = {
      colorPrimaries: lib.HEAP32[(ptr + 4) >> 2]!,
      transferCharacteristics: lib.HEAP32[(ptr + 8) >> 2]!,
      matrixCoefficients: lib.HEAP32[(ptr + 12) >> 2]!,
      fullRange: lib.HEAPU8[ptr + 16] !== 0,
    };
    lib._heif_nclx_color_profile_free(ptr);
    return nclx;
  }

  private readExif(): Uint8Array | null {
    const { lib } = this;
    lib.HEAPU8.set([0x45, 0x78, 0x69, 0x66, 0], this.exifFilter); // "Exif"
    const count = lib._heif_image_handle_get_number_of_metadata_blocks(this.handle, this.exifFilter);
    if (count <= 0) return null;
    const ids = lib._malloc(count * 4);
    try {
      lib._heif_image_handle_get_list_of_metadata_block_IDs(this.handle, this.exifFilter, ids, count);
      const id = lib.HEAPU32[ids >> 2]!;
      const size = lib._heif_image_handle_get_metadata_size(this.handle, id);
      if (size <= 0) return null;
      const data = lib._malloc(size);
      try {
        lib._heif_image_handle_get_metadata(this.err, this.handle, id, data);
        if (this.errorCode() !== HEIF_OK) return null;
        return tiffFromHeifExif(lib.HEAPU8.subarray(data, data + size));
      } finally {
        lib._free(data);
      }
    } finally {
      lib._free(ids);
    }
  }

  decode(): DecodedImage {
    const { lib } = this;
    // метаданные копируем до декодирования: они не зависят от пикселей
    const icc = this.readIcc();
    const nclx = this.readNclx();
    const exif = this.readExif();
    const hasAlpha = lib._heif_image_handle_has_alpha_channel(this.handle) !== 0;

    // options = NULL: libheif применяет irot/imir/clap, а 10 бит при выводе в RGBA понижает до 8
    lib._heif_decode_image(this.err, this.handle, this.out, COLORSPACE_RGB, CHROMA_INTERLEAVED_RGBA, 0);
    this.check('декодирование');
    const image = lib.HEAPU32[this.out >> 2]!;
    const width = lib._heif_image_get_width(image, CHANNEL_INTERLEAVED);
    const height = lib._heif_image_get_height(image, CHANNEL_INTERLEAVED);
    const plane = lib._heif_image_get_plane2(image, CHANNEL_INTERLEAVED, this.strideOut);
    const stride = lib.HEAPU32[this.strideOut >> 2]!;
    const rowBytes = width * 4;
    if (!plane || width <= 0 || height <= 0 || stride < rowBytes) {
      lib._heif_image_release(image);
      throw new ConvertError('decode-failed', 'libheif: пустое изображение');
    }
    // убираем выравнивание строк прямо в памяти WASM — без лишней копии на десятки мегабайт
    if (stride !== rowBytes) {
      const heap = lib.HEAPU8;
      for (let y = 1; y < height; y++) heap.copyWithin(plane + y * rowBytes, plane + y * stride, plane + y * stride + rowBytes);
    }
    let released = false;
    return {
      width,
      height,
      rgba: lib.HEAPU8.subarray(plane, plane + rowBytes * height),
      hasAlpha,
      icc,
      nclx,
      exif,
      release: () => {
        if (!released) lib._heif_image_release(image);
        released = true;
      },
    };
  }

  close(): void {
    const { lib } = this;
    if (this.handle) lib._heif_image_handle_release(this.handle);
    if (this.context) lib._heif_context_free(this.context);
    if (this.input) lib._free(this.input);
    if (this.scratch) lib._free(this.scratch);
    this.handle = 0;
  }
}

export async function loadHeicDecoder(): Promise<Decoder> {
  const lib = await loadLibheif();
  return { open: (bytes) => new HeicSession(lib, bytes), heapBytes: () => lib.HEAPU8.length };
}
