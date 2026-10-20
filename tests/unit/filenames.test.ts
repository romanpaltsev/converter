import { describe, expect, test } from 'vitest';
import { NameAllocator, fileTimestamp, outputName, withTimestamp } from '../../src/converter/widget/filenames';
import { formatBytes } from '../../src/converter/widget/sizes';

describe('outputName', () => {
  test.each([
    ['IMG_1234.HEIC', 'jpg', 'IMG_1234.jpg'],
    ['IMG_1234.heic', 'JPG', 'IMG_1234.jpg'],
    ['photo.HEIF', 'png', 'photo.png'],
    ['archive.tar.heic', 'jpg', 'archive.tar.jpg'],
    ['без расширения', 'jpg', 'без расширения.jpg'],
    ['Фото с отпуска.heic', 'jpg', 'Фото с отпуска.jpg'],
    ['.heic', 'jpg', '.heic.jpg'],
    ['trailing dot..heic', 'jpg', 'trailing dot.jpg'],
    ['a:b*c?.heic', 'jpg', 'a_b_c_.jpg'],
    ['', 'jpg', 'image.jpg'],
    ['Война и мир.fb2.zip', 'epub', 'Война и мир.epub'],
    ['book.FB2.ZIP', 'txt', 'book.txt'],
    ['archive.zip', 'txt', 'archive.txt'],
  ])('%s → %s', (input, ext, expected) => {
    expect(outputName(input, ext)).toBe(expected);
  });
});

describe('дата и время в имени при скачивании', () => {
  // конструктор с компонентами — местное время, как в браузере пользователя
  const date = new Date(2026, 0, 5, 7, 8, 9);

  test('формат: ГГГГ-ММ-ДД_ЧЧ-ММ-СС с ведущими нулями, без двоеточий', () => {
    expect(fileTimestamp(date)).toBe('2026-01-05_07-08-09');
    expect(fileTimestamp(new Date(2026, 11, 31, 23, 59, 59))).toBe('2026-12-31_23-59-59');
  });

  test.each([
    ['IMG_1234.jpg', 'IMG_1234_2026-01-05_07-08-09.jpg'],
    ['heic-to-jpg.zip', 'heic-to-jpg_2026-01-05_07-08-09.zip'],
    ['archive.tar.jpg', 'archive.tar_2026-01-05_07-08-09.jpg'],
    ['IMG_2.png', 'IMG_2_2026-01-05_07-08-09.png'],
    ['без расширения', 'без расширения_2026-01-05_07-08-09'],
    ['.heic.jpg', '.heic_2026-01-05_07-08-09.jpg'],
  ])('%s → %s', (name, expected) => {
    expect(withTimestamp(name, date)).toBe(expected);
  });
});

describe('NameAllocator', () => {
  test('конфликты получают суффиксы _2, _3', () => {
    const names = new NameAllocator();
    expect(names.allocate('IMG.jpg')).toBe('IMG.jpg');
    expect(names.allocate('IMG.jpg')).toBe('IMG_2.jpg');
    expect(names.allocate('IMG.jpg')).toBe('IMG_3.jpg');
  });

  test('регистр не различается (как в файловых системах Windows и macOS)', () => {
    const names = new NameAllocator();
    expect(names.allocate('Photo.jpg')).toBe('Photo.jpg');
    expect(names.allocate('photo.JPG')).toBe('photo_2.JPG');
  });

  test('занятый суффикс пропускается', () => {
    const names = new NameAllocator();
    names.allocate('IMG_2.jpg');
    names.allocate('IMG.jpg');
    expect(names.allocate('IMG.jpg')).toBe('IMG_3.jpg');
  });

  test('освобождённое имя можно выдать снова', () => {
    const names = new NameAllocator();
    names.allocate('a.jpg');
    names.release('a.jpg');
    expect(names.allocate('a.jpg')).toBe('a.jpg');
  });

  test('разные расширения не конфликтуют', () => {
    const names = new NameAllocator();
    expect(names.allocate('a.jpg')).toBe('a.jpg');
    expect(names.allocate('a.png')).toBe('a.png');
  });
});

describe('formatBytes', () => {
  const ru = { b: 'Б', kb: 'КБ', mb: 'МБ', gb: 'ГБ' };
  test.each([
    [500, 'ru', '500 Б'],
    [2048, 'ru', '2,0 КБ'],
    [3.4 * 1024 * 1024, 'ru', '3,4 МБ'],
    [48 * 1024 * 1024, 'ru', '48 МБ'],
    [3.4 * 1024 * 1024, 'en', '3.4 МБ'],
  ])('%d (%s) → %s', (bytes, locale, expected) => {
    expect(formatBytes(bytes, locale, ru)).toBe(expected);
  });
});
