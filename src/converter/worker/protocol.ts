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
      /**
       * Сколько памяти (байт) может занять этот worker вместе с уже выросшими кучами, чтобы остальные worker'ы
       * пула поместились в бюджет. Infinity — файл обрабатывается в одиночку, без ограничения.
       */
      memoryLimit: number;
    };

export interface WorkerStats {
  /** Размеры куч WASM после обработки (байты) по модулям: libheif, mozjpeg-enc, squoosh-png… */
  heap: Record<string, number>;
  timings: { read: number; decode: number; encode: number };
}

export type FromWorker =
  | { type: 'loaded' }
  | { type: 'load-failed'; message: string }
  /**
   * Файл открыт и оценён, оценка помещается в лимит — работа идёт (промежуточное сообщение, ответ будет позже).
   * fresh — сколько файл занял бы в свежем worker'е (пул прикидывает по нему следующие файлы пачки).
   */
  | { type: 'started'; id: number; footprint: number; fresh: number }
  /** Оценка не помещается в лимит; работа не начата. fresh — сколько займёт файл в свежем worker'е. */
  | { type: 'needs-memory'; id: number; footprint: number; fresh: number }
  | {
      type: 'done';
      id: number;
      buffer: ArrayBuffer;
      preview: ArrayBuffer;
      mime: string;
      extension: string;
      width: number;
      height: number;
      sourceWidth: number;
      sourceHeight: number;
      /** Качество результата (подобранное под целевой размер или с ползунка); null — без потерь. */
      quality: number | null;
      pixels: number;
      warnings: WarningCode[];
      stats: WorkerStats;
    }
  /** fatal — нужен новый worker и повторная попытка; recycle — новый worker без повторной попытки. */
  | { type: 'error'; id: number; code: ErrorCode; fatal: boolean; recycle: boolean; message: string };
