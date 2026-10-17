// Проверка, что браузер умеет всё нужное конвертеру: WebAssembly и module Web Worker.
// Старые Firefox (< 114) молча создают классический worker вместо модульного — ловим это заранее.

let cached: boolean | null = null;

function supportsModuleWorkers(): boolean {
  let supported = false;
  const options = {
    get type(): WorkerType {
      supported = true; // свойство читают только браузеры с поддержкой модульных worker'ов
      return 'module';
    },
  };
  try {
    const url = URL.createObjectURL(new Blob([''], { type: 'text/javascript' }));
    new Worker(url, options).terminate();
    URL.revokeObjectURL(url);
  } catch {
    // нас интересует только то, читалось ли свойство type
  }
  return supported;
}

export function supportsConverter(): boolean {
  cached ??= typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function' && typeof Worker === 'function' && supportsModuleWorkers();
  return cached;
}
