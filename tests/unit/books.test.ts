import { describe, expect, test } from 'vitest';
import { toPlainText } from '../../src/converter/documents/blocks';
import { bookToModel } from '../../src/converter/documents/book';
import { parseEpub, writeEpub } from '../../src/converter/documents/epub';
import { parseFb2, readFb2Text, writeFb2 } from '../../src/converter/documents/fb2';
import { readZip } from '../../src/converter/documents/zip';
import { sniffFile } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

const fb2 = async () => parseFb2(await readFb2Text(fixture('docs/book.fb2')));
const titles = (book: Awaited<ReturnType<typeof fb2>>) => book.chapters.map((chapter) => chapter.title);

describe('электронные книги', () => {
  test('вид: EPUB — по mimetype в начале архива, FB2 — по расширению и <FictionBook, .fb2.zip — FB2', () => {
    expect(sniffFile('книга', fixture('docs/book.epub'))).toBe('epub');
    expect(sniffFile('book.fb2', fixture('docs/book.fb2').subarray(0, 1024))).toBe('fb2');
    expect(sniffFile('без-расширения', fixture('docs/book.fb2').subarray(0, 1024))).toBe('fb2');
    expect(sniffFile('book.fb2.zip', fixture('docs/book.fb2.zip'))).toBe('fb2');
    expect(sniffFile('archive.zip', fixture('docs/book.fb2.zip'))).toBe('unknown');
  });

  test('FB2 (windows-1251): метаданные, обложка, главы по секциям, вложенная часть, эпиграф, стихи, картинка, примечания', async () => {
    const book = await fb2();
    expect(book).toMatchObject({ title: 'Тестовая книга', authors: ['Антон Павлович Чехов', 'Редактор'], lang: 'ru', cover: 'cover.jpg', lostImages: false });
    expect(titles(book)).toEqual(['Глава первая', 'Глава вторая', 'Примечания']);
    expect(book.annotation).toEqual([{ type: 'paragraph', runs: [{ text: 'Краткая ' }, { text: 'аннотация', italic: true }, { text: ' книги.' }] }]);
    expect(book.chapters[0]!.blocks.map((block) => block.type)).toEqual(['heading', 'quote', 'quote', 'paragraph', 'image', 'heading', 'paragraph', 'paragraph', 'paragraph']);
    expect(book.chapters[0]!.blocks[5]).toEqual({ type: 'heading', level: 3, runs: [{ text: 'Вложенная часть' }] });
    expect([...book.images.keys()].sort()).toEqual(['cover.jpg', 'picture.png']);
    expect(book.images.get('picture.png')?.mime).toBe('image/png');
    // тот же файл в ZIP
    expect(titles(parseFb2(await readFb2Text(fixture('docs/book.fb2.zip'))))).toEqual(titles(book));
  });

  test('EPUB: метаданные OPF, обложка (страница-обложка не дублируется), главы по spine, путь с пробелом, пропавшая картинка', async () => {
    const book = await parseEpub(fixture('docs/book.epub'));
    expect(book).toMatchObject({ title: 'Книга EPUB', authors: ['Лев Толстой'], lang: 'ru', cover: 'OEBPS/Images/cover.jpg', lostImages: true });
    expect(book.chapters.map((chapter) => chapter.title)).toEqual(['Глава 1', 'Глава 2']);
    expect(book.chapters[0]!.blocks.map((block) => block.type)).toEqual(['heading', 'paragraph', 'image', 'paragraph']);
    expect(book.chapters[1]!.blocks.map((block) => block.type)).toEqual(['heading', 'quote', 'item', 'item']);
  });

  test('FB2 в EPUB и обратно: OPF, оглавление, обложка, картинки; текст и главы сохраняются', async () => {
    const book = await fb2();
    const epub = writeEpub(book, '2026-10-20T00:00:00Z', 'urn:uuid:test');
    const files = readZip(epub);
    expect([...files.keys()].slice(0, 3)).toEqual(['mimetype', 'META-INF/container.xml', 'OEBPS/content.opf']);
    expect([...files.keys()]).toEqual(expect.arrayContaining(['OEBPS/nav.xhtml', 'OEBPS/toc.ncx', 'OEBPS/images/img-1.jpg', 'OEBPS/images/img-2.png']));
    const opf = new TextDecoder().decode(await files.get('OEBPS/content.opf')!.read());
    expect(opf).toContain('<dc:creator>Антон Павлович Чехов</dc:creator>');
    expect(opf).toContain('properties="cover-image"');
    const back = await parseEpub(epub);
    expect(back).toMatchObject({ title: 'Тестовая книга', lostImages: false });
    expect(back.chapters.map((chapter) => chapter.title)).toEqual(['Глава первая', 'Глава вторая', 'Примечания']);
    expect(back.images.size).toBe(2);
  });

  test('EPUB в FB2 и обратно: авторы, обложка и картинки — в binary, текст сохраняется', async () => {
    const book = await parseEpub(fixture('docs/book.epub'));
    const xml = new TextDecoder().decode(writeFb2(book, '2026-10-20', 'test'));
    expect(xml).toContain('<first-name>Лев</first-name><last-name>Толстой</last-name>');
    expect(xml).toMatch(/<binary id="OEBPS_Images_cover.jpg" content-type="image\/jpeg">/);
    const back = parseFb2(xml);
    expect(back).toMatchObject({ title: 'Книга EPUB', authors: ['Лев Толстой'], cover: 'OEBPS_Images_cover.jpg' });
    expect(back.chapters.map((chapter) => chapter.title)).toEqual(['Глава 1', 'Глава 2']);
    expect(toPlainText(bookToModel(back))).toContain('Все счастливые семьи похожи друг на друга.');
  });

  test('книга в TXT: титул, аннотация, главы', async () => {
    const text = toPlainText(bookToModel(await fb2()));
    expect(text.startsWith('Тестовая книга\n\nАнтон Павлович Чехов, Редактор\n\nКраткая аннотация книги.\n\nГлава первая\n\n> Краткость — сестра таланта.')).toBe(true);
    expect(text).toContain('Второй абзац & символы <угловые>.');
    expect(text).toContain('Текст примечания.');
  });
});
