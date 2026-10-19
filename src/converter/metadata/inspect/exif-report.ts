// EXIF для «Посмотреть EXIF»: сводка (дата, камера, параметры, место), таблица всех тегов и встроенная миниатюра.

import { type IfdKind, tagInfo } from '../exif-tags';
import { type ExifData, type TiffEntry, TYPE } from '../tiff';
import { readLayout, thumbnailRange } from '../tiff-layout';
import type { ExifSummary, ExposureInfo, LocationInfo, TagRow } from './types';

const T = {
  SBYTE: 6,
  SSHORT: 8,
  SLONG: 9,
  RATIONAL: 5,
  SRATIONAL: 10,
  FLOAT: 11,
  DOUBLE: 12,
  UTF8: 129,
} as const;

/** Длиннее — в таблице только размер («1 024 байта»): палитры, кривые, массивы смещений. */
const MAX_VALUES = 32;
const XP_TAGS = new Set([0x9c9b, 0x9c9c, 0x9c9d, 0x9c9e, 0x9c9f]);
/** Строки с 8-байтовым заголовком кодировки: UserComment, GPSProcessingMethod, GPSAreaInformation. */
const CHARSET_TAGS = new Set([0x9286, 0x1b, 0x1c]);
const VERSION_TAGS = new Set([0x9000, 0xa000, 0x0002]);

function view(entry: TiffEntry): DataView {
  return new DataView(entry.value.buffer, entry.value.byteOffset, entry.value.byteLength);
}

/** Числа значения (целые и с плавающей точкой); у рациональных — num/den. */
function numbers(entry: TiffEntry, le: boolean): number[] {
  const v = view(entry);
  const out: number[] = [];
  for (let i = 0; i < entry.count; i++) {
    switch (entry.type) {
      case TYPE.BYTE:
      case TYPE.UNDEFINED:
        out.push(v.getUint8(i));
        break;
      case T.SBYTE:
        out.push(v.getInt8(i));
        break;
      case TYPE.SHORT:
        out.push(v.getUint16(i * 2, le));
        break;
      case T.SSHORT:
        out.push(v.getInt16(i * 2, le));
        break;
      case TYPE.LONG:
      case TYPE.IFD:
        out.push(v.getUint32(i * 4, le));
        break;
      case T.SLONG:
        out.push(v.getInt32(i * 4, le));
        break;
      case T.RATIONAL:
      case T.SRATIONAL: {
        const signed = entry.type === T.SRATIONAL;
        const num = signed ? v.getInt32(i * 8, le) : v.getUint32(i * 8, le);
        const den = signed ? v.getInt32(i * 8 + 4, le) : v.getUint32(i * 8 + 4, le);
        out.push(den === 0 ? Number.NaN : num / den);
        break;
      }
      case T.FLOAT:
        out.push(v.getFloat32(i * 4, le));
        break;
      case T.DOUBLE:
        out.push(v.getFloat64(i * 8, le));
        break;
      default:
        return [];
    }
  }
  return out;
}

function rational(entry: TiffEntry | undefined, le: boolean, index = 0): [number, number] | null {
  if (!entry || (entry.type !== T.RATIONAL && entry.type !== T.SRATIONAL) || entry.count <= index) return null;
  const v = view(entry);
  const signed = entry.type === T.SRATIONAL;
  const num = signed ? v.getInt32(index * 8, le) : v.getUint32(index * 8, le);
  const den = signed ? v.getInt32(index * 8 + 4, le) : v.getUint32(index * 8 + 4, le);
  return den === 0 ? null : [num, den];
}

const decodeText = (bytes: Uint8Array, encoding = 'utf-8') => new TextDecoder(encoding).decode(bytes).replace(/\0[\s\S]*$/, '').trim();

/** Текст значения: ASCII/UTF-8, строки Windows (XP*) в UTF-16, строки с заголовком кодировки. null — не текст. */
function text(entry: TiffEntry, le: boolean): string | null {
  if (entry.type === TYPE.ASCII || entry.type === T.UTF8) return decodeText(entry.value);
  if (XP_TAGS.has(entry.tag) && entry.type === TYPE.BYTE) return decodeText(entry.value, 'utf-16le');
  if (CHARSET_TAGS.has(entry.tag) && entry.value.length >= 8) {
    const charset = decodeText(entry.value.subarray(0, 8));
    const body = entry.value.subarray(8);
    if (charset === 'UNICODE') return decodeText(body, le ? 'utf-16le' : 'utf-16be');
    if (charset === 'ASCII' || charset === '') return decodeText(body);
  }
  return null;
}

const round = (n: number) => (Number.isInteger(n) ? String(n) : String(Number(n.toPrecision(6))));

/** Значение тега для таблицы: строка без перевода или null для двоичных данных. */
function formatValue(entry: TiffEntry, le: boolean): string | null {
  const asText = text(entry, le);
  if (asText !== null) return asText;
  if (VERSION_TAGS.has(entry.tag) && entry.type === TYPE.UNDEFINED && entry.count === 4) return decodeText(entry.value);
  if (entry.tag === 0 && entry.type === TYPE.BYTE) return [...entry.value].join('.'); // GPSVersionID: 2.2.0.0
  if (entry.type === TYPE.UNDEFINED) {
    // короткие коды (SceneType, FileSource, ComponentsConfiguration) — числами, остальное — двоичные данные
    if (entry.count <= 4) return [...entry.value].join(' ');
    return null;
  }
  if (entry.count > MAX_VALUES) return null;
  if (entry.tag === 0x829a) {
    const time = rational(entry, le);
    if (time) return time[0] < time[1] && time[0] > 0 ? `1/${round(time[1] / time[0])}` : round(time[0] / time[1]);
  }
  const values = numbers(entry, le);
  if (values.length === 0) return null;
  return values.map((n) => (Number.isNaN(n) ? '—' : round(n))).join(', ');
}

function rows(kind: IfdKind, entries: TiffEntry[], le: boolean): TagRow[] {
  return entries.map((entry) => ({ ifd: kind, tag: entry.tag, name: tagInfo(kind, entry.tag).name, value: formatValue(entry, le), size: entry.value.length }));
}

/** Все теги по IFD (указатели на под-IFD — не данные, их нет). */
export function tagRows(data: ExifData): TagRow[] {
  const le = data.littleEndian;
  return [...rows('ifd0', data.ifd0, le), ...rows('exif', data.exif, le), ...rows('gps', data.gps, le), ...rows('interop', data.interop, le)];
}

const find = (entries: TiffEntry[], tag: number) => entries.find((e) => e.tag === tag);

function textOf(entries: TiffEntry[], tag: number, le: boolean): string | null {
  const entry = find(entries, tag);
  const value = entry ? text(entry, le) : null;
  return value ? value : null;
}

function numberOf(entries: TiffEntry[], tag: number, le: boolean): number | null {
  const entry = find(entries, tag);
  const value = entry ? numbers(entry, le)[0] : undefined;
  return value === undefined || Number.isNaN(value) ? null : value;
}

/** Градусы, минуты, секунды → десятичные градусы со знаком по полушарию. */
function coordinate(entries: TiffEntry[], tag: number, refTag: number, negative: string, le: boolean): number | null {
  const entry = find(entries, tag);
  if (!entry || entry.count < 1) return null;
  const parts = numbers(entry, le);
  if (parts.length === 0 || parts.some(Number.isNaN)) return null;
  const [degrees = 0, minutes = 0, seconds = 0] = parts;
  const value = degrees + minutes / 60 + seconds / 3600;
  return textOf(entries, refTag, le)?.toUpperCase() === negative ? -value : value;
}

function location(data: ExifData): LocationInfo | null {
  const le = data.littleEndian;
  const latitude = coordinate(data.gps, 2, 1, 'S', le);
  const longitude = coordinate(data.gps, 4, 3, 'W', le);
  if (latitude === null || longitude === null) return null;
  // 0, 0 без полушарий — «пустые» координаты некоторых камер, а не точка в Гвинейском заливе
  if (latitude === 0 && longitude === 0) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const height = numberOf(data.gps, 6, le);
  const below = find(data.gps, 5)?.value[0] === 1;
  return { latitude, longitude, altitude: height === null ? null : below ? -height : height };
}

function exposure(data: ExifData): ExposureInfo | null {
  const le = data.littleEndian;
  const info: ExposureInfo = {
    fNumber: numberOf(data.exif, 0x829d, le),
    exposureTime: rational(find(data.exif, 0x829a), le),
    iso: numberOf(data.exif, 0x8827, le),
    focalLength: numberOf(data.exif, 0x920a, le),
    focalLength35: numberOf(data.exif, 0xa405, le) || null,
  };
  return Object.values(info).some((v) => v !== null) ? info : null;
}

/** «Apple» + «iPhone 15 Pro» → «Apple iPhone 15 Pro»; модель уже с производителем («Canon EOS R6») — без повтора. */
function camera(make: string | null, model: string | null): string | null {
  if (!model) return make;
  if (!make || model.toLowerCase().startsWith(make.toLowerCase().split(' ')[0]!)) return model;
  return `${make} ${model}`;
}

export function summarizeExif(data: ExifData): ExifSummary {
  const le = data.littleEndian;
  const date = textOf(data.exif, 0x9003, le) ?? textOf(data.exif, 0x9004, le) ?? textOf(data.ifd0, 0x0132, le);
  return {
    taken: date ? { date, offset: textOf(data.exif, 0x9011, le) ?? textOf(data.exif, 0x9010, le) } : null,
    camera: camera(textOf(data.ifd0, 0x010f, le), textOf(data.ifd0, 0x0110, le)),
    lens: textOf(data.exif, 0xa434, le),
    exposure: exposure(data),
    location: location(data),
    software: textOf(data.ifd0, 0x0131, le) ?? textOf(data.ifd0, 0x013c, le),
    author: textOf(data.ifd0, 0x013b, le) ?? textOf(data.exif, 0xa430, le) ?? textOf(data.ifd0, 0x9c9d, le),
    copyright: textOf(data.ifd0, 0x8298, le),
    serial: textOf(data.exif, 0xa431, le) ?? textOf(data.ifd0, 0xc62f, le),
  };
}

export const EMPTY_SUMMARY: ExifSummary = {
  taken: null,
  camera: null,
  lens: null,
  exposure: null,
  location: null,
  software: null,
  author: null,
  copyright: null,
  serial: null,
};

/** JPEG-миниатюра из IFD1 (копия) или null. */
export function exifThumbnail(tiff: Uint8Array): Uint8Array | null {
  const range = thumbnailRange(tiff, readLayout(tiff));
  if (!range || tiff[range.offset] !== 0xff || tiff[range.offset + 1] !== 0xd8) return null;
  return tiff.slice(range.offset, range.offset + range.length);
}
