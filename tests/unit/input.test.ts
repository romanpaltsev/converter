import { describe, expect, test } from 'vitest';
import { DECODER_BY_KIND, checkInput } from '../../src/converter/pipeline/input';
import { SNIFF_BYTES, type SniffKind } from '../../src/converter/pipeline/sniff';
import { INPUT_FORMATS } from '../../src/tools/registry';
import { fixture } from './helpers/fixtures';

const head = (name: string) => fixture(name).subarray(0, SNIFF_BYTES);
const text = (s: string) => new TextEncoder().encode(s);

describe('checkInput', () => {
  test('HEIC читается декодером heic при любом выходе', () => {
    expect(checkInput(head('basic.heic'), 'jpeg')).toEqual({ ok: true, decoder: 'heic', encoder: 'jpeg' });
    expect(checkInput(head('basic.heic'), 'png')).toEqual({ ok: true, decoder: 'heic', encoder: 'png' });
  });

  test('вход в формате выбранного выхода — «уже …»', () => {
    expect(checkInput(head('photo.jpg'), 'jpeg')).toEqual({ ok: false, code: 'already-jpeg' });
    expect(checkInput(head('not-heic.heic'), 'png')).toEqual({ ok: false, code: 'already-png' });
    expect(checkInput(head('basic.webp'), 'webp')).toEqual({ ok: false, code: 'already-webp' });
  });

  test('сжатие и изменение размера: тот же формат разрешён, «Исходный» — формат входа, HEIC и AVIF → JPG', () => {
    expect(checkInput(head('photo.jpg'), 'jpeg', true)).toEqual({ ok: true, decoder: 'jpeg', encoder: 'jpeg' });
    expect(checkInput(head('photo.jpg'), 'original', true)).toEqual({ ok: true, decoder: 'jpeg', encoder: 'jpeg' });
    expect(checkInput(head('not-heic.heic'), 'original', true)).toEqual({ ok: true, decoder: 'png', encoder: 'png' });
    expect(checkInput(head('basic.webp'), 'original', true)).toEqual({ ok: true, decoder: 'webp', encoder: 'webp' });
    expect(checkInput(head('basic.heic'), 'original', true)).toEqual({ ok: true, decoder: 'heic', encoder: 'jpeg' });
    expect(checkInput(head('photo.avif'), 'original', true)).toEqual({ ok: true, decoder: 'avif', encoder: 'jpeg' });
    expect(checkInput(head('basic.gif'), 'original', true)).toEqual({ ok: true, decoder: 'gif', encoder: 'png' });
    expect(checkInput(text('8BPS......'), 'original', true)).toEqual({ ok: false, code: 'not-image' });
  });

  test('JPG и PNG в другие форматы — свои декодеры', () => {
    expect(checkInput(head('photo.jpg'), 'png')).toEqual({ ok: true, decoder: 'jpeg', encoder: 'png' });
    expect(checkInput(head('not-heic.heic'), 'jpeg')).toEqual({ ok: true, decoder: 'png', encoder: 'jpeg' });
  });

  test('варианты JPEG, которые MozJPEG не читает, видны по заголовку', () => {
    expect(checkInput(fixture('cmyk.jpg'), 'png')).toEqual({ ok: false, code: 'cmyk-unsupported' });
    expect(checkInput(fixture('12bit.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('lossless.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('arith.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('progressive.jpg'), 'png')).toEqual({ ok: true, decoder: 'jpeg', encoder: 'png' });
  });

  test('WebP — декодер webp', () => {
    expect(checkInput(head('basic.webp'), 'jpeg')).toEqual({ ok: true, decoder: 'webp', encoder: 'jpeg' });
    expect(checkInput(head('animated.webp'), 'png')).toEqual({ ok: true, decoder: 'webp', encoder: 'png' });
  });

  test('неизвестные форматы (PSD и т. п.) — «не изображение»', () => {
    expect(checkInput(text('8BPS......'), 'png')).toEqual({ ok: false, code: 'not-image' });
  });

  test('TIFF — свой декодер; «Исходный» — JPG', () => {
    expect(checkInput(Uint8Array.of(0x4d, 0x4d, 0, 42, 0, 0, 0, 8), 'png')).toEqual({ ok: true, decoder: 'tiff', encoder: 'png' });
    expect(checkInput(Uint8Array.of(0x49, 0x49, 42, 0, 8, 0, 0, 0), 'original', true)).toEqual({ ok: true, decoder: 'tiff', encoder: 'jpeg' });
  });

  test('GIF — свой декодер, в любой формат (GIF на выходе нет)', () => {
    expect(checkInput(head('basic.gif'), 'jpeg')).toEqual({ ok: true, decoder: 'gif', encoder: 'jpeg' });
    expect(checkInput(head('animated.gif'), 'png')).toEqual({ ok: true, decoder: 'gif', encoder: 'png' });
  });

  test('BMP — свой декодер; «Исходный» — PNG', () => {
    expect(checkInput(head('basic.bmp'), 'jpeg')).toEqual({ ok: true, decoder: 'bmp', encoder: 'jpeg' });
    expect(checkInput(head('rle8.bmp'), 'original', true)).toEqual({ ok: true, decoder: 'bmp', encoder: 'png' });
  });

  test('AVIF — декодер avif, в том числе анимированный (avis)', () => {
    expect(checkInput(head('photo.avif'), 'jpeg')).toEqual({ ok: true, decoder: 'avif', encoder: 'jpeg' });
    expect(checkInput(head('animated.avif'), 'webp')).toEqual({ ok: true, decoder: 'avif', encoder: 'webp' });
  });

  test('не изображения', () => {
    expect(checkInput(head('garbage.heic'), 'jpeg')).toEqual({ ok: false, code: 'not-image' });
    expect(checkInput(new Uint8Array(0), 'png')).toEqual({ ok: false, code: 'not-image' });
  });

  test('входные форматы реестра и декодеры по сигнатуре совпадают', () => {
    const fromRegistry = Object.fromEntries(Object.entries(INPUT_FORMATS).map(([id, format]) => [id, format.decoder]));
    expect(fromRegistry).toEqual(DECODER_BY_KIND as Record<SniffKind, string>);
  });
});
