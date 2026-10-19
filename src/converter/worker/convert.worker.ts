// Module Web Worker конвертера: один файл за раз (параллельно работают несколько таких worker'ов — см. widget/worker-pool.ts),
// WASM-модули грузятся по первому запросу.

import { convertImage } from '../pipeline/convert';
import { loadDecoder } from '../pipeline/decoders';
import { loadEncoder } from '../pipeline/encoders';
import { checkInput } from '../pipeline/input';
import { PDF_PAGE_LIMIT } from '../pdf/limits';
import { preparePdfPage } from '../pipeline/pdf-page';
import { chooseProfile } from '../color/nclx';
import { loadProfile } from '../color/profiles';
import { estimateNeeds, estimatePdfNeeds, freshFootprint, projectFootprint } from '../pipeline/memory';
import { downscale } from '../pipeline/preview';
import { targetSize } from '../pipeline/resize';
import { sniff } from '../pipeline/sniff';
import { type ConvertOptions, ConvertError, type ErrorCode, WEBP_MAX_DIMENSION } from '../pipeline/types';
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { FromWorker, ToWorker } from './protocol';

interface WorkerScope {
  onmessage: ((event: MessageEvent<ToWorker>) => void) | null;
  postMessage(message: FromWorker, transfer?: Transferable[]): void;
}

const scope = self as unknown as WorkerScope;
const post = (message: FromWorker, transfer: Transferable[] = []) => scope.postMessage(message, transfer);

/** Ошибки WASM, после которых экземпляр модуля нельзя использовать дальше. */
function classifyUnexpected(error: unknown): { code: ErrorCode; fatal: true } {
  const text = String(error instanceof Error ? `${error.name}: ${error.message}` : error);
  if (/out of memory|oom|memory\.grow|enlarge memory|allocation failed|array buffer allocation/i.test(text)) {
    return { code: 'out-of-memory', fatal: true };
  }
  return { code: error instanceof WebAssembly.RuntimeError ? 'decode-failed' : 'internal', fatal: true };
}

/** Загруженные WASM-модули по имени (у декодера и кодировщика PNG модуль общий — считаем его один раз). */
const modules = new Map<string, { heapBytes(): number }>();

function heapStats(): Record<string, number> {
  return Object.fromEntries([...modules].map(([name, module]) => [name, module.heapBytes()]));
}

function currentHeaps(): Map<string, number> {
  return new Map([...modules].map(([name, module]) => [name, module.heapBytes()]));
}

async function handleConvert(message: Extract<ToWorker, { type: 'convert' }>): Promise<void> {
  const { id } = message;
  try {
    const readStarted = performance.now();
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const read = performance.now() - readStarted;
    const { options } = message;
    const input = checkInput(bytes, options.encoder, options.allowSameFormat);
    if (!input.ok) throw new ConvertError(input.code);

    const [decoder, encoder] = await Promise.all([loadDecoder(input.decoder), loadEncoder(options.encoder)]);
    modules.set(decoder.module, decoder);
    modules.set(encoder.module, encoder);
    const session = decoder.open(bytes);
    try {
      // ограничение WebP проверяем до декодирования (бывает у панорам); после уменьшения снимок может и влезть —
      // тогда проверит сам кодировщик
      if (options.encoder === 'webp' && !options.resize && Math.max(session.width, session.height) > WEBP_MAX_DIMENSION) {
        throw new ConvertError('too-large-for-webp');
      }
      const pixels = session.width * session.height;
      // память: размер известен до декодирования — решаем, поместится ли файл рядом с другими worker'ами пула
      const output = options.resize ? targetSize(session.width, session.height, options.resize) : session;
      const needs = estimateNeeds({
        decoder: input.decoder,
        decoderModule: decoder.module,
        encoder: options.encoder,
        encoderModule: encoder.module,
        lossless: options.lossless,
        pixels,
        outputPixels: output.width * output.height,
        fileBytes: bytes.length,
      });
      const footprint = projectFootprint(needs, currentHeaps());
      const fresh = freshFootprint(needs);
      if (footprint > message.memoryLimit) {
        post({ type: 'needs-memory', id, footprint, fresh });
        return;
      }
      post({ type: 'started', id, footprint, fresh });
      const result = await convertImage(session, encoder, options);
      const buffer = result.bytes.buffer as ArrayBuffer;
      const preview = result.preview.buffer as ArrayBuffer;
      post(
        {
          type: 'done',
          id,
          buffer,
          preview,
          mime: encoder.mime,
          extension: encoder.extension,
          width: result.width,
          height: result.height,
          sourceWidth: result.sourceWidth,
          sourceHeight: result.sourceHeight,
          quality: result.quality,
          pixels,
          warnings: result.warnings,
          stats: { heap: heapStats(), timings: { read, ...result.timings } },
        },
        [buffer, preview],
      );
    } finally {
      session.close();
    }
  } catch (error) {
    postError(id, error);
  }
}

/** Ошибка задания → ответ; неожиданные ошибки WASM требуют нового worker'а. */
function postError(id: number, error: unknown): void {
  if (error instanceof ConvertError) {
    post({ type: 'error', id, code: error.code, fatal: error.fatal, recycle: error.recycle, message: error.message });
  } else {
    const { code, fatal } = classifyUnexpected(error);
    post({ type: 'error', id, code, fatal, recycle: true, message: String(error) });
  }
}

/** «Удалить метаданные»: модуль грузится только на этой странице; память — вход, копия и результат. */
async function handleStrip(message: Extract<ToWorker, { type: 'strip' }>): Promise<void> {
  const { id } = message;
  try {
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const { kind } = sniff(bytes);
    if (kind === 'unknown' || kind === 'pdf') throw new ConvertError(kind === 'pdf' ? 'pdf-input' : 'not-image');
    const footprint = 3 * bytes.length;
    if (footprint > message.memoryLimit) {
      post({ type: 'needs-memory', id, footprint, fresh: footprint });
      return;
    }
    post({ type: 'started', id, footprint, fresh: footprint });
    const { stripMetadata } = await import('../metadata/strip');
    const result = stripMetadata(bytes, kind, message.mode);
    const out = result.bytes;
    const buffer = out.byteOffset === 0 && out.byteLength === out.buffer.byteLength ? (out.buffer as ArrayBuffer) : (out.slice().buffer as ArrayBuffer);
    post({ type: 'stripped', id, buffer, changed: result.changed, removed: result.removed, warnings: result.warnings }, [buffer]);
  } catch (error) {
    postError(id, error);
  }
}

/** «Изображения в PDF»: страница — JPEG как есть или пиксели; плюс превью. Тот же учёт памяти, что у конвертации. */
async function handlePdfPage(message: Extract<ToWorker, { type: 'pdf-page' }>): Promise<void> {
  const { id } = message;
  try {
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const input = checkInput(bytes, 'jpeg', true);
    if (!input.ok) throw new ConvertError(input.code);
    const { kind } = sniff(bytes);
    if (kind === 'unknown' || kind === 'pdf') throw new ConvertError(kind === 'pdf' ? 'pdf-input' : 'not-image');
    const [decoder, encoder] = await Promise.all([loadDecoder(input.decoder), loadEncoder('jpeg')]);
    modules.set(decoder.module, decoder);
    modules.set(encoder.module, encoder);
    const session = decoder.open(bytes);
    try {
      const pixels = session.width * session.height;
      const needs = estimateNeeds({
        decoder: input.decoder,
        decoderModule: decoder.module,
        encoder: 'jpeg',
        encoderModule: encoder.module,
        lossless: false,
        pixels,
        outputPixels: pixels,
        fileBytes: bytes.length,
      });
      needs.js += pixels * 8; // каналы для PDF и их сжатая копия
      const footprint = projectFootprint(needs, currentHeaps());
      const fresh = freshFootprint(needs);
      if (footprint > message.memoryLimit) {
        post({ type: 'needs-memory', id, footprint, fresh });
        return;
      }
      post({ type: 'started', id, footprint, fresh });
      const options: ConvertOptions = { encoder: 'jpeg', quality: 90, lossless: false, metadata: 'dates', targetBytes: null, allowSameFormat: true, resize: null };
      const result = await preparePdfPage(bytes, kind, session, encoder, options);
      const preview = result.preview.buffer as ArrayBuffer;
      // ICC не передаём владением: встроенные профили закэшированы в worker'е
      const transfer = [result.image.data.buffer as ArrayBuffer, preview];
      if (result.image.alpha) transfer.push(result.image.alpha.buffer as ArrayBuffer);
      const heap = [...currentHeaps().values()].reduce((sum, bytes) => sum + bytes, 0);
      post({ type: 'pdf-page', id, image: result.image, preview, width: result.width, height: result.height, passthrough: result.passthrough, warnings: result.warnings, heap }, transfer);
    } finally {
      session.close();
    }
  } catch (error) {
    postError(id, error);
  }
}

/** «PDF в JPG»: pdf.js грузится только на этих страницах; страницы — по одной, сразу закодированными. */
async function handlePdfRender(message: Extract<ToWorker, { type: 'pdf-render' }>): Promise<void> {
  const { id, options } = message;
  let render: typeof import('../pdf/render') | null = null;
  let doc: PDFDocumentProxy | null = null;
  try {
    render = await import('../pdf/render');
    const { openPdf, renderPage, pageSize, pdfErrorKind } = render;
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    if (sniff(bytes).kind !== 'pdf') throw new ConvertError('not-pdf');
    const fileBytes = bytes.length;
    const encoder = await loadEncoder(options.encoder);
    modules.set(encoder.module, encoder);
    try {
      // pdf.js забирает буфер себе (передаёт его своей «рабочей» части)
      doc = await openPdf(bytes);
    } catch (error) {
      const kind = pdfErrorKind(error);
      if (kind === 'encrypted') throw new ConvertError('pdf-encrypted', String(error));
      if (kind === 'broken') throw new ConvertError('decode-failed', String(error));
      throw error;
    }
    // память — по первой странице (у документов они обычно одного размера)
    const first = await doc.getPage(1);
    const view = first.getViewport({ scale: 1 });
    const size = pageSize(view.width, view.height, options.dpi);
    first.cleanup();
    const needs = estimatePdfNeeds({ encoder: options.encoder, encoderModule: encoder.module, lossless: options.lossless, pagePixels: size.width * size.height, fileBytes });
    const footprint = projectFootprint(needs, currentHeaps());
    const fresh = freshFootprint(needs);
    if (footprint > message.memoryLimit) {
      post({ type: 'needs-memory', id, footprint, fresh });
      return;
    }
    post({ type: 'started', id, footprint, fresh });

    // холст pdf.js — sRGB: такой профиль и встраиваем, как конвертеры
    const icc = await loadProfile(chooseProfile(null).profile);
    const encode: ConvertOptions = { encoder: options.encoder, quality: options.quality, lossless: options.lossless, metadata: 'dates', targetBytes: null, allowSameFormat: true, resize: null };
    const total = Math.min(doc.numPages, PDF_PAGE_LIMIT);
    for (let page = 1; page <= total; page++) {
      const rendered = await renderPage(doc, page, options.dpi);
      const image = { rgba: rendered.rgba, width: rendered.width, height: rendered.height, hasAlpha: false };
      const small = downscale({ data: rendered.rgba, width: rendered.width, height: rendered.height });
      const preview = (await encoder.encode({ rgba: small.data, width: small.width, height: small.height, hasAlpha: false }, { ...encode, quality: 75, lossless: false })).buffer as ArrayBuffer;
      const meta = { exif: null, icc: icc.length <= encoder.maxIccBytes ? icc : null };
      const buffer = encoder.embed(await encoder.encode(image, encode, meta), meta).buffer as ArrayBuffer;
      post(
        {
          type: 'pdf-rendered',
          id,
          page,
          total,
          buffer,
          preview,
          mime: encoder.mime,
          extension: encoder.extension,
          width: rendered.width,
          height: rendered.height,
          warnings: rendered.downscaled ? ['pdf-page-downscaled'] : [],
        },
        [buffer, preview],
      );
    }
    const heap = [...currentHeaps().values()].reduce((sum, value) => sum + value, 0);
    post({ type: 'pdf-done', id, total, limited: doc.numPages > total, heap });
  } catch (error) {
    // битый файл бывает обнаружен и на середине — при разборе очередной страницы
    if (render?.pdfErrorKind(error) === 'broken') postError(id, new ConvertError('decode-failed', String(error)));
    else postError(id, error);
  } finally {
    // документ и «рабочую» часть pdf.js — освободить: следующий PDF откроется заново
    await doc?.loadingTask.destroy();
  }
}

/** «Посмотреть EXIF»: модуль грузится только на этой странице; миниатюра передаётся без копирования. */
async function handleInspect(message: Extract<ToWorker, { type: 'inspect' }>): Promise<void> {
  const { id } = message;
  try {
    const bytes = new Uint8Array(await message.file.arrayBuffer());
    const { kind } = sniff(bytes);
    if (kind === 'unknown' || kind === 'pdf') throw new ConvertError(kind === 'pdf' ? 'pdf-input' : 'not-image');
    const footprint = 3 * bytes.length;
    if (footprint > message.memoryLimit) {
      post({ type: 'needs-memory', id, footprint, fresh: footprint });
      return;
    }
    post({ type: 'started', id, footprint, fresh: footprint });
    const { inspectFile } = await import('../metadata/inspect');
    const report = await inspectFile(bytes, kind);
    post({ type: 'inspected', id, report }, report.thumbnail ? [report.thumbnail.buffer as ArrayBuffer] : []);
  } catch (error) {
    postError(id, error);
  }
}

scope.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'load') {
    const decoders = message.decoders.map((id) => loadDecoder(id));
    const encoders = message.encoders.map((id) => loadEncoder(id));
    Promise.all([...decoders, ...encoders]).then(
      (loaded) => {
        for (const module of loaded) modules.set(module.module, module);
        post({ type: 'loaded' });
      },
      (error: unknown) => post({ type: 'load-failed', message: String(error) }),
    );
  } else if (message.type === 'convert') {
    void handleConvert(message);
  } else if (message.type === 'strip') {
    void handleStrip(message);
  } else if (message.type === 'inspect') {
    void handleInspect(message);
  } else if (message.type === 'pdf-page') {
    void handlePdfPage(message);
  } else if (message.type === 'pdf-render') {
    void handlePdfRender(message);
  }
};
