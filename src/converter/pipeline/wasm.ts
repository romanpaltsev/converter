// Компиляция WASM-модулей: потоковая (быстрее и кэшируется браузером),
// с запасным путём, если сервер отдал .wasm не с тем MIME-типом.

export async function compileWasm(url: string): Promise<WebAssembly.Module> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`WASM ${url}: HTTP ${response.status}`);
  if (typeof WebAssembly.compileStreaming === 'function' && response.headers.get('content-type')?.startsWith('application/wasm')) {
    return WebAssembly.compileStreaming(response);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}
