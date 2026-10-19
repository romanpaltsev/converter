// Декодер AVIF: своя сборка libheif + dav1d (codecs/avif, src/converter/vendor/avif). Тот же C API libheif,
// что у HEIC, поэтому сессия общая (heif.ts): ICC, nclx, Exif, irot/imir/clap и 10/12 бит → 8 — как у HEIC.
// У анимированного AVIF (бренд avis) декодируется основное изображение.

import createAvifDecoder from '../../vendor/avif/avif_dec.mjs';
import avifDecWasmUrl from '../../vendor/avif/avif_dec.wasm?url';
import { readFtypBrands } from '../sniff';
import type { Decoder, WarningCode } from '../types';
import { compileWasm } from '../wasm';
import { type Libheif, heifDecoder, initLibheif } from './heif';

let loading: Promise<Libheif> | null = null;

function loadModule(): Promise<Libheif> {
  if (!loading) {
    loading = (async () => {
      const compiled = await compileWasm(avifDecWasmUrl);
      const lib = await createAvifDecoder({
        instantiateWasm(imports: WebAssembly.Imports, receive: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) {
          void WebAssembly.instantiate(compiled, imports).then((instance) => receive(instance, compiled));
          return {};
        },
        print: () => {},
        printErr: () => {},
      });
      return initLibheif(lib);
    })();
    loading.catch(() => (loading = null));
  }
  return loading;
}

function avifWarnings(bytes: Uint8Array): WarningCode[] {
  return readFtypBrands(bytes).includes('avis') ? ['first-frame-only'] : [];
}

export async function loadAvifDecoder(): Promise<Decoder> {
  return heifDecoder('libheif-avif', await loadModule(), avifWarnings);
}
