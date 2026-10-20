// Определение формата по сигнатуре файла, а не по расширению.

export type SniffResult =
  | { kind: 'heic' }
  | { kind: 'avif' }
  | { kind: 'jpeg' }
  | { kind: 'png' }
  | { kind: 'webp' }
  | { kind: 'gif' }
  | { kind: 'bmp' }
  | { kind: 'tiff' }
  | { kind: 'jxl' }
  /** PDF — не изображение: на страницах картинок — понятная ошибка, на «PDF в JPG» — вход. */
  | { kind: 'pdf' }
  /** Аудио и видео (контейнер по сигнатуре; какие в нём дорожки, узнаёт mediabunny в worker'е). */
  | { kind: MediaKind }
  /** Документы и таблицы: сигнатуры нет — только sniffFile() по расширению и содержимому. */
  | { kind: TextKind }
  | { kind: 'unknown' };

/** Аудио: MP3, WAV, FLAC, Ogg (Vorbis или Opus), Opus, AAC (ADTS), M4A. Видео: MP4, MOV, WebM, MKV. */
export const MEDIA_KINDS = ['mp3', 'wav', 'flac', 'ogg', 'opus', 'aac', 'm4a', 'mp4', 'mov', 'webm', 'mkv'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/** Текст (TXT, Markdown, HTML), таблицы (CSV, JSON, XLSX). */
export const TEXT_KINDS = ['txt', 'md', 'html', 'csv', 'json', 'xlsx'] as const;
export type TextKind = (typeof TEXT_KINDS)[number];

export type SniffKind = SniffResult['kind'];
/** Форматы изображений (то, что читают декодеры). */
export type ImageKind = Exclude<SniffKind, 'unknown' | 'pdf' | MediaKind | TextKind>;

export function isTextKind(kind: SniffKind): kind is TextKind {
  return (TEXT_KINDS as readonly string[]).includes(kind);
}

export function isMediaKind(kind: SniffKind): kind is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(kind);
}

export function isImageKind(kind: SniffKind): kind is ImageKind {
  return kind !== 'unknown' && kind !== 'pdf' && !isMediaKind(kind) && !isTextKind(kind);
}

/** Подпись формата аудио или видео в строке файла (до результата). */
export const MEDIA_LABELS: Record<MediaKind, string> = {
  mp3: 'MP3',
  wav: 'WAV',
  flac: 'FLAC',
  ogg: 'OGG',
  opus: 'Opus',
  aac: 'AAC',
  m4a: 'M4A',
  mp4: 'MP4',
  mov: 'MOV',
  webm: 'WebM',
  mkv: 'MKV',
};

const TEXT_LABELS: Record<TextKind, string> = { txt: 'TXT', md: 'MD', html: 'HTML', csv: 'CSV', json: 'JSON', xlsx: 'XLSX' };

/** Подпись любого распознанного формата (картинка, PDF, аудио, видео, документ). */
export function kindLabel(kind: Exclude<SniffKind, 'unknown'>): string {
  if (kind === 'pdf') return 'PDF';
  if (isTextKind(kind)) return TEXT_LABELS[kind];
  return isMediaKind(kind) ? MEDIA_LABELS[kind] : KIND_FILES[kind].label;
}

/** Название, расширение и MIME-тип по формату — для файлов, которые остаются в своём формате («Удалить метаданные»). */
export const KIND_FILES: Record<ImageKind, { label: string; extension: string; mime: string }> = {
  heic: { label: 'HEIC', extension: 'heic', mime: 'image/heic' },
  avif: { label: 'AVIF', extension: 'avif', mime: 'image/avif' },
  jpeg: { label: 'JPG', extension: 'jpg', mime: 'image/jpeg' },
  png: { label: 'PNG', extension: 'png', mime: 'image/png' },
  webp: { label: 'WebP', extension: 'webp', mime: 'image/webp' },
  gif: { label: 'GIF', extension: 'gif', mime: 'image/gif' },
  bmp: { label: 'BMP', extension: 'bmp', mime: 'image/bmp' },
  tiff: { label: 'TIFF', extension: 'tif', mime: 'image/tiff' },
  jxl: { label: 'JXL', extension: 'jxl', mime: 'image/jxl' },
};

/**
 * Сколько байт начала файла читать для определения формата: с запасом на длинный список брендов ftyp; PDF ищется
 * в первом килобайте (перед «%PDF-» бывает мусор), там же обычно и заголовок кадра JPEG (CMYK видно без WASM).
 */
export const SNIFF_BYTES = 1024;

// Бренды, однозначно указывающие на HEVC (HEIC).
const HEVC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs']);
// Общие бренды HEIF: кодек не указан, пробуем декодировать.
const GENERIC_HEIF_BRANDS = new Set(['mif1', 'msf1']);
const AVIF_BRANDS = new Set(['avif', 'avis']);
// Бренды ISO BMFF аудио (iTunes) и видео; QuickTime — бренд «qt  ». Прочие (CR3, JPEG 2000…) — не поддерживаются.
const M4A_BRANDS = new Set(['M4A ', 'M4B ', 'M4P ']);
const MP4_BRANDS = new Set(['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'iso8', 'iso9', 'mp41', 'mp42', 'mp71', 'avc1', 'hvc1', 'av01', 'dash', 'M4V ', 'M4VH', 'M4VP', 'MSNV', 'mmp4', 'f4v ', 'NDAS', '3gp4', '3gp5', '3gp6', '3g2a', '3g2b', '3g2c']);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = '';
  for (let i = start; i < start + length; i++) s += String.fromCharCode(bytes[i] ?? 0);
  return s;
}

/** Бренды из бокса ftyp: основной и совместимые. Пустой массив — это не ISOBMFF. */
export function readFtypBrands(bytes: Uint8Array): string[] {
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== 'ftyp') return [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let size = view.getUint32(0);
  let headerSize = 8;
  if (size === 1) {
    // 64-битный размер бокса; для ftyp на практике не встречается
    if (bytes.length < 24) return [];
    size = Number(view.getBigUint64(8));
    headerSize = 16;
  } else if (size === 0) {
    size = bytes.length; // бокс до конца файла
  }
  if (size < headerSize + 8) return [];
  const end = Math.min(size, bytes.length);
  const brands = [ascii(bytes, headerSize, 4)];
  // после основного бренда — minor_version (4 байта), затем совместимые бренды
  for (let pos = headerSize + 8; pos + 4 <= end; pos += 4) brands.push(ascii(bytes, pos, 4));
  return brands;
}

export function sniff(bytes: Uint8Array): SniffResult {
  const brands = readFtypBrands(bytes);
  if (brands.length > 0) {
    if (brands.some((b) => HEVC_BRANDS.has(b))) return { kind: 'heic' };
    if (brands.some((b) => AVIF_BRANDS.has(b))) return { kind: 'avif' };
    if (brands.some((b) => GENERIC_HEIF_BRANDS.has(b))) return { kind: 'heic' };
    // основной бренд важнее совместимых: у M4A среди совместимых бывает isom
    if (M4A_BRANDS.has(brands[0]!)) return { kind: 'm4a' };
    if (brands[0] === 'qt  ') return { kind: 'mov' };
    if (brands.some((b) => M4A_BRANDS.has(b))) return { kind: 'm4a' };
    if (brands.some((b) => MP4_BRANDS.has(b))) return { kind: 'mp4' };
    if (brands.includes('qt  ')) return { kind: 'mov' };
    return { kind: 'unknown' };
  }
  const b = (i: number) => bytes[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return { kind: 'jpeg' };
  // JPEG XL: «голый» кодовый поток (FF 0A) или контейнер, первый бокс которого — «JXL » (а не ftyp)
  if (b(0) === 0xff && b(1) === 0x0a) return { kind: 'jxl' };
  if (ascii(bytes, 4, 4) === 'JXL ' && b(0) === 0 && b(3) === 0x0c) return { kind: 'jxl' };
  if (b(0) === 0x89 && ascii(bytes, 1, 3) === 'PNG' && b(4) === 0x0d && b(5) === 0x0a) return { kind: 'png' };
  if (ascii(bytes, 0, 4) === 'GIF8') return { kind: 'gif' };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return { kind: 'webp' };
  if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 26) return { kind: 'bmp' };
  const tiffHeader = ascii(bytes, 0, 4);
  if (tiffHeader === 'II*\0' || tiffHeader === 'MM\0*') return { kind: 'tiff' };
  const media = sniffMedia(bytes);
  if (media) return { kind: media };
  // заголовок PDF бывает не в самом начале: читатели ищут его в первом килобайте
  if (ascii(bytes, 0, Math.min(bytes.length, 1024)).includes('%PDF-')) return { kind: 'pdf' };
  return { kind: 'unknown' };
}

/** Аудио и видео без бокса ftyp (его разбирает sniff): по сигнатуре контейнера или кадра. */
function sniffMedia(bytes: Uint8Array): MediaKind | null {
  const b = (i: number) => bytes[i] ?? -1;
  const head = ascii(bytes, 0, 4);
  if (ascii(bytes, 0, 3) === 'ID3') return 'mp3';
  if (head === 'fLaC') return 'flac';
  if ((head === 'RIFF' || head === 'RF64') && ascii(bytes, 8, 4) === 'WAVE') return 'wav';
  if (head === 'OggS') return ascii(bytes, 28, 8) === 'OpusHead' ? 'opus' : 'ogg';
  // EBML: тип документа — «webm» или «matroska» в заголовке
  if (b(0) === 0x1a && b(1) === 0x45 && b(2) === 0xdf && b(3) === 0xa3) {
    return ascii(bytes, 0, Math.min(bytes.length, 64)).includes('webm') ? 'webm' : 'mkv';
  }
  // старый QuickTime без ftyp начинается сразу с moov, mdat или wide
  const atom = ascii(bytes, 4, 4);
  if (atom === 'moov' || atom === 'mdat' || atom === 'wide') return 'mov';
  // кадр MPEG без ID3: синхрослово 11 бит; слой 00 — это ADTS (AAC), иначе MP3 (MPEG-1/2 Layer III и ниже)
  if (b(0) === 0xff && (b(1) & 0xe0) === 0xe0) {
    if ((b(1) & 0xf6) === 0xf0) return 'aac';
    // версия 01 зарезервирована, слой 00 у MPEG-аудио не бывает
    if ((b(1) & 0x18) !== 0x08 && (b(1) & 0x06) !== 0 && b(2) >> 4 !== 0x0f) return 'mp3';
  }
  return null;
}

/** Расширение → вид для форматов без сигнатуры. */
const TEXT_EXTENSIONS: Record<string, TextKind> = {
  txt: 'txt',
  text: 'txt',
  md: 'md',
  markdown: 'md',
  html: 'html',
  htm: 'html',
  csv: 'csv',
  tsv: 'csv',
  json: 'json',
};

/** Похоже на текст: нет нулевых байтов (UTF-16 с BOM — тоже текст). */
function looksLikeText(bytes: Uint8Array): boolean {
  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) return true;
  return !bytes.includes(0);
}

/**
 * Вид файла по сигнатуре, а для форматов без неё — по расширению: текст (TXT, Markdown, HTML, CSV, JSON) — если
 * начало файла похоже на текст, XLSX — если это ZIP. Сигнатура важнее расширения (JPEG с именем .txt — JPEG).
 */
export function sniffFile(name: string, bytes: Uint8Array): SniffKind {
  const { kind } = sniff(bytes);
  if (kind !== 'unknown') return kind;
  const dot = name.lastIndexOf('.');
  const extension = dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
  if (extension === 'xlsx') return ascii(bytes, 0, 4) === 'PK\x03\x04' ? 'xlsx' : 'unknown';
  const text = TEXT_EXTENSIONS[extension];
  return text && looksLikeText(bytes) ? text : 'unknown';
}
