#!/usr/bin/env python3
# Фикстура tests/fixtures/docs/book.xlsx: два листа, общие строки (в том числе с форматированием — несколько <t>),
# числа, логическое значение, дата (встроенный формат 14) и дата со временем (свой формат). Без внешних библиотек:
# python3 tests/fixtures/generate/xlsx.py
import zipfile, pathlib
out = pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'book.xlsx'
H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
files = {
  '[Content_Types].xml': H + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
  '_rels/.rels': H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  'xl/workbook.xml': H + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Данные" sheetId="1" r:id="rId7"/><sheet name="Второй" sheetId="2" r:id="rId8"/></sheets></workbook>',
  'xl/_rels/workbook.xml.rels': H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="/xl/worksheets/sheet1.xml"/><Relationship Id="rId9" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/><Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  'xl/sharedStrings.xml': H + '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="6" uniqueCount="6"><si><t>Товар</t></si><si><t>Цена</t></si><si><t>Дата</t></si><si><t>В наличии</t></si><si><r><t>Чай </t></r><r><rPr><b/></rPr><t>&quot;Зелёный&quot;</t></r></si><si><t xml:space="preserve">Кофе &amp; молоко</t></si></sst>',
  'xl/styles.xml': H + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd.mm.yyyy hh:mm"/></numFmts><cellXfs count="3"><xf numFmtId="0"/><xf numFmtId="14" applyNumberFormat="1"/><xf numFmtId="164" applyNumberFormat="1"/></cellXfs></styleSheet>',
  'xl/worksheets/sheet1.xml': H + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
    '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c><c r="C1" t="s"><v>2</v></c><c r="D1" t="s"><v>3</v></c></row>'
    '<row r="2"><c r="A2" t="s"><v>4</v></c><c r="B2"><v>199.5</v></c><c r="C2" s="1"><v>45488</v></c><c r="D2" t="b"><v>1</v></c></row>'
    '<row r="3"><c r="A3" t="s"><v>5</v></c><c r="B3"><f>B2*2</f><v>399</v></c><c r="C3" s="2"><v>45488.6041666667</v></c><c r="D3" t="b"><v>0</v></c></row>'
    '<row r="5"><c r="A5" t="inlineStr"><is><t>Через строку</t></is></c><c r="C5" t="str"><v>формула-текст</v></c></row>'
    '</sheetData></worksheet>',
  'xl/worksheets/sheet2.xml': H + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>второй лист</t></is></c></row></sheetData></worksheet>',
}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
  for name, text in files.items():
    info = zipfile.ZipInfo(name, date_time=(2024, 7, 15, 12, 0, 0))
    info.compress_type = zipfile.ZIP_DEFLATED
    z.writestr(info, text.encode('utf-8'))
print(out)
