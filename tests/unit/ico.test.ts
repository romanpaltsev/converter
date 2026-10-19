import { describe, expect, test } from 'vitest';
import { buildIco, fitSquare, icoSizes } from '../../src/converter/pipeline/encoders/ico';

const pixel = (data: Uint8Array, size: number, x: number, y: number) => [...data.subarray((y * size + x) * 4, (y * size + x) * 4 + 4)];

describe('ICO', () => {
  test('размеры: стандартный набор, не больше исходника; из крошечной картинки — 16', () => {
    expect(icoSizes(1024, 1024)).toEqual([16, 32, 48, 64, 128, 256]);
    expect(icoSizes(100, 60)).toEqual([16, 32, 48, 64]);
    expect(icoSizes(10, 10)).toEqual([16]);
  });

  test('прямоугольная картинка вписывается в квадрат по центру, поля прозрачные', () => {
    // красная полоса 40 × 20 → квадрат 16 × 16: картинка 16 × 8, сверху и снизу по 4 прозрачные строки
    const rgba = new Uint8Array(40 * 20 * 4);
    for (let i = 0; i < rgba.length; i += 4) rgba.set([255, 0, 0, 255], i);
    const square = fitSquare({ rgba, width: 40, height: 20, hasAlpha: false }, 16);
    expect(square.length).toBe(16 * 16 * 4);
    expect(pixel(square, 16, 8, 1)[3]).toBe(0);
    expect(pixel(square, 16, 8, 8)).toEqual([255, 0, 0, 255]);
    expect(pixel(square, 16, 8, 14)[3]).toBe(0);
  });

  test('контейнер: заголовок, записи (256 → 0), смещения указывают на данные', () => {
    const images = [
      { size: 16, png: Uint8Array.of(1, 2, 3) },
      { size: 256, png: Uint8Array.of(4, 5) },
    ];
    const ico = buildIco(images);
    const view = new DataView(ico.buffer);
    expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 2]);
    expect([ico[6], ico[7], view.getUint16(6 + 6, true), view.getUint32(6 + 8, true)]).toEqual([16, 16, 32, 3]);
    expect([ico[22], ico[23]]).toEqual([0, 0]);
    const second = view.getUint32(22 + 12, true);
    expect([...ico.subarray(second, second + 2)]).toEqual([4, 5]);
    expect(ico.length).toBe(6 + 2 * 16 + 5);
  });
});
