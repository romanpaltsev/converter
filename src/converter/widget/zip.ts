// «Скачать всё»: ZIP без сжатия (JPG, PNG и WebP уже сжаты). Собирается в отдельном worker'е,
// который создаётся только по нажатию кнопки.
import type { ZipRequest, ZipResponse } from '../worker/zip.worker';

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export function createZip(entries: ZipEntry[]): Promise<Blob> {
  const worker = new Worker(new URL('../worker/zip.worker.ts', import.meta.url), { type: 'module', name: 'zip' });
  return new Promise<Blob>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<ZipResponse>) => {
      if (event.data.ok) resolve(event.data.blob);
      else reject(new Error(event.data.message));
    };
    worker.onerror = (event) => {
      event.preventDefault();
      reject(new Error(event.message || 'zip worker failed'));
    };
    const request: ZipRequest = { entries };
    worker.postMessage(request);
  }).finally(() => worker.terminate());
}

/** Сохранение файла через временную ссылку с атрибутом download. */
export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  // освобождаем позже: некоторые браузеры начинают скачивание асинхронно
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
