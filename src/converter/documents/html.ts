// HTML в модель документа (для PDF и TXT): htmlparser2 (MIT) — в worker'е нет DOMParser. Блочные теги начинают новый
// блок (заголовки, абзацы, пункты списков, pre, цитаты, таблицы, hr), строчные — начертание (b/strong, i/em, code, a).
// Пробелы схлопываются, как в браузере; script, style, head и т. п. пропускаются; картинки не переносятся.

import { Parser } from 'htmlparser2';
import { type Block, type DocumentModel, type Run, mergeRuns } from './blocks';

const SKIP = new Set(['script', 'style', 'head', 'title', 'template', 'noscript', 'svg', 'iframe', 'object', 'select', 'button']);
const BLOCK = new Set(['p', 'div', 'section', 'article', 'header', 'footer', 'main', 'nav', 'aside', 'figure', 'figcaption', 'address', 'dd', 'dt', 'form', 'fieldset', 'center', 'body', 'html']);

interface ListState {
  ordered: boolean;
  next: number;
}

export function htmlToModel(source: string): DocumentModel {
  const blocks: Block[] = [];
  let images = false;
  let skip = 0;
  let pre = 0;
  let bold = 0;
  let italic = 0;
  let code = 0;
  const links: string[] = [];
  const lists: ListState[] = [];
  let quote = 0;
  // текущий блок: что за блок и его фрагменты
  let current: { kind: 'paragraph' | 'heading' | 'item' | 'quote'; level?: number; marker?: string; depth?: number } | null = null;
  let runs: Run[] = [];
  let preText = '';
  let table: { header: boolean; cells: Run[][] }[] | null = null;
  let row: { header: boolean; cells: Run[][] } | null = null;
  let cell: Run[] | null = null;

  /** Закрыть текущий блок: пробелы по краям убираются, пустой блок не добавляется. */
  const flush = () => {
    const merged = trimRuns(mergeRuns(runs));
    runs = [];
    if (!current || merged.length === 0) {
      current = null;
      return;
    }
    if (current.kind === 'heading') blocks.push({ type: 'heading', level: current.level!, runs: merged });
    else if (current.kind === 'item') blocks.push({ type: 'item', depth: current.depth!, marker: current.marker!, runs: merged });
    else if (current.kind === 'quote' || quote > 0) blocks.push({ type: 'quote', runs: merged });
    else blocks.push({ type: 'paragraph', runs: merged });
    current = null;
  };
  const start = (kind: NonNullable<typeof current>['kind'], extra: Partial<NonNullable<typeof current>> = {}) => {
    flush();
    current = { kind, ...extra };
  };

  const parser = new Parser(
    {
      onopentag(name, attrs) {
        if (skip > 0 || SKIP.has(name)) {
          skip++;
          return;
        }
        if (name === 'img') images = true;
        if (pre > 0) return;
        if (/^h[1-6]$/.test(name)) start('heading', { level: Number(name[1]) });
        else if (name === 'ul' || name === 'ol') {
          flush();
          lists.push({ ordered: name === 'ol', next: Number(attrs.start ?? 1) || 1 });
        } else if (name === 'li') {
          const list = lists.at(-1);
          const depth = Math.max(0, lists.length - 1);
          start('item', { depth, marker: list?.ordered ? `${list.next++}.` : depth % 2 ? '◦' : '•' });
        } else if (name === 'pre') {
          flush();
          pre++;
          preText = '';
        } else if (name === 'blockquote') {
          flush();
          quote++;
        } else if (name === 'hr') {
          flush();
          blocks.push({ type: 'rule' });
        } else if (name === 'br') runs.push(styled('\n'));
        else if (name === 'table') {
          flush();
          table = [];
        } else if (name === 'tr' && table) row = { header: false, cells: [] };
        else if ((name === 'td' || name === 'th') && row) {
          cell = [];
          if (name === 'th') row.header = true;
          if (name === 'th') bold++;
        } else if (name === 'b' || name === 'strong') bold++;
        else if (name === 'i' || name === 'em') italic++;
        else if (name === 'code' || name === 'kbd' || name === 'samp') code++;
        else if (name === 'a') links.push(attrs.href ?? '');
        // блок сразу внутри пустого блока (<li><p>…) — продолжает его: пункт списка не теряет маркер
        else if (BLOCK.has(name) && !(current && runs.length === 0)) start(quote > 0 ? 'quote' : 'paragraph');
      },
      ontext(text) {
        if (skip > 0) return;
        if (pre > 0) {
          preText += text;
          return;
        }
        const run = styled(text.replace(/\s+/g, ' '));
        if (cell) cell.push(run);
        else {
          current ??= { kind: quote > 0 ? 'quote' : 'paragraph' };
          runs.push(run);
        }
      },
      onclosetag(name) {
        if (skip > 0) {
          skip--;
          return;
        }
        if (name === 'pre' && pre > 0) {
          pre--;
          if (pre === 0) blocks.push({ type: 'code', text: preText.replace(/^\n/, '').replace(/\s+$/, '') });
          return;
        }
        if (pre > 0) return;
        if (/^h[1-6]$/.test(name) || name === 'li' || BLOCK.has(name)) flush();
        else if (name === 'ul' || name === 'ol') {
          flush();
          lists.pop();
        } else if (name === 'blockquote') {
          flush();
          quote = Math.max(0, quote - 1);
        } else if ((name === 'td' || name === 'th') && row && cell) {
          row.cells.push(trimRuns(mergeRuns(cell)));
          cell = null;
          if (name === 'th') bold = Math.max(0, bold - 1);
        } else if (name === 'tr' && table && row) {
          if (row.cells.length > 0) table.push(row);
          row = null;
        } else if (name === 'table' && table) {
          if (table.length > 0) blocks.push({ type: 'table', rows: table });
          table = null;
        } else if (name === 'b' || name === 'strong') bold = Math.max(0, bold - 1);
        else if (name === 'i' || name === 'em') italic = Math.max(0, italic - 1);
        else if (name === 'code' || name === 'kbd' || name === 'samp') code = Math.max(0, code - 1);
        else if (name === 'a') links.pop();
      },
    },
    { decodeEntities: true, lowerCaseTags: true },
  );

  function styled(text: string): Run {
    const link = links.at(-1);
    return { text, ...(bold > 0 ? { bold: true } : {}), ...(italic > 0 ? { italic: true } : {}), ...(code > 0 ? { code: true } : {}), ...(link ? { link } : {}) };
  }

  parser.write(source);
  parser.end();
  flush();
  return { blocks, images };
}

/** Пробелы в начале первого и в конце последнего фрагмента (и вокруг переводов строк) — как в браузере. */
function trimRuns(runs: Run[]): Run[] {
  const out = runs.map((run) => ({ ...run, text: run.text.replace(/ *\n */g, '\n') }));
  if (out[0]) out[0].text = out[0].text.replace(/^ +/, '');
  const last = out.at(-1);
  if (last) last.text = last.text.replace(/ +$/, '');
  return out.filter((run) => run.text !== '');
}
