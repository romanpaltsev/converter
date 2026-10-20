// Один worker конвертера из основного потока: ленивый запуск, загрузка WASM-модулей, одно задание за раз.
// Сколько worker'ов работает одновременно, когда файл ждёт памяти и когда worker пересоздаётся, решает пул
// (worker-pool.ts): память WASM после роста не уменьшается.

import type { MetadataReport } from '../metadata/inspect/types';
import type { RemovedKind, StripMode } from '../metadata/strip/types';
import type { PdfImage } from '../pdf/writer';
import type { ConvertOptions, DecoderId, EncoderId, ErrorCode, WarningCode } from '../pipeline/types';
import type { FromWorker, PdfRenderOptions, ToWorker, WorkerStats } from '../worker/protocol';

export interface ConvertSuccess {
  status: 'done';
  buffer: ArrayBuffer;
  preview: ArrayBuffer;
  mime: string;
  extension: string;
  width: number;
  height: number;
  sourceWidth: number;
  sourceHeight: number;
  quality: number | null;
  warnings: WarningCode[];
  stats: WorkerStats;
}

export interface ConvertFailure {
  status: 'error';
  code: ErrorCode;
  message: string;
  /** Нужен новый worker и повторная попытка (нехватка памяти, сбой WASM). */
  fatal: boolean;
  /** Модуль мог потерять память — worker пересоздаётся без повторной попытки. */
  recycle: boolean;
}

/** Файл не поместился в лимит памяти и не начат; fresh — сколько он займёт в свежем worker'е. */
export interface NeedsMemory {
  status: 'needs-memory';
  fresh: number;
}

export type ConvertOutcome = ConvertSuccess | ConvertFailure | NeedsMemory;

export interface StripSuccess {
  status: 'done';
  buffer: ArrayBuffer;
  /** false — удалять было нечего, buffer — исходный файл. */
  changed: boolean;
  removed: RemovedKind[];
  warnings: WarningCode[];
}

export type StripOutcome = StripSuccess | ConvertFailure | NeedsMemory;

export type InspectOutcome = { status: 'done'; report: MetadataReport } | ConvertFailure | NeedsMemory;

export interface PdfPageSuccess {
  status: 'done';
  image: PdfImage;
  preview: ArrayBuffer;
  width: number;
  height: number;
  passthrough: boolean;
  warnings: WarningCode[];
}

export type PdfPageOutcome = PdfPageSuccess | ConvertFailure | NeedsMemory;

/** Страница PDF, нарисованная и закодированная worker'ом. */
export type RenderedPdfPage = Omit<Extract<FromWorker, { type: 'pdf-rendered' }>, 'type' | 'id'>;

export type PdfRenderOutcome = { status: 'done'; total: number; limited: boolean } | ConvertFailure | NeedsMemory;

type OnStarted = (footprint: number, fresh: number) => void;

/** То, что нужно пулу от worker'а (в unit-тестах пула — подделка). */
export interface PoolClient {
  /** Файлов обработано этим экземпляром worker'а. */
  readonly files: number;
  /** Кучи WASM-модулей после последнего файла: память, которую держит простаивающий worker. */
  readonly heapBytes: number;
  /** Worker запущен (и, значит, держит память и загруженные модули). */
  readonly alive: boolean;
  recycle(): void;
}

export class WorkerClient implements PoolClient {
  private worker: Worker | null = null;
  private loading: Promise<void> | null = null;
  private nextId = 1;
  private pending: ((reply: FromWorker) => void) | null = null;
  private onStarted: OnStarted | null = null;
  private onPage: ((page: RenderedPdfPage) => void) | null = null;
  /** Модули, уже загруженные (или загружаемые) в текущем worker'е; после пересоздания — пусто. */
  private readonly decoders = new Set<DecoderId>();
  private readonly encoders = new Set<EncoderId>();
  files = 0;
  heapBytes = 0;

  get alive(): boolean {
    return this.worker !== null;
  }

  /** Запускает worker и загружает в него недостающие WASM-модули: декодер (если нужен) и кодировщик. */
  load(decoder: DecoderId | null, encoder: EncoderId): Promise<void> {
    const decoders = decoder === null || this.decoders.has(decoder) ? [] : [decoder];
    const encoders = this.encoders.has(encoder) ? [] : [encoder];
    if (this.loading && decoders.length === 0 && encoders.length === 0) return this.loading;
    decoders.forEach((id) => this.decoders.add(id));
    encoders.forEach((id) => this.encoders.add(id));
    const worker = this.ensureWorker();
    this.loading = new Promise<void>((resolve, reject) => {
      this.pending = (reply) => {
        if (reply.type === 'loaded') resolve();
        else if (reply.type === 'load-failed') reject(new Error(reply.message));
        else reject(new Error(`unexpected reply ${reply.type}`));
      };
      const message: ToWorker = { type: 'load', decoders, encoders };
      worker.postMessage(message);
    });
    this.loading.catch(() => this.recycle());
    return this.loading;
  }

  /**
   * Конвертирует один файл. memoryLimit — сколько памяти может занять worker (Infinity — без ограничения);
   * onStarted вызывается, когда worker оценил файл и начал работу.
   */
  async convert(file: Blob, options: ConvertOptions, memoryLimit: number, onStarted: OnStarted): Promise<ConvertOutcome> {
    const reply = await this.request((id) => ({ type: 'convert', id, file, options, memoryLimit }), onStarted);
    if (reply.type === 'done') {
      this.files++;
      this.heapBytes = Object.values(reply.stats.heap).reduce((sum, bytes) => sum + bytes, 0);
      return {
        status: 'done',
        buffer: reply.buffer,
        preview: reply.preview,
        mime: reply.mime,
        extension: reply.extension,
        width: reply.width,
        height: reply.height,
        sourceWidth: reply.sourceWidth,
        sourceHeight: reply.sourceHeight,
        quality: reply.quality,
        warnings: reply.warnings,
        stats: reply.stats,
      };
    }
    return failure(reply);
  }

  /** «Удалить метаданные»: модули WASM не нужны. */
  async strip(file: Blob, mode: StripMode, memoryLimit: number, onStarted: OnStarted): Promise<StripOutcome> {
    const reply = await this.request((id) => ({ type: 'strip', id, file, mode, memoryLimit }), onStarted);
    if (reply.type === 'stripped') {
      this.files++;
      return { status: 'done', buffer: reply.buffer, changed: reply.changed, removed: reply.removed, warnings: reply.warnings };
    }
    return failure(reply);
  }

  /** Завершает worker и освобождает его память; следующий файл запустит новый. */
  recycle(): void {
    this.worker?.terminate();
    this.reset();
    const pending = this.pending;
    this.pending = null;
    pending?.({ type: 'error', id: 0, code: 'internal', fatal: true, recycle: false, message: 'worker terminated' });
  }

  private reset(): void {
    this.worker = null;
    this.loading = null;
    this.onStarted = null;
    this.onPage = null;
    this.files = 0;
    this.heapBytes = 0;
    this.decoders.clear();
    this.encoders.clear();
  }

  /** «Посмотреть EXIF»: модули WASM не нужны. */
  async inspect(file: Blob, memoryLimit: number, onStarted: OnStarted): Promise<InspectOutcome> {
    const reply = await this.request((id) => ({ type: 'inspect', id, file, memoryLimit }), onStarted);
    if (reply.type === 'inspected') {
      this.files++;
      return { status: 'done', report: reply.report };
    }
    return failure(reply);
  }

  /** «Изображения в PDF»: картинка страницы (модули декодера и MozJPEG — как у конвертации). */
  async pdfPage(file: Blob, memoryLimit: number, onStarted: OnStarted): Promise<PdfPageOutcome> {
    const reply = await this.request((id) => ({ type: 'pdf-page', id, file, memoryLimit }), onStarted);
    if (reply.type === 'pdf-page') {
      this.files++;
      this.heapBytes = reply.heap;
      return { status: 'done', image: reply.image, preview: reply.preview, width: reply.width, height: reply.height, passthrough: reply.passthrough, warnings: reply.warnings };
    }
    return failure(reply);
  }

  /** «Объединить PDF»: число страниц и превью первой. */
  async pdfInfo(file: Blob, memoryLimit: number, onStarted: OnStarted): Promise<{ status: 'done'; pages: number; preview: ArrayBuffer } | ConvertFailure | NeedsMemory> {
    const reply = await this.request((id) => ({ type: 'pdf-info', id, file, memoryLimit }), onStarted);
    if (reply.type === 'pdf-info') {
      this.files++;
      return { status: 'done', pages: reply.pages, preview: reply.preview };
    }
    return failure(reply);
  }

  /** «Объединить PDF»: документы по порядку → один PDF. */
  async pdfMerge(files: Blob[]): Promise<{ status: 'done'; buffer: ArrayBuffer; pages: number } | ConvertFailure | NeedsMemory> {
    const reply = await this.request((id) => ({ type: 'pdf-merge', id, files }), () => {});
    if (reply.type === 'pdf-merged') return { status: 'done', buffer: reply.buffer, pages: reply.pages };
    return failure(reply);
  }

  /** «PDF в JPG»: страницы приходят по одной в onPage, результат — когда готовы все. */
  async pdfRender(file: Blob, options: PdfRenderOptions, memoryLimit: number, onStarted: OnStarted, onPage: (page: RenderedPdfPage) => void): Promise<PdfRenderOutcome> {
    this.onPage = onPage;
    const reply = await this.request((id) => ({ type: 'pdf-render', id, file, options, memoryLimit }), onStarted);
    this.onPage = null;
    if (reply.type === 'pdf-done') {
      this.files++;
      this.heapBytes = reply.heap;
      return { status: 'done', total: reply.total, limited: reply.limited };
    }
    return failure(reply);
  }

  private request(build: (id: number) => ToWorker, onStarted: OnStarted): Promise<FromWorker> {
    const worker = this.ensureWorker();
    const message = build(this.nextId++);
    return new Promise<FromWorker>((resolve) => {
      this.pending = resolve;
      this.onStarted = onStarted;
      worker.postMessage(message);
    });
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../worker/convert.worker.ts', import.meta.url), { type: 'module', name: 'converter' });
    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      // запоздалый ответ уже завершённого worker'а (задание отменили) не должен достаться следующему заданию
      if (this.worker !== worker) return;
      const reply = event.data;
      if (reply.type === 'started') {
        this.onStarted?.(reply.footprint, reply.fresh);
        return;
      }
      if (reply.type === 'pdf-rendered') {
        const { type: _type, id: _id, ...page } = reply;
        this.onPage?.(page);
        return;
      }
      const pending = this.pending;
      this.pending = null;
      this.onStarted = null;
      pending?.(reply);
    };
    // падение worker'а (например, нехватка памяти вкладки) — завершаем текущую задачу ошибкой
    worker.onerror = (event) => {
      event.preventDefault();
      if (this.worker !== worker) return;
      const pending = this.pending;
      this.pending = null;
      worker.terminate();
      this.reset();
      pending?.({ type: 'error', id: 0, code: 'out-of-memory', fatal: true, recycle: false, message: event.message || 'worker crashed' });
    };
    this.worker = worker;
    return worker;
  }
}

/** Ответ, который не «готово»: нехватка памяти или ошибка. */
function failure(reply: FromWorker): ConvertFailure | NeedsMemory {
  if (reply.type === 'needs-memory') return { status: 'needs-memory', fresh: reply.fresh };
  if (reply.type === 'error') return { status: 'error', code: reply.code, message: reply.message, fatal: reply.fatal, recycle: reply.recycle };
  return { status: 'error', code: 'internal', message: `unexpected reply ${reply.type}`, fatal: false, recycle: true };
}
