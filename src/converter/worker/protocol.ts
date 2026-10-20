// Сообщения между основным потоком и worker'ом конвертера.

import type { MediaOptions } from '../media/formats';
import type { MetadataReport } from '../metadata/inspect/types';
import type { RemovedKind, StripMode } from '../metadata/strip/types';
import type { PdfImage } from '../pdf/writer';
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
    }
  /** «Удалить метаданные»: без WASM и перекодирования. */
  | { type: 'strip'; id: number; file: Blob; mode: StripMode; memoryLimit: number }
  /** «Посмотреть EXIF»: только чтение, без WASM. */
  | { type: 'inspect'; id: number; file: Blob; memoryLimit: number }
  /** «Изображения в PDF»: картинка страницы и превью. */
  | { type: 'pdf-page'; id: number; file: Blob; memoryLimit: number }
  /** «PDF в JPG»: страницы по одной — сообщениями pdf-rendered, в конце pdf-done. */
  | { type: 'pdf-render'; id: number; file: Blob; options: PdfRenderOptions; memoryLimit: number }
  /** «Объединить PDF»: сколько страниц и превью первой. */
  | { type: 'pdf-info'; id: number; file: Blob; memoryLimit: number }
  /** «Объединить PDF»: документы по порядку → один PDF. */
  | { type: 'pdf-merge'; id: number; files: Blob[] }
  /** Аудио (и звук из видео): mediabunny; ход — сообщениями media-progress. */
  | { type: 'media'; id: number; file: Blob; options: MediaOptions; memoryLimit: number };

export interface PdfRenderOptions {
  encoder: EncoderId;
  quality: number;
  lossless: boolean;
  /** Точек на дюйм: 72, 150 или 300. */
  dpi: number;
}

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
  /** Метаданные удалены; changed = false — удалять было нечего, buffer — исходный файл. */
  | { type: 'stripped'; id: number; buffer: ArrayBuffer; changed: boolean; removed: RemovedKind[]; warnings: WarningCode[] }
  | { type: 'inspected'; id: number; report: MetadataReport }
  /** Страница PDF готова (промежуточное сообщение). */
  | {
      type: 'pdf-rendered';
      id: number;
      /** Номер страницы (с 1) и сколько страниц будет всего. */
      page: number;
      total: number;
      buffer: ArrayBuffer;
      preview: ArrayBuffer;
      mime: string;
      extension: string;
      width: number;
      height: number;
      warnings: WarningCode[];
    }
  | { type: 'pdf-info'; id: number; pages: number; preview: ArrayBuffer }
  | { type: 'pdf-merged'; id: number; buffer: ArrayBuffer; pages: number }
  /** Все страницы готовы; limited — страниц больше предела, сохранены первые. */
  | { type: 'pdf-done'; id: number; total: number; limited: boolean; heap: number }
  | {
      type: 'pdf-page';
      id: number;
      image: PdfImage;
      preview: ArrayBuffer;
      /** Размер картинки, как она видна (после поворота). */
      width: number;
      height: number;
      /** JPEG вставлен без перекодирования. */
      passthrough: boolean;
      warnings: WarningCode[];
      /** Кучи WASM-модулей worker'а после файла (байты). */
      heap: number;
    }
  /** Аудио: доля готового 0…1 (промежуточное сообщение). */
  | { type: 'media-progress'; id: number; progress: number }
  /** Аудио готово; duration — секунды; copied — звук скопирован без перекодирования. */
  | { type: 'media-done'; id: number; buffer: ArrayBuffer; mime: string; extension: string; duration: number; copied: boolean }
  /** fatal — нужен новый worker и повторная попытка; recycle — новый worker без повторной попытки. */
  | { type: 'error'; id: number; code: ErrorCode; fatal: boolean; recycle: boolean; message: string };
