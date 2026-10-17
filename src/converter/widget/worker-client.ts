// Управление worker'ом конвертера из основного потока: ленивый запуск, по одному файлу,
// пересоздание (память WASM после роста не уменьшается) и одна повторная попытка после нехватки памяти.

import type { ConvertOptions, DecoderId, EncoderId, ErrorCode, WarningCode } from '../pipeline/types';
import type { FromWorker, ToWorker, WorkerStats } from '../worker/protocol';

export interface ConvertSuccess {
  ok: true;
  buffer: ArrayBuffer;
  preview: ArrayBuffer;
  mime: string;
  extension: string;
  width: number;
  height: number;
  warnings: WarningCode[];
  stats: WorkerStats;
}

export interface ConvertFailure {
  ok: false;
  code: ErrorCode;
  message: string;
}

export type ConvertOutcome = ConvertSuccess | ConvertFailure;

export interface WorkerPolicy {
  /** Файл больше этого размера обрабатывается в свежем worker'е, и после него worker пересоздаётся. */
  freshWorkerAbovePixels: number;
  /** Пересоздавать worker после стольких файлов подряд. */
  recycleEveryFiles: number;
}

export const DEFAULT_POLICY: WorkerPolicy = {
  freshWorkerAbovePixels: 30_000_000,
  recycleEveryFiles: 20,
};

type Reply = FromWorker;

export class WorkerClient {
  private worker: Worker | null = null;
  private loading: Promise<void> | null = null;
  private filesInWorker = 0;
  private nextId = 1;
  private pending: ((reply: Reply) => void) | null = null;
  private readonly encoders = new Set<EncoderId>();
  /** Сколько раз worker создавался — для замеров и тестов. */
  workersCreated = 0;

  constructor(
    private readonly decoder: DecoderId,
    private readonly policy: WorkerPolicy = DEFAULT_POLICY,
  ) {}

  /** Запускает worker и загружает WASM-модули (декодер и нужные кодировщики). */
  load(encoder: EncoderId): Promise<void> {
    const known = this.encoders.has(encoder);
    this.encoders.add(encoder);
    if (this.loading && known) return this.loading;
    const worker = this.ensureWorker();
    this.loading = new Promise<void>((resolve, reject) => {
      this.pending = (reply) => {
        if (reply.type === 'loaded') resolve();
        else if (reply.type === 'load-failed') reject(new Error(reply.message));
        else reject(new Error(`unexpected reply ${reply.type}`));
      };
      const message: ToWorker = { type: 'load', decoder: this.decoder, encoders: [...this.encoders] };
      worker.postMessage(message);
    });
    this.loading.catch(() => this.recycle());
    return this.loading;
  }

  async convert(file: Blob, options: ConvertOptions): Promise<ConvertOutcome> {
    for (let attempt = 0; attempt < 2; attempt++) {
      await this.load(options.encoder);
      const reply = await this.request(file, options);
      if (reply.type === 'needs-fresh-worker') {
        this.recycle(); // большой файл после других — в чистом worker'е (не считается попыткой)
        attempt--;
        continue;
      }
      if (reply.type === 'done') {
        this.filesInWorker++;
        if (reply.pixels > this.policy.freshWorkerAbovePixels || this.filesInWorker >= this.policy.recycleEveryFiles) this.recycle();
        return {
          ok: true,
          buffer: reply.buffer,
          preview: reply.preview,
          mime: reply.mime,
          extension: reply.extension,
          width: reply.width,
          height: reply.height,
          warnings: reply.warnings,
          stats: reply.stats,
        };
      }
      if (reply.type === 'error') {
        // после фатальной ошибки (нехватка памяти, сбой WASM) пробуем ещё раз в свежем worker'е:
        // память могли занять предыдущие файлы
        if (reply.fatal) {
          this.recycle();
          if (attempt === 0) continue;
        }
        return { ok: false, code: reply.code, message: reply.message };
      }
      return { ok: false, code: 'internal', message: `unexpected reply ${reply.type}` };
    }
    return { ok: false, code: 'out-of-memory', message: 'out of memory after retry' };
  }

  /** Завершает worker; следующий файл запустит новый. */
  recycle(): void {
    this.worker?.terminate();
    this.worker = null;
    this.loading = null;
    this.filesInWorker = 0;
    const pending = this.pending;
    this.pending = null;
    pending?.({ type: 'error', id: 0, code: 'internal', fatal: true, message: 'worker terminated' });
  }

  private request(file: Blob, options: ConvertOptions): Promise<Reply> {
    const worker = this.ensureWorker();
    const id = this.nextId++;
    return new Promise<Reply>((resolve) => {
      this.pending = resolve;
      const freshWorkerAbovePixels = this.filesInWorker > 0 ? this.policy.freshWorkerAbovePixels : Number.POSITIVE_INFINITY;
      const message: ToWorker = { type: 'convert', id, file, options, freshWorkerAbovePixels };
      worker.postMessage(message);
    });
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../worker/convert.worker.ts', import.meta.url), { type: 'module', name: 'converter' });
    worker.onmessage = (event: MessageEvent<Reply>) => {
      const pending = this.pending;
      this.pending = null;
      pending?.(event.data);
    };
    // падение worker'а (например, нехватка памяти вкладки) — завершаем текущую задачу ошибкой
    worker.onerror = (event) => {
      event.preventDefault();
      const pending = this.pending;
      this.worker = null;
      this.loading = null;
      this.filesInWorker = 0;
      this.pending = null;
      worker.terminate();
      pending?.({ type: 'error', id: 0, code: 'out-of-memory', fatal: true, message: event.message || 'worker crashed' });
    };
    this.worker = worker;
    this.workersCreated++;
    return worker;
  }
}
