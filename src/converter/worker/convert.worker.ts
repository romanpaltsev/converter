// Module Web Worker конвертера: строго один файл за раз, WASM-модули грузятся по первому запросу.

import { convertImage } from '../pipeline/convert';
import { loadDecoder } from '../pipeline/decoders';
import { loadEncoder } from '../pipeline/encoders';
import { SNIFF_BYTES, sniff, sniffError } from '../pipeline/sniff';
import { ConvertError, type Decoder, type Encoder, type EncoderId, type ErrorCode } from '../pipeline/types';
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

/** Загруженные кодеки — для замеров памяти. */
const loadedEncoders = new Map<EncoderId, Encoder>();

function heapStats(decoder: Decoder) {
  return {
    decoder: decoder.heapBytes(),
    jpeg: loadedEncoders.get('jpeg')?.heapBytes() ?? 0,
    png: loadedEncoders.get('png')?.heapBytes() ?? 0,
  };
}

async function handleConvert(message: Extract<ToWorker, { type: 'convert' }>): Promise<void> {
  const { id } = message;
  try {
    const readStarted = performance.now();
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const read = performance.now() - readStarted;
    const notHeic = sniffError(sniff(bytes.subarray(0, SNIFF_BYTES)));
    if (notHeic) throw new ConvertError(notHeic);

    const [decoder, encoder] = await Promise.all([loadDecoder('heic'), loadEncoder(message.options.encoder)]);
    loadedEncoders.set(message.options.encoder, encoder);
    const session = decoder.open(bytes);
    try {
      const pixels = session.width * session.height;
      if (processed > 0 && pixels > message.freshWorkerAbovePixels) {
        post({ type: 'needs-fresh-worker', id, pixels });
        return;
      }
      const result = await convertImage(session, encoder, message.options);
      processed++;
      const buffer = result.bytes.buffer as ArrayBuffer;
      post(
        {
          type: 'done',
          id,
          buffer,
          mime: encoder.mime,
          extension: encoder.extension,
          width: result.width,
          height: result.height,
          pixels,
          warnings: result.warnings,
          stats: { heap: heapStats(decoder), timings: { read, ...result.timings } },
        },
        [buffer],
      );
    } finally {
      session.close();
    }
  } catch (error) {
    if (error instanceof ConvertError) {
      post({ type: 'error', id, code: error.code, fatal: error.code === 'out-of-memory', message: error.message });
    } else {
      const { code, fatal } = classifyUnexpected(error);
      post({ type: 'error', id, code, fatal, message: String(error) });
    }
  }
}

scope.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'load') {
    Promise.all([loadDecoder(message.decoder), ...message.encoders.map(loadEncoder)]).then(
      () => post({ type: 'loaded' }),
      (error: unknown) => post({ type: 'load-failed', message: String(error) }),
    );
  } else if (message.type === 'convert') {
    void handleConvert(message);
  }
};
