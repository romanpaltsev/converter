// Сборка ZIP вне основного потока: client-zip считает CRC32 по всем файлам (сотни мегабайт),
// на основном потоке это давало паузы интерфейса больше полсекунды.
import { downloadZip } from 'client-zip';

export interface ZipRequest {
  entries: { name: string; blob: Blob }[];
}

export type ZipResponse = { ok: true; blob: Blob } | { ok: false; message: string };

interface ZipScope {
  onmessage: ((event: MessageEvent<ZipRequest>) => void) | null;
  postMessage(message: ZipResponse): void;
}

const scope = self as unknown as ZipScope;

scope.onmessage = async (event) => {
  try {
    const lastModified = new Date();
    const files = event.data.entries.map((entry) => ({ name: entry.name, input: entry.blob, lastModified, size: entry.blob.size }));
    // Blob передаётся между потоками по ссылке, без копирования данных
    scope.postMessage({ ok: true, blob: await downloadZip(files).blob() });
  } catch (error) {
    scope.postMessage({ ok: false, message: String(error) });
  }
};
