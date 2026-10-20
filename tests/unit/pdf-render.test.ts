import { describe, expect, test } from 'vitest';
import { MAX_PAGE_PIXELS, pageSize } from '../../src/converter/pdf/render';
import { checkInput } from '../../src/converter/pipeline/input';
import { sniff } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

describe('«PDF в JPG»: размер страницы', () => {
  test('A4 при 72, 150 и 300 dpi', () => {
    expect(pageSize(595.28, 841.89, 72)).toMatchObject({ width: 595, height: 841, downscaled: false });
    expect(pageSize(595.28, 841.89, 150)).toMatchObject({ width: 1240, height: 1753, downscaled: false });
    expect(pageSize(595.28, 841.89, 300)).toMatchObject({ width: 2480, height: 3507, downscaled: false });
  });

  test('большая страница уменьшается до предела холста (iOS — 16,7 Мп), длинная — до 16 384 точек', () => {
    const a1 = pageSize(1683.78, 2383.94, 300); // A1
    expect(a1.downscaled).toBe(true);
    expect(a1.width * a1.height).toBeLessThanOrEqual(MAX_PAGE_PIXELS);
    expect(a1.width / a1.height).toBeCloseTo(1683.78 / 2383.94, 2);
    const strip = pageSize(100, 10_000, 300); // очень длинная лента
    expect(strip.downscaled).toBe(true);
    expect(Math.max(strip.width, strip.height)).toBeLessThanOrEqual(16_384);
  });
});

describe('PDF по сигнатуре', () => {
  test.each(['quadrants.pdf', 'text.pdf', 'two-pages.pdf', 'encrypted.pdf', 'garbage.pdf'])('%s — pdf', (name) => {
    expect(sniff(fixture(name)).kind).toBe('pdf');
  });

  test('заголовок не в самом начале — тоже PDF; на странице картинок — подсказка, а не «не изображение»', () => {
    const shifted = new Uint8Array([...new TextEncoder().encode('junk before header\n'), ...fixture('text.pdf')]);
    expect(sniff(shifted).kind).toBe('pdf');
    expect(checkInput(fixture('text.pdf'), 'jpeg')).toEqual({ ok: false, code: 'pdf-input' });
  });
});

describe('объединённый PDF: Producer', () => {
  test('«Firefox» заменяется на «PDF.js» той же длиной, остальное не трогается', async () => {
    const { fixProducer } = await import('../../src/converter/pdf/render');
    const source = '%PDF-1.7\n5 0 obj\n<< /Creator (PDF.js) /Producer (Firefox) >>\nendobj\n';
    const bytes = new TextEncoder().encode(source);
    fixProducer(bytes);
    const fixed = new TextDecoder().decode(bytes);
    expect(fixed).toBe(source.replace('/Producer (Firefox)', '/Producer (PDF.js) '));
    expect(fixed).toHaveLength(source.length);
    const untouched = new TextEncoder().encode('%PDF-1.7\n<< /Producer (Other) >>');
    fixProducer(untouched);
    expect(new TextDecoder().decode(untouched)).toBe('%PDF-1.7\n<< /Producer (Other) >>');
  });
});
