// Декодер HEIC: libheif-js (libheif + libde265). Сама сессия общая с AVIF — heif.ts.

import createLibheif from 'libheif-js/libheif-wasm/libheif.js';
import libheifWasmUrl from 'libheif-js/libheif-wasm/libheif.wasm?url';
import type { Decoder } from '../types';
import { compileWasm } from '../wasm';
import { type Libheif, heifDecoder, initLibheif } from './heif';

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
      return initLibheif(lib);
    })();
    libPromise.catch(() => (libPromise = null));
  }
  return libPromise;
}

export async function loadHeicDecoder(): Promise<Decoder> {
  return heifDecoder('libheif', await loadLibheif());
}
