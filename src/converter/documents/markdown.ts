// Markdown в модель документа (для PDF и TXT) и в HTML. Разбор — marked (MIT): токены блоков и строк.
// Сырой HTML внутри Markdown в PDF идёт текстом без тегов; картинки не переносятся (флаг images).

import { type Token, type Tokens, marked } from 'marked';
import { type Block, type DocumentModel, type Run, mergeRuns } from './blocks';
import { decodeXmlEntities, escapeXml } from './text';

interface Style {
  bold?: boolean;
  italic?: boolean;
  link?: string;
}

/** Строчные токены во фрагменты с начертанием. */
function inline(tokens: Token[] | undefined, style: Style, state: { images: boolean }): Run[] {
  const runs: Run[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case 'strong':
        runs.push(...inline((token as Tokens.Strong).tokens, { ...style, bold: true }, state));
        break;
      case 'em':
        runs.push(...inline((token as Tokens.Em).tokens, { ...style, italic: true }, state));
        break;
      case 'del':
        runs.push(...inline((token as Tokens.Del).tokens, style, state));
        break;
      case 'link':
        runs.push(...inline((token as Tokens.Link).tokens, { ...style, link: (token as Tokens.Link).href }, state));
        break;
      case 'codespan':
        runs.push({ ...style, text: decodeXmlEntities((token as Tokens.Codespan).text), code: true });
        break;
      case 'br':
        runs.push({ ...style, text: '\n' });
        break;
      case 'image':
        state.images = true;
        break;
      case 'html':
        runs.push({ ...style, text: (token as Tokens.HTML).text.replace(/<[^>]*>/g, '') });
        break;
      default: {
        const text = token as Tokens.Text;
        if (text.tokens) runs.push(...inline(text.tokens, style, state));
        else runs.push({ ...style, text: decodeXmlEntities(text.text ?? '') });
      }
    }
  }
  return runs;
}

function blocks(tokens: Token[], depth: number, state: { images: boolean }, out: Block[]): void {
  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        out.push({ type: 'heading', level: (token as Tokens.Heading).depth, runs: mergeRuns(inline((token as Tokens.Heading).tokens, {}, state)) });
        break;
      case 'paragraph':
      case 'text':
        out.push({ type: 'paragraph', runs: mergeRuns(inline((token as Tokens.Paragraph).tokens, {}, state)) });
        break;
      case 'list': {
        const list = token as Tokens.List;
        list.items.forEach((item, index) => {
          // знаки — те, что есть в шрифте PDF (☑ и ☐ в Liberation Sans нет); вложенный пункт — «◦»
          const marker = list.ordered ? `${Number(list.start || 1) + index}.` : item.task ? (item.checked ? '■' : '□') : depth % 2 ? '◦' : '•';
          // первый абзац пункта — сам пункт, остальное (вложенные списки, абзацы) — следом, с отступом
          // у пункта-задачи первый токен — сам флажок (он уже в маркере)
          const [first, ...rest] = item.tokens.filter((child) => child.type !== 'checkbox');
          const runs = first && (first.type === 'text' || first.type === 'paragraph') ? inline((first as Tokens.Text).tokens ?? [first], {}, state) : [];
          out.push({ type: 'item', depth, marker, runs: mergeRuns(runs) });
          blocks(runs.length > 0 ? rest : item.tokens, depth + 1, state, out);
        });
        break;
      }
      case 'code':
        out.push({ type: 'code', text: (token as Tokens.Code).text });
        break;
      case 'blockquote': {
        const inner: Block[] = [];
        blocks((token as Tokens.Blockquote).tokens, depth, state, inner);
        for (const block of inner) out.push(block.type === 'paragraph' ? { type: 'quote', runs: block.runs } : block);
        break;
      }
      case 'hr':
        out.push({ type: 'rule' });
        break;
      case 'table': {
        const table = token as Tokens.Table;
        const row = (cells: Tokens.TableCell[], header: boolean) => ({ header, cells: cells.map((cell) => mergeRuns(inline(cell.tokens, header ? { bold: true } : {}, state))) });
        out.push({ type: 'table', rows: [row(table.header, true), ...table.rows.map((cells) => row(cells, false))] });
        break;
      }
      case 'html': {
        const text = (token as Tokens.HTML).text.replace(/<[^>]*>/g, '').trim();
        if (/<img\b/i.test((token as Tokens.HTML).text)) state.images = true;
        if (text) out.push({ type: 'paragraph', runs: [{ text: decodeXmlEntities(text) }] });
        break;
      }
      default:
        break;
    }
  }
}

export function markdownToModel(source: string): DocumentModel {
  const state = { images: false };
  const out: Block[] = [];
  blocks(marked.lexer(source), 0, state, out);
  return { blocks: out.filter((block) => block.type !== 'paragraph' || block.runs.length > 0), images: state.images };
}

/** Markdown в самостоятельную страницу HTML: заголовок — первый заголовок документа, аккуратные стили по умолчанию. */
export function markdownToHtml(source: string, fallbackTitle: string): string {
  const body = marked.parse(source, { async: false, gfm: true });
  const heading = marked.lexer(source).find((token) => token.type === 'heading') as Tokens.Heading | undefined;
  const title = escapeXml(heading ? decodeXmlEntities(heading.text) : fallbackTitle);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
body { max-width: 48rem; margin: 2rem auto; padding: 0 1rem; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2328; }
h1, h2, h3 { line-height: 1.25; }
pre, code { font-family: ui-monospace, "SFMono-Regular", Consolas, monospace; background: #f6f8fa; border-radius: 4px; }
pre { padding: 1rem; overflow: auto; }
code { padding: 0.1em 0.3em; }
pre code { padding: 0; }
blockquote { margin: 0; padding: 0 1rem; color: #59636e; border-left: 4px solid #d1d9e0; }
table { border-collapse: collapse; }
th, td { border: 1px solid #d1d9e0; padding: 0.4rem 0.8rem; }
img { max-width: 100%; }
</style>
</head>
<body>
${body}</body>
</html>
`;
}
