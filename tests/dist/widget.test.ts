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
    expect(root.querySelector('input[name="quality"]')?.getAttribute('value')).toBe('90');
    expect(root.querySelector('input[name="keepMetadata"]')?.hasAttribute('checked')).toBe(false);
    expect(root.querySelector('[data-status-text][role="status"][aria-live="polite"]')).toBeTruthy();
    // ползунок скрыт для PNG, предупреждение о размере — наоборот
    expect(root.querySelector('[data-quality-row]')?.hasAttribute('hidden')).toBe(tool.defaultOutput === 'png');
    expect(root.querySelector('[data-png-warning]')?.hasAttribute('hidden')).toBe(tool.defaultOutput !== 'png');
    const config = JSON.parse(root.querySelector('script[data-converter-config]')!.text);
    expect(config.maxFiles).toBe(100);
    expect(config.outputs.map((o: { id: string }) => o.id)).toEqual(tool.outputs);
    expect(config.iphoneHint).toBe(tool.inputFormats.includes('heic'));
    expect(config).not.toHaveProperty('decoder');
    // шаблоны строк заполнены при сборке
    expect(JSON.stringify(config.strings)).not.toMatch(/\{formats?\}/);
    expect(root.querySelector('.dropzone__title')?.text).toBe(config.strings.dropTitle);
  });
});
