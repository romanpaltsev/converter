// Сообщения между основным потоком и worker'ом конвертера.

import type { ConvertOptions, DecoderId, EncoderId, ErrorCode, WarningCode } from '../pipeline/types';

export type ToWorker =
  | { type: 'load'; decoder: DecoderId; encoders: EncoderId[] }
  | {
      type: 'convert';
      id: number;
      file: Blob;
      options: ConvertOptions;
      /** Если worker уже обрабатывал файлы, а этот больше порога — просим свежий worker. */
      freshWorkerAbovePixels: number;
    };

export interface WorkerStats {
  /** Размеры куч WASM после обработки (байты): libheif, MozJPEG, PNG. */
  heap: { decoder: number; jpeg: number; png: number };
  timings: { read: number; decode: number; encode: number };
}

export type FromWorker =
  | { type: 'loaded' }
  | { type: 'load-failed'; message: string }
  | {
      type: 'done';
      id: number;
      buffer: ArrayBuffer;
      mime: string;
      extension: string;
      width: number;
      height: number;
      pixels: number;
      warnings: WarningCode[];
      stats: WorkerStats;
    }
  | { type: 'error'; id: number; code: ErrorCode; fatal: boolean; message: string }
  | { type: 'needs-fresh-worker'; id: number; pixels: number };
