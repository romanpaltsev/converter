// Виджет конвертера: очередь файлов, настройки, строки результатов, ZIP.
// Разметку отдаёт сервер (ConverterWidget.astro), здесь — только поведение. Строки — из конфигурации.

import { track } from '../../lib/analytics';
import { SNIFF_BYTES, sniff, sniffError } from '../pipeline/sniff';
import type { ErrorCode, WarningCode } from '../pipeline/types';
import { type OutputOption, type WidgetConfig, readConfig } from './config';
import { NameAllocator, outputName } from './filenames';
import { formatBytes } from './sizes';
import { supportsConverter } from './support';
import { WorkerClient } from './worker-client';

type Status = 'queued' | 'converting' | 'done' | 'error';

interface Settings {
  output: OutputOption;
  quality: number;
  keepMetadata: boolean;
}

interface Item {
  file: File;
  status: Status;
  /** Настройки, с которыми файл сконвертирован (для «Конвертировать заново»). */
  settings: Settings | null;
  name: string | null;
  blob: Blob | null;
  url: string | null;
  error: ErrorCode | null;
  warnings: WarningCode[];
  row: HTMLLIElement;
}

const sameSettings = (a: Settings, b: Settings) =>
  a.output.id === b.output.id && a.keepMetadata === b.keepMetadata && (!a.output.hasQuality || a.quality === b.quality);

/** Подстановка {name} в строку из словаря. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function element<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`converter: нет элемента ${selector}`);
  return node;
}

export class ConverterWidget {
  private readonly config: WidgetConfig;
  private readonly t: WidgetConfig['strings'];
  private readonly dropzone: HTMLButtonElement;
  private readonly input: HTMLInputElement;
  private readonly form: HTMLFormElement;
  private readonly qualityRow: HTMLElement;
  private readonly qualityValue: HTMLOutputElement;
  private readonly pngWarning: HTMLElement;
  private readonly status: HTMLElement;
  private readonly notice: HTMLElement;
  private readonly results: HTMLElement;
  private readonly list: HTMLUListElement;
  private readonly zipButton: HTMLButtonElement;
  private readonly reconvertButton: HTMLButtonElement;
  private readonly settingsHint: HTMLElement;
  private readonly clearButton: HTMLButtonElement;

  private items: Item[] = [];
  private client: WorkerClient | null = null;
  private running = false;
  private zipping = false;
  private loadedOnce = false;
  /** Растёт при очистке: результаты задач из прошлого «поколения» отбрасываются. */
  private generation = 0;
  private run = { total: 0, done: 0, failed: 0 };
  private dragDepth = 0;
  private readonly names = new NameAllocator();

  constructor(private readonly root: HTMLElement) {
    this.config = readConfig(root);
    this.t = this.config.strings;
    this.dropzone = element(root, '[data-dropzone]');
    this.input = element(root, '[data-input]');
    this.form = element(root, '[data-settings]');
    this.qualityRow = element(root, '[data-quality-row]');
    this.qualityValue = element(root, '[data-quality-value]');
    this.pngWarning = element(root, '[data-png-warning]');
    this.status = element(root, '[data-status]');
    this.notice = element(root, '[data-notice]');
    this.results = element(root, '[data-results]');
    this.list = element(root, '[data-files]');
    this.zipButton = element(root, '[data-zip]');
    this.reconvertButton = element(root, '[data-reconvert]');
    this.settingsHint = element(root, '[data-settings-hint]');
    this.clearButton = element(root, '[data-clear]');
    this.bind();
    this.syncSettings();
    root.dataset.ready = 'true';
  }

  private bind(): void {
    this.dropzone.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', () => {
      this.addFiles([...(this.input.files ?? [])]);
      this.input.value = ''; // чтобы повторный выбор того же файла тоже сработал
    });

    const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;
    this.root.addEventListener('dragenter', (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      this.dragDepth++;
      this.dropzone.classList.add('is-dragging');
    });
    this.root.addEventListener('dragover', (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    });
    this.root.addEventListener('dragleave', () => {
      this.dragDepth = Math.max(0, this.dragDepth - 1);
      if (this.dragDepth === 0) this.dropzone.classList.remove('is-dragging');
    });
    this.root.addEventListener('drop', (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      this.dragDepth = 0;
      this.dropzone.classList.remove('is-dragging');
      this.addFiles([...(event.dataTransfer?.files ?? [])]);
    });
    // файл, брошенный мимо зоны, не должен открываться в этой вкладке вместо сайта
    window.addEventListener('dragover', (event) => hasFiles(event) && event.preventDefault());
    window.addEventListener('drop', (event) => hasFiles(event) && event.preventDefault());

    this.form.addEventListener('input', () => this.syncSettings());
    this.form.addEventListener('change', () => this.syncSettings());
    this.form.addEventListener('submit', (event) => event.preventDefault());
    this.zipButton.addEventListener('click', () => void this.downloadAll());
    this.reconvertButton.addEventListener('click', () => this.reconvert());
    this.clearButton.addEventListener('click', () => this.clear());
  }

  private currentSettings(): Settings {
    const data = new FormData(this.form);
    const output = this.config.outputs.find((o) => o.id === data.get('format')) ?? this.config.outputs[0]!;
    return { output, quality: Number(data.get('quality') ?? 90), keepMetadata: data.get('keepMetadata') !== null };
  }

  private syncSettings(): void {
    const settings = this.currentSettings();
    this.qualityRow.hidden = !settings.output.hasQuality;
    this.pngWarning.hidden = !settings.output.largeFiles;
    this.qualityValue.value = String(settings.quality);
    this.updateActions();
  }

  addFiles(files: File[]): void {
    if (files.length === 0) return;
    if (!supportsConverter()) {
      this.showNotice(this.t.unsupportedBrowser, 'error');
      return;
    }
    const max = this.config.maxFiles;
    if (files.length > max) this.showNotice(fill(this.t.batchLimit, { max }), 'warning');
    else this.hideNotice();
    for (const file of files.slice(0, max)) {
      const item: Item = { file, status: 'queued', settings: null, name: null, blob: null, url: null, error: null, warnings: [], row: document.createElement('li') };
      this.items.push(item);
      this.renderRow(item);
      this.list.append(item.row);
      this.run.total++;
    }
    this.results.hidden = false;
    this.updateActions();
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.running) return;
    this.running = true;
    const generation = this.generation;
    for (let item = this.nextQueued(); item; item = this.nextQueued()) {
      await this.convert(item, generation);
      if (generation !== this.generation) return; // список очистили — этот цикл больше не нужен
    }
    this.running = false;
    this.finishRun();
  }

  private nextQueued(): Item | undefined {
    return this.items.find((item) => item.status === 'queued');
  }

  private async convert(item: Item, generation: number): Promise<void> {
    // формат по сигнатуре проверяем сразу, без загрузки WASM
    const head = new Uint8Array(await item.file.slice(0, SNIFF_BYTES).arrayBuffer());
    if (generation !== this.generation) return;
    const notHeic = sniffError(sniff(head));
    if (notHeic) return this.fail(item, notHeic);

    const settings = this.currentSettings();
    item.settings = settings;
    item.status = 'converting';
    this.renderRow(item);

    this.client ??= new WorkerClient(this.config.decoder);
    if (!this.loadedOnce) this.setStatus(this.t.loading);
    try {
      await this.client.load(settings.output.encoder);
      this.loadedOnce = true;
    } catch {
      if (generation !== this.generation) return;
      this.showNotice(this.t.loadFailed, 'error');
      return this.fail(item, 'internal');
    }
    if (generation !== this.generation) return;
    this.setStatus(fill(this.t.progress, { current: this.run.done + this.run.failed + 1, total: this.run.total }));

    const outcome = await this.client.convert(item.file, {
      encoder: settings.output.encoder,
      quality: settings.quality,
      metadata: settings.keepMetadata ? 'all' : 'dates',
    });
    if (generation !== this.generation) return;
    if (!outcome.ok) return this.fail(item, outcome.code);

    item.blob = new Blob([outcome.buffer], { type: outcome.mime });
    item.url = URL.createObjectURL(item.blob);
    item.name = this.names.allocate(outputName(item.file.name, settings.output.extension));
    item.warnings = outcome.warnings;
    item.status = 'done';
    this.run.done++;
    this.renderRow(item);
    this.updateActions();
  }

  private fail(item: Item, code: ErrorCode): void {
    item.status = 'error';
    item.error = code;
    this.run.failed++;
    this.renderRow(item);
    this.updateActions();
  }

  private finishRun(): void {
    const { total, done, failed } = this.run;
    if (total === 0) return;
    let text = fill(this.t.summary, { done, total });
    if (failed > 0) text += ' ' + fill(this.t.summaryErrors, { failed });
    this.setStatus(text);
    if (done > 0) track('conversion_complete', { tool: this.config.toolId, format: this.currentSettings().output.id, count: done });
    this.run = { total: 0, done: 0, failed: 0 };
    this.updateActions();
  }

  private size(bytes: number): string {
    return formatBytes(bytes, this.config.locale, this.t.units);
  }

  private renderRow(item: Item): void {
    const row = item.row;
    row.className = 'file';
    row.dataset.status = item.status;
    row.replaceChildren();

    const thumb = document.createElement('span');
    thumb.className = 'file__thumb';
    if (item.status === 'done' && item.url) {
      // превью из готового файла через <img> (не canvas): браузер сам уменьшит его при отрисовке
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = '';
      img.width = 48;
      img.height = 48;
      img.decoding = 'async';
      img.loading = 'lazy';
      thumb.append(img);
    }

    const body = document.createElement('div');
    body.className = 'file__body';
    const name = document.createElement('p');
    name.className = 'file__name';
    name.textContent = item.name ?? item.file.name;
    const meta = document.createElement('p');
    meta.className = 'file__meta';
    if (item.status === 'queued') meta.textContent = this.t.queued;
    if (item.status === 'converting') meta.textContent = this.t.converting;
    if (item.status === 'error') meta.textContent = this.t.failed;
    if (item.status === 'done' && item.blob) {
      meta.textContent = `${this.t.done} · ${fill(this.t.sizes, { before: this.size(item.file.size), after: this.size(item.blob.size) })}`;
    }
    body.append(name, meta);

    const notes = item.status === 'error' && item.error ? [this.t.errors[item.error]] : item.warnings.map((w) => this.t.warnings[w]);
    for (const text of notes) {
      const note = document.createElement('p');
      note.className = item.status === 'error' ? 'file__note file__note--error' : 'file__note';
      note.textContent = text;
      body.append(note);
    }
    row.append(thumb, body);

    if (item.status === 'done' && item.url && item.name) {
      const link = document.createElement('a');
      link.className = 'button button--small file__download';
      link.href = item.url;
      link.download = item.name;
      link.textContent = this.t.download;
      link.setAttribute('aria-label', fill(this.t.downloadLabel, { name: item.name }));
      row.append(link);
    }
  }

  private updateActions(): void {
    const done = this.items.filter((item) => item.status === 'done');
    this.zipButton.disabled = this.zipping || done.length === 0;
    const current = this.currentSettings();
    const outdated = done.some((item) => item.settings && !sameSettings(item.settings, current));
    this.reconvertButton.hidden = !outdated;
    this.settingsHint.hidden = !outdated;
    this.clearButton.disabled = this.items.length === 0;
  }

  private reconvert(): void {
    const current = this.currentSettings();
    for (const item of this.items) {
      if (item.status !== 'done' || !item.settings || sameSettings(item.settings, current)) continue;
      if (item.url) URL.revokeObjectURL(item.url);
      if (item.name) this.names.release(item.name);
      Object.assign(item, { status: 'queued', settings: null, name: null, blob: null, url: null, warnings: [] });
      this.run.total++;
      this.renderRow(item);
    }
    this.updateActions();
    void this.processQueue();
  }

  private clear(): void {
    this.generation++;
    this.running = false;
    this.client?.recycle(); // прерываем текущую конвертацию
    for (const item of this.items) if (item.url) URL.revokeObjectURL(item.url);
    this.items = [];
    this.names.clear();
    this.run = { total: 0, done: 0, failed: 0 };
    this.list.replaceChildren();
    this.results.hidden = true;
    this.setStatus('');
    this.hideNotice();
    this.updateActions();
    this.dropzone.focus();
  }

  private async downloadAll(): Promise<void> {
    const done = this.items.filter((item) => item.status === 'done' && item.blob && item.name);
    if (done.length === 0 || this.zipping) return;
    this.zipping = true;
    const label = this.zipButton.textContent;
    this.zipButton.textContent = this.t.zipPreparing;
    this.zipButton.setAttribute('aria-busy', 'true');
    this.updateActions();
    try {
      const { createZip, saveBlob } = await import('./zip');
      const zip = await createZip(done.map((item) => ({ name: item.name!, blob: item.blob! })));
      saveBlob(zip, `${this.config.zipName}.zip`);
    } catch {
      this.showNotice(this.t.zipFailed, 'error');
    } finally {
      this.zipping = false;
      this.zipButton.textContent = label;
      this.zipButton.removeAttribute('aria-busy');
      this.updateActions();
    }
  }

  private setStatus(text: string): void {
    this.status.textContent = text;
  }

  private showNotice(text: string, kind: 'warning' | 'error'): void {
    this.notice.textContent = text;
    this.notice.dataset.kind = kind;
    this.notice.hidden = false;
  }

  private hideNotice(): void {
    this.notice.hidden = true;
    this.notice.textContent = '';
  }
}

export function initConverters(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-converter]')) new ConverterWidget(root);
}
