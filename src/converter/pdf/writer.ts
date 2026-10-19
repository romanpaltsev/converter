// Свой минимальный писатель PDF для «Изображения в PDF»: на каждой странице — одна картинка.
// JPEG вставляется как есть (DCTDecode, без перекодирования), остальное — сжатые zlib строки пикселей (FlateDecode)
// или JPEG от MozJPEG. Ни шрифтов, ни метаданных документа (Info, XMP): только каталог, страницы, картинки и ICC.

export interface PdfImage {
  /** Поток изображения: JPEG целиком или сжатые zlib строки пикселей (без фильтров строк). */
  data: Uint8Array;
  filter: 'DCTDecode' | 'FlateDecode';
  /** Размер в пикселях — как хранится (до поворота). */
  width: number;
  height: number;
  /** 1 — оттенки серого, 3 — RGB. */
  components: 1 | 3;
  /** ICC-профиль изображения (если число каналов совпадает) или null — sRGB/серый по умолчанию. */
  icc: Uint8Array | null;
  /** Прозрачность: сжатый zlib канал альфы (SMask) или null. */
  alpha: Uint8Array | null;
  /** EXIF Orientation: у JPEG, вставленного как есть, пиксели не повёрнуты — поворачивает матрица. */
  orientation: number;
}

export type PageSize = 'a4' | 'letter' | 'image';

export interface PdfLayout {
  size: PageSize;
  /** Поля в пунктах (1/72 дюйма). */
  margin: number;
}

/** A4 и Letter в пунктах (портрет). */
const PAGE_SIZES: Record<Exclude<PageSize, 'image'>, [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };
/** «Как у изображения»: 96 точек на дюйм, как у браузеров, — 1 пиксель = 0,75 пункта. */
const POINTS_PER_PIXEL = 0.75;
/** Поля «узкие» — 10 мм. */
export const SMALL_MARGIN = (10 / 25.4) * 72;

export interface Placement {
  page: [width: number, height: number];
  /** Где картинка на странице (левый нижний угол и размер, как она видна). */
  box: [x: number, y: number, width: number, height: number];
}

/** Размер страницы и место картинки: вписать с сохранением пропорций и по центру; альбомная — на альбомный лист. */
export function placeImage(image: Pick<PdfImage, 'width' | 'height' | 'orientation'>, layout: PdfLayout): Placement {
  const turned = image.orientation >= 5;
  const [width, height] = turned ? [image.height, image.width] : [image.width, image.height];
  const m = layout.margin;
  if (layout.size === 'image') {
    const [w, h] = [width * POINTS_PER_PIXEL, height * POINTS_PER_PIXEL];
    return { page: [w + 2 * m, h + 2 * m], box: [m, m, w, h] };
  }
  let [pw, ph] = PAGE_SIZES[layout.size];
  if (width > height) [pw, ph] = [ph, pw];
  const scale = Math.min((pw - 2 * m) / width, (ph - 2 * m) / height);
  const [w, h] = [width * scale, height * scale];
  return { page: [pw, ph], box: [(pw - w) / 2, (ph - h) / 2, w, h] };
}

/**
 * Матрица cm, которая кладёт картинку в прямоугольник (x, y, w, h) с поворотом по EXIF Orientation.
 * Единичный квадрат картинки в PDF: (s, t) — от левого нижнего угла, первая строка пикселей — вверху.
 */
export function orientationMatrix(orientation: number, x: number, y: number, w: number, h: number): number[] {
  switch (orientation) {
    case 2:
      return [-w, 0, 0, h, x + w, y];
    case 3:
      return [-w, 0, 0, -h, x + w, y + h];
    case 4:
      return [w, 0, 0, -h, x, y + h];
    case 5:
      return [0, -h, -w, 0, x + w, y + h];
    case 6:
      return [0, -h, w, 0, x, y + h];
    case 7:
      return [0, h, w, 0, x, y];
    case 8:
      return [0, h, -w, 0, x + w, y];
    default:
      return [w, 0, 0, h, x, y];
  }
}

const encoder = new TextEncoder();

/** Число для PDF: до 4 знаков после точки, без экспоненты и лишних нулей. */
function num(value: number): string {
  const fixed = value.toFixed(4).replace(/\.?0+$/, '');
  return fixed === '-0' ? '0' : fixed;
}

/** Хеш FNV-1a: одинаковые ICC-профили страниц записываются один раз. */
function hash(bytes: Uint8Array): string {
  let h = 0x811c9dc5;
  for (const b of bytes) h = Math.imul(h ^ b, 0x01000193);
  return `${bytes.length}:${h >>> 0}`;
}

/** Число каналов профиля по его цветовому пространству: RGB — 3, GRAY — 1. */
function iccChannels(icc: Uint8Array): number | null {
  const space = String.fromCharCode(...icc.subarray(16, 20));
  return space === 'RGB ' ? 3 : space === 'GRAY' ? 1 : null;
}

class Writer {
  readonly parts: Uint8Array[] = [];
  private offset = 0;
  private readonly offsets: number[] = [];
  private next = 1;

  /** Номер для объекта, который запишется позже. */
  reserve(): number {
    return this.next++;
  }

  raw(data: Uint8Array | string): void {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data;
    this.parts.push(bytes);
    this.offset += bytes.length;
  }

  object(id: number, dictionary: string, stream?: Uint8Array): void {
    this.offsets[id] = this.offset;
    if (!stream) {
      this.raw(`${id} 0 obj\n${dictionary}\nendobj\n`);
      return;
    }
    this.raw(`${id} 0 obj\n${dictionary.replace(/>>$/, `/Length ${stream.length} >>`)}\nstream\n`);
    this.raw(stream);
    this.raw('\nendstream\nendobj\n');
  }

  /** Таблица перекрёстных ссылок: записи ровно по 20 байт. */
  finish(root: number): void {
    const xref = this.offset;
    const count = this.next;
    let table = `xref\n0 ${count}\n0000000000 65535 f \n`;
    for (let id = 1; id < count; id++) table += `${String(this.offsets[id]).padStart(10, '0')} 00000 n \n`;
    this.raw(`${table}trailer\n<< /Size ${count} /Root ${root} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  }
}

/** PDF из картинок по порядку: Blob из частей, без копирования больших буферов. */
export function buildPdf(images: PdfImage[], layout: PdfLayout): Blob {
  const w = new Writer();
  // вторая строка с байтами больше 127 — признак двоичного файла для программ передачи
  w.raw('%PDF-1.7\n');
  w.raw(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  const catalog = w.reserve();
  const pages = w.reserve();
  const iccObjects = new Map<string, number>();
  const kids: number[] = [];

  for (const image of images) {
    const page = w.reserve();
    kids.push(page);
    let colorSpace = image.components === 1 ? '/DeviceGray' : '/DeviceRGB';
    if (image.icc && iccChannels(image.icc) === image.components) {
      const key = hash(image.icc);
      let id = iccObjects.get(key);
      if (id === undefined) {
        id = w.reserve();
        iccObjects.set(key, id);
        w.object(id, `<< /N ${image.components} >>`, image.icc);
      }
      colorSpace = `[/ICCBased ${id} 0 R]`;
    }
    let mask = '';
    if (image.alpha) {
      const smask = w.reserve();
      w.object(smask, `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode >>`, image.alpha);
      mask = ` /SMask ${smask} 0 R`;
    }
    const xobject = w.reserve();
    w.object(
      xobject,
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace ${colorSpace} /BitsPerComponent 8 /Filter /${image.filter}${mask} >>`,
      image.data,
    );
    const { page: size, box } = placeImage(image, layout);
    const matrix = orientationMatrix(image.orientation, ...box).map(num).join(' ');
    const content = w.reserve();
    w.object(content, '<< >>', encoder.encode(`q\n${matrix} cm\n/Im0 Do\nQ\n`));
    w.object(
      page,
      `<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${num(size[0])} ${num(size[1])}] /Resources << /XObject << /Im0 ${xobject} 0 R >> >> /Contents ${content} 0 R >>`,
    );
  }
  w.object(pages, `<< /Type /Pages /Kids [${kids.map((id) => `${id} 0 R`).join(' ')}] /Count ${kids.length} >>`);
  w.object(catalog, `<< /Type /Catalog /Pages ${pages} 0 R >>`);
  w.finish(catalog);
  return new Blob(w.parts as BlobPart[], { type: 'application/pdf' });
}
