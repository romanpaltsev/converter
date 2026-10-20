import { describe, expect, test } from 'vitest';
import type { SniffKind } from '../../src/converter/pipeline/sniff';
import { ALL_TARGETS, type TargetId, visibleSettings } from '../../src/converter/widget/targets';
import { UI } from '../../src/i18n/ui';
import { AUDIO_FORMATS, BOOK_FORMATS, CATEGORY_SLUGS, DOCUMENT_FORMATS, TOOL_CATEGORIES, type ToolCategory, categoryInputs, INPUT_FORMATS, MEDIA_FORMATS, TEXT_FORMATS, isAudioTarget, isDocTarget, isVideoTarget, SOURCE_FORMATS, TOOLS, UNIVERSAL_MODES } from '../../src/tools/registry';
import { HOME_PAGES, readHtml } from './helpers';

describe('сборка: конвертер на главной', () => {
  test.each(HOME_PAGES)('%s: любой формат на входе, формат результата — у каждого файла, без предустановки', (file) => {
    const ui = UI[file.startsWith('en/') ? 'en' : 'ru'].widget;
    const root = readHtml(file).doc.querySelector('[data-converter]')!;
    // accept — все форматы: картинки, PDF, аудио и видео (с image/heic: иначе iOS может перекодировать HEIC в JPEG при выборе)
    expect(root.querySelector('input[type="file"]')?.getAttribute('accept')).toBe([...Object.values(INPUT_FORMATS), DOCUMENT_FORMATS.pdf, ...Object.values(MEDIA_FORMATS), ...Object.values(TEXT_FORMATS), ...Object.values(BOOK_FORMATS)].map((f) => f.accept).join(','));
    expect(root.querySelector('input[type="file"]')?.hasAttribute('multiple')).toBe(true);
    expect(root.querySelector('.dropzone__title')?.text).toBe(ui.dropTitleUniversal);
    // настраивать нечего, пока ни у одного файла нет формата
    expect(root.querySelector('form[data-settings]')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('input[name="format"]')).toBeNull();
    expect(root.querySelectorAll('[data-picker] [role="menuitemradio"]').map((item) => item.getAttribute('data-target'))).toEqual([...ALL_TARGETS]);
    const config = JSON.parse(root.querySelector('script[data-converter-config]')!.text);
    expect(config).toMatchObject({ toolId: 'home', mode: 'convert', universal: true, preset: null, presetKind: null, zipName: 'converter', iphoneHint: false, outputs: [] });
  });
});

describe('сборка: разметка виджета', () => {
  test.each(TOOLS.flatMap((tool) => [[tool.id, `${tool.slugs.ru}.html`], [tool.id, `en/${tool.slugs.en}.html`]]))('%s (%s)', (id, file) => {
    const tool = TOOLS.find((t) => t.id === id)!;
    const { doc } = readHtml(file);
    const root = doc.querySelector('[data-converter]')!;
    expect(root).toBeTruthy();
    expect(root.querySelector('input[type="file"]')?.getAttribute('accept')).toBe(tool.inputFormats.map((id) => SOURCE_FORMATS[id].accept).join(','));
    expect(root.querySelector('input[type="file"]')?.hasAttribute('multiple')).toBe(true);
    expect(root.querySelector('button[data-dropzone]')).toBeTruthy();
    expect(root.querySelector('[data-status-text][role="status"][aria-live="polite"]')).toBeTruthy();
    if (tool.mode === 'strip') {
      // «Удалить метаданные»: только что удалять (по умолчанию всё) и пояснение; формата, качества и галочек нет
      expect(root.querySelector('input[name="stripMode"][checked]')?.getAttribute('value')).toBe('all');
      expect(root.querySelector('[data-strip-hint]')?.text).toBe(UI[file.startsWith('en/') ? 'en' : 'ru'].widget.stripHints.all);
      for (const selector of ['input[name="format"]', '[data-quality-row]', '[data-meta-row]', '[data-lossless-row]', '[data-png-warning]']) {
        expect(root.querySelector(selector)).toBeNull();
      }
    } else if (tool.mode === 'to-pdf') {
      // «Изображения в PDF»: размер страницы (A4) и поля (без полей) вместо формата; кнопка — «Скачать PDF»
      const ui = UI[file.startsWith('en/') ? 'en' : 'ru'].widget;
      expect(root.querySelector('input[name="pageSize"][checked]')?.getAttribute('value')).toBe('a4');
      expect(root.querySelector('input[name="margin"][checked]')?.getAttribute('value')).toBe('none');
      for (const selector of ['input[name="format"]', '[data-quality-row]', '[data-meta-row]', '[data-lossless-row]']) {
        expect(root.querySelector(selector)).toBeNull();
      }
      expect(root.querySelector('[data-zip]')?.text).toBe(ui.downloadPdf);
    } else if (tool.mode === 'merge-pdf') {
      // «Объединить PDF»: настроек нет, кнопка — «Объединить PDF»
      expect(root.querySelector('form[data-settings]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelectorAll('form[data-settings] input')).toHaveLength(0);
      expect(root.querySelector('[data-zip]')?.text).toBe(UI[file.startsWith('en/') ? 'en' : 'ru'].widget.mergePdf);
    } else if (tool.mode === 'inspect') {
      // «Посмотреть EXIF»: настроек и архива нет — форма пустая и скрыта, кнопка ZIP скрыта
      expect(root.querySelector('form[data-settings]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelectorAll('form[data-settings] input')).toHaveLength(0);
      expect(root.querySelector('[data-zip]')?.hasAttribute('hidden')).toBe(true);
    } else if (UNIVERSAL_MODES.includes(tool.mode)) {
      // пары форматов: общего переключателя нет — формат у каждого файла (меню в строке и «Все файлы в …»)
      const ui = UI[file.startsWith('en/') ? 'en' : 'ru'].widget;
      expect(root.querySelector('input[name="format"]')).toBeNull();
      const menu = root.querySelector('[data-picker][role="menu"]')!;
      expect(menu.hasAttribute('hidden')).toBe(true);
      expect(menu.querySelectorAll('[role="menuitemradio"]').map((item) => item.getAttribute('data-target'))).toEqual([...ALL_TARGETS]);
      expect(menu.querySelectorAll('[role="menuitemradio"][tabindex="-1"]')).toHaveLength(ALL_TARGETS.length);
      expect(menu.querySelectorAll('[role="group"]').map((group) => group.getAttribute('aria-label'))).toEqual([ui.targetGroups.image, ui.targetGroups.document, ui.targetGroups.table, ui.targetGroups.book, ui.targetGroups.video, ui.targetGroups.audio]);
      const all = root.querySelector('[data-target-all]')!;
      expect(all.getAttribute('aria-haspopup')).toBe('menu');
      expect(all.getAttribute('aria-controls')).toBe(menu.getAttribute('id'));
      expect(root.querySelector('[data-target-all-row]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelector('[data-zip]')?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('input[name="quality"]')?.getAttribute('value')).toBe(String(tool.defaultQuality));
      expect(root.querySelector('input[name="keepMetadata"]')?.hasAttribute('checked')).toBe(false);
      // до выбора файлов видны настройки формата страницы (у PDF-страниц — разрешение 150 dpi вместо метаданных)
      const shown = visibleSettings([{ kind: tool.inputFormats[0] as SniffKind, target: tool.defaultOutput as TargetId }], false);
      const rows = { quality: '[data-quality-row]', lossless: '[data-lossless-row]', metadata: '[data-meta-row]', pngWarning: '[data-png-warning]', icoHint: '[data-ico-hint]', avifHint: '[data-avif-hint]', dpi: '[data-dpi-row]', pdfLayout: '[data-pdf-layout-row]', audioBitrate: '[data-audio-bitrate-row]', video: '[data-video-row]', gif: '[data-gif-row]', csv: '[data-csv-row]' } as const;
      for (const [key, selector] of Object.entries(rows)) {
        expect(root.querySelector(selector)?.hasAttribute('hidden'), `${selector} у ${file}`).toBe(!shown[key as keyof typeof shown]);
      }
      // аудио: вместо качества — битрейт (у WAV и FLAC настроек нет — форма скрыта); видео — качество и размер кадра
      const output = tool.defaultOutput;
      const media = isAudioTarget(output) || isVideoTarget(output) || isDocTarget(output) || tool.inputFormats[0]! in TEXT_FORMATS || tool.inputFormats[0]! in BOOK_FORMATS;
      expect(shown.quality).toBe(!media && tool.defaultOutput !== 'png' && tool.defaultOutput !== 'ico');
      expect(shown.video).toBe(output === 'mp4' || output === 'webm');
      expect(shown.gif).toBe(output === 'gif');
      expect(shown.csv).toBe(output === 'csv');
      // разделитель CSV по умолчанию — под Excel языка страницы
      expect(root.querySelector('input[name="csvDelimiter"][checked]')?.getAttribute('value')).toBe(file.startsWith('en/') ? ',' : ';');
      expect(shown.audioBitrate).toBe(isAudioTarget(output) && AUDIO_FORMATS[output].lossy);
      expect(root.querySelector('form[data-settings]')?.hasAttribute('hidden')).toBe(!Object.values(shown).some(Boolean));
      expect(root.querySelector('input[name="audioBitrate"][checked]')?.getAttribute('value')).toBe('192');
      expect(shown.dpi).toBe(tool.mode === 'from-pdf');
      expect(root.querySelector('input[name="dpi"][checked]')?.getAttribute('value')).toBe('150');
      expect(root.querySelector('input[name="pageSize"][checked]')?.getAttribute('value')).toBe('a4');
      expect(root.querySelector('[data-avif-hint]')?.text.trim()).toBe(ui.avifHint);
      expect(root.querySelector('input[name="lossless"]')?.hasAttribute('checked')).toBe(false);
    } else {
      // сжатие и размер: общий переключатель формата, по умолчанию «Исходный»
      expect(root.querySelector('[data-zip]')?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('input[name="format"][checked]')?.getAttribute('value')).toBe(tool.defaultOutput);
      expect(root.querySelector('input[name="quality"]')?.getAttribute('value')).toBe(String(tool.defaultQuality));
      expect(root.querySelector('[data-quality-row]')?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('[data-picker]')).toBeNull();
      expect(root.querySelector('[data-png-warning]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelector('[data-lossless-row]')?.hasAttribute('hidden')).toBe(true);
    }
    const config = JSON.parse(root.querySelector('script[data-converter-config]')!.text);
    expect(config.maxFiles).toBe(100);
    expect(config.outputs.map((o: { id: string }) => o.id)).toEqual(tool.outputs ?? []);
    expect(config.universal).toBe(UNIVERSAL_MODES.includes(tool.mode));
    expect(config.preset).toBe(UNIVERSAL_MODES.includes(tool.mode) ? tool.defaultOutput : null);
    expect(config.iphoneHint).toBe(tool.mode === 'convert' && tool.inputFormats.includes('heic'));
    // список поддерживаемых форматов в ошибке «не картинка»: у универсального виджета — и PDF
    expect(config.strings.errors['not-image'].includes('PDF')).toBe(UNIVERSAL_MODES.includes(tool.mode));
    expect(config.mode).toBe(tool.mode);
    // сжатие: переключатель «По качеству / До размера» и скрытое до выбора поле целевого размера
    expect(Boolean(root.querySelector('input[name="compression"][value="quality"][checked]'))).toBe(tool.mode === 'compress');
    expect(root.querySelector('[data-target-row]')?.hasAttribute('hidden') ?? null).toBe(tool.mode === 'compress' ? true : null);
    expect(Boolean(root.querySelector('[data-original-hint]'))).toBe(tool.mode === 'compress' || tool.mode === 'resize');
    // размер: по умолчанию «По длинной стороне» 1920, остальные режимы скрыты
    expect(Boolean(root.querySelector('input[name="resizeMode"][value="long-side"][checked]'))).toBe(tool.mode === 'resize');
    if (tool.mode === 'resize') {
      expect(root.querySelector('input[name="longSide"]')?.getAttribute('value')).toBe('1920');
      expect(root.querySelector('[data-preset="1920"]')?.getAttribute('aria-pressed')).toBe('true');
      expect(root.querySelector('[data-resize-percent]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelector('[data-resize-box]')?.hasAttribute('hidden')).toBe(true);
    }
    expect(config).not.toHaveProperty('decoder');
    // шаблоны строк заполнены при сборке
    expect(JSON.stringify(config.strings)).not.toMatch(/\{formats?\}/);
    expect(root.querySelector('.dropzone__title')?.text).toBe(config.strings.dropTitle);
  });
});

describe('сборка: конвертер на страницах разделов', () => {
  test.each(TOOL_CATEGORIES.flatMap((category) => [[category, `${CATEGORY_SLUGS[category].ru}.html`], [category, `en/${CATEGORY_SLUGS[category].en}.html`]]))('%s (%s): форматы раздела, без предустановки; у «Обработки фото» конвертера нет', (category, file) => {
    const root = readHtml(file).doc.querySelector('[data-converter]');
    const inputs = categoryInputs(category as ToolCategory);
    if (!inputs) {
      expect(root).toBeNull();
      return;
    }
    expect(root!.querySelector('input[type="file"]')?.getAttribute('accept')).toBe(inputs.map((id) => SOURCE_FORMATS[id].accept).join(','));
    const config = JSON.parse(root!.querySelector('script[data-converter-config]')!.text);
    expect(config).toMatchObject({ toolId: `category-${category}`, universal: true, preset: null, zipName: CATEGORY_SLUGS[category as ToolCategory].en });
  });
});
