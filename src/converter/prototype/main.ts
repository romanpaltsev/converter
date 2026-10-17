// ВРЕМЕННЫЙ стенд прототипа: конвертирует выбранные файлы по одному и показывает замеры.

import type { ConvertOptions } from '../pipeline/types';
import { WorkerClient } from '../widget/worker-client';

interface ProtoResult {
  name: string;
  ok: boolean;
  code?: string;
  width?: number;
  height?: number;
  inBytes: number;
  outBytes?: number;
  timings?: { read: number; decode: number; encode: number };
  heap?: { decoder: number; jpeg: number; png: number };
  warnings?: string[];
  workersCreated: number;
  downloadName?: string;
}

declare global {
  interface Window {
    __proto: { results: ProtoResult[]; total: number; finished: boolean };
  }
}

const client = new WorkerClient('heic');
const form = document.querySelector<HTMLFormElement>('#settings')!;
const input = document.querySelector<HTMLInputElement>('#files')!;
const rows = document.querySelector<HTMLTableSectionElement>('#rows')!;
const status = document.querySelector<HTMLElement>('#status')!;
window.__proto = { results: [], total: 0, finished: false };

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

function options(): ConvertOptions {
  const data = new FormData(form);
  return {
    encoder: data.get('encoder') === 'png' ? 'png' : 'jpeg',
    quality: Number(data.get('quality') ?? 90),
    metadata: data.get('all') ? 'all' : 'dates',
  };
}

function cell(row: HTMLTableRowElement, text: string) {
  const td = document.createElement('td');
  td.textContent = text;
  row.append(td);
  return td;
}

input.addEventListener('change', async () => {
  const files = [...(input.files ?? [])];
  window.__proto = { results: [], total: files.length, finished: false };
  rows.textContent = '';
  status.textContent = 'Загружаем конвертер…';
  const opts = options();
  await client.load(opts.encoder);
  for (const [index, file] of files.entries()) {
    status.textContent = `Конвертируем ${index + 1} из ${files.length}`;
    const outcome = await client.convert(file, opts);
    const row = document.createElement('tr');
    cell(row, file.name);
    const result: ProtoResult = { name: file.name, ok: outcome.ok, inBytes: file.size, workersCreated: client.workersCreated };
    if (outcome.ok) {
      const blob = new Blob([outcome.buffer], { type: outcome.mime });
      const downloadName = file.name.replace(/\.[^.]*$/, '') + '.' + outcome.extension;
      Object.assign(result, {
        width: outcome.width,
        height: outcome.height,
        outBytes: blob.size,
        timings: outcome.stats.timings,
        heap: outcome.stats.heap,
        warnings: outcome.warnings,
        downloadName,
      });
      const t = outcome.stats.timings;
      const h = outcome.stats.heap;
      cell(row, 'готово' + (outcome.warnings.length ? ` (${outcome.warnings.join(', ')})` : ''));
      cell(row, `${outcome.width}×${outcome.height}`);
      cell(row, mb(file.size));
      cell(row, mb(blob.size));
      cell(row, `${t.read.toFixed(0)} / ${t.decode.toFixed(0)} / ${t.encode.toFixed(0)}`);
      cell(row, `${mb(h.decoder)} / ${mb(h.jpeg)} / ${mb(h.png)}`);
      cell(row, String(client.workersCreated));
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = downloadName;
      link.textContent = 'Скачать';
      link.dataset.index = String(index);
      cell(row, '').append(link);
    } else {
      result.code = outcome.code;
      cell(row, `ошибка: ${outcome.code} — ${outcome.message}`);
    }
    rows.append(row);
    window.__proto.results.push(result);
  }
  status.textContent = 'Готово';
  window.__proto.finished = true;
});
