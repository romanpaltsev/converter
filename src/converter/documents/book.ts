// Электронная книга — общее для FB2 и EPUB: метаданные, обложка, главы из блоков модели документа, картинки.
// Из неё пишутся FB2 (fb2.ts), EPUB (epub.ts), а для PDF и TXT она превращается в документ (bookToModel).

import type { Asset, Block, DocumentModel } from './blocks';

export interface Chapter {
  /** Заголовок главы (оглавление EPUB, заголовок секции FB2); null — без заголовка. */
  title: string | null;
  blocks: Block[];
}

export interface Book {
  title: string;
  authors: string[];
  /** Язык (ru, en…); пусто — не указан. */
  lang: string;
  annotation: Block[];
  /** id обложки в images или null. */
  cover: string | null;
  chapters: Chapter[];
  images: Map<string, Asset>;
  /** В исходнике были картинки, которые не перенесены (нет файла, неподдерживаемый формат). */
  lostImages: boolean;
}

/** Картинки, которые понимают все читалки и PDF. */
export const BOOK_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

/** Книга как документ: титул (название, авторы, обложка, аннотация), затем главы — каждая с новой страницы. */
export function bookToModel(book: Book): DocumentModel {
  const blocks: Block[] = [];
  if (book.cover) blocks.push({ type: 'image', id: book.cover, cover: true });
  blocks.push({ type: 'heading', level: 1, runs: [{ text: book.title }] });
  if (book.authors.length > 0) blocks.push({ type: 'paragraph', runs: [{ text: book.authors.join(', '), italic: true }] });
  blocks.push(...book.annotation);
  for (const chapter of book.chapters) {
    blocks.push({ type: 'pagebreak' });
    // заголовок главы — если его нет в самом тексте (в EPUB он обычно первым заголовком главы)
    const first = chapter.blocks.find((block) => block.type !== 'image');
    const titled = first?.type === 'heading';
    if (chapter.title && !titled) blocks.push({ type: 'heading', level: 2, runs: [{ text: chapter.title }] });
    blocks.push(...chapter.blocks);
  }
  return { blocks, images: book.lostImages, assets: book.images };
}

/** Первый заголовок блоков — название главы для оглавления. */
export function firstHeading(blocks: Block[]): string | null {
  const heading = blocks.find((block) => block.type === 'heading');
  return heading?.type === 'heading' ? heading.runs.map((run) => run.text).join('').trim() || null : null;
}

/** Base64 без пробелов и переводов строк (как в FB2) — в байты. */
export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/=]/g, '');
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** Байты — в base64 строками по 76 знаков (как принято в FB2). */
export function toBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return btoa(binary).replace(/.{76}/g, '$&\n');
}

/** MIME-тип картинки по сигнатуре (в книгах content-type бывает неверным). */
export function imageType(data: Uint8Array): string | null {
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png';
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'image/gif';
  return null;
}
