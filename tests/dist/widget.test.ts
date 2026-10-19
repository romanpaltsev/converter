import { describe, expect, test } from 'vitest';
import { INPUT_FORMATS, TOOLS } from '../../src/tools/registry';
import { readHtml } from './helpers';

describe('сборка: разметка виджета', () => {
  test.each(TOOLS.flatMap((tool) => [[tool.id, `${tool.slugs.ru}.html`], [tool.id, `en/${tool.slugs.en}.html`]]))('%s (%s)', (id, file) => {
    const tool = TOOLS.find((t) => t.id === id)!;
    const { doc } = readHtml(file);
    const root = doc.querySelector('[data-converter]')!;
    expect(root).toBeTruthy();
    expect(root.querySelector('input[type="file"]')?.getAttribute('accept')).toBe(tool.inputFormats.map((id) => INPUT_FORMATS[id].accept).join(','));
    expect(root.querySelector('input[type="file"]')?.hasAttribute('multiple')).toBe(true);
    expect(root.querySelector('button[data-dropzone]')).toBeTruthy();
    expect(root.querySelector('input[name="format"][checked]')?.getAttribute('value')).toBe(tool.defaultOutput);
    expect(root.querySelector('input[name="quality"]')?.getAttribute('value')).toBe(String(tool.defaultQuality));
    expect(root.querySelector('input[name="keepMetadata"]')?.hasAttribute('checked')).toBe(false);
    expect(root.querySelector('[data-status-text][role="status"][aria-live="polite"]')).toBeTruthy();
    // ползунок скрыт для PNG, предупреждение о размере — наоборот
    expect(root.querySelector('[data-quality-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput === 'png');
    expect(root.querySelector('[data-png-warning]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'png');
    // «Без потерь» — только у WebP
    expect(root.querySelector('[data-lossless-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'webp');
    expect(root.querySelector('input[name="lossless"]')?.hasAttribute('checked')).toBe(false);
    const config = JSON.parse(root.querySelector('script[data-converter-config]')!.text);
    expect(config.maxFiles).toBe(100);
    expect(config.outputs.map((o: { id: string }) => o.id)).toEqual(tool.outputs);
    expect(config.iphoneHint).toBe(tool.mode === 'convert' && tool.inputFormats.includes('heic'));
    expect(config.mode).toBe(tool.mode);
    // сжатие: переключатель «По качеству / До размера» и скрытое до выбора поле целевого размера
    expect(Boolean(root.querySelector('input[name="compression"][value="quality"][checked]'))).toBe(tool.mode === 'compress');
    expect(root.querySelector('[data-target-row]')?.hasAttribute('hidden') ?? null).toBe(tool.mode === 'compress' ? true : null);
    expect(Boolean(root.querySelector('[data-original-hint]'))).toBe(tool.mode !== 'convert');
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
