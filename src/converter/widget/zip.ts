// «Скачать всё»: ZIP без сжатия (JPG и PNG уже сжаты). client-zip грузится только по нажатию кнопки.

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function createZip(entries: ZipEntry[]): Promise<Blob> {
  const { downloadZip } = await import('client-zip');
  const lastModified = new Date();
  return downloadZip(entries.map((entry) => ({ name: entry.name, input: entry.blob, lastModified, size: entry.blob.size }))).blob();
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
