// ZIP для XLSX: чтение по центральному каталогу (store и deflate — распаковка браузером) и запись без сжатия.
// Свой код вместо библиотеки: нужно немного, а запись детерминирована (одинаковые таблицы — одинаковые файлы).

import { crc32 } from '../metadata/crc32';
import { inflateRaw } from '../metadata/inflate';
import { ConvertError } from '../pipeline/types';

/** Распакованные данные одного файла не больше этого: защита от «zip-бомбы». */
const MAX_ENTRY_BYTES = 256 * 1024 * 1024;

export interface ZipEntry {
  name: string;
  read(): Promise<Uint8Array>;
}

/** Файлы архива по центральному каталогу (ZIP64 и шифрование не поддерживаются — XLSX их не использует). */
export function readZip(bytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // конец центрального каталога — в последних 64 КБ + 22 байта
  let end = -1;
  for (let pos = bytes.length - 22; pos >= Math.max(0, bytes.length - 22 - 0xffff); pos--) {
    if (view.getUint32(pos, true) === 0x06054b50) {
      end = pos;
      break;
    }
  }
  if (end < 0) throw new ConvertError('decode-failed', 'zip: нет центрального каталога');
  const count = view.getUint16(end + 10, true);
  let pos = view.getUint32(end + 16, true);
  const entries = new Map<string, ZipEntry>();
  const decoder = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw new ConvertError('decode-failed', 'zip: битый каталог');
    const method = view.getUint16(pos + 10, true);
    const compressed = view.getUint32(pos + 20, true);
    const nameLength = view.getUint16(pos + 28, true);
    const extraLength = view.getUint16(pos + 30, true);
    const commentLength = view.getUint16(pos + 32, true);
    const local = view.getUint32(pos + 42, true);
    const name = decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLength));
    pos += 46 + nameLength + extraLength + commentLength;
    entries.set(name, {
      name,
      read: async () => {
        if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50) throw new ConvertError('decode-failed', `zip: нет заголовка ${name}`);
        const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        const data = bytes.subarray(start, start + compressed);
        if (method === 0) return data;
        if (method === 8) {
          try {
            return await inflateRaw(data, MAX_ENTRY_BYTES);
          } catch (error) {
            throw new ConvertError('decode-failed', `zip: ${String(error)}`);
          }
        }
        throw new ConvertError('unsupported-variant', `zip: метод сжатия ${method}`);
      },
    });
  }
  return entries;
}

/** Архив без сжатия (store): локальные заголовки, данные, центральный каталог. Время — 1980-01-01 (детерминированно). */
export function writeZip(files: { name: string; data: Uint8Array }[]): Uint8Array {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);
    const header = new Uint8Array(30 + name.length);
    const h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true); // версия 2.0
    h.setUint16(6, 0x0800, true); // имена в UTF-8
    h.setUint16(10, 0, true); // время 00:00
    h.setUint16(12, 0x21, true); // дата 1980-01-01
    h.setUint32(14, crc, true);
    h.setUint32(18, file.data.length, true);
    h.setUint32(22, file.data.length, true);
    h.setUint16(26, name.length, true);
    header.set(name, 30);
    const record = new Uint8Array(46 + name.length);
    const c = new DataView(record.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, file.data.length, true);
    c.setUint32(24, file.data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    record.set(name, 46);
    parts.push(header, file.data);
    central.push(record);
    offset += header.length + file.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, centralSize, true);
  e.setUint32(16, offset, true);
  const out = new Uint8Array(offset + centralSize + end.length);
  let pos = 0;
  for (const part of [...parts, ...central, end]) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}
