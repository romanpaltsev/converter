// Виджет конвертера: очередь файлов, настройки, строки результатов, ZIP.
// Разметку отдаёт сервер (ConverterWidget.astro), здесь — только поведение. Строки — из конфигурации.

import { track } from '../../lib/analytics';
import type { MetadataReport } from '../metadata/inspect/types';
import type { RemovedKind, StripMode } from '../metadata/strip/types';
import { SMALL_MARGIN } from '../pdf/limits';
import type { PageSize, PdfImage, PdfLayout } from '../pdf/writer';
import { checkInput } from '../pipeline/input';
import { type ImageKind, KIND_FILES, SNIFF_BYTES, type SniffKind, sniff } from '../pipeline/sniff';
import type { ResizeSpec } from '../pipeline/resize';
import { ENCODER_EXTENSIONS, type EncoderId, type ErrorCode, type OutputTarget, type WarningCode } from '../pipeline/types';
import { type OutputOption, type WidgetConfig, readConfig } from './config';
import { NameAllocator, outputName, withTimestamp } from './filenames';
import { FormatPicker } from './format-picker';
import { ReportView } from './report-view';
import { formatBytes } from './sizes';
import { supportsConverter, supportsPdfRendering } from './support';
import { type TargetId, type TargetPair, type TargetSettings, defaultTarget, jobFor, ownTarget, settingsKey, sharedTargets, targetsFor, visibleSettings } from './targets';
import { WorkerClient } from './worker-client';
import { type Lease, WorkerPool, currentDevice, poolPolicy } from './worker-pool';

/** waiting — универсальный виджет: файл ждёт, пока для него выберут формат. */
type Status = 'waiting' | 'queued' | 'converting' | 'done' | 'error';

interface Settings {
  /** Общий переключатель формата (сжатие, размер, PDF в JPG); у универсального виджета — null, формат у файла. */
  output: OutputOption | null;
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
  /** «Изображения в PDF» и картинки в PDF у универсального виджета: размер страниц и поля (применяются при сборке —
   *  файлы заново не обрабатываются); иначе null. */
  pdf: PdfLayout | null;
  /** Универсальный виджет: разрешение страниц PDF; иначе null. */
  dpi: number | null;
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
  kind: ImageKind | null;
  /** «Изображения в PDF»: картинка страницы; passthrough — JPEG вставлен без перекодирования. */
  pdf: PdfImage | null;
  passthrough: boolean;
  /** «PDF в JPG/PNG»: у строки PDF — сколько страниц нарисовано и сколько всего; у строки страницы — её PDF и номер. */
  pages: { done: number; total: number | null } | null;
  parent: Item | null;
  page: { number: number; total: number } | null;
  /** Размеры до и после уменьшения (страница «Изменить размер»). */
  dimensions: { before: [number, number]; after: [number, number] } | null;
  /** Оценка памяти, если файл не поместился рядом с другими (ждёт в очереди первым). */
  estimate: number | null;
  /** Повтор после нехватки памяти или сбоя WASM — в одиночку на свежем worker'е. */
  retry: boolean;
  /** Универсальный виджет: вид файла по сигнатуре и выбранный формат (null — ждёт выбора). */
  source: SniffKind | null;
  target: TargetId | null;
  /** Номер задания: растёт при смене формата — ответы прежнего задания отбрасываются. */
  job: number;
  /** Worker, который сейчас обрабатывает файл (чтобы прервать задание). */
  lease: Lease | null;
  /** Настройки, важные для формата файла, на момент старта (settingsKey) — для «Конвертировать заново». */
  key: string | null;
  row: HTMLLIElement;
}

/** Чьё это задание: «поколение» (растёт при «Очистить») и номер задания файла. */
interface Ticket {
  generation: number;
  job: number;
}

/** Ошибки, после которых другой формат может помочь: предел WebP, нехватка памяти, сбой. Остальные — про сам файл. */
const RETRYABLE_ERRORS = new Set<ErrorCode>(['too-large-for-webp', 'out-of-memory', 'internal']);

const isLossless = (s: Settings) => !!s.output?.hasLossless && s.lossless;
/** Форматы с потерями: только у них есть качество и целевой размер. */
const isLossy = (s: Settings) => !!s.output?.hasQuality && !isLossless(s);

/** Совпадают ли настройки по-существу: качество не важно без потерь и при целевом размере, галочка «Без потерь» — у форматов без неё. */
const sameSettings = (a: Settings, b: Settings) =>
  a.output?.id === b.output?.id &&
  a.keepMetadata === b.keepMetadata &&
  isLossless(a) === isLossless(b) &&
  (!isLossy(a) || (a.targetBytes === b.targetBytes && (a.targetBytes !== null || a.quality === b.quality))) &&
  JSON.stringify(a.resize) === JSON.stringify(b.resize) &&
  a.strip === b.strip &&
  a.dpi === b.dpi;

/** Сконвертированный файл или «уже в этом формате» — после смены настроек их можно сконвертировать заново. */
function isOutdated(item: Item, current: Settings): boolean {
  if (!item.settings) return false;
  if (item.status === 'done') return !sameSettings(item.settings, current);
  return item.status === 'error' && (item.error?.startsWith('already-') ?? false) && item.settings.output?.id !== current.output?.id;
}

/** Подстановка {name} в строку из словаря. */
function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Общие настройки, важные формату файла (у универсального виджета dpi есть всегда). */
function targetSettings(settings: Settings): TargetSettings {
  return { quality: settings.quality, lossless: settings.lossless, keepMetadata: settings.keepMetadata, dpi: settings.dpi ?? 0 };
}

/** По какому селектору найти «ту же» кнопку в перерисованной строке. */
function focusSelector(focused: HTMLElement): string | null {
  if (focused.matches('[data-target-button]')) return '[data-target-button]';
  if (focused.matches('[data-remove]')) return '[data-remove]';
  if (focused.matches('[data-move]')) return `[data-move="${focused.dataset.move}"]`;
  if (focused.matches('.file__download')) return '.file__download';
  return null;
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
  /** Универсальный виджет: «AVIF кодируется долго», размер страницы PDF и разрешение страниц. */
  private readonly avifHint: HTMLElement | null;
  private readonly pdfLayoutRow: HTMLElement | null;
  private readonly dpiRow: HTMLElement | null;
  /** Размер страницы и поля, с которыми собраны готовые PDF: сменились — документы пересобираются. */
  private layoutKey = '';
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
  /** Универсальный виджет: меню форматов и «Все файлы в …». */
  private readonly picker: FormatPicker | null;
  private readonly pickerId: string;
  private readonly allRow: HTMLElement | null;
  private readonly allButton: HTMLButtonElement | null;
  /** Владелец меню, открытого кнопкой «Все файлы в …». */
  private readonly allOwner = {};
  /** С каким форматом новые файлы встают в очередь: формат страницы, после «Все файлы в …» — выбранный там. */
  private preset: TargetId | null;
  /** Файлы добавляются по очереди: сигнатуры читаются асинхронно, а строки должны идти в порядке выбора. */
  private adding: Promise<void> = Promise.resolve();

  private items: Item[] = [];
  private readonly pool = new WorkerPool(poolPolicy(currentDevice()), () => new WorkerClient());
  private zipping = false;
  private loadedOnce = false;
  /** Растёт при очистке: результаты задач из прошлого «поколения» отбрасываются. */
  private generation = 0;
  /** formats — сколько файлов готово в каждом формате (для аналитики универсального виджета). */
  private run = { total: 0, done: 0, failed: 0, formats: {} as Record<string, number> };
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
    this.avifHint = root.querySelector('[data-avif-hint]');
    this.pdfLayoutRow = root.querySelector('[data-pdf-layout-row]');
    this.dpiRow = root.querySelector('[data-dpi-row]');
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
    const menu = root.querySelector<HTMLElement>('[data-picker]');
    this.picker = menu ? new FormatPicker(menu, this.results) : null;
    this.pickerId = menu?.id ?? '';
    this.allRow = root.querySelector('[data-target-all-row]');
    this.allButton = root.querySelector('[data-target-all]');
    this.preset = this.config.preset;
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
    this.zipButton.addEventListener('click', () => {
      if (this.config.mode === 'to-pdf') void this.downloadPdf();
      else if (this.config.mode === 'merge-pdf') void this.mergePdf();
      else void this.downloadAll();
    });
    this.reconvertButton.addEventListener('click', () => this.reconvert());
    this.clearButton.addEventListener('click', () => this.clear());
    if (this.allButton) this.bindMenuButton(this.allButton, (focus) => this.openAllPicker(focus), this.allOwner);
  }

  /** Кнопка, открывающая меню форматов: щелчок — открыть/закрыть, стрелки — открыть на первом/последнем пункте. */
  private bindMenuButton(button: HTMLButtonElement, open: (focus: 'checked' | 'first' | 'last') => void, owner: object): void {
    button.addEventListener('click', () => (this.picker!.isOpenFor(owner) ? this.picker!.close() : open('checked')));
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      open(event.key === 'ArrowDown' ? 'first' : 'last');
    });
  }

  private currentSettings(): Settings {
    const data = new FormData(this.form);
    const output = this.config.outputs.find((o) => o.id === data.get('format')) ?? this.config.outputs[0] ?? null;
    return {
      output,
      quality: Number(data.get('quality') ?? 90),
      lossless: data.get('lossless') !== null,
      keepMetadata: data.get('keepMetadata') !== null,
      targetBytes: data.get('compression') === 'target' ? this.targetBytes(data) : null,
      resize: this.resizeRows ? this.resizeSpec(data) : null,
      strip: this.config.mode === 'strip' ? ((data.get('stripMode') ?? 'all') as StripMode) : null,
      pdf:
        this.config.mode === 'to-pdf' || this.config.universal
          ? { size: (data.get('pageSize') ?? 'a4') as PageSize, margin: data.get('margin') === 'small' ? SMALL_MARGIN : 0 }
          : null,
      dpi: this.config.universal ? Number(data.get('dpi') ?? 150) : null,
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
    if (this.config.universal) {
      this.syncTargetSettings(settings);
      return;
    }
    const output = settings.output!;
    const lossy = isLossy(settings);
    if (this.originalHint) this.originalHint.hidden = output.id !== 'original';
    if (this.icoHint) this.icoHint.hidden = output.id !== 'ico';
    if (this.metaRow) this.metaRow.hidden = output.id === 'ico';
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
    if (this.losslessRow) this.losslessRow.hidden = !output.hasLossless;
    if (this.pngWarning) this.pngWarning.hidden = !output.largeFiles;
    if (this.qualityValue) this.qualityValue.value = String(settings.quality);
    this.updateActions();
  }

  /** Универсальный виджет: видны настройки, которые нужны форматам файлов в списке (без файлов — формату страницы). */
  private syncTargetSettings(settings: Settings): void {
    const pairs = this.targetPairs();
    const show = visibleSettings(pairs, settings.lossless);
    if (this.qualityRow) this.qualityRow.hidden = !show.quality;
    if (this.losslessRow) this.losslessRow.hidden = !show.lossless;
    if (this.metaRow) this.metaRow.hidden = !show.metadata;
    if (this.pngWarning) this.pngWarning.hidden = !show.pngWarning;
    if (this.icoHint) this.icoHint.hidden = !show.icoHint;
    if (this.avifHint) this.avifHint.hidden = !show.avifHint;
    if (this.pdfLayoutRow) this.pdfLayoutRow.hidden = !show.pdfLayout;
    if (this.dpiRow) this.dpiRow.hidden = !show.dpi;
    // размер страницы и поля применяются к готовым PDF сразу, без повторной обработки
    const layout = JSON.stringify(settings.pdf);
    if (layout !== this.layoutKey) {
      this.layoutKey = layout;
      void this.rebuildDocuments(settings.pdf!);
    }
    // настраивать нечего (например, ни у одного файла ещё не выбран формат) — форма не нужна
    this.form.hidden = !Object.values(show).some(Boolean);
    if (this.qualityValue) this.qualityValue.value = String(settings.quality);
    this.updateActions();
  }

  /** Пары «вход → формат» файлов, которые конвертируются или сконвертированы; без них — формат страницы. */
  private targetPairs(): TargetPair[] {
    const pairs = this.items
      .filter((item) => !item.parent && item.source && item.target && item.status !== 'error' && item.status !== 'waiting')
      .map((item) => ({ kind: item.source!, target: item.target! }));
    if (pairs.length > 0) return pairs;
    const { preset, presetKind } = this.config;
    return preset && presetKind ? [{ kind: presetKind, target: preset }] : [];
  }

  addFiles(files: File[]): void {
    if (files.length === 0) return;
    // «Объединить PDF» без OffscreenCanvas бесполезна целиком; в универсальном виджете проверяется строка PDF (classify)
    const rendersPdf = this.config.mode === 'merge-pdf';
    if (!(rendersPdf ? supportsPdfRendering() : supportsConverter())) {
      this.showNotice(this.t.unsupportedBrowser, 'error');
      return;
    }
    const max = this.config.maxFiles;
    if (files.length > max) this.showNotice(fill(this.t.batchLimit, { max }), 'warning');
    else this.hideNotice();
    if (this.config.universal) {
      // формат каждого файла узнаём по сигнатуре до появления строки: от него зависят меню и автозапуск
      const generation = this.generation;
      const batch = files.slice(0, max);
      this.adding = this.adding.then(() => this.addClassified(batch, generation)).catch(() => {});
      return;
    }
    for (const file of files.slice(0, max)) {
      const item = this.blankItem(file);
      this.items.push(item);
      this.renderRow(item);
      this.list.append(item.row);
      this.run.total++;
    }
    this.results.hidden = false;
    this.updateActions();
    this.pump();
  }

  /** Универсальный виджет: строки — после чтения сигнатур, в порядке выбора файлов. */
  private async addClassified(files: File[], generation: number): Promise<void> {
    const heads = await Promise.all(
      files.map((file) =>
        file
          .slice(0, SNIFF_BYTES)
          .arrayBuffer()
          .then(
            (buffer) => new Uint8Array(buffer),
            () => null,
          ),
      ),
    );
    if (generation !== this.generation) return;
    files.forEach((file, index) => {
      const item = this.blankItem(file);
      this.items.push(item);
      this.list.append(item.row);
      this.classify(item, heads[index]!);
    });
    this.results.hidden = false;
    this.syncSettings();
    this.pump();
  }

  /**
   * Вид файла по сигнатуре и формат, с которым он встаёт в очередь (предустановка страницы, если подходит;
   * иначе ждёт выбора). Нечитаемый файл, CMYK и неподдерживаемый JPEG — ошибка сразу, без WASM.
   */
  private classify(item: Item, head: Uint8Array | null): void {
    if (!head) {
      this.run.total++;
      this.fail(item, 'internal');
      return;
    }
    const { kind } = sniff(head);
    item.source = kind;
    if (kind === 'pdf' && !supportsPdfRendering()) {
      this.run.total++;
      this.fail(item, 'pdf-unsupported');
      return;
    }
    // картинка: CMYK и неподдерживаемый JPEG видны по заголовку (PDF проверит pdf.js в worker'е)
    const check = kind === 'pdf' ? null : checkInput(head, 'png', true);
    if (kind === 'unknown' || (check && !check.ok)) {
      this.run.total++;
      this.fail(item, check && !check.ok ? check.code : 'not-image');
      return;
    }
    item.target = defaultTarget(kind, this.preset);
    item.status = item.target ? 'queued' : 'waiting';
    if (item.target) this.run.total++;
    this.renderRow(item);
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
      void this.convert(item, lease, { generation, job: item.job });
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

  private async convert(item: Item, lease: Lease, ticket: Ticket): Promise<void> {
    item.lease = lease;
    let recycle = false;
    try {
      recycle = await this.process(item, lease, ticket);
    } catch {
      // например, файл не читается: его удалили с диска после выбора — остальная очередь идёт дальше
      if (!this.stale(item, ticket)) this.fail(item, 'internal');
    } finally {
      if (item.lease === lease) item.lease = null;
      // после «Очистить» пул уже сброшен — этот файл больше никого не интересует
      if (ticket.generation === this.generation) {
        lease.release(recycle);
        this.pump();
      }
    }
  }

  /** Ответ устарел: после «Очистить» или после смены формата у файла (задание отменено). */
  private stale(item: Item, ticket: Ticket): boolean {
    return ticket.generation !== this.generation || ticket.job !== item.job;
  }

  /** Обрабатывает файл на выданном worker'е; true — worker нужно пересоздать. */
  private async process(item: Item, lease: Lease, ticket: Ticket): Promise<boolean> {
    // формат по сигнатуре проверяем сразу, без загрузки WASM
    const head = new Uint8Array(await item.file.slice(0, SNIFF_BYTES).arrayBuffer());
    if (this.stale(item, ticket)) return false;
    const settings = this.currentSettings();
    item.settings = settings;
    if (this.config.universal) {
      const pair = { kind: item.source!, target: item.target! };
      item.key = settingsKey(pair, targetSettings(settings));
      const job = jobFor(pair.kind, pair.target);
      if (job === 'pages') return this.renderPdf(item, head, pair.target as EncoderId, settings, lease, ticket);
      if (job === 'document') return this.pdfPage(item, head, lease, ticket, settings.pdf);
      return this.convertImage(item, head, pair.target as EncoderId, pair.target === 'webp' && settings.lossless, settings, lease, ticket);
    }
    if (settings.strip) return this.strip(item, head, settings.strip, lease, ticket);
    if (this.config.mode === 'inspect') return this.inspect(item, head, lease, ticket);
    if (this.config.mode === 'to-pdf') return this.pdfPage(item, head, lease, ticket);
    if (this.config.mode === 'merge-pdf') return this.pdfInfo(item, head, lease, ticket);
    return this.convertImage(item, head, settings.output!.encoder, isLossless(settings), settings, lease, ticket);
  }

  /** Картинка → картинка (конвертеры, сжатие, размер): декодер и кодировщик в worker'е. */
  private async convertImage(
    item: Item,
    head: Uint8Array,
    output: OutputTarget,
    lossless: boolean,
    settings: Settings,
    lease: Lease,
    ticket: Ticket,
  ): Promise<boolean> {
    const input = checkInput(head, output, this.config.mode !== 'convert');
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
      if (this.stale(item, ticket)) return false;
      this.showNotice(this.t.loadFailed, 'error');
      this.fail(item, 'internal');
      return true;
    }
    if (this.stale(item, ticket)) return false;
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));

    const options = {
      encoder: input.encoder,
      quality: settings.quality,
      lossless,
      metadata: settings.keepMetadata ? ('all' as const) : ('dates' as const),
      targetBytes: settings.targetBytes,
      allowSameFormat: this.config.mode !== 'convert',
      resize: settings.resize,
    };
    const outcome = await lease.client.convert(item.file, options, lease.memoryLimit, (footprint, fresh) => {
      if (this.stale(item, ticket)) return;
      lease.started(footprint, fresh);
      this.pump(); // файл оценён — можно запускать следующий
    });
    if (this.stale(item, ticket)) return false;
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
    if (item.target) this.run.formats[item.target] = (this.run.formats[item.target] ?? 0) + 1;
    this.renderRow(item);
    this.syncSettings(); // у готовых файлов свои форматы — от них зависят видимые настройки
    return false;
  }

  /** «Удалить метаданные»: формат и имя файла остаются, WASM не нужен. */
  private async strip(item: Item, head: Uint8Array, mode: StripMode, lease: Lease, ticket: Ticket): Promise<boolean> {
    const { kind } = sniff(head);
    if (kind === 'unknown' || kind === 'pdf') {
      this.fail(item, kind === 'pdf' ? 'pdf-input' : 'not-image');
      return false;
    }
    // имя и расширение остаются (без расширения — по формату)
    const dot = item.file.name.lastIndexOf('.');
    const extension = dot > 0 ? item.file.name.slice(dot + 1) : KIND_FILES[kind].extension;
    item.name ??= this.names.allocate(outputName(item.file.name, extension));
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.strip(item.file, mode, lease.memoryLimit, (footprint, fresh) => {
      if (this.stale(item, ticket)) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (this.stale(item, ticket)) return false;
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
  private async inspect(item: Item, head: Uint8Array, lease: Lease, ticket: Ticket): Promise<boolean> {
    const { kind } = sniff(head);
    if (kind === 'unknown' || kind === 'pdf') {
      this.fail(item, kind === 'pdf' ? 'pdf-input' : 'not-image');
      return false;
    }
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.inspect(item.file, lease.memoryLimit, (footprint, fresh) => {
      if (this.stale(item, ticket)) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (this.stale(item, ticket)) return false;
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

  /**
   * Картинка страницы PDF и превью. «Изображения в PDF» — документ собирается по кнопке из готовых страниц;
   * layout задан — универсальный виджет: у файла свой PDF, собирается сразу.
   */
  private async pdfPage(item: Item, head: Uint8Array, lease: Lease, ticket: Ticket, layout: PdfLayout | null = null): Promise<boolean> {
    const input = checkInput(head, 'jpeg', true);
    if (!input.ok) {
      this.fail(item, input.code);
      return false;
    }
    if (layout) item.name ??= this.names.allocate(outputName(item.file.name, 'pdf'));
    if (!this.loadedOnce) this.setStatus(this.t.loading);
    try {
      await lease.client.load(input.decoder, 'jpeg');
      this.loadedOnce = true;
    } catch {
      if (this.stale(item, ticket)) return false;
      this.showNotice(this.t.loadFailed, 'error');
      this.fail(item, 'internal');
      return true;
    }
    if (this.stale(item, ticket)) return false;
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.pdfPage(item.file, lease.memoryLimit, (footprint, fresh) => {
      if (this.stale(item, ticket)) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (this.stale(item, ticket)) return false;
    if (outcome.status === 'needs-memory') {
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      if (outcome.fatal && !item.retry) {
        item.retry = true;
        this.requeue(item);
        return true;
      }
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }
    item.pdf = outcome.image;
    item.passthrough = outcome.passthrough;
    item.previewUrl = URL.createObjectURL(new Blob([outcome.preview], { type: 'image/jpeg' }));
    item.dimensions = { before: [outcome.width, outcome.height], after: [outcome.width, outcome.height] };
    item.warnings = outcome.warnings;
    if (layout) {
      await this.buildDocument(item, layout);
      if (this.stale(item, ticket)) return false;
      this.run.formats.pdf = (this.run.formats.pdf ?? 0) + 1;
    }
    item.status = 'done';
    this.run.done++;
    if (layout) this.renderRow(item);
    else this.renderAll(); // номера страниц у следующих строк
    this.syncSettings();
    return false;
  }

  /** Свой PDF у файла: одна страница с картинкой, размер страницы и поля — из настроек. */
  private async buildDocument(item: Item, layout: PdfLayout): Promise<void> {
    const { buildPdf } = await import('../pdf/writer');
    if (item.url) URL.revokeObjectURL(item.url);
    item.blob = buildPdf([item.pdf!], layout);
    item.url = URL.createObjectURL(item.blob);
  }

  /** Сменились размер страницы или поля: готовые PDF пересобираются из тех же картинок (без повторной обработки). */
  private async rebuildDocuments(layout: PdfLayout): Promise<void> {
    for (const item of this.items.filter((other) => other.status === 'done' && other.pdf && other.target === 'pdf')) {
      await this.buildDocument(item, layout);
      this.renderRow(item);
    }
  }

  /** «PDF в JPG/PNG»: страницы приходят по одной и сразу становятся строками под строкой PDF. */
  /** Страницы PDF — картинками в формате encoder; разрешение — из настроек. */
  private async renderPdf(item: Item, head: Uint8Array, encoder: EncoderId, settings: Settings, lease: Lease, ticket: Ticket): Promise<boolean> {
    if (sniff(head).kind !== 'pdf') {
      this.fail(item, 'not-pdf');
      return false;
    }
    if (!this.loadedOnce) this.setStatus(this.t.loading);
    try {
      await lease.client.load(null, encoder);
      this.loadedOnce = true;
    } catch {
      if (this.stale(item, ticket)) return false;
      this.showNotice(this.t.loadFailed, 'error');
      this.fail(item, 'internal');
      return true;
    }
    if (this.stale(item, ticket)) return false;
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    item.pages = { done: 0, total: null };
    // имена страниц: «отчёт_01.jpg» — номер с ведущими нулями, чтобы файлы шли по порядку
    const base = outputName(item.file.name, 'x').slice(0, -2);
    let last = item;
    const outcome = await lease.client.pdfRender(
      item.file,
      { encoder, quality: settings.quality, lossless: encoder === 'webp' && settings.lossless, dpi: settings.dpi! },
      lease.memoryLimit,
      (footprint, fresh) => {
        if (this.stale(item, ticket)) return;
        lease.started(footprint, fresh);
        this.pump();
      },
      (rendered) => {
        if (this.stale(item, ticket)) return;
        const digits = String(rendered.total).length;
        const name = this.names.allocate(`${base}_${String(rendered.page).padStart(digits, '0')}.${rendered.extension}`);
        const blob = new Blob([rendered.buffer], { type: rendered.mime });
        const page: Item = {
          ...this.blankItem(item.file),
          status: 'done',
          name,
          blob,
          url: URL.createObjectURL(blob),
          previewUrl: URL.createObjectURL(new Blob([rendered.preview], { type: rendered.mime })),
          warnings: rendered.warnings,
          dimensions: { before: [rendered.width, rendered.height], after: [rendered.width, rendered.height] },
          parent: item,
          page: { number: rendered.page, total: rendered.total },
        };
        this.items.splice(this.items.indexOf(last) + 1, 0, page);
        last.row.after(page.row);
        last = page;
        this.renderRow(page);
        item.pages = { done: rendered.page, total: rendered.total };
        this.renderRow(item);
        this.updateActions();
      },
    );
    if (this.stale(item, ticket)) return false;
    if (outcome.status === 'needs-memory') {
      this.removePages(item);
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      this.removePages(item);
      item.pages = null;
      if (outcome.fatal && !item.retry) {
        item.retry = true;
        this.requeue(item);
        return true;
      }
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }
    item.pages = { done: outcome.total, total: outcome.total };
    item.format = 'PDF';
    if (outcome.limited) item.warnings = ['pdf-page-limit'];
    item.status = 'done';
    this.run.done++;
    this.run.formats[encoder] = (this.run.formats[encoder] ?? 0) + 1;
    this.renderRow(item);
    this.syncSettings();
    return false;
  }

  /** «Объединить PDF»: число страниц и превью первой — документ в списке узнаётся с первого взгляда. */
  private async pdfInfo(item: Item, head: Uint8Array, lease: Lease, ticket: Ticket): Promise<boolean> {
    if (sniff(head).kind !== 'pdf') {
      this.fail(item, 'not-pdf');
      return false;
    }
    this.setStatus(fill(this.t.progress, { done: this.run.done + this.run.failed, total: this.run.total }));
    const outcome = await lease.client.pdfInfo(item.file, lease.memoryLimit, (footprint, fresh) => {
      if (this.stale(item, ticket)) return;
      lease.started(footprint, fresh);
      this.pump();
    });
    if (this.stale(item, ticket)) return false;
    if (outcome.status === 'needs-memory') {
      item.estimate = outcome.fresh;
      this.requeue(item);
      return true;
    }
    if (outcome.status === 'error') {
      this.fail(item, outcome.code);
      return outcome.fatal || outcome.recycle;
    }
    item.pages = { done: outcome.pages, total: outcome.pages };
    item.format = 'PDF';
    item.previewUrl = URL.createObjectURL(new Blob([outcome.preview], { type: 'image/jpeg' }));
    item.status = 'done';
    this.run.done++;
    this.renderRow(item);
    this.updateActions();
    return false;
  }

  /** Документы по порядку → один PDF; собирает отдельный worker, который потом завершается. */
  private async mergePdf(): Promise<void> {
    const documents = this.items.filter((item) => item.status === 'done' && item.pages);
    if (documents.length === 0 || this.zipping) return;
    this.zipping = true;
    const label = this.zipButton.textContent;
    this.zipButton.textContent = this.t.pdfPreparing;
    this.zipButton.setAttribute('aria-busy', 'true');
    this.updateActions();
    // память простаивающих worker'ов отдаём под объединение: все документы нужны сразу
    this.pool.recycleAll();
    const client = new WorkerClient();
    try {
      const result = await client.pdfMerge(documents.map((item) => item.file));
      if (result.status !== 'done') throw new Error(result.status === 'error' ? result.message : 'needs memory');
      const { saveBlob } = await import('./zip');
      saveBlob(new Blob([result.buffer], { type: 'application/pdf' }), withTimestamp(`${this.config.zipName}.pdf`, new Date()));
      this.setStatus(fill(this.t.pdfPages, { count: result.pages }));
    } catch {
      this.showNotice(this.t.mergeFailed, 'error');
    } finally {
      client.recycle();
      this.zipping = false;
      this.zipButton.textContent = label;
      this.zipButton.removeAttribute('aria-busy');
      this.updateActions();
    }
  }

  /** Убрать строки страниц этого PDF (перед повторной обработкой или после ошибки). */
  private removePages(pdf: Item): void {
    for (const page of this.items.filter((other) => other.parent === pdf)) {
      this.revokeUrls(page);
      if (page.name) this.names.release(page.name);
      page.row.remove();
    }
    this.items = this.items.filter((other) => other.parent !== pdf);
  }

  /** Пустая строка для файла: всё по нулям, статус «в очереди». */
  private blankItem(file: File, row: HTMLLIElement = document.createElement('li')): Item {
    return {
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
      pdf: null,
      passthrough: false,
      pages: null,
      parent: null,
      page: null,
      dimensions: null,
      estimate: null,
      retry: false,
      source: null,
      target: null,
      job: 0,
      lease: null,
      key: null,
      row,
    };
  }

  /** Убрать результат и ошибку (перед новым форматом или настройками); файл, его вид, формат и строка остаются. */
  private resetResult(item: Item): void {
    this.removePages(item);
    this.revokeUrls(item);
    if (item.name) this.names.release(item.name);
    const { source, target, job, lease } = item;
    Object.assign(item, this.blankItem(item.file, item.row), { source, target, job, lease });
  }

  /** Отменить работу над файлом: ответы текущего задания станут устаревшими, его worker перезапустится. */
  private cancel(item: Item): void {
    item.job++;
    // так ядро и память освобождаются сразу (AVIF большого снимка кодируется десятки секунд)
    if (item.status === 'converting') item.lease?.client.recycle();
  }

  /** Можно ли выбрать формат: файл прочитан, а ошибка (если была) — не про сам файл. */
  private canChooseTarget(item: Item): boolean {
    if (item.parent || !item.source || targetsFor(item.source).length === 0) return false;
    return item.status !== 'error' || RETRYABLE_ERRORS.has(item.error!);
  }

  /**
   * Новый формат у файла — сразу в очередь: идущая конвертация отменяется, готовый результат убирается.
   * update = false — вызывающий сам обновит настройки и очередь (несколько файлов сразу).
   */
  private setTarget(item: Item, target: TargetId, update = true): void {
    if (item.target === target && item.status !== 'waiting' && item.status !== 'error') return;
    const counted = item.status === 'queued' || item.status === 'converting';
    this.cancel(item);
    this.resetResult(item);
    item.target = target;
    item.status = 'queued';
    if (!counted) this.run.total++;
    this.renderRow(item);
    if (!update) return;
    this.syncSettings();
    this.pump();
  }

  /** «Все файлы в …»: формат — всем файлам, которым он подходит, и файлам, добавленным после (до «Очистить»). */
  private applyAll(target: TargetId): void {
    this.preset = target;
    for (const item of this.items) {
      if (this.canChooseTarget(item) && targetsFor(item.source!).includes(target)) this.setTarget(item, target, false);
    }
    this.syncSettings();
    this.pump();
  }

  private openPicker(item: Item, anchor: HTMLButtonElement, focus: 'checked' | 'first' | 'last'): void {
    this.picker!.open(item, { anchor, available: targetsFor(item.source!), checked: item.target, onSelect: (target) => this.setTarget(item, target) }, focus);
  }

  private openAllPicker(focus: 'checked' | 'first' | 'last'): void {
    const choosable = this.items.filter((item) => this.canChooseTarget(item));
    this.picker!.open(
      this.allOwner,
      { anchor: this.allButton!, available: sharedTargets(choosable.map((item) => item.source!)), checked: this.sharedTarget(choosable), onSelect: (target) => this.applyAll(target) },
      focus,
    );
  }

  /**
   * Подпись «Все файлы в …»: общий формат файлов. После «Все файлы в X» файлы, которым X не подходит (PNG → PNG),
   * остаются в своём формате — подпись всё равно X.
   */
  private sharedTarget(items: Item[]): TargetId | null {
    const first = items[0]?.target ?? null;
    if (first && items.every((item) => item.target === first)) return first;
    const preset = this.preset;
    if (!preset || !items.some((item) => item.target === preset)) return null;
    return items.every((item) => item.target === preset || !targetsFor(item.source!).includes(preset)) ? preset : null;
  }

  private targetName(target: TargetId): string {
    return this.config.targets.find((option) => option.id === target)?.label ?? target;
  }

  /** Переставить файл (страницу) на одну позицию; фокус остаётся на той же кнопке. */
  private move(item: Item, step: -1 | 1): void {
    const index = this.items.indexOf(item);
    const target = index + step;
    if (index < 0 || target < 0 || target >= this.items.length) return;
    this.items.splice(index, 1);
    this.items.splice(target, 0, item);
    if (step < 0) this.list.insertBefore(item.row, this.items[target + 1]!.row);
    else this.list.insertBefore(item.row, this.items[target - 1]!.row.nextSibling);
    this.renderAll();
    item.row.querySelector<HTMLButtonElement>(`[data-move="${step < 0 ? 'up' : 'down'}"]:not(:disabled)`)?.focus();
  }

  /** Убрать файл из списка; в универсальном виджете — и тот, что сейчас конвертируется (задание прерывается). */
  private remove(item: Item): void {
    const index = this.items.indexOf(item);
    if (index < 0 || (item.status === 'converting' && !this.config.universal)) return;
    if (item.status === 'queued' || item.status === 'converting') this.run.total--;
    this.cancel(item);
    if (this.picker?.isOpenFor(item)) this.picker.close(false);
    this.removePages(item);
    this.revokeUrls(item);
    if (item.name) this.names.release(item.name);
    this.items.splice(index, 1);
    item.row.remove();
    this.renderAll();
    if (this.items.length === 0) this.results.hidden = true;
    // фокус — на соседнюю строку, иначе на зону загрузки
    const next = this.items[Math.min(index, this.items.length - 1)];
    (next?.row.querySelector<HTMLButtonElement>('[data-remove]') ?? this.dropzone).focus();
    this.syncSettings();
    this.pump(); // если убрали последний файл в очереди — подвести итог
  }

  private renderAll(): void {
    for (const item of this.items) this.renderRow(item);
  }

  /** PDF из готовых страниц в порядке списка; имя — по первому файлу. */
  private async downloadPdf(): Promise<void> {
    const pages = this.items.filter((item) => item.status === 'done' && item.pdf);
    const layout = this.currentSettings().pdf;
    if (pages.length === 0 || !layout || this.zipping) return;
    this.zipping = true;
    const label = this.zipButton.textContent;
    this.zipButton.textContent = this.t.pdfPreparing;
    this.zipButton.setAttribute('aria-busy', 'true');
    this.updateActions();
    try {
      const { buildPdf } = await import('../pdf/writer');
      const { saveBlob } = await import('./zip');
      const blob = buildPdf(pages.map((item) => item.pdf!), layout);
      saveBlob(blob, withTimestamp(outputName(pages[0]!.file.name, 'pdf'), new Date()));
    } catch {
      this.showNotice(this.t.pdfFailed, 'error');
    } finally {
      this.zipping = false;
      this.zipButton.textContent = label;
      this.zipButton.removeAttribute('aria-busy');
      this.updateActions();
    }
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
    const { total, done, failed, formats } = this.run;
    // универсальный виджет: файлы без формата не конвертируются — об этом и итог
    const waiting = this.items.filter((item) => item.status === 'waiting').length;
    const waitingText = waiting > 0 ? fill(this.t.waitingStatus, { count: waiting }) : '';
    if (total === 0) {
      if (waitingText) this.setStatus(waitingText);
      return;
    }
    let text = fill(this.t.summary, { done, total });
    if (failed > 0) text += ' ' + fill(this.t.summaryErrors, { failed });
    if (waitingText) text += ' ' + waitingText;
    this.setStatus(text);
    if (this.config.universal) {
      for (const [format, count] of Object.entries(formats)) track('conversion_complete', { tool: this.config.toolId, format, count });
    } else if (done > 0) {
      track('conversion_complete', { tool: this.config.toolId, format: this.currentSettings().output?.id ?? '', count: done });
    }
    this.run = { total: 0, done: 0, failed: 0, formats: {} };
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

  /**
   * Строка перерисовывается целиком; если фокус был на её кнопке (формат, «Скачать», «убрать»), он переходит на такую
   * же кнопку новой строки — иначе клавиатура «теряется», когда файл, например, досконвертировался.
   */
  private renderRow(item: Item): void {
    const focused = document.activeElement;
    const restore = focused instanceof HTMLElement && item.row.contains(focused) ? focusSelector(focused) : null;
    this.buildRow(item);
    if (restore) item.row.querySelector<HTMLElement>(restore)?.focus();
  }

  private buildRow(item: Item): void {
    const row = item.row;
    // страницы PDF — с отступом под строкой своего документа
    row.className = item.parent ? 'file file--page' : 'file';
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
    } else if (this.config.universal && !item.parent && item.source && item.source !== 'unknown') {
      // универсальный виджет: до результата — формат входа
      thumb.classList.add('file__thumb--format');
      thumb.textContent = item.source === 'pdf' ? 'PDF' : KIND_FILES[item.source].label;
    }

    const body = document.createElement('div');
    body.className = 'file__body';
    const name = document.createElement('p');
    name.className = 'file__name';
    // имя результата выделяется при старте, но показываем его только у готового файла
    name.textContent = item.status === 'done' && item.name ? item.name : item.file.name;
    const meta = document.createElement('p');
    meta.className = 'file__meta';
    if (item.status === 'waiting') meta.textContent = this.t.waiting;
    if (item.status === 'queued') meta.textContent = this.t.queued;
    if (item.status === 'converting') {
      // «PDF в JPG»: какая страница рисуется
      const pages = item.pages;
      meta.textContent = pages?.total ? fill(this.t.pdfRendering, { page: Math.min(pages.done + 1, pages.total), total: pages.total }) : this.t.converting;
    }
    if (item.status === 'done' && item.pages?.total) meta.textContent = fill(this.t.pdfPages, { count: item.pages.total });
    if (item.status === 'error') meta.textContent = this.t.failed;
    if (item.status === 'done' && item.report) {
      const { width, height } = item.report;
      const parts = [item.format ?? '', this.size(item.file.size)];
      if (width && height) parts.push(fill(this.t.dimensions, { width, height }));
      meta.textContent = parts.join(' · ');
    }
    if (item.status === 'done' && item.pdf && item.dimensions && this.config.mode === 'to-pdf') {
      // номер страницы — среди готовых файлов в порядке списка
      const number = this.items.filter((other) => other.status === 'done' && other.pdf).indexOf(item) + 1;
      const [width, height] = item.dimensions.after;
      const parts = [fill(this.t.pageNumber, { number }), fill(this.t.dimensions, { width, height })];
      if (item.passthrough) parts.push(this.t.passthrough);
      meta.textContent = parts.join(' · ');
    }
    if (item.status === 'done' && item.page && item.blob && item.dimensions) {
      // страница PDF: размер исходного PDF к ней не относится
      const [width, height] = item.dimensions.after;
      meta.textContent = [fill(this.t.pageOf, item.page), fill(this.t.dimensions, { width, height }), this.size(item.blob.size)].join(' · ');
    } else if (item.status === 'done' && item.blob) {
      const parts = [this.t.done, fill(this.t.sizes, { before: this.size(item.file.size), after: this.size(item.blob.size) })];
      // при сжатии и изменении размера важна разница в размере: «−85 %»; размер не изменился — одно число
      if (item.blob.size === item.file.size) parts[1] = this.size(item.file.size);
      else if (this.config.mode !== 'convert') parts[1] += ` (${this.change(item.file.size, item.blob.size)})`;
      if (item.dimensions) {
        const [before, after] = [item.dimensions.before, item.dimensions.after].map(([width, height]) => fill(this.t.dimensions, { width, height }));
        parts.splice(1, 0, before === after ? before! : fill(this.t.sizes, { before: before!, after: after! }));
      }
      if (item.quality !== null) parts.push(fill(this.t.qualityUsed, { quality: item.quality }));
      // картинка → PDF: JPEG вставлен как есть
      if (item.passthrough) parts.push(this.t.passthrough);
      meta.textContent = parts.join(' · ');
    }
    body.append(name, meta);

    const notes = item.status === 'error' && item.error ? [this.errorText(item.error)] : item.warnings.map((w) => this.t.warnings[w]);
    if (item.status === 'done' && item.removed) notes.unshift(this.removedText(item.removed));
    // формат страницы ему не подходит, потому что файл уже в нём (на HEIC-страницах — пояснение про iPhone)
    const own = item.source ? ownTarget(item.source) : null;
    if (item.status === 'waiting' && own && own === this.preset) {
      let text = fill(this.t.sameFormat, { target: this.targetName(own) });
      if (own === 'jpeg' && this.config.iphoneHint) text += ` ${this.t.iphoneJpegHint}`;
      notes.push(text);
    }
    for (const text of notes) {
      const note = document.createElement('p');
      note.className = item.status === 'error' ? 'file__note file__note--error' : 'file__note';
      note.textContent = text;
      body.append(note);
    }
    row.append(thumb, body);
    if (item.status === 'done' && item.report) row.append(this.reports.render(item.report, item.file.name, () => void this.downloadStripped(item)));
    if (this.config.mode === 'to-pdf' || this.config.mode === 'merge-pdf') row.append(this.orderControls(item));
    if (this.config.universal && !item.parent) {
      row.append(this.targetControls(item));
      // меню открыто для этой строки, а её перерисовали — привязываем меню к новой кнопке (сразу: после выбора
      // формата фокус вернётся уже на неё)
      const button = row.querySelector<HTMLButtonElement>('[data-target-button]');
      if (button && this.picker?.isOpenFor(item)) this.picker.reanchor(item, button);
      return;
    }
    const download = this.downloadLink(item);
    if (download) row.append(download);
  }

  /** Ссылка «Скачать» у готового файла; дата и время в имени — на момент нажатия. */
  private downloadLink(item: Item): HTMLAnchorElement | null {
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
      return link;
    }
    return null;
  }

  /** Универсальный виджет: «в [JPG ▾]» (меню форматов), «Скачать» и «убрать» у строки файла. */
  private targetControls(item: Item): HTMLElement {
    const group = document.createElement('div');
    group.className = 'file__actions';
    if (this.canChooseTarget(item)) {
      const to = document.createElement('span');
      to.className = 'file__to';
      to.textContent = this.t.targetTo;
      to.setAttribute('aria-hidden', 'true');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'target-button';
      button.dataset.targetButton = '';
      const label = item.target ? this.targetName(item.target) : this.t.chooseTarget;
      button.textContent = label;
      // доступное имя начинается с видимого текста (WCAG 2.5.3)
      button.setAttribute('aria-label', fill(this.t.targetLabel, { target: label, name: item.file.name }));
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-controls', this.pickerId);
      button.setAttribute('aria-expanded', 'false');
      this.bindMenuButton(button, (focus) => this.openPicker(item, button, focus), item);
      group.append(to, button);
    }
    const download = this.downloadLink(item);
    if (download) group.append(download);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-button icon-button--remove';
    remove.dataset.remove = '';
    remove.setAttribute('aria-label', fill(this.t.removeFile, { name: item.file.name }));
    remove.title = remove.getAttribute('aria-label')!;
    remove.addEventListener('click', () => this.remove(item));
    group.append(remove);
    return group;
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

  /** «Изображения в PDF»: кнопки «выше», «ниже» и «убрать» у каждой строки. */
  private orderControls(item: Item): HTMLElement {
    const group = document.createElement('div');
    group.className = 'file__order';
    const index = this.items.indexOf(item);
    const button = (kind: 'up' | 'down' | 'remove', label: string, disabled: boolean, action: () => void) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = `icon-button icon-button--${kind}`;
      node.setAttribute('aria-label', fill(label, { name: item.file.name }));
      node.title = node.getAttribute('aria-label')!;
      if (kind === 'remove') node.dataset.remove = '';
      else node.dataset.move = kind;
      node.disabled = disabled;
      node.addEventListener('click', action);
      group.append(node);
    };
    button('up', this.t.moveUp, index === 0, () => this.move(item, -1));
    button('down', this.t.moveDown, index === this.items.length - 1, () => this.move(item, 1));
    button('remove', this.t.removeFile, item.status === 'converting', () => this.remove(item));
    return group;
  }

  private updateActions(): void {
    const done = this.items.filter((item) => item.status === 'done');
    // PDF собирается, когда обработаны все файлы: иначе страницы потеряются
    const ordered = this.config.mode === 'to-pdf' || this.config.mode === 'merge-pdf';
    const pending = ordered && this.items.some((item) => item.status === 'queued' || item.status === 'converting');
    this.zipButton.disabled = this.zipping || done.length === 0 || pending;
    const current = this.currentSettings();
    const outdated = this.items.some((item) => this.outdated(item, current));
    this.reconvertButton.hidden = !outdated;
    this.settingsHint.hidden = !outdated;
    this.clearButton.disabled = this.items.length === 0;
    if (this.allRow && this.allButton) {
      // «Все файлы в …» — когда выбирать есть из чего: от двух файлов
      const choosable = this.items.filter((item) => this.canChooseTarget(item));
      this.allRow.hidden = choosable.length < 2;
      const shared = this.sharedTarget(choosable);
      const label = shared ? this.targetName(shared) : this.t.chooseTarget;
      this.allButton.textContent = label;
      this.allButton.setAttribute('aria-label', fill(this.t.allLabel, { target: label }));
    }
  }

  /** Готовый файл сконвертирован с другими настройками (у универсального — только важными для его формата). */
  private outdated(item: Item, current: Settings): boolean {
    if (!this.config.universal) return isOutdated(item, current);
    if (item.status !== 'done' || item.parent || !item.source || !item.target || item.key === null) return false;
    return item.key !== settingsKey({ kind: item.source, target: item.target }, targetSettings(current));
  }

  private reconvert(): void {
    const current = this.currentSettings();
    for (const item of this.items.filter((other) => this.outdated(other, current))) {
      // у PDF старые страницы уходят: появятся новые
      this.resetResult(item);
      item.status = 'queued';
      this.run.total++;
      this.renderRow(item);
    }
    this.updateActions();
    this.pump();
  }

  private clear(): void {
    this.generation++;
    this.pool.recycleAll(); // прерываем текущие конвертации
    this.picker?.close(false);
    this.preset = this.config.preset;
    for (const item of this.items) this.revokeUrls(item);
    this.items = [];
    this.names.clear();
    this.run = { total: 0, done: 0, failed: 0, formats: {} };
    this.list.replaceChildren();
    this.results.hidden = true;
    this.setStatus('');
    this.hideNotice();
    this.syncSettings();
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
