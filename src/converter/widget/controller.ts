// Виджет конвертера: очередь файлов, настройки, строки результатов, ZIP.
// Разметку отдаёт сервер (ConverterWidget.astro), здесь — только поведение. Строки — из конфигурации.

import { track } from '../../lib/analytics';
import type { MetadataReport } from '../metadata/inspect/types';
import type { RemovedKind, StripMode } from '../metadata/strip/types';
import { checkInput } from '../pipeline/input';
import { KIND_FILES, SNIFF_BYTES, type SniffKind, sniff } from '../pipeline/sniff';
import type { ResizeSpec } from '../pipeline/resize';
import { ENCODER_EXTENSIONS, type ErrorCode, type WarningCode } from '../pipeline/types';
import { type OutputOption, type WidgetConfig, readConfig } from './config';
import { NameAllocator, outputName, withTimestamp } from './filenames';
import { ReportView } from './report-view';
import { formatBytes } from './sizes';
import { supportsConverter } from './support';
import { WorkerClient } from './worker-client';
import { type Lease, WorkerPool, currentDevice, poolPolicy } from './worker-pool';

type Status = 'queued' | 'converting' | 'done' | 'error';

interface Settings {
  output: OutputOption;
  quality: number;
  /** Галочка «Без потерь» (действует только для форматов с hasLossless). */
  lossless: boolean;
  keepMetadata: boolean;
  /** Страница «Сжать фото»: целевой размер в байтах вместо качества с ползунка; иначе null. */
  targetBytes: number | null;
  /** Страница «Изменить размер»: как уменьшать; иначе null. */
  resize: ResizeSpec | null;
  /** Страница «Удалить метаданные»: что удалять; иначе null. */
  strip: StripMode | null;
}

/** Целевой размер — в десятичных килобайтах и мегабайтах: файл «до 1 МБ» пройдёт и лимит 1 000 000, и 1 048 576 байт. */
const TARGET_UNITS: Record<string, number> = { kb: 1000, mb: 1000 * 1000 };
const MIN_TARGET_BYTES = 10 * 1000;
const DEFAULT_TARGET_BYTES = 500 * 1000;
const DEFAULT_LONG_SIDE = 1920;
/** Больше точек по стороне не бывает ни у одного поддерживаемого формата. */
const MAX_DIMENSION = 100_000;

/** Целое число точек из поля («1 920», «1920px» не принимаем — только цифры и пробелы); иначе null. */
function parseDimension(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? '').replace(/\s/g, '');
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX_DIMENSION ? n : null;
}

interface Item {
  file: File;
  status: Status;
  /** Настройки, с которыми файл сконвертирован (для «Конвертировать заново»). */
  settings: Settings | null;
  name: string | null;
  blob: Blob | null;
  url: string | null;
  /** Object URL маленького превью (делается в worker'е). */
  previewUrl: string | null;
  error: ErrorCode | null;
  warnings: WarningCode[];
  /** Качество, подобранное под целевой размер (показывается в строке файла). */
  quality: number | null;
  /** «Удалить метаданные»: что нашлось и удалено (пусто — файл не изменился) и формат файла — вместо превью. */
  removed: RemovedKind[] | null;
  format: string | null;
  /** «Посмотреть EXIF»: что прочитано из файла и его формат (для «Скачать без метаданных»). */
  report: MetadataReport | null;
  kind: Exclude<SniffKind, 'unknown'> | null;
  /** Размеры до и после уменьшения (страница «Изменить размер»). */
  dimensions: { before: [number, number]; after: [number, number] } | null;
  /** Оценка памяти, если файл не поместился рядом с другими (ждёт в очереди первым). */
  estimate: number | null;
  /** Повтор после нехватки памяти или сбоя WASM — в одиночку на свежем worker'е. */
  retry: boolean;
  row: HTMLLIElement;
}

const isLossless = (s: Settings) => s.output.hasLossless && s.lossless;
/** Форматы с потерями: только у них есть качество и целевой размер. */
const isLossy = (s: Settings) => s.output.hasQuality && !isLossless(s);

/** Совпадают ли настройки по-существу: качество не важно без потерь и при целевом размере, галочка «Без потерь» — у форматов без неё. */
const sameSettings = (a: Settings, b: Settings) =>
  a.output.id === b.output.id &&
  a.keepMetadata === b.keepMetadata &&
  isLossless(a) === isLossless(b) &&
  (!isLossy(a) || (a.targetBytes === b.targetBytes && (a.targetBytes !== null || a.quality === b.quality))) &&
  JSON.stringify(a.resize) === JSON.stringify(b.resize) &&
  a.strip === b.strip;

/** Сконвертированный файл или «уже в этом формате» — после смены настроек их можно сконвертировать заново. */
function isOutdated(item: Item, current: Settings): boolean {
  if (!item.settings) return false;
  if (item.status === 'done') return !sameSettings(item.settings, current);
  return item.status === 'error' && (item.error?.startsWith('already-') ?? false) && item.settings.output.id !== current.output.id;
}

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
  /** Качество, «Без потерь», метаданные и предупреждение PNG — у всех, кроме «Удалить метаданные». */
  private readonly qualityRow: HTMLElement | null;
  private readonly losslessRow: HTMLElement | null;
  private readonly qualityValue: HTMLOutputElement | null;
  /** Только на страницах сжатия и размера. */
  private readonly originalHint: HTMLElement | null;
  /** Только на страницах иконок: пояснение про размеры ICO; метаданные для ICO скрываются. */
  private readonly icoHint: HTMLElement | null;
  private readonly metaRow: HTMLElement | null;
  /** Только на странице «Удалить метаданные»: пояснение к выбранному режиму. */
  private readonly stripHint: HTMLElement | null;
  /** Только на странице «Сжать фото»: переключатель «По качеству / До размера» и поле целевого размера. */
  private readonly compressionRow: HTMLElement | null;
  private readonly targetRow: HTMLElement | null;
  /** Только на странице «Изменить размер»: строки трёх режимов, готовые размеры и подпись масштаба. */
  private readonly resizeRows: Record<ResizeSpec['mode'], HTMLElement> | null;
  private readonly presets: HTMLButtonElement[];
  private readonly percentValue: HTMLOutputElement | null;
  private readonly pngWarning: HTMLElement | null;
  private readonly status: HTMLElement;
  private readonly notice: HTMLElement;
  private readonly results: HTMLElement;
  private readonly list: HTMLUListElement;
  private readonly zipButton: HTMLButtonElement;
  private readonly reconvertButton: HTMLButtonElement;
  private readonly settingsHint: HTMLElement;
  private readonly clearButton: HTMLButtonElement;

  private items: Item[] = [];
  private readonly pool = new WorkerPool(poolPolicy(currentDevice()), () => new WorkerClient());
  private zipping = false;
  private loadedOnce = false;
  /** Растёт при очистке: результаты задач из прошлого «поколения» отбрасываются. */
  private generation = 0;
  private run = { total: 0, done: 0, failed: 0 };
  private dragDepth = 0;
  private readonly names = new NameAllocator();
  private readonly reports: ReportView;

  constructor(private readonly root: HTMLElement) {
    this.config = readConfig(root);
    this.t = this.config.strings;
    this.reports = new ReportView(this.t, this.config.locale);
    this.dropzone = element(root, '[data-dropzone]');
    this.input = element(root, '[data-input]');
    this.form = element(root, '[data-settings]');
    this.qualityRow = root.querySelector('[data-quality-row]');
    this.losslessRow = root.querySelector('[data-lossless-row]');
    this.qualityValue = root.querySelector('[data-quality-value]');
    this.originalHint = root.querySelector('[data-original-hint]');
    this.icoHint = root.querySelector('[data-ico-hint]');
    this.metaRow = root.querySelector('[data-meta-row]');
    this.stripHint = root.querySelector('[data-strip-hint]');
    this.compressionRow = root.querySelector('[data-compression-row]');
    this.targetRow = root.querySelector('[data-target-row]');
    const longRow = root.querySelector<HTMLElement>('[data-resize-long]');
    this.resizeRows = longRow
      ? { 'long-side': longRow, percent: element(root, '[data-resize-percent]'), box: element(root, '[data-resize-box]') }
      : null;
    this.presets = [...root.querySelectorAll<HTMLButtonElement>('[data-preset]')];
    this.percentValue = root.querySelector('[data-percent-value]');
    this.pngWarning = root.querySelector('[data-png-warning]');
    this.status = element(root, '[data-status-text]');
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
    for (const preset of this.presets) {
      preset.addEventListener('click', () => {
        (this.form.elements.namedItem('longSide') as HTMLInputElement).value = preset.dataset.preset!;
        this.syncSettings();
      });
    }
    this.zipButton.addEventListener('click', () => void this.downloadAll());
    this.reconvertButton.addEventListener('click', () => this.reconvert());
    this.clearButton.addEventListener('click', () => this.clear());
  }

  private currentSettings(): Settings {
    const data = new FormData(this.form);
    const output = this.config.outputs.find((o) => o.id === data.get('format')) ?? this.config.outputs[0]!;
    return {
      output,
      quality: Number(data.get('quality') ?? 90),
      lossless: data.get('lossless') !== null,
      keepMetadata: data.get('keepMetadata') !== null,
      targetBytes: data.get('compression') === 'target' ? this.targetBytes(data) : null,
      resize: this.resizeRows ? this.resizeSpec(data) : null,
      strip: this.config.mode === 'strip' ? ((data.get('stripMode') ?? 'all') as StripMode) : null,
    };
  }

  /** Как уменьшать — из полей; пустое или неверное число: у стороны — по умолчанию, у ширины/высоты — без ограничения. */
  private resizeSpec(data: FormData): ResizeSpec {
    const mode = data.get('resizeMode');
    if (mode === 'percent') return { mode, percent: Number(data.get('percent') ?? 50) };
    if (mode === 'box') {
      return {
        mode,
        width: parseDimension(data.get('boxWidth')),
        height: parseDimension(data.get('boxHeight')),
        keepAspect: data.get('keepAspect') !== null,
      };
    }
    return { mode: 'long-side', size: parseDimension(data.get('longSide')) ?? DEFAULT_LONG_SIDE };
  }

  /** Целевой размер из поля и единицы; пустое или неверное значение — по умолчанию, слишком маленькое — минимум. */
  private targetBytes(data: FormData): number {
    const value = Number(String(data.get('targetSize') ?? '').replace(',', '.'));
    const unit = TARGET_UNITS[String(data.get('targetUnit'))] ?? TARGET_UNITS.kb!;
    if (!Number.isFinite(value) || value <= 0) return DEFAULT_TARGET_BYTES;
    return Math.max(MIN_TARGET_BYTES, Math.round(value * unit));
  }

  private syncSettings(): void {
    const settings = this.currentSettings();
    const lossy = isLossy(settings);
    if (this.originalHint) this.originalHint.hidden = settings.output.id !== 'original';
    if (this.icoHint) this.icoHint.hidden = settings.output.id !== 'ico';
    if (this.metaRow) this.metaRow.hidden = settings.output.id === 'ico';
    if (this.stripHint && settings.strip) this.stripHint.textContent = this.t.stripHints[settings.strip];
    if (this.compressionRow) this.compressionRow.hidden = !lossy;
    if (this.targetRow) this.targetRow.hidden = !lossy || settings.targetBytes === null;
    if (this.qualityRow) this.qualityRow.hidden = !lossy || settings.targetBytes !== null;
    if (this.resizeRows && settings.resize) {
      const resize = settings.resize;
      for (const [mode, row] of Object.entries(this.resizeRows)) row.hidden = mode !== resize.mode;
      const data = new FormData(this.form);
      const longSide = String(data.get('longSide') ?? '');
      for (const preset of this.presets) preset.setAttribute('aria-pressed', String(preset.dataset.preset === longSide.trim()));
      if (this.percentValue) this.percentValue.value = `${data.get('percent')} %`;
      // неверное число подсвечиваем (пустая ширина или высота — допустимо: «без ограничения»)
      for (const name of ['longSide', 'boxWidth', 'boxHeight']) {
        const input = this.form.elements.namedItem(name) as HTMLInputElement | null;
        if (!input) continue;
        const empty = input.value.trim() === '' && name !== 'longSide';
        input.setAttribute('aria-invalid', String(!empty && parseDimension(input.value) === null));
      }
    }
    if (this.losslessRow) this.losslessRow.hidden = !settings.output.hasLossless;
    if (this.pngWarning) this.pngWarning.hidden = !settings.output.largeFiles;
    if (this.qualityValue) this.qualityValue.value = String(settings.quality);
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
      const item: Item = {
        file,
        status: 'queued',
        settings: null,
        name: null,
        blob: null,
        url: null,
        previewUrl: null,
        error: null,
        warnings: [],
        quality: null,
        removed: null,
        format: null,
        report: null,
        kind: null,
        dimensions: null,
        estimate: null,
        retry: false,
        row: document.createElement('li'),
      };
      this.items.push(item);
      this.renderRow(item);
      this.list.append(item.row);
      this.run.total++;
    }
    this.results.hidden = false;
    this.updateActions();
    this.pump();
  }

  /**
   * Запускает файлы из очереди по порядку, пока пул даёт место (worker'ы, память). Вызывается при добавлении файлов,
   * когда worker оценил файл и когда файл закончен. Файл, который ждёт памяти, остаётся первым в очереди.
   */
  private pump(): void {
    const generation = this.generation;
    for (let item = this.nextQueued(); item; item = this.nextQueued()) {
      const lease = this.pool.acquire(item.estimate, item.retry);
      if (!lease) break;
      item.status = 'converting';
      this.renderRow(item);
      void this.convert(item, lease, generation);
    }
    if (this.pool.running > 0) {
      if (this.loadedOnce) this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    } else if (!this.nextQueued()) {
      this.pool.trim();
      this.finishRun();
    }
  }

  private nextQueued(): Item | undefined {
    return this.items.find((item) => item.status === 'queued');
  }

  private async convert(item: Item, lease: Lease, generation: number): Promise<void> {
    let recycle = false;
    try {
      recycle = await this.process(item, lease, generation);
    } catch {
      // например, файл не читается: его удалили с диска после выбора — остальная очередь идёт дальше
      if (generation === this.generation) this.fail(item, 'internal');
    } finally {
      // после «Очистить» пул уже сброшен — этот файл больше никого не интересует
      if (generation === this.generation) {
        lease.release(recycle);
        this.pump();
      }
    }
  }

  /** Обрабатывает файл на выданном worker'е; true — worker нужно пересоздать. */
  private async process(item: Item, lease: Lease, generation: number): Promise<boolean> {
    // формат по сигнатуре проверяем сразу, без загрузки WASM
    const head = new Uint8Array(await item.file.slice(0, SNIFF_BYTES).arrayBuffer());
    if (generation !== this.generation) return false;
    const settings = this.currentSettings();
    item.settings = settings;
    if (settings.strip) return this.strip(item, head, settings.strip, lease, generation);
    if (this.config.mode === 'inspect') return this.inspect(item, head, lease, generation);
    const input = checkInput(head, settings.output.encoder, this.config.mode !== 'convert');
    if (!input.ok) {
      this.fail(item, input.code);
      return false;
    }
    // имя выделяем сейчас, в порядке очереди: при параллельной обработке файлы заканчиваются вразнобой
    item.name ??= this.names.allocate(outputName(item.file.name, ENCODER_EXTENSIONS[input.encoder]));

    if (!this.loadedOnce) this.setStatus(this.t.loading);
    try {
      await lease.client.load(input.decoder, input.encoder);
      this.loadedOnce = true;
    } catch {
      if (generation !== this.generation) return false;
      this.showNotice(this.t.loadFailed, 'error');
      this.fail(item, 'internal');
      return true;
    }
    if (generation !== this.generation) return false;
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));

    const options = {
      encoder: input.encoder,
      quality: settings.quality,
      lossless: isLossless(settings),
      metadata: settings.keepMetadata ? ('all' as const) : ('dates' as const),
      targetBytes: settings.targetBytes,
      allowSameFormat: this.config.mode !== 'convert',
      resize: settings.resize,
    };
    const outcome = await lease.client.convert(item.file, options, lease.memoryLimit, (footprint, fresh) => {
      if (generation !== this.generation) return;
      lease.started(footprint, fresh);
      this.pump(); // файл оценён — можно запускать следующий
    });
    if (generation !== this.generation) return false;
    if (outcome.status === 'needs-memory') {
      // не поместился рядом с другими: ждёт первым в очереди, пока освободится память
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      // нехватка памяти или сбой WASM: один повтор — в одиночку на свежем worker'е (память могли занять другие файлы)
      if (outcome.fatal && !item.retry) {
        item.retry = true;
        this.requeue(item);
        return true;
      }
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }

    item.blob = new Blob([outcome.buffer], { type: outcome.mime });
    item.url = URL.createObjectURL(item.blob);
    item.previewUrl = URL.createObjectURL(new Blob([outcome.preview], { type: outcome.mime }));
    item.quality = settings.targetBytes !== null ? outcome.quality : null;
    item.dimensions = settings.resize
      ? { before: [outcome.sourceWidth, outcome.sourceHeight], after: [outcome.width, outcome.height] }
      : null;
    item.warnings = outcome.warnings;
    // при сжатии честно говорим, что файл не уменьшился (если причина не названа уже — «у PNG нет качества»)
    if (this.config.mode === 'compress' && item.blob.size >= item.file.size && !item.warnings.includes('target-lossless')) {
      item.warnings.push('not-smaller');
    }
    item.status = 'done';
    this.run.done++;
    this.renderRow(item);
    this.updateActions();
    return false;
  }

  /** «Удалить метаданные»: формат и имя файла остаются, WASM не нужен. */
  private async strip(item: Item, head: Uint8Array, mode: StripMode, lease: Lease, generation: number): Promise<boolean> {
    const { kind } = sniff(head);
    if (kind === 'unknown') {
      this.fail(item, 'not-image');
      return false;
    }
    // имя и расширение остаются (без расширения — по формату)
    const dot = item.file.name.lastIndexOf('.');
    const extension = dot > 0 ? item.file.name.slice(dot + 1) : KIND_FILES[kind].extension;
    item.name ??= this.names.allocate(outputName(item.file.name, extension));
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.strip(item.file, mode, lease.memoryLimit, (footprint, fresh) => {
      if (generation !== this.generation) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (generation !== this.generation) return false;
    if (outcome.status === 'needs-memory') {
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }
    item.blob = new Blob([outcome.buffer], { type: item.file.type || KIND_FILES[kind].mime });
    item.url = URL.createObjectURL(item.blob);
    item.removed = outcome.removed;
    item.format = KIND_FILES[kind].label;
    item.warnings = outcome.warnings;
    item.status = 'done';
    this.run.done++;
    this.renderRow(item);
    this.updateActions();
    return false;
  }

  /** «Посмотреть EXIF»: только чтение, результата-файла нет. */
  private async inspect(item: Item, head: Uint8Array, lease: Lease, generation: number): Promise<boolean> {
    const { kind } = sniff(head);
    if (kind === 'unknown') {
      this.fail(item, 'not-image');
      return false;
    }
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.inspect(item.file, lease.memoryLimit, (footprint, fresh) => {
      if (generation !== this.generation) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (generation !== this.generation) return false;
    if (outcome.status === 'needs-memory') {
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }
    item.report = outcome.report;
    item.kind = kind;
    item.format = KIND_FILES[kind].label;
    if (outcome.report.thumbnail) item.previewUrl = URL.createObjectURL(new Blob([outcome.report.thumbnail as Uint8Array<ArrayBuffer>], { type: 'image/jpeg' }));
    item.status = 'done';
    this.run.done++;
    this.renderRow(item);
    this.updateActions();
    return false;
  }

  /** «Скачать без метаданных» из отчёта: один файл по нажатию — удаляем прямо здесь, без очереди. */
  private async downloadStripped(item: Item): Promise<void> {
    if (!item.kind) return;
    try {
      const { stripMetadata } = await import('../metadata/strip');
      const result = stripMetadata(new Uint8Array(await item.file.arrayBuffer()), item.kind, 'all');
      const { saveBlob } = await import('./zip');
      const name = outputName(item.file.name, item.file.name.includes('.') ? item.file.name.slice(item.file.name.lastIndexOf('.') + 1) : KIND_FILES[item.kind].extension);
      saveBlob(new Blob([result.bytes as Uint8Array<ArrayBuffer>], { type: item.file.type || KIND_FILES[item.kind].mime }), withTimestamp(name, new Date()));
    } catch {
      this.showNotice(this.t.errors.internal, 'error');
    }
  }

  /** Вернуть файл в очередь (на своё место — он пойдёт первым); имя выделится заново при старте. */
  private requeue(item: Item): void {
    if (item.name) this.names.release(item.name);
    item.name = null;
    item.status = 'queued';
    this.renderRow(item);
  }

  private fail(item: Item, code: ErrorCode): void {
    if (item.name) this.names.release(item.name);
    item.name = null;
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

  /** Изменение размера файла в процентах со знаком: «−85 %», «+12 %». */
  private change(before: number, after: number): string {
    const ratio = before > 0 ? (after - before) / before : 0;
    return new Intl.NumberFormat(this.config.locale, { style: 'percent', maximumFractionDigits: 0, signDisplay: 'exceptZero' })
      .format(ratio)
      .replace('-', '\u2212');
  }

  private renderRow(item: Item): void {
    const row = item.row;
    row.className = 'file';
    row.dataset.status = item.status;
    row.replaceChildren();

    const thumb = document.createElement('span');
    thumb.className = 'file__thumb';
    if (item.status === 'done' && item.previewUrl) {
      // превью через <img> и object URL (не canvas); маленькую копию готовит worker
      const img = document.createElement('img');
      img.src = item.previewUrl;
      img.alt = '';
      img.width = 48;
      img.height = 48;
      img.decoding = 'async';
      // у «Посмотреть EXIF» это миниатюра из самого файла — бывает, что на ней снимок до обрезки
      if (item.report) img.title = this.t.report.thumbnail;
      thumb.append(img);
    } else if (item.status === 'done' && item.format) {
      // изображение не декодируется (метаданные удаляются без WASM) — вместо превью формат файла
      thumb.classList.add('file__thumb--format');
      thumb.textContent = item.format;
    }

    const body = document.createElement('div');
    body.className = 'file__body';
    const name = document.createElement('p');
    name.className = 'file__name';
    // имя результата выделяется при старте, но показываем его только у готового файла
    name.textContent = item.status === 'done' && item.name ? item.name : item.file.name;
    const meta = document.createElement('p');
    meta.className = 'file__meta';
    if (item.status === 'queued') meta.textContent = this.t.queued;
    if (item.status === 'converting') meta.textContent = this.t.converting;
    if (item.status === 'error') meta.textContent = this.t.failed;
    if (item.status === 'done' && item.report) {
      const { width, height } = item.report;
      const parts = [item.format ?? '', this.size(item.file.size)];
      if (width && height) parts.push(fill(this.t.dimensions, { width, height }));
      meta.textContent = parts.join(' · ');
    }
    if (item.status === 'done' && item.blob) {
      const parts = [this.t.done, fill(this.t.sizes, { before: this.size(item.file.size), after: this.size(item.blob.size) })];
      // при сжатии и изменении размера важна разница в размере: «−85 %»; размер не изменился — одно число
      if (item.blob.size === item.file.size) parts[1] = this.size(item.file.size);
      else if (this.config.mode !== 'convert') parts[1] += ` (${this.change(item.file.size, item.blob.size)})`;
      if (item.dimensions) {
        const [before, after] = [item.dimensions.before, item.dimensions.after].map(([width, height]) => fill(this.t.dimensions, { width, height }));
        parts.splice(1, 0, before === after ? before! : fill(this.t.sizes, { before: before!, after: after! }));
      }
      if (item.quality !== null) parts.push(fill(this.t.qualityUsed, { quality: item.quality }));
      meta.textContent = parts.join(' · ');
    }
    body.append(name, meta);

    const notes = item.status === 'error' && item.error ? [this.errorText(item.error)] : item.warnings.map((w) => this.t.warnings[w]);
    if (item.status === 'done' && item.removed) notes.unshift(this.removedText(item.removed));
    for (const text of notes) {
      const note = document.createElement('p');
      note.className = item.status === 'error' ? 'file__note file__note--error' : 'file__note';
      note.textContent = text;
      body.append(note);
    }
    row.append(thumb, body);
    if (item.status === 'done' && item.report) row.append(this.reports.render(item.report, item.file.name, () => void this.downloadStripped(item)));

    if (item.status === 'done' && item.url && item.name) {
      const name = item.name;
      const link = document.createElement('a');
      link.className = 'button button--small file__download';
      link.href = item.url;
      link.download = name;
      // дата и время в имени — на момент нажатия: повторное скачивание не перезапишет прошлый файл
      link.addEventListener('click', () => (link.download = withTimestamp(name, new Date())));
      link.textContent = this.t.download;
      link.setAttribute('aria-label', fill(this.t.downloadLabel, { name: item.name }));
      row.append(link);
    }
  }

  /** «Удалено: геолокация, камера и объектив, XMP.» или «Метаданных не найдено…». */
  private removedText(removed: RemovedKind[]): string {
    if (removed.length === 0) return this.t.nothingFound;
    return fill(this.t.removed, { list: removed.map((kind) => this.t.removedKinds[kind]).join(', ') });
  }

  private errorText(code: ErrorCode): string {
    const text = this.t.errors[code];
    return code === 'already-jpeg' && this.config.iphoneHint ? `${text} ${this.t.iphoneJpegHint}` : text;
  }

  private updateActions(): void {
    const done = this.items.filter((item) => item.status === 'done');
    this.zipButton.disabled = this.zipping || done.length === 0;
    const current = this.currentSettings();
    const outdated = this.items.some((item) => isOutdated(item, current));
    this.reconvertButton.hidden = !outdated;
    this.settingsHint.hidden = !outdated;
    this.clearButton.disabled = this.items.length === 0;
  }

  private reconvert(): void {
    const current = this.currentSettings();
    for (const item of this.items) {
      if (!isOutdated(item, current)) continue;
      this.revokeUrls(item);
      if (item.name) this.names.release(item.name);
      Object.assign(item, {
        status: 'queued',
        settings: null,
        name: null,
        blob: null,
        url: null,
        previewUrl: null,
        error: null,
        warnings: [],
        quality: null,
        removed: null,
        format: null,
        report: null,
        kind: null,
        dimensions: null,
        estimate: null,
        retry: false,
      });
      this.run.total++;
      this.renderRow(item);
    }
    this.updateActions();
    this.pump();
  }

  private clear(): void {
    this.generation++;
    this.pool.recycleAll(); // прерываем текущие конвертации
    for (const item of this.items) this.revokeUrls(item);
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

  private revokeUrls(item: Item): void {
    if (item.url) URL.revokeObjectURL(item.url);
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
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
      const started = new Date();
      const { createZip, saveBlob } = await import('./zip');
      const zip = await createZip(done.map((item) => ({ name: item.name!, blob: item.blob! })));
      saveBlob(zip, withTimestamp(`${this.config.zipName}.zip`, started));
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
