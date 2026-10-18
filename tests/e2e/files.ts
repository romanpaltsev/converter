// Разбор скачанных результатов независимыми средствами: exifr (EXIF, ICC), свои разборщики
// заголовков JPEG/PNG (размеры, структура), декодер браузера (пиксели и ориентация).
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import type { Download, Page } from '@playwright/test';
import exifr from 'exifr';
import { unzipSync } from 'fflate';

export const FIXTURES = new URL('../fixtures/', import.meta.url).pathname;
export const fixture = (name: string) => FIXTURES + name;
export const iccProfile = (name: string) => new Uint8Array(readFileSync(new URL(`../../src/converter/color/icc/${name}`, import.meta.url)));

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
