import { describe, expect, test } from 'vitest';
import type { SniffKind } from '../../src/converter/pipeline/sniff';
import { ALL_TARGETS, AUDIO_TARGETS, IMAGE_TARGETS, VIDEO_TARGETS, defaultTarget, jobFor, ownTarget, settingsKey, sharedTargets, targetsFor, visibleSettings } from '../../src/converter/widget/targets';

const settings = { quality: 90, lossless: false, keepMetadata: false, dpi: 150, audioBitrate: 192, videoQuality: 'high', videoHeight: 0, gifWidth: 480, gifFps: 10, csvDelimiter: ',' };

describe('форматы результата у файла', () => {
  test('картинка — во все форматы и в PDF, кроме своего формата; HEIC, GIF, BMP, TIFF, JPEG XL — во все', () => {
    expect(targetsFor('jpeg')).toEqual(['png', 'webp', 'avif', 'ico', 'pdf']);
    expect(targetsFor('png')).toEqual(['jpeg', 'webp', 'avif', 'ico', 'pdf']);
    expect(targetsFor('webp')).toEqual(['jpeg', 'png', 'avif', 'ico', 'pdf']);
    expect(targetsFor('avif')).toEqual(['jpeg', 'png', 'webp', 'ico', 'pdf']);
    for (const kind of ['heic', 'gif', 'bmp', 'tiff', 'jxl'] as SniffKind[]) {
      expect(targetsFor(kind)).toEqual([...IMAGE_TARGETS, 'pdf']);
      expect(ownTarget(kind)).toBeNull();
    }
  });

  test('PDF — страницы в JPG, PNG или WebP; нечитаемый файл — выбирать нечего', () => {
    expect(targetsFor('pdf')).toEqual(['jpeg', 'png', 'webp']);
    expect(ownTarget('pdf')).toBe('pdf');
    expect(targetsFor('unknown')).toEqual([]);
  });

  test('что делать с файлом: картинка, свой PDF или страницы PDF', () => {
    expect(jobFor('heic', 'jpeg')).toBe('image');
    expect(jobFor('heic', 'pdf')).toBe('document');
    expect(jobFor('pdf', 'png')).toBe('pages');
  });

  test('предустановка страницы — если подходит файлу; файл уже в этом формате или главная без предустановки — ждёт выбора', () => {
    expect(defaultTarget('heic', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('png', 'jpeg')).toBe('jpeg');
    expect(defaultTarget('jpeg', 'jpeg')).toBeNull();
    expect(defaultTarget('avif', 'avif')).toBeNull();
    expect(defaultTarget('heic', null)).toBeNull();
    expect(defaultTarget('unknown', 'jpeg')).toBeNull();
    // PDF на странице картинок: страницы — в формат страницы; PDF на «JPG → ICO» ждёт (ICO из PDF не бывает)
    expect(defaultTarget('pdf', 'png')).toBe('png');
    expect(defaultTarget('pdf', 'ico')).toBeNull();
    expect(defaultTarget('png', 'pdf')).toBe('pdf');
  });

  test('«Все файлы в …»: форматы, подходящие хотя бы одному файлу, в порядке меню', () => {
    expect(sharedTargets(['jpeg'])).toEqual(['png', 'webp', 'avif', 'ico', 'pdf']);
    expect(sharedTargets(['jpeg', 'png'])).toEqual([...IMAGE_TARGETS, 'pdf']);
    // картинки, документы, таблицы, видео и аудио вместе — все пункты меню
    expect(sharedTargets(['jpeg', 'png', 'md', 'html', 'csv', 'json', 'mov', 'mp3', 'wav'])).toEqual([...ALL_TARGETS]);
    expect(sharedTargets(['mp3', 'wav'])).toEqual([...AUDIO_TARGETS]);
    expect(sharedTargets(['pdf'])).toEqual(['jpeg', 'png', 'webp']);
    expect(sharedTargets([])).toEqual([]);
  });
});

describe('аудио и видео', () => {
  test('аудио — в аудиоформаты, кроме своего; видео — в аудио (звуковая дорожка); Opus в Ogg — это уже OGG', () => {
    expect(targetsFor('mp3')).toEqual(['wav', 'm4a', 'ogg', 'flac']);
    expect(targetsFor('wav')).toEqual(['mp3', 'm4a', 'ogg', 'flac']);
    expect(targetsFor('m4a')).toEqual(['mp3', 'wav', 'ogg', 'flac']);
    expect(targetsFor('ogg')).toEqual(['mp3', 'wav', 'm4a', 'flac']);
    expect(targetsFor('opus')).toEqual(['mp3', 'wav', 'm4a', 'flac']);
    expect(targetsFor('flac')).toEqual(['mp3', 'wav', 'm4a', 'ogg']);
    expect(targetsFor('aac')).toEqual([...AUDIO_TARGETS]);
    // видео — в видео (кроме своего контейнера) и в аудио (звуковая дорожка)
    expect(targetsFor('mp4')).toEqual(['webm', 'gif', ...AUDIO_TARGETS]);
    expect(targetsFor('webm')).toEqual(['mp4', 'gif', ...AUDIO_TARGETS]);
    for (const kind of ['mov', 'mkv'] as SniffKind[]) expect(targetsFor(kind)).toEqual([...VIDEO_TARGETS, ...AUDIO_TARGETS]);
    expect(jobFor('mp4', 'mp3')).toBe('media');
    expect(jobFor('mov', 'gif')).toBe('media');
    expect(jobFor('wav', 'flac')).toBe('media');
    expect(defaultTarget('mp3', 'mp3')).toBeNull();
    expect(defaultTarget('mp4', 'mp3')).toBe('mp3');
    // картинка на странице «WAV в MP3» ждёт выбора, аудио на странице картинок — тоже
    expect(defaultTarget('jpeg', 'mp3')).toBeNull();
    expect(defaultTarget('wav', 'jpeg')).toBeNull();
  });

  test('битрейт — у MP3, M4A и OGG; у WAV и FLAC (без потерь) его нет; метаданные фото у аудио не показываются', () => {
    for (const target of ['mp3', 'm4a', 'ogg'] as const) {
      expect(visibleSettings([{ kind: 'wav', target }], false)).toMatchObject({ audioBitrate: true, quality: false, metadata: false });
    }
    for (const target of ['wav', 'flac'] as const) {
      expect(Object.values(visibleSettings([{ kind: 'mp3', target }], false)).some(Boolean)).toBe(false);
    }
  });

  test('видео: качество и размер кадра — у MP4 и WebM, ширина и частота — у GIF; метаданных фото нет', () => {
    expect(visibleSettings([{ kind: 'mov', target: 'mp4' }], false)).toMatchObject({ video: true, gif: false, audioBitrate: false, quality: false, metadata: false });
    expect(visibleSettings([{ kind: 'mp4', target: 'gif' }], false)).toMatchObject({ video: false, gif: true, metadata: false });
    const mp4 = { kind: 'mov' as const, target: 'mp4' as const };
    expect(settingsKey(mp4, settings)).toBe('mp4:qhigh:h0');
    expect(settingsKey(mp4, { ...settings, videoHeight: 720, audioBitrate: 320, gifFps: 20 })).toBe('mp4:qhigh:h720');
    expect(settingsKey({ kind: 'mp4', target: 'gif' }, { ...settings, videoQuality: 'low' })).toBe('gif:w480:f10');
  });

  test('ключ настроек аудио — формат и битрейт (у форматов без потерь — только формат)', () => {
    const mp3 = { kind: 'wav' as const, target: 'mp3' as const };
    expect(settingsKey(mp3, settings)).toBe('mp3:b192');
    expect(settingsKey(mp3, { ...settings, quality: 10, keepMetadata: true, videoHeight: 480 })).toBe('mp3:b192');
    expect(settingsKey(mp3, { ...settings, audioBitrate: 320 })).toBe('mp3:b320');
    expect(settingsKey({ kind: 'mp3', target: 'flac' }, { ...settings, audioBitrate: 320 })).toBe('flac');
  });
});

describe('документы и таблицы', () => {
  test('текст — в PDF (Markdown — и в HTML, HTML — и в TXT), таблицы — друг в друга; задание text', () => {
    expect(targetsFor('txt')).toEqual(['pdf']);
    expect(targetsFor('md')).toEqual(['pdf', 'html']);
    expect(targetsFor('html')).toEqual(['pdf', 'txt']);
    expect(targetsFor('csv')).toEqual(['xlsx', 'json']);
    expect(targetsFor('json')).toEqual(['xlsx', 'csv']);
    expect(targetsFor('xlsx')).toEqual(['csv', 'json']);
    expect(jobFor('md', 'pdf')).toBe('text');
    expect(jobFor('png', 'pdf')).toBe('document');
    expect(defaultTarget('txt', 'pdf')).toBe('pdf');
    expect(defaultTarget('jpeg', 'csv')).toBeNull();
  });

  test('настройки: у документов в PDF — никаких (A4), разделитель — у CSV; ключ — только разделитель', () => {
    expect(Object.values(visibleSettings([{ kind: 'md', target: 'pdf' }], false)).some(Boolean)).toBe(false);
    expect(visibleSettings([{ kind: 'png', target: 'pdf' }], false).pdfLayout).toBe(true);
    expect(visibleSettings([{ kind: 'xlsx', target: 'csv' }], false)).toMatchObject({ csv: true, metadata: false, quality: false });
    expect(settingsKey({ kind: 'xlsx', target: 'csv' }, { ...settings, csvDelimiter: ';' })).toBe('csv:;');
    expect(settingsKey({ kind: 'csv', target: 'json' }, { ...settings, csvDelimiter: ';', quality: 10 })).toBe('json');
  });
});

describe('видимые настройки', () => {
  test('качество — у JPG, AVIF и WebP с потерями; «Без потерь» — у WebP', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'jpeg' }], false)).toEqual({
      quality: true,
      lossless: false,
      metadata: true,
      pngWarning: false,
      icoHint: false,
      avifHint: false,
      dpi: false,
      pdfLayout: false,
      audioBitrate: false,
      video: false,
      gif: false,
      csv: false,
    });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], true)).toMatchObject({ quality: false, lossless: true });
    expect(visibleSettings([{ kind: 'heic', target: 'webp' }], false)).toMatchObject({ quality: true, lossless: true });
    expect(visibleSettings([{ kind: 'jpeg', target: 'avif' }], false)).toMatchObject({ quality: true, avifHint: true });
  });

  test('PNG — предупреждение о размере, ICO — пояснение и без метаданных; смесь форматов — всё нужное', () => {
    expect(visibleSettings([{ kind: 'heic', target: 'png' }], false)).toMatchObject({ quality: false, pngWarning: true, metadata: true });
    expect(visibleSettings([{ kind: 'png', target: 'ico' }], false)).toMatchObject({ quality: false, lossless: false, metadata: false, pngWarning: false, icoHint: true });
    expect(
      visibleSettings(
        [
          { kind: 'png', target: 'ico' },
          { kind: 'heic', target: 'jpeg' },
        ],
        false,
      ),
    ).toMatchObject({ quality: true, metadata: true, icoHint: true });
    expect(Object.values(visibleSettings([], false)).some(Boolean)).toBe(false);
  });

  test('PDF: у страниц — разрешение и качество, без метаданных и предупреждения PNG; картинка в PDF — размер страницы', () => {
    expect(visibleSettings([{ kind: 'pdf', target: 'jpeg' }], false)).toMatchObject({ dpi: true, quality: true, metadata: false, pdfLayout: false });
    expect(visibleSettings([{ kind: 'pdf', target: 'png' }], false)).toMatchObject({ dpi: true, quality: false, pngWarning: false });
    expect(visibleSettings([{ kind: 'heic', target: 'pdf' }], false)).toEqual({
      quality: false,
      lossless: false,
      metadata: false,
      pngWarning: false,
      icoHint: false,
      avifHint: false,
      dpi: false,
      pdfLayout: true,
      audioBitrate: false,
      video: false,
      gif: false,
      csv: false,
    });
  });
});

describe('ключ настроек готового файла', () => {
  test('учитывает только то, что влияет на формат', () => {
    const png = { kind: 'heic', target: 'png' } as const;
    expect(settingsKey(png, settings)).toBe(settingsKey(png, { ...settings, quality: 50, lossless: true }));
    expect(settingsKey(png, settings)).not.toBe(settingsKey(png, { ...settings, keepMetadata: true }));
    const ico = { kind: 'png', target: 'ico' } as const;
    expect(settingsKey(ico, settings)).toBe(settingsKey(ico, { ...settings, quality: 10, lossless: true, keepMetadata: true }));
    const jpeg = { kind: 'heic', target: 'jpeg' } as const;
    expect(settingsKey(jpeg, settings)).not.toBe(settingsKey(jpeg, { ...settings, quality: 80 }));
    expect(settingsKey(jpeg, settings)).toBe(settingsKey(jpeg, { ...settings, lossless: true }));
    const webp = { kind: 'heic', target: 'webp' } as const;
    // без потерь качество не важно
    expect(settingsKey(webp, { ...settings, lossless: true })).toBe(settingsKey(webp, { ...settings, lossless: true, quality: 40 }));
    expect(settingsKey(webp, settings)).not.toBe(settingsKey(webp, { ...settings, lossless: true }));
    // разрешение важно только страницам PDF, метаданные им — нет
    const pages = { kind: 'pdf', target: 'png' } as const;
    expect(settingsKey(pages, settings)).not.toBe(settingsKey(pages, { ...settings, dpi: 300 }));
    expect(settingsKey(pages, settings)).toBe(settingsKey(pages, { ...settings, keepMetadata: true }));
    expect(settingsKey(jpeg, settings)).toBe(settingsKey(jpeg, { ...settings, dpi: 300 }));
    // картинка в PDF: ничего из общих настроек (размер страницы — при сборке)
    const document = { kind: 'heic', target: 'pdf' } as const;
    expect(settingsKey(document, settings)).toBe(settingsKey(document, { ...settings, quality: 10, lossless: true, keepMetadata: true, dpi: 300 }));
  });
});
