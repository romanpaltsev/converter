import { describe, expect, test } from 'vitest';
import { tagWords } from '../../src/converter/widget/report-view';

// Имена тегов EXIF — слитные слова (DateTimeOriginal): в узкой колонке таблицы на телефоне их можно переносить
// только между словами, иначе получается «DateTimeOrigi / nal».
describe('«Посмотреть EXIF»: слова в имени тега', () => {
  test.each([
    ['DateTimeOriginal', ['Date', 'Time', 'Original']],
    ['GPSLatitudeRef', ['GPS', 'Latitude', 'Ref']],
    ['YCbCrPositioning', ['Y', 'Cb', 'Cr', 'Positioning']],
    ['FocalLengthIn35mmFormat', ['Focal', 'Length', 'In35mm', 'Format']],
    ['PixelXDimension', ['Pixel', 'X', 'Dimension']],
    ['ISO', ['ISO']],
    ['Tag 0x9999', ['Tag 0x9999']],
  ])('%s', (name, words) => {
    expect(tagWords(name)).toEqual(words);
  });
});
