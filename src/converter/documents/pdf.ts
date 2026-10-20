// Вёрстка текстового документа в PDF (pdf-lib + fontkit, MIT): A4, поля 20 мм, Liberation Sans (кириллица, латиница,
// греческий; шрифт pdf.js, лицензия GPL с исключением для шрифтов — встраивание в документ разрешено), подмножество
// шрифта встраивается. Перенос по словам с учётом начертания; код — Courier, если в нём только ASCII (иначе
// Liberation Sans). Метаданных документа (Info) нет — как у «Изображений в PDF». Символы, которых нет в шрифте
// (иероглифы, эмодзи), заменяются на «?» — warning missing-glyphs.

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, type PDFFont, type PDFPage, StandardFonts, rgb } from 'pdf-lib';
import boldUrl from 'pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf?url';
import boldItalicUrl from 'pdfjs-dist/standard_fonts/LiberationSans-BoldItalic.ttf?url';
import italicUrl from 'pdfjs-dist/standard_fonts/LiberationSans-Italic.ttf?url';
import regularUrl from 'pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf?url';
import type { WarningCode } from '../pipeline/types';
import type { Block, DocumentModel, Run } from './blocks';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56.69; // 20 мм
const CONTENT = PAGE_WIDTH - 2 * MARGIN;
const SIZE = 11;
const LEADING = 1.45;
const HEADING_SIZES = [22, 18, 15, 13, 12, 11];
const TEXT = rgb(0.12, 0.14, 0.16);
const MUTED = rgb(0.38, 0.4, 0.44);
const LINK = rgb(0.1, 0.33, 0.8);
const RULE = rgb(0.82, 0.84, 0.87);
const CODE_BG = rgb(0.96, 0.97, 0.98);
const HEADER_BG = rgb(0.95, 0.96, 0.97);

/** Шрифты загружаются один раз на worker (fetch хешированных файлов из /_astro/). */
let fontBytes: Promise<Uint8Array[]> | null = null;

function loadFonts(): Promise<Uint8Array[]> {
  fontBytes ??= Promise.all(
    [regularUrl, boldUrl, italicUrl, boldItalicUrl].map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`шрифт ${url}: ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    }),
  );
  fontBytes.catch(() => (fontBytes = null));
  return fontBytes;
}

interface Piece {
  text: string;
  font: PDFFont;
  size: number;
  width: number;
  run: Run;
}

interface Line {
  pieces: Piece[];
  width: number;
}

class Layout {
  private page!: PDFPage;
  private y = 0;
  pages = 0;
  readonly warnings = new Set<WarningCode>();

  constructor(
    private readonly doc: PDFDocument,
    private readonly fonts: { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont; mono: PDFFont; monoBold: PDFFont },
    private readonly hasGlyph: (codePoint: number) => boolean,
  ) {
    this.newPage();
  }

  private newPage(): void {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
    this.pages++;
  }

  /** Места на странице не хватает — новая страница. */
  private ensure(height: number): void {
    if (this.y - height < MARGIN && this.y < PAGE_HEIGHT - MARGIN) this.newPage();
  }

  private gap(points: number): void {
    // в начале страницы отступ не нужен
    if (this.y < PAGE_HEIGHT - MARGIN) this.y -= points;
  }

  /** Знаки, которых нет в шрифте, — «?»; управляющие — пробел. */
  private clean(text: string): string {
    let out = '';
    for (const char of text.replace(/\t/g, '    ')) {
      const code = char.codePointAt(0)!;
      if (code < 0x20) out += ' ';
      else if (this.hasGlyph(code)) out += char;
      else {
        this.warnings.add('missing-glyphs');
        out += '?';
      }
    }
    return out;
  }

  private fontFor(run: Run, text: string): PDFFont {
    // Courier (стандартный шрифт PDF) — только ASCII; иначе код набирается обычным шрифтом
    if (run.code && /^[\x20-\x7e]*$/.test(text)) return run.bold ? this.fonts.monoBold : this.fonts.mono;
    if (run.bold && run.italic) return this.fonts.boldItalic;
    if (run.bold) return this.fonts.bold;
    if (run.italic) return this.fonts.italic;
    return this.fonts.regular;
  }

  /**
   * Фрагменты — в строки шириной не больше width: перенос по пробелам, слишком длинное слово — по знакам.
   * indent — отступ в начале исходной строки сохраняется (код, TXT); у перенесённых строк пробелы в начале не нужны.
   */
  private wrap(runs: Run[], size: number, width: number, indent = false): Line[] {
    const lines: Line[] = [];
    let line: Line = { pieces: [], width: 0 };
    const push = () => {
      // пробелы в конце строки не занимают места (строка из одних пробелов — пустая строка)
      while (line.pieces.length > 0 && line.pieces.at(-1)!.text.trim() === '') line.width -= line.pieces.pop()!.width;
      lines.push(line);
      line = { pieces: [], width: 0 };
    };
    let sourceLineStart = true;
    for (const run of runs) {
      for (const paragraph of run.text.split('\n').map((part, index) => ({ part, index }))) {
        if (paragraph.index > 0) {
          push();
          sourceLineStart = true;
        }
        for (const token of paragraph.part.split(/(\s+)/)) {
          if (token === '') continue;
          const text = this.clean(token);
          const font = this.fontFor(run, text);
          const pieceWidth = font.widthOfTextAtSize(text, size);
          const space = text.trim() === '';
          const keep = indent && sourceLineStart;
          sourceLineStart = false;
          if (space && line.pieces.length === 0 && !keep) continue;
          if (line.width + pieceWidth > width && !space && line.pieces.length > 0) push();
          if (pieceWidth <= width || space) {
            line.pieces.push({ text, font, size, width: pieceWidth, run });
            line.width += pieceWidth;
            continue;
          }
          // слово шире строки — по знакам
          let chunk = '';
          for (const char of text) {
            const next = chunk + char;
            if (font.widthOfTextAtSize(next, size) > width - line.width && chunk) {
              const w = font.widthOfTextAtSize(chunk, size);
              line.pieces.push({ text: chunk, font, size, width: w, run });
              line.width += w;
              push();
              chunk = char;
            } else chunk = next;
          }
          if (chunk) {
            const w = font.widthOfTextAtSize(chunk, size);
            line.pieces.push({ text: chunk, font, size, width: w, run });
            line.width += w;
          }
        }
      }
    }
    if (line.pieces.length > 0 || lines.length === 0) push();
    return lines;
  }

  /** Строки абзаца с левого края x; color — цвет текста (ссылки — синие с подчёркиванием). */
  private drawLines(lines: Line[], x: number, size: number, color = TEXT, onLine?: (top: number, height: number) => void): void {
    const height = size * LEADING;
    for (const line of lines) {
      this.ensure(height);
      onLine?.(this.y, height);
      const baseline = this.y - size * 1.05;
      let cursor = x;
      for (const piece of line.pieces) {
        const pieceColor = piece.run.link ? LINK : color;
        if (piece.run.code) this.page.drawRectangle({ x: cursor - 1, y: baseline - size * 0.25, width: piece.width + 2, height: size * 1.2, color: CODE_BG });
        this.page.drawText(piece.text, { x: cursor, y: baseline, size: piece.size, font: piece.font, color: pieceColor });
        if (piece.run.link && piece.text.trim()) {
          this.page.drawLine({ start: { x: cursor, y: baseline - 1.5 }, end: { x: cursor + piece.width, y: baseline - 1.5 }, thickness: 0.5, color: LINK });
        }
        cursor += piece.width;
      }
      this.y -= height;
    }
  }

  block(block: Block, previous: Block | undefined): void {
    switch (block.type) {
      case 'heading': {
        const size = HEADING_SIZES[Math.min(block.level, 6) - 1]!;
        this.gap(size * 0.8);
        const lines = this.wrap(block.runs.map((run) => ({ ...run, bold: true })), size, CONTENT);
        // заголовок не остаётся последней строкой страницы: вместе с ним — хотя бы две строки текста
        this.ensure(lines.length * size * LEADING + 2 * SIZE * LEADING);
        this.drawLines(lines, MARGIN, size);
        this.y -= size * 0.25;
        break;
      }
      case 'paragraph':
        if (previous && previous.type !== 'heading') this.gap(SIZE * 0.6);
        this.drawLines(this.wrap(block.runs, SIZE, CONTENT), MARGIN, SIZE);
        break;
      case 'item': {
        const indent = 18 + block.depth * 18;
        if (previous && previous.type !== 'item' && previous.type !== 'heading') this.gap(SIZE * 0.6);
        else if (previous?.type === 'item') this.gap(SIZE * 0.15);
        const lines = this.wrap(block.runs, SIZE, CONTENT - indent);
        this.ensure(SIZE * LEADING);
        const marker = this.clean(block.marker);
        const width = this.fonts.regular.widthOfTextAtSize(marker, SIZE);
        this.page.drawText(marker, { x: MARGIN + indent - width - 6, y: this.y - SIZE * 1.05, size: SIZE, font: this.fonts.regular, color: TEXT });
        this.drawLines(lines, MARGIN + indent, SIZE);
        break;
      }
      case 'quote': {
        this.gap(SIZE * 0.6);
        this.drawLines(this.wrap(block.runs, SIZE, CONTENT - 16), MARGIN + 16, SIZE, MUTED, (top, height) =>
          this.page.drawRectangle({ x: MARGIN + 2, y: top - height, width: 3, height, color: RULE }),
        );
        break;
      }
      case 'code': {
        const size = 9.5;
        this.gap(SIZE * 0.6);
        const runs: Run[] = [{ text: block.text, code: true }];
        const lines = this.wrap(runs, size, CONTENT - 16, true).map((line) => ({ ...line, pieces: line.pieces.map((piece) => ({ ...piece, run: { ...piece.run, code: false } })) }));
        this.drawLines(lines, MARGIN + 8, size, TEXT, (top, height) => this.page.drawRectangle({ x: MARGIN, y: top - height, width: CONTENT, height, color: CODE_BG }));
        break;
      }
      case 'rule':
        this.gap(SIZE * 0.8);
        this.ensure(SIZE);
        this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: MARGIN + CONTENT, y: this.y }, thickness: 0.75, color: RULE });
        this.y -= SIZE * 0.8;
        break;
      case 'lines':
        for (const text of block.text.split('\n')) this.drawLines(this.wrap([{ text }], SIZE, CONTENT, true), MARGIN, SIZE);
        break;
      case 'table':
        this.gap(SIZE * 0.8);
        this.table(block.rows);
        break;
    }
  }

  /** Таблица: ширины столбцов — по содержимому, если не помещается — пропорционально; рамки, шапка с фоном. */
  private table(rows: { header: boolean; cells: Run[][] }[]): void {
    const size = 10;
    const padding = 5;
    const columns = Math.max(...rows.map((row) => row.cells.length));
    const natural = Array.from({ length: columns }, () => 20);
    for (const row of rows) {
      row.cells.forEach((cell, index) => {
        const width = this.wrap(cell, size, Number.MAX_SAFE_INTEGER).reduce((max, line) => Math.max(max, line.width), 0);
        natural[index] = Math.max(natural[index]!, width + 2 * padding);
      });
    }
    const total = natural.reduce((sum, width) => sum + width, 0);
    const widths = total <= CONTENT ? natural : natural.map((width) => Math.max(CONTENT / columns / 2, (width / total) * CONTENT));
    const scale = Math.min(1, CONTENT / widths.reduce((sum, width) => sum + width, 0));
    const columnWidths = widths.map((width) => width * scale);
    const lineHeight = size * LEADING;
    for (const row of rows) {
      const cells = columnWidths.map((width, index) => this.wrap(row.cells[index] ?? [], size, width - 2 * padding));
      const height = Math.max(...cells.map((lines) => lines.length)) * lineHeight + 2 * padding;
      this.ensure(height);
      let x = MARGIN;
      cells.forEach((lines, index) => {
        const width = columnWidths[index]!;
        this.page.drawRectangle({ x, y: this.y - height, width, height, borderColor: RULE, borderWidth: 0.75, ...(row.header ? { color: HEADER_BG } : {}) });
        let top = this.y - padding;
        for (const line of lines) {
          let cursor = x + padding;
          for (const piece of line.pieces) {
            this.page.drawText(piece.text, { x: cursor, y: top - size * 1.05, size, font: piece.font, color: piece.run.link ? LINK : TEXT });
            cursor += piece.width;
          }
          top -= lineHeight;
        }
        x += width;
      });
      this.y -= height;
    }
  }
}

export async function modelToPdf(model: DocumentModel): Promise<{ bytes: Uint8Array; pages: number; warnings: WarningCode[] }> {
  const [regularBytes, boldBytes, italicBytes, boldItalicBytes] = await loadFonts();
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.registerFontkit(fontkit);
  const embed = (bytes: Uint8Array) => doc.embedFont(bytes, { subset: true });
  const fonts = {
    regular: await embed(regularBytes!),
    bold: await embed(boldBytes!),
    italic: await embed(italicBytes!),
    boldItalic: await embed(boldItalicBytes!),
    mono: await doc.embedFont(StandardFonts.Courier),
    monoBold: await doc.embedFont(StandardFonts.CourierBold),
  };
  const glyphs = fontkit.create(regularBytes!);
  const layout = new Layout(doc, fonts, (code) => glyphs.hasGlyphForCodePoint(code));
  model.blocks.forEach((block, index) => layout.block(block, model.blocks[index - 1]));
  const warnings = [...layout.warnings];
  if (model.images) warnings.push('images-dropped');
  return { bytes: await doc.save(), pages: layout.pages, warnings };
}
