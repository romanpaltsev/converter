// «PDF в JPG/PNG»: страницы рисует pdf.js (Mozilla, Apache-2.0) прямо в нашем worker'е — на OffscreenCanvas, без DOM.
// Пиксели забираем getImageData и кодируем своими кодировщиками. Решения — в CLAUDE.md:
// - pdf.js целиком в этом потоке: его «рабочая» часть (pdf.worker) подключается как библиотека («fake worker»),
//   своих worker'ов pdf.js не создаёт;
// - шрифты рисуются контурами (disableFontFace): FontFace в worker'е есть не везде, а результат одинаковый;
// - фильтры SVG (мягкие маски, функции переноса) недоступны без DOM — pdf.js считает их сам по пикселям;
// - стандартные шрифты, CMap, ICC и WASM-декодеры (JPEG 2000, JBIG2, ICC) — со своего домена, путь с версией.

import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';

type Pdfjs = typeof import('pdfjs-dist/legacy/build/pdf.mjs');

/** Больше точек на странице не рисуем: в Safari на iOS холст ограничен 16,7 Мп (16 777 216). */
export const MAX_PAGE_PIXELS = 16_000_000;
/** И не длиннее по стороне — предел холста в Safari. */
const MAX_PAGE_SIDE = 16_384;

let loading: Promise<Pdfjs> | null = null;

function loadPdfjs(): Promise<Pdfjs> {
  loading ??= (async () => {
    // pdf.worker, загруженный в worker, сам начинает слушать self как «свой» worker pdf.js (static-блок
    // WorkerMessageHandler: «window нет, а postMessage и onmessage есть») и шлёт «ready» в наш основной поток.
    // Нам нужен только класс — на время загрузки делаем вид, что window есть.
    const scope = globalThis as { window?: unknown };
    scope.window = scope;
    try {
      await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    } finally {
      delete scope.window;
    }
    return import('pdfjs-dist/legacy/build/pdf.mjs');
  })();
  loading.catch(() => (loading = null));
  return loading;
}

/** Холсты для pdf.js — OffscreenCanvas (в worker'е нет document). */
class CanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) throw new Error('Invalid canvas size');
    const canvas = new OffscreenCanvas(width, height);
    return { canvas, context: canvas.getContext('2d', { willReadFrequently: true }) };
  }

  reset(entry: { canvas: OffscreenCanvas | null }, width: number, height: number): void {
    if (!entry.canvas) throw new Error('Canvas is not specified');
    entry.canvas.width = width;
    entry.canvas.height = height;
  }

  destroy(entry: { canvas: OffscreenCanvas | null; context: unknown }): void {
    if (entry.canvas) entry.canvas.width = entry.canvas.height = 0;
    entry.canvas = null;
    entry.context = null;
  }
}

/** Фильтров SVG без DOM нет: «none» — и pdf.js применяет маски и переносы сам, по пикселям. */
class FilterFactory {
  addFilter(): string {
    return 'none';
  }
  addHCMFilter(): string {
    return 'none';
  }
  addAlphaFilter(): string {
    return 'none';
  }
  addLuminosityFilter(): string {
    return 'none';
  }
  addKnockoutFilter(): string {
    return 'none';
  }
  addHighlightHCMFilter(): string {
    return 'none';
  }
  addSelectionHCMFilter(): string {
    return 'none';
  }
  addSelectionFilter(): string {
    return 'none';
  }
  createSelectionStyle(): null {
    return null;
  }
  destroy(): void {}
}

/** Ошибки pdf.js по имени класса: пароль и битый файл. */
export function pdfErrorKind(error: unknown): 'encrypted' | 'broken' | null {
  const name = (error as { name?: string } | null)?.name;
  if (name === 'PasswordException') return 'encrypted';
  if (name === 'InvalidPDFException' || name === 'UnknownErrorException' || name === 'FormatError') return 'broken';
  return null;
}

export async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  const base = new URL(`/_astro/pdfjs/${pdfjs.version}/`, self.location.origin).href;
  return pdfjs.getDocument({
    data: bytes,
    CanvasFactory,
    FilterFactory,
    disableFontFace: true,
    useSystemFonts: false,
    // «рабочая» часть pdf.js в этом же потоке — пусть сама и загружает шрифты, CMap и WASM
    useWorkerFetch: true,
    standardFontDataUrl: `${base}standard_fonts/`,
    cMapUrl: `${base}cmaps/`,
    cMapPacked: true,
    iccUrl: `${base}iccs/`,
    wasmUrl: `${base}wasm/`,
    enableXfa: false,
    verbosity: 0,
  } as Parameters<Pdfjs['getDocument']>[0]).promise;
}

export interface RenderedPage {
  rgba: Uint8Array;
  width: number;
  height: number;
  /** Страница больше предела холста — нарисована с меньшим разрешением. */
  downscaled: boolean;
}

/** Размер страницы в пикселях при dpi (с поворотом /Rotate) и с учётом пределов холста. */
export function pageSize(width: number, height: number, dpi: number): { scale: number; width: number; height: number; downscaled: boolean } {
  let scale = dpi / 72;
  const area = width * height * scale * scale;
  const side = Math.max(width, height) * scale;
  const limit = Math.min(1, Math.sqrt(MAX_PAGE_PIXELS / area), MAX_PAGE_SIDE / side);
  scale *= limit;
  return { scale, width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), downscaled: limit < 1 };
}

/** Страница (с 1) на белом фоне — как на бумаге. */
export async function renderPage(doc: PDFDocumentProxy, number: number, dpi: number): Promise<RenderedPage> {
  const pdfjs = await loadPdfjs();
  const page = await doc.getPage(number);
  try {
    const base = page.getViewport({ scale: 1 });
    const size = pageSize(base.width, base.height, dpi);
    const viewport = page.getViewport({ scale: size.scale });
    const canvas = new OffscreenCanvas(size.width, size.height);
    const context = canvas.getContext('2d', { willReadFrequently: true })!;
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      canvas: canvas as unknown as HTMLCanvasElement,
      viewport,
      background: '#ffffff',
      annotationMode: pdfjs.AnnotationMode.ENABLE,
    }).promise;
    const { data } = context.getImageData(0, 0, size.width, size.height);
    canvas.width = canvas.height = 0;
    return { rgba: new Uint8Array(data.buffer, data.byteOffset, data.byteLength), width: size.width, height: size.height, downscaled: size.downscaled };
  } finally {
    page.cleanup();
  }
}
