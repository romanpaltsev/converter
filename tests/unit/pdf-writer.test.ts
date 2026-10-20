import { deflateSync } from 'node:zlib';
import { OPS, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, test } from 'vitest';
import { SMALL_MARGIN } from '../../src/converter/pdf/limits';
import { buildPdf, orientationMatrix, placeImage, type PdfImage } from '../../src/converter/pdf/writer';
import { applyOrientation } from '../../src/converter/pipeline/orientation';
import { fixture, iccFixture } from './helpers/fixtures';

const text = (bytes: Uint8Array) => new TextDecoder('latin1').decode(bytes);

async function pdfBytes(images: PdfImage[], size: 'a4' | 'letter' | 'image' = 'a4', margin = 0): Promise<Uint8Array> {
  return new Uint8Array(await buildPdf(images, { size, margin }).arrayBuffer());
}

function flate(width: number, height: number, rgb: number[], alpha?: number[]): PdfImage {
  return {
    data: deflateSync(Uint8Array.from(rgb)),
    filter: 'FlateDecode',
    width,
    height,
    components: 3,
    icc: null,
    alpha: alpha ? deflateSync(Uint8Array.from(alpha)) : null,
    orientation: 1,
  };
}

describe('поворот матрицей: те же пиксели, что после applyOrientation', () => {
  // картинка 3×2 с разными пикселями; ищем, куда матрица кладёт центр каждого пикселя
  const width = 3;
  const height = 2;
  const stored = new Uint8Array(width * height * 4).map((_, i) => (i % 4 === 3 ? 255 : Math.floor(i / 4) + 1));

  test.each([1, 2, 3, 4, 5, 6, 7, 8])('Orientation %i', (orientation) => {
    const oriented = applyOrientation({ data: stored, width, height }, orientation);
    const [x, y, w, h] = [10, 20, oriented.width * 7, oriented.height * 7];
    const [a, b, c, d, e, f] = orientationMatrix(orientation, x, y, w, h);
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
        // единичный квадрат: s — слева направо, t — снизу вверх (первая строка пикселей — вверху)
        const s = (u + 0.5) / width;
        const t = 1 - (v + 0.5) / height;
        const px = a * s + c * t + e;
        const py = b * s + d * t + f;
        const ox = Math.floor(((px - x) / w) * oriented.width);
        const oy = Math.floor(((y + h - py) / h) * oriented.height);
        expect(oriented.data[(oy * oriented.width + ox) * 4]).toBe(stored[(v * width + u) * 4]);
      }
    }
  });
});

describe('размер страницы и место картинки', () => {
  test('A4: книжная картинка — на книжный лист по ширине, по центру по высоте', () => {
    const { page, box } = placeImage({ width: 600, height: 800, orientation: 1 }, { size: 'a4', margin: 0 });
    expect(page).toEqual([595.28, 841.89]);
    expect(box[2]).toBeCloseTo(595.28, 2);
    expect(box[1]).toBeCloseTo((841.89 - box[3]) / 2, 6);
  });

  test('альбомная (и повёрнутая по EXIF в альбомную) — на альбомный лист', () => {
    expect(placeImage({ width: 1200, height: 800, orientation: 1 }, { size: 'letter', margin: 0 }).page).toEqual([792, 612]);
    expect(placeImage({ width: 800, height: 1200, orientation: 6 }, { size: 'letter', margin: 0 }).page).toEqual([792, 612]);
  });

  test('по размеру изображения: 96 dpi, поля добавляются снаружи', () => {
    expect(placeImage({ width: 1200, height: 800, orientation: 1 }, { size: 'image', margin: 0 })).toEqual({ page: [900, 600], box: [0, 0, 900, 600] });
    const withMargin = placeImage({ width: 1200, height: 800, orientation: 1 }, { size: 'image', margin: SMALL_MARGIN });
    expect(withMargin.page[0]).toBeCloseTo(900 + 2 * 28.3465, 3);
    expect(withMargin.box[0]).toBeCloseTo(28.3465, 3);
  });
});

describe('файл PDF', () => {
  test('таблица xref указывает точно на объекты, трейлер — на каталог', async () => {
    const bytes = await pdfBytes([flate(1, 1, [255, 0, 0]), flate(2, 1, [0, 255, 0, 0, 0, 255], [255, 0])]);
    const source = text(bytes);
    expect(source.startsWith('%PDF-1.7\n')).toBe(true);
    expect(source.endsWith('%%EOF\n')).toBe(true);
    const xref = Number(/startxref\n(\d+)\n%%EOF\n$/.exec(source)![1]);
    expect(source.slice(xref, xref + 5)).toBe('xref\n');
    const [, count] = /^xref\n0 (\d+)\n/.exec(source.slice(xref))!.map(Number);
    const entries = source.slice(xref).split('\n').slice(3, 2 + count!);
    entries.forEach((entry, i) => {
      expect(entry).toMatch(/^\d{10} 00000 n $/);
      expect(source.slice(Number(entry.slice(0, 10)))).toMatch(new RegExp(`^${i + 1} 0 obj\\n`));
    });
    expect(source).toMatch(/trailer\n<< \/Size \d+ \/Root 1 0 R >>/);
    // ни Info, ни XMP: метаданных документа нет
    expect(source).not.toMatch(/\/Info|\/Metadata|\/Producer/);
  });

  test('pdf.js читает страницы, пиксели FlateDecode и маску прозрачности', async () => {
    const pdf = await getDocument({ data: await pdfBytes([flate(2, 2, [255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 0], [255, 128, 0, 255])], 'image'), verbosity: 0 })
      .promise;
    const page = await pdf.getPage(1);
    expect(page.view).toEqual([0, 0, 1.5, 1.5]);
    const ops = await page.getOperatorList();
    const [id] = ops.argsArray[ops.fnArray.indexOf(OPS.paintImageXObject)] as [string];
    const image = await new Promise<{ data: Uint8ClampedArray }>((resolve) => page.objs.get(id, resolve));
    expect(Array.from(image.data)).toEqual([255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 0, 255, 255, 0, 255]);
  });

  test('одинаковый ICC-профиль страниц записывается один раз; профиль не того числа каналов не используется', async () => {
    const p3 = iccFixture('DisplayP3Compat-v2-magic.icc');
    const page = { ...flate(1, 1, [1, 2, 3]), icc: p3 };
    const gray: PdfImage = { ...flate(1, 1, [7]), components: 1, icc: p3 };
    const source = text(await pdfBytes([page, { ...page }, gray]));
    expect(source.match(/\/ICCBased/g)).toHaveLength(2);
    expect(new Set(source.match(/\/ICCBased \d+ 0 R/g))).toHaveProperty('size', 1);
    expect(source.match(/<< \/N 3 \/Length \d+ >>/g)).toHaveLength(1);
    expect(source).toContain('/ColorSpace /DeviceGray');
  });

  test('JPEG вставляется как есть (DCTDecode)', async () => {
    const jpeg = fixture('photo.jpg');
    const bytes = await pdfBytes([{ data: jpeg, filter: 'DCTDecode', width: 1200, height: 800, components: 3, icc: null, alpha: null, orientation: 1 }]);
    expect(text(bytes)).toContain('/Filter /DCTDecode');
    expect(Buffer.from(bytes).includes(Buffer.from(jpeg))).toBe(true);
    const pdf = await getDocument({ data: bytes, verbosity: 0 }).promise;
    expect((await pdf.getPage(1)).view).toEqual([0, 0, 841.89, 595.28]);
  });
});
