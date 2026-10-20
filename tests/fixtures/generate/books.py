#!/usr/bin/env python3
# Фикстуры электронных книг (tests/fixtures/docs/): book.fb2 (windows-1251, обложка, вложенные секции, эпиграф, стихи,
# иллюстрация, примечания), book.fb2.zip (тот же файл в ZIP) и book.epub (EPUB 2: OPF в OEBPS/, обложка через
# <meta name="cover">, две главы, картинка, nav нет — только NCX). Картинки — gray.jpg и gray.png из tests/fixtures.
# Запуск: python3 tests/fixtures/generate/books.py
import base64, pathlib, zipfile
root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'docs'
jpg = (root / 'gray.jpg').read_bytes()
png = (root / 'gray.png').read_bytes()
b64 = lambda data: '\n'.join(base64.b64encode(data).decode()[i:i + 76] for i in range(0, len(base64.b64encode(data)), 76))
fb2 = f'''<?xml version="1.0" encoding="windows-1251"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description>
<title-info>
<genre>prose_classic</genre>
<author><first-name>Антон</first-name><middle-name>Павлович</middle-name><last-name>Чехов</last-name></author>
<author><nickname>Редактор</nickname></author>
<book-title>Тестовая книга</book-title>
<annotation><p>Краткая <emphasis>аннотация</emphasis> книги.</p></annotation>
<coverpage><image l:href="#cover.jpg"/></coverpage>
<lang>ru</lang>
</title-info>
<document-info><author><nickname>test</nickname></author><date>2024</date><id>test-book</id><version>1.0</version></document-info>
</description>
<body>
<title><p>Тестовая книга</p></title>
<section>
<title><p>Глава первая</p></title>
<epigraph><p>Краткость — сестра таланта.</p><text-author>А. П. Чехов</text-author></epigraph>
<p>Первый абзац с <strong>жирным</strong> и <emphasis>курсивом</emphasis>.<a l:href="#n1" type="note">[1]</a></p>
<image l:href="#picture.png"/>
<section>
<title><p>Вложенная часть</p></title>
<p>Текст вложенной части.</p>
<poem><stanza><v>Строка стиха один,</v><v>строка стиха два.</v></stanza></poem>
</section>
</section>
<section>
<title><p>Глава вторая</p></title>
<p>Второй абзац &amp; символы &lt;угловые&gt;.</p>
<empty-line/>
<p>После пустой строки.</p>
</section>
</body>
<body name="notes">
<section id="n1"><title><p>1</p></title><p>Текст примечания.</p></section>
</body>
<binary id="cover.jpg" content-type="image/jpeg">{b64(jpg)}</binary>
<binary id="picture.png" content-type="image/png">{b64(png)}</binary>
</FictionBook>
'''
(out / 'book.fb2').write_bytes(fb2.encode('cp1251'))
with zipfile.ZipFile(out / 'book.fb2.zip', 'w', zipfile.ZIP_DEFLATED) as z:
  z.writestr(zipfile.ZipInfo('book.fb2', date_time=(2024, 7, 15, 12, 0, 0)), fb2.encode('cp1251'), zipfile.ZIP_DEFLATED)

chapter = lambda title, body: f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>{title}</title><link href="../css/style.css" rel="stylesheet" type="text/css"/></head>
<body>{body}</body></html>
'''
files = {
  'mimetype': 'application/epub+zip',
  'META-INF/container.xml': '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
  'OEBPS/content.opf': '''<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="BookId">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
<dc:title>Книга EPUB</dc:title><dc:creator opf:role="aut">Лев Толстой</dc:creator><dc:language>ru</dc:language><dc:identifier id="BookId">test-epub</dc:identifier>
<meta name="cover" content="cover-img"/>
</metadata>
<manifest>
<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
<item id="cover" href="Text/cover.xhtml" media-type="application/xhtml+xml"/>
<item id="ch1" href="Text/chapter%201.xhtml" media-type="application/xhtml+xml"/>
<item id="ch2" href="Text/chapter2.xhtml" media-type="application/xhtml+xml"/>
<item id="cover-img" href="Images/cover.jpg" media-type="image/jpeg"/>
<item id="pic" href="Images/picture.png" media-type="image/png"/>
<item id="css" href="css/style.css" media-type="text/css"/>
</manifest>
<spine toc="ncx"><itemref idref="cover"/><itemref idref="ch1"/><itemref idref="ch2"/></spine>
</package>''',
  'OEBPS/toc.ncx': '<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1"><head/><docTitle><text>Книга EPUB</text></docTitle><navMap/></ncx>',
  'OEBPS/css/style.css': 'p { text-indent: 1em; }',
  'OEBPS/Text/cover.xhtml': chapter('Обложка', '<div><img src="../Images/cover.jpg" alt="cover"/></div>'),
  'OEBPS/Text/chapter 1.xhtml': chapter('Глава 1', '<h1>Глава 1</h1><p>Все счастливые семьи похожи друг на друга.</p><p><img src="../Images/picture.png" alt=""/></p><p>Вторая <i>строка</i><br/>с переносом.</p>'),
  'OEBPS/Text/chapter2.xhtml': chapter('Глава 2', '<h2>Глава 2</h2><blockquote><p>Цитата.</p></blockquote><ul><li>один</li><li>два</li></ul><p><img src="../Images/missing.jpg"/></p>'),
}
with zipfile.ZipFile(out / 'book.epub', 'w') as z:
  for name, text in files.items():
    info = zipfile.ZipInfo(name, date_time=(2024, 7, 15, 12, 0, 0))
    info.compress_type = zipfile.ZIP_STORED if name == 'mimetype' else zipfile.ZIP_DEFLATED
    z.writestr(info, text.encode('utf-8'))
  for name, data in (('OEBPS/Images/cover.jpg', jpg), ('OEBPS/Images/picture.png', png)):
    info = zipfile.ZipInfo(name, date_time=(2024, 7, 15, 12, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    z.writestr(info, data)
print('ok')
