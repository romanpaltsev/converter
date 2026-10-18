import { describe, expect, test } from 'vitest';
import { DECODER_BY_KIND, checkInput } from '../../src/converter/pipeline/input';
import { SNIFF_BYTES, type SniffKind } from '../../src/converter/pipeline/sniff';
import { INPUT_FORMATS } from '../../src/tools/registry';
import { fixture } from './helpers/fixtures';

const head = (name: string) => fixture(name).subarray(0, SNIFF_BYTES);
const text = (s: string) => new TextEncoder().encode(s);

describe('checkInput', () => {
  test('HEIC читается декодером heic при любом выходе', () => {
    expect(checkInput(head('basic.heic'), 'jpeg')).toEqual({ ok: true, decoder: 'heic' });
    expect(checkInput(head('basic.heic'), 'png')).toEqual({ ok: true, decoder: 'heic' });
  });

  test('вход в формате выбранного выхода — «уже …»', () => {
    expect(checkInput(head('photo.jpg'), 'jpeg')).toEqual({ ok: false, code: 'already-jpeg' });
    expect(checkInput(head('not-heic.heic'), 'png')).toEqual({ ok: false, code: 'already-png' });
    expect(checkInput(head('basic.webp'), 'webp')).toEqual({ ok: false, code: 'already-webp' });
  });

  test('JPG и PNG в другие форматы — свои декодеры', () => {
    expect(checkInput(head('photo.jpg'), 'png')).toEqual({ ok: true, decoder: 'jpeg' });
    expect(checkInput(head('not-heic.heic'), 'jpeg')).toEqual({ ok: true, decoder: 'png' });
  });

  test('варианты JPEG, которые MozJPEG не читает, видны по заголовку', () => {
    expect(checkInput(fixture('cmyk.jpg'), 'png')).toEqual({ ok: false, code: 'cmyk-unsupported' });
    expect(checkInput(fixture('12bit.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('lossless.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('arith.jpg'), 'png')).toEqual({ ok: false, code: 'unsupported-variant' });
    expect(checkInput(fixture('progressive.jpg'), 'png')).toEqual({ ok: true, decoder: 'jpeg' });
  });

  test('WebP — декодер webp', () => {
    expect(checkInput(head('basic.webp'), 'jpeg')).toEqual({ ok: true, decoder: 'webp' });
    expect(checkInput(head('animated.webp'), 'png')).toEqual({ ok: true, decoder: 'webp' });
  });

  test('форматы без декодера — «пока не поддерживается»', () => {
    expect(checkInput(text('GIF89a......'), 'png')).toEqual({ ok: false, code: 'unsupported-image' });
    expect(checkInput(Uint8Array.of(0x4d, 0x4d, 0, 42, 0, 0, 0, 8), 'jpeg')).toEqual({ ok: false, code: 'unsupported-image' });
  });

  test('AVIF и не изображения', () => {
    expect(checkInput(head('photo.avif'), 'jpeg')).toEqual({ ok: false, code: 'avif-unsupported' });
    expect(checkInput(head('garbage.heic'), 'jpeg')).toEqual({ ok: false, code: 'not-image' });
    expect(checkInput(new Uint8Array(0), 'png')).toEqual({ ok: false, code: 'not-image' });
  });

  test('входные форматы реестра и декодеры по сигнатуре совпадают', () => {
    const fromRegistry = Object.fromEntries(Object.entries(INPUT_FORMATS).map(([id, format]) => [id, format.decoder]));
    expect(fromRegistry).toEqual(DECODER_BY_KIND as Record<SniffKind, string>);
  });
});
