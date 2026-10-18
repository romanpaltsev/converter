// Сообщения между основным потоком и worker'ом конвертера.

import type { ConvertOptions, DecoderId, EncoderId, ErrorCode, WarningCode } from '../pipeline/types';

export type ToWorker =
  /** Загрузить WASM-модули, которых ещё нет в этом worker'е. */
  | { type: 'load'; decoders: DecoderId[]; encoders: EncoderId[] }
  | {
      type: 'convert';
      id: number;
      file: Blob;
      options: ConvertOptions;
      /** Если worker уже обрабатывал файлы, а этот больше порога — просим свежий worker. */
      freshWorkerAbovePixels: number;
      /** Если worker уже обрабатывал файлы, а кучи его WASM-модулей в сумме больше порога — тоже свежий worker. */
      freshWorkerAboveHeapBytes: number;
    };

export interface WorkerStats {
  /** Размеры куч WASM после обработки (байты) по модулям: libheif, mozjpeg-enc, squoosh-png… */
  heap: Record<string, number>;
  timings: { read: number; decode: number; encode: number };
}

export type FromWorker =
  | { type: 'loaded' }
  | { type: 'load-failed'; message: string }
  | {
      type: 'done';
      id: number;
      buffer: ArrayBuffer;
      preview: ArrayBuffer;
      mime: string;
      extension: string;
      width: number;
      height: number;
      pixels: number;
      warnings: WarningCode[];
      stats: WorkerStats;
    }
  /** fatal — нужен новый worker и повторная попытка; recycle — новый worker без повторной попытки. */
  | { type: 'error'; id: number; code: ErrorCode; fatal: boolean; recycle: boolean; message: string }
  | { type: 'needs-fresh-worker'; id: number; pixels: number };
