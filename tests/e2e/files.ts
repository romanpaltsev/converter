// Разбор скачанных результатов независимыми средствами: exifr (EXIF, ICC), свои разборщики
// заголовков JPEG/PNG (размеры, структура), декодер браузера (пиксели и ориентация).
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import type { Download, Page } from '@playwright/test';
import exifr from 'exifr';
import { unzipSync } from 'fflate';
import { OPS, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const FIXTURES = new URL('../fixtures/', import.meta.url).pathname;
export const fixture = (name: string) => FIXTURES + name;
export const iccProfile = (name: string) => new Uint8Array(readFileSync(new URL(`../../src/converter/color/icc/${name}`, import.meta.url)));

/**
 * Имя скачанного файла: name с датой и временем перед расширением (IMG_1234_2026-10-19_00-45-12.jpg),
 * и это время — почти «сейчас» (часовой пояс браузера и тестов один и тот же).
 */
export function expectTimestamped(actual: string, name: string): void {
  const dot = name.lastIndexOf('.');
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escape(name.slice(0, dot))}_(\\d{4})-(\\d{2})-(\\d{2})_(\\d{2})-(\\d{2})-(\\d{2})${escape(name.slice(dot))}$`);
  const match = pattern.exec(actual);
  if (!match) throw new Error(`имя «${actual}» не похоже на «${name}» с датой и временем`);
  const [year, month, day, hours, minutes, seconds] = match.slice(1).map(Number);
  const stamp = new Date(year!, month! - 1, day, hours, minutes, seconds).getTime();
  if (Math.abs(Date.now() - stamp) > 15 * 60_000) throw new Error(`время в имени «${actual}» далеко от текущего`);
}

export async function downloadBytes(download: Download): Promise<Buffer> {
  const path = await download.path();
  return readFileSync(path!);
}

export interface JpegInfo {
  width: number;
  height: number;
  progressive: boolean;
  markers: number[];
}

/** Размеры и порядок сегментов JPEG (до SOS). */
export function jpegInfo(bytes: Uint8Array): JpegInfo {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('не JPEG');
  const markers: number[] = [];
  let pos = 2;
  let size: { width: number; height: number; progressive: boolean } | null = null;
  while (pos < bytes.length) {
    const marker = bytes[pos + 1]!;
    const length = (bytes[pos + 2]! << 8) | bytes[pos + 3]!;
    markers.push(marker);
    if (marker >= 0xc0 && marker <= 0xc2) {
      size = { height: (bytes[pos + 5]! << 8) | bytes[pos + 6]!, width: (bytes[pos + 7]! << 8) | bytes[pos + 8]!, progressive: marker === 0xc2 };
    }
    if (marker === 0xda) break;
    pos += 2 + length;
  }
  if (!size) throw new Error('нет SOF');
  return { ...size, markers };
}

export interface PngInfo {
  width: number;
  height: number;
  chunks: string[];
  icc: Uint8Array | null;
  exif: Uint8Array | null;
}

export function pngInfo(bytes: Uint8Array): PngInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: string[] = [];
  let icc: Uint8Array | null = null;
  let exif: Uint8Array | null = null;
  let pos = 8;
  while (pos < bytes.length) {
    const length = view.getUint32(pos);
    const type = String.fromCharCode(...bytes.subarray(pos + 4, pos + 8));
    const data = bytes.subarray(pos + 8, pos + 8 + length);
    chunks.push(type);
    if (type === 'iCCP') icc = new Uint8Array(inflateSync(data.subarray(data.indexOf(0) + 2)));
    if (type === 'eXIf') exif = data;
    pos += 12 + length;
    if (type === 'IEND') break;
  }
  return { width: view.getUint32(16), height: view.getUint32(20), chunks, icc, exif };
}

export interface WebpInfo {
  chunks: string[];
  /** Флаги VP8X: ICC 0x20, альфа 0x10, EXIF 0x08. */
  flags: number;
  width: number;
  height: number;
  icc: Uint8Array | null;
  exif: Uint8Array | null;
}

/** Независимый разбор RIFF/WebP для проверок (размер RIFF, выравнивание, VP8X). */
export function webpInfo(bytes: Uint8Array): WebpInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (at: number) => String.fromCharCode(...bytes.subarray(at, at + 4));
  if (text(0) !== 'RIFF' || text(8) !== 'WEBP') throw new Error('не WebP');
  if (view.getUint32(4, true) !== bytes.length - 8) throw new Error('неверный размер RIFF');
  const info: WebpInfo = { chunks: [], flags: 0, width: 0, height: 0, icc: null, exif: null };
  let pos = 12;
  while (pos + 8 <= bytes.length) {
    const type = text(pos);
    const size = view.getUint32(pos + 4, true);
    const data = bytes.subarray(pos + 8, pos + 8 + size);
    info.chunks.push(type);
    if (type === 'VP8X') {
      info.flags = data[0]!;
      info.width = 1 + (data[4]! | (data[5]! << 8) | (data[6]! << 16));
      info.height = 1 + (data[7]! | (data[8]! << 8) | (data[9]! << 16));
    }
    if (type === 'ICCP') info.icc = data.slice();
    if (type === 'EXIF') info.exif = data.slice();
    pos += 8 + size + (size & 1);
  }
  if (pos !== bytes.length) throw new Error('лишние байты в конце RIFF');
  return info;
}

export interface ExifSummary {
  Orientation?: number;
  DateTimeOriginal?: string;
  CreateDate?: string;
  ModifyDate?: string;
  OffsetTimeOriginal?: string;
  SubSecTimeOriginal?: string;
  Make?: string;
  Model?: string;
  SerialNumber?: string;
  latitude?: number;
  longitude?: number;
  hasGps: boolean;
}

/** EXIF через exifr: для JPEG — из файла целиком, для PNG — из чанка eXIf. */
export async function readExif(input: Uint8Array | null): Promise<ExifSummary | null> {
  if (!input) return null;
  const data = (await exifr.parse(input, {
    tiff: true,
    exif: true,
    gps: true,
    xmp: false,
    icc: false,
    reviveValues: false,
    translateValues: false,
    mergeOutput: true,
  })) as Record<string, unknown> | undefined;
  if (!data) return null;
  return { ...(data as object), hasGps: Object.keys(data).some((k) => k.startsWith('GPS')) || 'latitude' in data } as ExifSummary;
}

/** ICC из JPEG (сегменты APP2 по порядку номеров). */
export function jpegIcc(bytes: Uint8Array): Uint8Array | null {
  const parts: { seq: number; data: Uint8Array }[] = [];
  let pos = 2;
  while (pos < bytes.length && bytes[pos + 1] !== 0xda) {
    const length = (bytes[pos + 2]! << 8) | bytes[pos + 3]!;
    const body = bytes.subarray(pos + 4, pos + 2 + length);
    if (bytes[pos + 1] === 0xe2 && new TextDecoder().decode(body.subarray(0, 11)) === 'ICC_PROFILE') parts.push({ seq: body[12]!, data: body.subarray(14) });
    pos += 2 + length;
  }
  if (parts.length === 0) return null;
  return Uint8Array.from(parts.sort((a, b) => a.seq - b.seq).flatMap((p) => [...p.data]));
}

export function hasXmp(bytes: Uint8Array): boolean {
  return Buffer.from(bytes).includes('http://ns.adobe.com/xap/1.0/');
}

export function unzip(bytes: Uint8Array): Record<string, Uint8Array> {
  return unzipSync(bytes);
}

/**
 * Пиксели результата глазами браузера: декодирование встроенным декодером
 * (с учётом EXIF Orientation, как в галерее) и чтение цветов в заданных точках.
 * Canvas здесь только для проверки в тесте — в конвейере его нет.
 */
export async function decodeInBrowser(page: Page, bytes: Uint8Array, mime: string, points: [number, number][]) {
  return page.evaluate(
    async ({ base64, mime, points }) => {
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([binary], { type: mime }));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      return {
        width: bitmap.width,
        height: bitmap.height,
        pixels: points.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data)),
      };
    },
    { base64: Buffer.from(bytes).toString('base64'), mime, points },
  );
}

export interface IcoEntry {
  width: number;
  height: number;
  bitCount: number;
  data: Uint8Array;
}

/** Записи ICO: размер (0 → 256), глубина и данные каждого изображения. */
export function icoEntries(bytes: Uint8Array): IcoEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint16(0, true) !== 0 || view.getUint16(2, true) !== 1) throw new Error('не ICO');
  const count = view.getUint16(4, true);
  return Array.from({ length: count }, (_, i) => {
    const entry = 6 + i * 16;
    const size = view.getUint32(entry + 8, true);
    const offset = view.getUint32(entry + 12, true);
    return {
      width: bytes[entry] || 256,
      height: bytes[entry + 1] || 256,
      bitCount: view.getUint16(entry + 6, true),
      data: bytes.subarray(offset, offset + size),
    };
  });
}

/** Какой цвет преобладает: r, g, b, y (жёлтый), w (белый) или t (прозрачный). */
export function dominant([r, g, b, a]: number[]): string {
  if (a! < 32) return 't';
  if (r! > 180 && g! > 180 && b! > 180) return 'w';
  if (r! > 150 && g! > 150 && b! < 100) return 'y';
  if (r! > 150 && g! < 100 && b! < 100) return 'r';
  if (g! > 120 && r! < 100 && b! < 100) return 'g';
  if (b! > 150 && r! < 100 && g! < 100) return 'b';
  return `?(${r},${g},${b},${a})`;
}

/** PDF разбирается независимо — pdf.js в Node. */
export async function openPdf(bytes: Uint8Array) {
  return getDocument({ data: new Uint8Array(bytes), verbosity: 0, isOffscreenCanvasSupported: false }).promise;
}

/** Размер страницы, матрица, которой рисуется картинка, и сама картинка. */
export async function pageInfo(pdf: Awaited<ReturnType<typeof openPdf>>, number: number) {
  const page = await pdf.getPage(number);
  const ops = await page.getOperatorList();
  const transform = ops.argsArray[ops.fnArray.indexOf(OPS.transform)] as number[];
  const index = ops.fnArray.indexOf(OPS.paintImageXObject);
  const [id] = ops.argsArray[index] as [string];
  const image = await new Promise<{ width: number; height: number; kind: number; data: Uint8ClampedArray }>((resolve) => page.objs.get(id, resolve));
  return { view: page.view.map((v) => Math.round(v * 100) / 100), transform: transform.map((v) => Math.round(v * 100) / 100), image };
}

/** Сжатые данные JPEG (от первого SOS до конца) — по ним видно, что файл вставлен без перекодирования. */
export function entropyData(jpeg: Buffer): Buffer {
  let pos = 2;
  while (jpeg[pos + 1] !== 0xda) pos += 2 + jpeg.readUInt16BE(pos + 2);
  return jpeg.subarray(pos);
}

export interface MediaInfo {
  /** MIME-тип контейнера по mediabunny: audio/mpeg, audio/wav, audio/mp4, video/mp4, video/webm… */
  mime: string;
  /** Кодек звука (null — звука нет). */
  codec: string | null;
  channels: number;
  sampleRate: number;
  duration: number;
  hasVideo: boolean;
  /** Кодек видео и размер кадра на экране (null — видео нет). */
  videoCodec: string | null;
  width: number | null;
  height: number | null;
  title: string | null;
  artist: string | null;
}

/** Разбор аудио и видео mediabunny в Node (без декодирования): контейнер, кодеки, размер, длительность, теги. */
export async function mediaInfo(bytes: Uint8Array): Promise<MediaInfo> {
  const { ALL_FORMATS, BufferSource, Input } = await import('mediabunny');
  const input = new Input({ source: new BufferSource(bytes), formats: ALL_FORMATS });
  try {
    const audio = await input.getPrimaryAudioTrack();
    const video = await input.getPrimaryVideoTrack();
    const tags = await input.getMetadataTags();
    return {
      mime: (await input.getMimeType()).split(';')[0]!,
      codec: audio ? await audio.getCodec() : null,
      channels: audio ? await audio.getNumberOfChannels() : 0,
      sampleRate: audio ? await audio.getSampleRate() : 0,
      duration: await input.computeDuration(),
      hasVideo: video !== null,
      videoCodec: video ? await video.getCodec() : null,
      width: video ? await video.getDisplayWidth() : null,
      height: video ? await video.getDisplayHeight() : null,
      title: tags.title ?? null,
      artist: tags.artist ?? null,
    };
  } finally {
    input.dispose();
  }
}

/** GIF: размер логического экрана, число кадров и задержка первого кадра (мс), повтор (NETSCAPE2.0). */
export function gifInfo(bytes: Uint8Array): { width: number; height: number; frames: number; delay: number; loops: boolean } {
  if (String.fromCharCode(...bytes.subarray(0, 6)) !== 'GIF89a') throw new Error('не GIF89a');
  const width = bytes[6]! | (bytes[7]! << 8);
  const height = bytes[8]! | (bytes[9]! << 8);
  let pos = 13 + (bytes[10]! & 0x80 ? 3 << ((bytes[10]! & 7) + 1) : 0);
  let frames = 0;
  let delay = -1;
  let loops = false;
  const skipBlocks = () => {
    while (bytes[pos] !== 0) pos += bytes[pos]! + 1;
    pos++;
  };
  while (pos < bytes.length) {
    const block = bytes[pos++];
    if (block === 0x3b) break;
    if (block === 0x21) {
      const label = bytes[pos++];
      if (label === 0xf9 && delay < 0) delay = (bytes[pos + 2]! | (bytes[pos + 3]! << 8)) * 10;
      if (label === 0xff && String.fromCharCode(...bytes.subarray(pos + 1, pos + 12)) === 'NETSCAPE2.0') loops = true;
      skipBlocks();
    } else if (block === 0x2c) {
      frames++;
      const packed = bytes[pos + 8]!;
      pos += 9 + (packed & 0x80 ? 3 << ((packed & 7) + 1) : 0) + 1; // дескриптор, локальная палитра, размер кода LZW
      skipBlocks();
    } else {
      throw new Error(`неизвестный блок ${block}`);
    }
  }
  return { width, height, frames, delay, loops };
}
