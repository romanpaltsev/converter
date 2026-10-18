// Модуль PNG из набора jSquash (Rust `png`, wasm-bindgen). Декодер и кодировщик — один экземпляр:
// glue wasm-bindgen хранит его в переменной модуля, поэтому загружаем один раз на оба.

import initPng from '@jsquash/png/codec/pkg/squoosh_png.js';
import pngWasmUrl from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm?url';
import { compileWasm } from '../wasm';

let loading: Promise<WebAssembly.Memory> | null = null;

/** Загружает модуль; возвращает его память (для статистики). */
export function loadSquooshPng(): Promise<WebAssembly.Memory> {
  if (!loading) {
    loading = (async () => (await initPng(await compileWasm(pngWasmUrl))).memory)();
    loading.catch(() => (loading = null));
  }
  return loading;
}
