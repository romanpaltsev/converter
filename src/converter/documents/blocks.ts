// Модель текстового документа для PDF и TXT: блоки (заголовок, абзац, пункт списка, код, цитата, линия, таблица,
// строки TXT) из фрагментов текста с начертанием. Её строят разборщики Markdown (markdown.ts), HTML (html.ts) и TXT.

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** Код внутри строки — моноширинным, если хватает знаков (см. pdf.ts). */
  code?: boolean;
  /** Ссылка: в PDF — синим с подчёркиванием, в TXT — «текст (адрес)». */
  link?: string;
}

export type Block =
  | { type: 'heading'; level: number; runs: Run[] }
  | { type: 'paragraph'; runs: Run[] }
  /** Пункт списка: depth — вложенность (0 — верхний уровень), marker — «•» или «3.». */
  | { type: 'item'; depth: number; marker: string; runs: Run[] }
  | { type: 'code'; text: string }
  | { type: 'quote'; runs: Run[] }
  | { type: 'rule' }
  | { type: 'table'; rows: { header: boolean; cells: Run[][] }[] }
  /** TXT: строки как есть (переносы строк сохраняются). */
  | { type: 'lines'; text: string };

export interface DocumentModel {
  blocks: Block[];
  /** В исходнике были картинки — в PDF и TXT они не переносятся. */
  images: boolean;
}

/** Склеивает соседние фрагменты с одинаковым начертанием и убирает пустые. */
export function mergeRuns(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const run of runs) {
    if (run.text === '') continue;
    const last = out.at(-1);
    if (last && !!last.bold === !!run.bold && !!last.italic === !!run.italic && !!last.code === !!run.code && last.link === run.link) last.text += run.text;
    else out.push({ ...run });
  }
  return out;
}

const plain = (runs: Run[]) => runs.map((run) => (run.link && run.link !== run.text ? `${run.text} (${run.link})` : run.text)).join('');

/** Документ в обычный текст: заголовки и абзацы через пустую строку, списки с отступом, таблицы — через табуляцию. */
export function toPlainText(model: DocumentModel): string {
  const parts: string[] = [];
  for (const block of model.blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') parts.push(plain(block.runs));
    else if (block.type === 'item') parts.push(`${'  '.repeat(block.depth)}${block.marker} ${plain(block.runs)}`);
    else if (block.type === 'quote') parts.push(`> ${plain(block.runs)}`);
    else if (block.type === 'code' || block.type === 'lines') parts.push(block.text);
    else if (block.type === 'rule') parts.push('—'.repeat(20));
    else parts.push(block.rows.map((row) => row.cells.map(plain).join('\t')).join('\n'));
  }
  // пункты одного списка — без пустых строк между ними
  return (
    parts
      .map((part, index) => (index > 0 && model.blocks[index]!.type === 'item' && model.blocks[index - 1]!.type === 'item' ? `\n${part}` : `\n\n${part}`))
      .join('')
      .trimStart() + '\n'
  );
}
