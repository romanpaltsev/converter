// Элементы HEIF/AVIF (ISOBMFF): где в файле лежат блоки Exif и XMP, какое изображение основное, его размер и цвет.
// Нужно, чтобы удалять метаданные без перекодирования (данные элементов затираются на месте — смещения не меняются)
// и показывать их в «Посмотреть EXIF». Разбираются только боксы meta: pitm, iinf, iloc, idat, iprp.

import type { Nclx } from '../color/nclx';

export class HeifError extends Error {}

export interface Box {
  type: string;
  /** Начало бокса (поле размера) и начало данных после заголовка. */
  start: number;
  dataStart: number;
  end: number;
}

/** Кусок данных элемента: абсолютное смещение в файле и длина. */
export interface HeifExtent {
  offset: number;
  length: number;
}

export interface HeifItem {
  id: number;
  /** Тип элемента: hvc1, av01, grid, Exif, mime… */
  type: string;
  /** Для mime — тип содержимого (application/rdf+xml у XMP). */
  contentType: string | null;
  /** Где лежат данные; null — не в этом файле (ссылка на другой элемент или внешний файл). */
  extents: HeifExtent[] | null;
}

export interface HeifInfo {
  items: HeifItem[];
  primary: number | null;
  /** Размер основного изображения до поворота (ispe) и поворот против часовой (irot), градусы. */
  width: number | null;
  height: number | null;
  rotation: number;
  /** Цвет основного изображения (colr): ICC-профиль и/или параметры nclx. */
  icc: Uint8Array | null;
  nclx: Nclx | null;
}

type PrimaryProperties = Pick<HeifInfo, 'width' | 'height' | 'rotation' | 'icc' | 'nclx'>;
const NO_PROPERTIES: PrimaryProperties = { width: null, height: null, rotation: 0, icc: null, nclx: null };

const ascii = (bytes: Uint8Array, at: number, length: number) => String.fromCharCode(...bytes.subarray(at, at + length));

/** Боксы на участке [start, end). Битая длина — ошибка: править такой файл опасно. */
export function readBoxes(bytes: Uint8Array, start: number, end: number): Box[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const boxes: Box[] = [];
  let pos = start;
  while (pos + 8 <= end) {
    let size = view.getUint32(pos);
    const type = ascii(bytes, pos + 4, 4);
    let header = 8;
    if (size === 1) {
      if (pos + 16 > end) throw new HeifError(`ISOBMFF: обрезан заголовок ${type}`);
      size = Number(view.getBigUint64(pos + 8));
      header = 16;
    } else if (size === 0) {
      size = end - pos; // до конца родителя
    }
    if (size < header || pos + size > end) throw new HeifError(`ISOBMFF: битая длина бокса ${type}`);
    boxes.push({ type, start: pos, dataStart: pos + header, end: pos + size });
    pos += size;
  }
  return boxes;
}

class Reader {
  private readonly view: DataView;
  constructor(
    private readonly bytes: Uint8Array,
    public pos: number,
    private readonly end: number,
  ) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  private need(n: number): void {
    if (this.pos + n > this.end) throw new HeifError('ISOBMFF: обрезанный бокс');
  }

  u8(): number {
    this.need(1);
    return this.bytes[this.pos++]!;
  }

  u16(): number {
    this.need(2);
    const v = this.view.getUint16(this.pos);
    this.pos += 2;
    return v;
  }

  u32(): number {
    this.need(4);
    const v = this.view.getUint32(this.pos);
    this.pos += 4;
    return v;
  }

  /** Беззнаковое целое длиной 0, 4 или 8 байт (поля iloc). */
  uint(size: number): number {
    if (size === 0) return 0;
    if (size === 4) return this.u32();
    if (size === 8) {
      this.need(8);
      const v = Number(this.view.getBigUint64(this.pos));
      this.pos += 8;
      return v;
    }
    throw new HeifError(`ISOBMFF: размер поля ${size}`);
  }

  fourcc(): string {
    this.need(4);
    const s = ascii(this.bytes, this.pos, 4);
    this.pos += 4;
    return s;
  }

  /** Строка до нулевого байта (или до конца бокса). */
  string(): string {
    let stop = this.pos;
    while (stop < this.end && this.bytes[stop] !== 0) stop++;
    const s = new TextDecoder().decode(this.bytes.subarray(this.pos, stop));
    this.pos = Math.min(this.end, stop + 1);
    return s;
  }

  get remaining(): number {
    return this.end - this.pos;
  }
}

/** Версия и флаги FullBox; читатель стоит после них. */
function fullBox(bytes: Uint8Array, box: Box): { version: number; reader: Reader } {
  const reader = new Reader(bytes, box.dataStart, box.end);
  const version = reader.u8();
  reader.pos += 3; // флаги
  return { version, reader };
}

function readItemInfos(bytes: Uint8Array, iinf: Box): Map<number, { type: string; contentType: string | null }> {
  const { version, reader } = fullBox(bytes, iinf);
  if (version === 0) reader.u16();
  else reader.u32();
  const infos = new Map<number, { type: string; contentType: string | null }>();
  for (const infe of readBoxes(bytes, reader.pos, iinf.end)) {
    if (infe.type !== 'infe') continue;
    const entry = fullBox(bytes, infe);
    const r = entry.reader;
    if (entry.version >= 2) {
      const id = entry.version === 2 ? r.u16() : r.u32();
      r.u16(); // item_protection_index
      const type = r.fourcc();
      r.string(); // item_name
      const contentType = type === 'mime' && r.remaining > 0 ? r.string() : null;
      infos.set(id, { type, contentType });
    } else {
      // старые версии 0 и 1: типа нет, только MIME-тип содержимого
      const id = r.u16();
      r.u16();
      r.string();
      infos.set(id, { type: 'mime', contentType: r.remaining > 0 ? r.string() : null });
    }
  }
  return infos;
}

function readLocations(bytes: Uint8Array, iloc: Box, idat: Box | undefined): Map<number, HeifExtent[] | null> {
  const { version, reader: r } = fullBox(bytes, iloc);
  if (version > 2) throw new HeifError(`ISOBMFF: iloc версии ${version}`);
  const sizes = r.u8();
  const offsetSize = sizes >> 4;
  const lengthSize = sizes & 15;
  const more = r.u8();
  const baseOffsetSize = more >> 4;
  const indexSize = version > 0 ? more & 15 : 0;
  const count = version < 2 ? r.u16() : r.u32();
  const locations = new Map<number, HeifExtent[] | null>();
  for (let i = 0; i < count; i++) {
    const id = version < 2 ? r.u16() : r.u32();
    const method = version > 0 ? r.u16() & 15 : 0;
    const dataReference = r.u16();
    const base = r.uint(baseOffsetSize);
    const extentCount = r.u16();
    const extents: HeifExtent[] = [];
    for (let e = 0; e < extentCount; e++) {
      if (indexSize > 0) r.uint(indexSize);
      const offset = r.uint(offsetSize);
      const length = r.uint(lengthSize);
      extents.push({ offset: base + offset, length });
    }
    // метод 0 — смещения в файле, 1 — внутри idat; 2 (ссылка на элемент) и внешние файлы здесь не встречаются
    if (dataReference !== 0 || method === 2 || (method === 1 && !idat)) {
      locations.set(id, null);
      continue;
    }
    const origin = method === 1 ? idat!.dataStart : 0;
    const limit = method === 1 ? idat!.end : bytes.length;
    const resolved = extents.map((extent) => {
      const offset = origin + extent.offset;
      // длина 0 — «до конца данных»
      const length = extent.length === 0 ? limit - offset : extent.length;
      if (offset < origin || offset + length > limit) throw new HeifError(`ISOBMFF: данные элемента ${id} за пределами файла`);
      return { offset, length };
    });
    locations.set(id, resolved);
  }
  return locations;
}

/** Размер (ispe), поворот (irot) и цвет (colr) основного изображения из iprp. */
function readPrimaryProperties(bytes: Uint8Array, iprp: Box, primary: number): PrimaryProperties {
  const children = readBoxes(bytes, iprp.dataStart, iprp.end);
  const ipco = children.find((b) => b.type === 'ipco');
  const result = { ...NO_PROPERTIES };
  if (!ipco) return result;
  const properties = readBoxes(bytes, ipco.dataStart, ipco.end);
  for (const ipma of children.filter((b) => b.type === 'ipma')) {
    const { version, reader: r } = fullBox(bytes, ipma);
    const flags = bytes[ipma.dataStart + 3]! & 1;
    const count = r.u32();
    for (let i = 0; i < count; i++) {
      const id = version < 1 ? r.u16() : r.u32();
      const n = r.u8();
      for (let j = 0; j < n; j++) {
        const index = (flags ? r.u16() & 0x7fff : r.u8() & 0x7f) - 1; // 0 — «нет свойства»
        if (id !== primary || index < 0) continue;
        const property = properties[index];
        if (property?.type === 'ispe') {
          const p = fullBox(bytes, property).reader;
          result.width = p.u32();
          result.height = p.u32();
        } else if (property?.type === 'irot') {
          result.rotation = ((bytes[property.dataStart]! & 3) * 90) % 360;
        } else if (property?.type === 'colr') {
          const p = new Reader(bytes, property.dataStart, property.end);
          const type = p.fourcc();
          if (type === 'nclx') {
            const [colorPrimaries, transferCharacteristics, matrixCoefficients] = [p.u16(), p.u16(), p.u16()];
            result.nclx = { colorPrimaries, transferCharacteristics, matrixCoefficients, fullRange: (p.u8() & 0x80) !== 0 };
          } else if (type === 'prof' || type === 'rICC') {
            result.icc = bytes.slice(p.pos, property.end);
          }
        }
      }
    }
  }
  return result;
}

export function readHeifInfo(bytes: Uint8Array): HeifInfo {
  const meta = readBoxes(bytes, 0, bytes.length).find((b) => b.type === 'meta');
  if (!meta) throw new HeifError('ISOBMFF: нет бокса meta');
  const children = readBoxes(bytes, meta.dataStart + 4, meta.end); // meta — FullBox
  const find = (type: string) => children.find((b) => b.type === type);
  const iinf = find('iinf');
  const iloc = find('iloc');
  const pitm = find('pitm');
  const iprp = find('iprp');
  const infos = iinf ? readItemInfos(bytes, iinf) : new Map<number, { type: string; contentType: string | null }>();
  const locations = iloc ? readLocations(bytes, iloc, find('idat')) : new Map<number, HeifExtent[] | null>();
  let primary: number | null = null;
  if (pitm) {
    const { version, reader } = fullBox(bytes, pitm);
    primary = version === 0 ? reader.u16() : reader.u32();
  }
  const items = [...infos].map(([id, info]): HeifItem => ({ id, ...info, extents: locations.get(id) ?? null }));
  const properties = iprp && primary !== null ? readPrimaryProperties(bytes, iprp, primary) : NO_PROPERTIES;
  return { items, primary, ...properties };
}

export const isExifItem = (item: HeifItem) => item.type === 'Exif';
export const isXmpItem = (item: HeifItem) => item.type === 'mime' && item.contentType === 'application/rdf+xml';

/** Данные элемента одним куском (копия). */
export function readItemData(bytes: Uint8Array, item: HeifItem): Uint8Array | null {
  if (!item.extents) return null;
  const out = new Uint8Array(item.extents.reduce((sum, e) => sum + e.length, 0));
  let pos = 0;
  for (const extent of item.extents) {
    out.set(bytes.subarray(extent.offset, extent.offset + extent.length), pos);
    pos += extent.length;
  }
  return out;
}

/** Записывает данные элемента обратно в те же места (длина не меняется). */
export function writeItemData(target: Uint8Array, item: HeifItem, data: Uint8Array): void {
  if (!item.extents) throw new HeifError(`ISOBMFF: данные элемента ${item.id} не в файле`);
  let pos = 0;
  for (const extent of item.extents) {
    target.set(data.subarray(pos, pos + extent.length), extent.offset);
    pos += extent.length;
  }
}
