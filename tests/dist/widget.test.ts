import { describe, expect, test } from 'vitest';
import { IMAGE_TARGETS } from '../../src/converter/widget/targets';
import { UI } from '../../src/i18n/ui';
import { INPUT_FORMATS, SOURCE_FORMATS, TOOLS, UNIVERSAL_MODES } from '../../src/tools/registry';
import { HOME_PAGES, readHtml } from './helpers';

describe('сборка: конвертер на главной', () => {
  test.each(HOME_PAGES)('%s: любой формат на входе, формат результата — у каждого файла, без предустановки', (file) => {
    const ui = UI[file.startsWith('en/') ? 'en' : 'ru'].widget;
    const root = readHtml(file).doc.querySelector('[data-converter]')!;
    // accept — все форматы (с image/heic: иначе iOS может перекодировать HEIC в JPEG при выборе)
    expect(root.querySelector('input[type="file"]')?.getAttribute('accept')).toBe(Object.values(INPUT_FORMATS).map((f) => f.accept).join(','));
    expect(root.querySelector('input[type="file"]')?.hasAttribute('multiple')).toBe(true);
    expect(root.querySelector('.dropzone__title')?.text).toBe(ui.dropTitleUniversal);
    // настраивать нечего, пока ни у одного файла нет формата
    expect(root.querySelector('form[data-settings]')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('input[name="format"]')).toBeNull();
    expect(root.querySelectorAll('[data-picker] [role="menuitemradio"]').map((item) => item.getAttribute('data-target'))).toEqual([...IMAGE_TARGETS]);
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
    } else if (tool.mode === 'from-pdf') {
      // «PDF в JPG/PNG»: формат и качество, разрешение 150 dpi; метаданных у страниц нет
      expect(root.querySelector('input[name="format"][checked]')?.getAttribute('value')).toBe(tool.defaultOutput);
      expect(root.querySelector('input[name="dpi"][checked]')?.getAttribute('value')).toBe('150');
      expect(root.querySelector('[data-meta-row]')).toBeNull();
      expect(root.querySelector('[data-png-warning]')).toBeNull();
      expect(root.querySelector('[data-zip]')?.hasAttribute('hidden')).toBe(false);
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
      expect(menu.querySelectorAll('[role="menuitemradio"]').map((item) => item.getAttribute('data-target'))).toEqual([...IMAGE_TARGETS]);
      expect(menu.querySelectorAll('[role="menuitemradio"][tabindex="-1"]')).toHaveLength(IMAGE_TARGETS.length);
      const all = root.querySelector('[data-target-all]')!;
      expect(all.getAttribute('aria-haspopup')).toBe('menu');
      expect(all.getAttribute('aria-controls')).toBe(menu.getAttribute('id'));
      expect(root.querySelector('[data-target-all-row]')?.hasAttribute('hidden')).toBe(true);
      expect(root.querySelector('[data-zip]')?.hasAttribute('hidden')).toBe(false);
      expect(root.querySelector('input[name="quality"]')?.getAttribute('value')).toBe(String(tool.defaultQuality));
      expect(root.querySelector('input[name="keepMetadata"]')?.hasAttribute('checked')).toBe(false);
      // до выбора файлов видны настройки формата страницы: качество — у форматов с потерями, ICO — пояснение
      // вместо метаданных, AVIF — предупреждение о долгом кодировании, PNG — о размере файлов
      expect(root.querySelector('[data-quality-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput === 'png' || tool.defaultOutput === 'ico');
      expect(root.querySelector('[data-ico-hint]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'ico');
      expect(root.querySelector('[data-avif-hint]')?.text.trim()).toBe(ui.avifHint);
      expect(root.querySelector('[data-avif-hint]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'avif');
      expect(root.querySelector('[data-meta-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput === 'ico');
      expect(root.querySelector('[data-png-warning]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'png');
      // «Без потерь» — только у WebP
      expect(root.querySelector('[data-lossless-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'webp');
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
