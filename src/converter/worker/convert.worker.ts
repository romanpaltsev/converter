// Module Web Worker конвертера: строго один файл за раз, WASM-модули грузятся по первому запросу.

import { convertImage } from '../pipeline/convert';
import { loadDecoder } from '../pipeline/decoders';
import { loadEncoder } from '../pipeline/encoders';
import { checkInput } from '../pipeline/input';
import { ConvertError, type ErrorCode, WEBP_MAX_DIMENSION } from '../pipeline/types';
import type { FromWorker, ToWorker } from './protocol';

interface WorkerScope {
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
  postMessage(message: FromWorker, transfer?: Transferable[]): void;
}

const scope = self as unknown as WorkerScope;
const post = (message: FromWorker, transfer: Transferable[] = []) => scope.postMessage(message, transfer);

/** Сколько файлов обработал этот экземпляр worker'а (память WASM после роста не уменьшается). */
let processed = 0;

/** Ошибки WASM, после которых экземпляр модуля нельзя использовать дальше. */
function classifyUnexpected(error: unknown): { code: ErrorCode; fatal: true } {
  const text = String(error instanceof Error ? `${error.name}: ${error.message}` : error);
  if (/out of memory|oom|memory\.grow|enlarge memory|allocation failed|array buffer allocation/i.test(text)) {
    return { code: 'out-of-memory', fatal: true };
  }
  return { code: error instanceof WebAssembly.RuntimeError ? 'decode-failed' : 'internal', fatal: true };
}

/** Загруженные WASM-модули по имени (у декодера и кодировщика PNG модуль общий — считаем его один раз). */
const modules = new Map<string, { heapBytes(): number }>();

function heapStats(): Record<string, number> {
  return Object.fromEntries([...modules].map(([name, module]) => [name, module.heapBytes()]));
}

function reservedHeap(): number {
  let total = 0;
  for (const module of modules.values()) total += module.heapBytes();
  return total;
}

async function handleConvert(message: Extract<ToWorker, { type: 'convert' }>): Promise<void> {
  const { id } = message;
  try {
    const readStarted = performance.now();
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const read = performance.now() - readStarted;
    const input = checkInput(bytes, message.options.encoder, message.options.allowSameFormat);
    if (!input.ok) throw new ConvertError(input.code);
    // кучи прошлых файлов не уменьшаются: если их уже много, следующий файл — в свежем worker'е
    if (processed > 0 && reservedHeap() > message.freshWorkerAboveHeapBytes) {
      post({ type: 'needs-fresh-worker', id, pixels: 0 });
      return;
    }

    const [decoder, encoder] = await Promise.all([loadDecoder(input.decoder), loadEncoder(message.options.encoder)]);
    modules.set(decoder.module, decoder);
    modules.set(encoder.module, encoder);
    const session = decoder.open(bytes);
    try {
      // ограничение WebP проверяем до декодирования (бывает у панорам); после уменьшения снимок может и влезть —
      // тогда проверит сам кодировщик
      const resized = message.options.resize !== null;
      if (message.options.encoder === 'webp' && !resized && Math.max(session.width, session.height) > WEBP_MAX_DIMENSION) {
        throw new ConvertError('too-large-for-webp');
      }
      const pixels = session.width * session.height;
      if (processed > 0 && pixels > message.freshWorkerAbovePixels) {
        post({ type: 'needs-fresh-worker', id, pixels });
        return;
      }
      const result = await convertImage(session, encoder, message.options);
      processed++;
      const buffer = result.bytes.buffer as ArrayBuffer;
      const preview = result.preview.buffer as ArrayBuffer;
      post(
        {
          type: 'done',
          id,
          buffer,
          preview,
          mime: encoder.mime,
          extension: encoder.extension,
          width: result.width,
          height: result.height,
          sourceWidth: result.sourceWidth,
          sourceHeight: result.sourceHeight,
          quality: result.quality,
          pixels,
          warnings: result.warnings,
          stats: { heap: heapStats(), timings: { read, ...result.timings } },
        },
        [buffer, preview],
      );
    } finally {
      session.close();
    }
  } catch (error) {
    if (error instanceof ConvertError) {
      post({ type: 'error', id, code: error.code, fatal: error.fatal, recycle: error.recycle, message: error.message });
    } else {
      const { code, fatal } = classifyUnexpected(error);
      post({ type: 'error', id, code, fatal, recycle: true, message: String(error) });
    }
  }
}

scope.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'load') {
    const decoders = message.decoders.map((id) => loadDecoder(id));
    const encoders = message.encoders.map((id) => loadEncoder(id));
    Promise.all([...decoders, ...encoders]).then(
      (loaded) => {
        for (const module of loaded) modules.set(module.module, module);
        post({ type: 'loaded' });
      },
      (error: unknown) => post({ type: 'load-failed', message: String(error) }),
    );
  } else if (message.type === 'convert') {
    void handleConvert(message);
  }
};
