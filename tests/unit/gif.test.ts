import { describe, expect, test } from 'vitest';
import { decodeGif, decodeLzw, readGif } from '../../src/converter/pipeline/decoders/gif';
import { sniff } from '../../src/converter/pipeline/sniff';
import { fixture } from './helpers/fixtures';

const at = (img: { rgba: Uint8Array; width: number }, x: number, y: number) => [...img.rgba.subarray((y * img.width + x) * 4, (y * img.width + x) * 4 + 4)];

/** Квадранты фикстур: красный, зелёный / синий, жёлтый (цвета генератора). */
const QUADRANTS = [
  [224, 0, 0, 255],
  [0, 176, 0, 255],
  [0, 0, 224, 255],
  [224, 224, 0, 255],
];

function expectQuadrants(img: { rgba: Uint8Array; width: number; height: number }) {
  const { width: w, height: h } = img;
  expect([at(img, w / 4, h / 4), at(img, (3 * w) / 4, h / 4), at(img, w / 4, (3 * h) / 4), at(img, (3 * w) / 4, (3 * h) / 4)]).toEqual(QUADRANTS);
}

describe('GIF', () => {
  test('сигнатура', () => {
    expect(sniff(fixture('basic.gif'))).toEqual({ kind: 'gif' });
  });

  test('обычный и чересстрочный — одинаковые пиксели, без прозрачности', () => {
    const basic = decodeGif(fixture('basic.gif'));
    expect(basic).toMatchObject({ width: 1200, height: 800, hasAlpha: false, animated: false });
    expectQuadrants(basic);
    const interlaced = decodeGif(fixture('interlaced.gif'));
    expect(readGif(fixture('interlaced.gif')).first.interlaced).toBe(true);
    expect(Buffer.compare(interlaced.rgba, basic.rgba)).toBe(0);
  });

  test('прозрачный индекс палитры — прозрачные пиксели', () => {
    const img = decodeGif(fixture('alpha.gif'));
    expect(img).toMatchObject({ width: 800, height: 600, hasAlpha: true });
    expect(at(img, 5, 5)[3]).toBe(0);
    expect(at(img, 400, 300)).toEqual([224, 0, 0, 255]);
  });

  test('анимация — первый кадр и флаг', () => {
    const img = decodeGif(fixture('animated.gif'));
    expect(img).toMatchObject({ width: 640, height: 480, animated: true });
    expectQuadrants(img);
  });

  test('кадр меньше холста — на своём месте, вокруг прозрачно', () => {
    const img = decodeGif(fixture('offset.gif'));
    expect(img).toMatchObject({ width: 400, height: 300, hasAlpha: true });
    expect(at(img, 50, 25)[3]).toBe(0);
    expect(at(img, 200, 100)).toEqual([224, 0, 0, 255]);
    expect(at(img, 350, 200)[3]).toBe(0);
  });

  test('обрезанный файл: декодируется начало, остальное прозрачно', () => {
    const bytes = fixture('basic.gif');
    const img = decodeGif(bytes.subarray(0, Math.floor(bytes.length / 2)));
    expect(img).toMatchObject({ width: 1200, height: 800, hasAlpha: true });
    expect(at(img, 300, 50)).toEqual(QUADRANTS[0]);
    expect(at(img, 900, 750)[3]).toBe(0);
  });

  test('LZW: KwKwK и сброс словаря', () => {
    // minCodeSize 2: clear = 4, end = 5. Коды (3 бита): 4 (clear), 1, 6 (KwKwK → «1 1»), 6 («1 1»), 5 (end)
    const codes = [4, 1, 6, 6, 5];
    let bits = 0;
    let n = 0;
    const bytes: number[] = [];
    for (const code of codes) {
      bits |= code << n;
      n += 3;
      while (n >= 8) {
        bytes.push(bits & 0xff);
        bits >>= 8;
        n -= 8;
      }
    }
    if (n > 0) bytes.push(bits & 0xff);
    const out = new Uint8Array(10);
    expect(decodeLzw(Uint8Array.from(bytes), 2, out)).toBe(5);
    expect([...out.subarray(0, 5)]).toEqual([1, 1, 1, 1, 1]);
  });

  test('не GIF и пустой GIF — понятная ошибка', () => {
    expect(() => readGif(new TextEncoder().encode('GIF89a'))).toThrow();
    expect(() => readGif(new TextEncoder().encode('GIF89a\x01\x00\x01\x00\x00\x00\x00;'))).toThrow(/нет изображения/);
  });
});
