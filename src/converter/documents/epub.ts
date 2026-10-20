// EPUB: разбор (container.xml → OPF → spine; главы XHTML — тот же разбор HTML, что у «HTML в PDF», картинки — из
// архива) и запись EPUB 3 (nav.xhtml и toc.ncx — для новых и старых читалок, обложка, свой простой CSS, без сжатия).

import { Parser } from 'htmlparser2';
import { ConvertError } from '../pipeline/types';
import type { Block, Run } from './blocks';
import { BOOK_IMAGE_TYPES, type Book, type Chapter, firstHeading, imageType } from './book';
import { htmlToModel } from './html';
import { decodeText, escapeXml } from './text';
import { readZip, writeZip } from './zip';

/** Путь файла в архиве относительно файла base (без якоря, с декодированием %XX). */
function resolvePath(base: string, href: string): string {
  const clean = decodeURIComponent(href.split('#')[0]!.split('?')[0]!);
  const parts = clean.startsWith('/') ? [] : base.split('/').slice(0, -1);
  for (const part of clean.split('/')) {
    if (part === '..') parts.pop();
    else if (part !== '.' && part !== '') parts.push(part);
  }
  return parts.join('/');
}

interface Opf {
  title: string;
  authors: string[];
  lang: string;
  manifest: Map<string, { href: string; type: string; properties: string }>;
  spine: string[];
  coverId: string | null;
}

/** OPF разбирается тем же htmlparser2 в режиме XML: метаданные Dublin Core, manifest, spine, обложка. */
function parseOpf(xml: string): Opf {
  const opf: Opf = { title: '', authors: [], lang: '', manifest: new Map(), spine: [], coverId: null };
  let text = '';
  const parser = new Parser(
    {
      onopentag(name, attrs) {
        text = '';
        const local = name.replace(/^.*:/, '');
        if (local === 'item' && attrs.id && attrs.href) opf.manifest.set(attrs.id, { href: attrs.href, type: attrs['media-type'] ?? '', properties: attrs.properties ?? '' });
        else if (local === 'itemref' && attrs.idref && attrs.linear !== 'no') opf.spine.push(attrs.idref);
        else if (local === 'meta' && attrs.name === 'cover' && attrs.content) opf.coverId ??= attrs.content;
      },
      ontext(value) {
        text += value;
      },
      onclosetag(name) {
        const value = text.replace(/\s+/g, ' ').trim();
        if (name === 'dc:title' && !opf.title) opf.title = value;
        else if (name === 'dc:creator' && value) opf.authors.push(value);
        else if (name === 'dc:language' && !opf.lang) opf.lang = value;
        text = '';
      },
    },
    { xmlMode: true, decodeEntities: true },
  );
  parser.write(xml);
  parser.end();
  for (const [id, item] of opf.manifest) if (item.properties.split(/\s+/).includes('cover-image')) opf.coverId = id;
  return opf;
}

export async function parseEpub(bytes: Uint8Array): Promise<Book> {
  const zip = readZip(bytes);
  const read = async (path: string) => {
    const entry = zip.get(path);
    return entry ? entry.read() : null;
  };
  const container = await read('META-INF/container.xml');
  const opfPath = container ? new TextDecoder().decode(container).match(/full-path\s*=\s*"([^"]+)"/)?.[1] : undefined;
  const opfBytes = opfPath ? await read(opfPath) : null;
  if (!opfPath || !opfBytes) throw new ConvertError('decode-failed', 'epub: нет OPF');
  const opf = parseOpf(decodeText(opfBytes).text);
  const book: Book = { title: opf.title, authors: opf.authors, lang: opf.lang, annotation: [], cover: null, chapters: [], images: new Map(), lostImages: false };

  /** Картинка по пути в архиве: JPEG и PNG — в книгу (id — путь), остальное и отсутствующее — потеряно. */
  const pending = new Set<string>();
  const loadImage = async (path: string) => {
    const data = await read(path);
    const mime = data ? imageType(data) : null;
    if (data && mime && BOOK_IMAGE_TYPES.has(mime)) book.images.set(path, { mime, data });
  };

  for (const idref of opf.spine) {
    const item = opf.manifest.get(idref);
    if (!item || item.properties.split(/\s+/).includes('nav')) continue;
    const path = resolvePath(opfPath, item.href);
    const data = await read(path);
    if (!data) continue;
    const model = htmlToModel(decodeText(data).text, (src) => {
      const image = resolvePath(path, src);
      if (!zip.has(image)) return null;
      pending.add(image);
      return image;
    });
    if (model.images) book.lostImages = true;
    if (model.blocks.length > 0) book.chapters.push({ title: firstHeading(model.blocks), blocks: model.blocks });
  }
  for (const path of pending) await loadImage(path);
  const coverItem = opf.coverId ? opf.manifest.get(opf.coverId) : undefined;
  if (coverItem) {
    const path = resolvePath(opfPath, coverItem.href);
    await loadImage(path);
    if (book.images.has(path)) book.cover = path;
  }
  // картинки, которые не загрузились (нет файла, не JPEG и не PNG), — убрать из текста
  for (const chapter of book.chapters) {
    chapter.blocks = chapter.blocks.filter((block) => {
      if (block.type !== 'image' || book.images.has(block.id)) return true;
      book.lostImages = true;
      return false;
    });
  }
  // титульная страница (первая глава с заголовком-названием книги): её абзацы — аннотация, строка авторов не нужна
  const first = book.chapters[0];
  if (first && book.title && first.title?.toLowerCase() === book.title.toLowerCase()) {
    book.chapters.shift();
    if (book.annotation.length === 0) {
      const authors = book.authors.join(', ');
      book.annotation = first.blocks.filter((block) => block.type === 'paragraph' && block.runs.map((run) => run.text).join('') !== authors);
    }
  }
  // страница-обложка (одна картинка — та же обложка) уже есть на титуле
  book.chapters = book.chapters.filter((chapter) => chapter.blocks.length > 0 && !(chapter.blocks.length === 1 && chapter.blocks[0]!.type === 'image' && chapter.blocks[0]!.id === book.cover));
  if (book.chapters.length === 0 && !book.cover) throw new ConvertError('decode-failed', 'epub: пустая книга');
  if (!book.title) book.title = book.chapters[0]?.title ?? 'Без названия';
  return book;
}

// ---------------------------------------------------------------- запись

function inline(runs: Run[]): string {
  return runs
    .map((run) => {
      let out = escapeXml(run.text).replace(/\n/g, '<br/>');
      if (run.code) out = `<code>${out}</code>`;
      if (run.italic) out = `<em>${out}</em>`;
      if (run.bold) out = `<strong>${out}</strong>`;
      if (run.link) out = `<a href="${escapeXml(run.link)}">${out}</a>`;
      return out;
    })
    .join('');
}

function blockXhtml(block: Block, images: Map<string, string>): string {
  switch (block.type) {
    case 'heading': {
      const level = Math.min(6, Math.max(1, block.level));
      return `<h${level}>${inline(block.runs)}</h${level}>`;
    }
    case 'paragraph':
      return `<p>${inline(block.runs)}</p>`;
    case 'item':
      return `<p class="item depth-${Math.min(block.depth, 5)}"><span class="marker">${escapeXml(block.marker)}</span> ${inline(block.runs)}</p>`;
    case 'quote':
      return `<blockquote><p>${inline(block.runs)}</p></blockquote>`;
    case 'code':
      return `<pre><code>${escapeXml(block.text)}</code></pre>`;
    case 'lines':
      return block.text
        .split('\n')
        .map((line) => (line.trim() ? `<p>${escapeXml(line)}</p>` : '<p class="empty">&#160;</p>'))
        .join('\n');
    case 'rule':
      return '<hr/>';
    case 'table':
      return `<table>${block.rows.map((row) => `<tr>${row.cells.map((cell) => (row.header ? `<th>${inline(cell)}</th>` : `<td>${inline(cell)}</td>`)).join('')}</tr>`).join('')}</table>`;
    case 'image': {
      const file = images.get(block.id);
      return file ? `<div class="image"><img src="../images/${file}" alt=""/></div>` : '';
    }
    case 'pagebreak':
      return '';
  }
}

const CSS = `body { margin: 0 5%; font-family: serif; line-height: 1.5; }
h1, h2, h3, h4, h5, h6 { font-family: sans-serif; line-height: 1.25; margin: 1.2em 0 0.6em; }
p { margin: 0; text-indent: 1.5em; text-align: justify; }
p.item, p.empty, .title p, blockquote p { text-indent: 0; }
p.item { margin-left: 1.5em; }
p.depth-1 { margin-left: 3em; } p.depth-2 { margin-left: 4.5em; } p.depth-3, p.depth-4, p.depth-5 { margin-left: 6em; }
.marker { display: inline-block; min-width: 1.2em; }
blockquote { margin: 1em 2em; font-style: italic; }
pre { white-space: pre-wrap; font-size: 0.85em; }
table { border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #999; padding: 0.2em 0.5em; }
.image { text-align: center; margin: 1em 0; }
.image img { max-width: 100%; }
.title { text-align: center; margin-top: 20%; }
.title .authors { font-style: italic; margin-top: 1em; }
.annotation { margin-top: 2em; text-align: left; }
`;

function xhtml(title: string, lang: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="UTF-8"/><title>${escapeXml(title)}</title><link rel="stylesheet" type="text/css" href="../style.css"/></head>
<body>
${body}
</body>
</html>
`;
}

/** EPUB 3: identifier — urn:uuid, modified — дата в формате ISO без долей секунды. */
export function writeEpub(book: Book, modified: string, identifier: string): Uint8Array {
  const encode = (text: string) => new TextEncoder().encode(text);
  const lang = book.lang || (/[а-яё]/i.test(book.title) ? 'ru' : 'en');
  // картинки — images/img-N.jpg|png; только JPEG и PNG
  const images = new Map<string, string>();
  for (const [id, asset] of book.images) {
    if (!BOOK_IMAGE_TYPES.has(asset.mime)) continue;
    images.set(id, `img-${images.size + 1}.${asset.mime === 'image/png' ? 'png' : 'jpg'}`);
  }
  const chapterTitle = (chapter: Chapter, index: number) => chapter.title ?? firstHeading(chapter.blocks) ?? `${lang === 'ru' ? 'Глава' : 'Chapter'} ${index + 1}`;
  const coverFile = book.cover ? images.get(book.cover) : undefined;

  const titleBody = `<div class="title">
${coverFile ? `<div class="image"><img src="../images/${coverFile}" alt=""/></div>` : ''}
<h1>${escapeXml(book.title)}</h1>
${book.authors.length > 0 ? `<p class="authors">${escapeXml(book.authors.join(', '))}</p>` : ''}
${book.annotation.length > 0 ? `<div class="annotation">${book.annotation.map((block) => blockXhtml(block, images)).join('\n')}</div>` : ''}
</div>`;
  const chapters = book.chapters.map((chapter, index) => ({
    file: `text/chapter-${index + 1}.xhtml`,
    title: chapterTitle(chapter, index),
    body: chapter.blocks.map((block) => blockXhtml(block, images)).join('\n'),
  }));
  // глава начинается со своего заголовка: если первым идёт не он (нет заголовка или это заголовок части, как «1»
  // у примечаний) — добавляем, чтобы глава не начиналась «с середины» и оглавление читалось обратно
  for (const [index, chapter] of chapters.entries()) {
    if (firstHeading(book.chapters[index]!.blocks.slice(0, 1)) !== chapter.title) chapter.body = `<h2>${escapeXml(chapter.title)}</h2>\n${chapter.body}`;
  }

  const manifest = [
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="css" href="style.css" media-type="text/css"/>',
    '<item id="title" href="text/title.xhtml" media-type="application/xhtml+xml"/>',
    ...chapters.map((chapter, index) => `<item id="chapter-${index + 1}" href="${chapter.file}" media-type="application/xhtml+xml"/>`),
    ...[...book.images]
      .filter(([id]) => images.has(id))
      .map(([id, asset]) => {
        const file = images.get(id)!;
        return `<item id="${file.replace('.', '-')}" href="images/${file}" media-type="${asset.mime}"${file === coverFile ? ' properties="cover-image"' : ''}/>`;
      }),
  ].join('\n    ');
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${identifier}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    ${book.authors.map((author) => `<dc:creator>${escapeXml(author)}</dc:creator>`).join('\n    ')}
    <dc:language>${escapeXml(lang)}</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
    ${coverFile ? `<meta name="cover" content="${coverFile.replace('.', '-')}"/>` : ''}
  </metadata>
  <manifest>
    ${manifest}
  </manifest>
  <spine toc="ncx">
    <itemref idref="title"/>
    ${chapters.map((_, index) => `<itemref idref="chapter-${index + 1}"/>`).join('\n    ')}
  </spine>
</package>
`;
  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="UTF-8"/><title>${escapeXml(book.title)}</title></head>
<body>
<nav epub:type="toc" id="toc"><ol>
${chapters.map((chapter) => `<li><a href="${chapter.file}">${escapeXml(chapter.title)}</a></li>`).join('\n')}
</ol></nav>
</body>
</html>
`;
  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head><meta name="dtb:uid" content="${identifier}"/></head>
<docTitle><text>${escapeXml(book.title)}</text></docTitle>
<navMap>
${chapters.map((chapter, index) => `<navPoint id="nav-${index + 1}" playOrder="${index + 1}"><navLabel><text>${escapeXml(chapter.title)}</text></navLabel><content src="${chapter.file}"/></navPoint>`).join('\n')}
</navMap>
</ncx>
`;
  return writeZip([
    // mimetype — первым и без сжатия: по нему читалки узнают EPUB
    { name: 'mimetype', data: encode('application/epub+zip') },
    {
      name: 'META-INF/container.xml',
      data: encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>\n`,
      ),
    },
    { name: 'OEBPS/content.opf', data: encode(opf) },
    { name: 'OEBPS/nav.xhtml', data: encode(nav) },
    { name: 'OEBPS/toc.ncx', data: encode(ncx) },
    { name: 'OEBPS/style.css', data: encode(CSS) },
    { name: 'OEBPS/text/title.xhtml', data: encode(xhtml(book.title, lang, titleBody)) },
    ...chapters.map((chapter) => ({ name: `OEBPS/${chapter.file}`, data: encode(xhtml(chapter.title, lang, chapter.body)) })),
    ...[...book.images].filter(([id]) => images.has(id)).map(([id, asset]) => ({ name: `OEBPS/images/${images.get(id)}`, data: asset.data })),
  ]);
}
