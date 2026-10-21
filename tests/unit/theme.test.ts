import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

// Тёмная тема в global.css — два блока токенов: по системе (без JS) и по data-theme (lib/theme.js). Они обязаны
// совпадать, иначе тема, выбранная кнопкой, выглядит не так, как системная.
const css = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');

/** Объявления первого блока после `start` (до парной `}`) без комментариев и пробелов по краям. */
function declarations(start: string): string[] {
  const from = css.indexOf(start);
  expect(from, start).toBeGreaterThanOrEqual(0);
  const open = css.indexOf('{', from + start.length - 1);
  const close = css.indexOf('}', open);
  return css
    .slice(open + 1, close)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(';')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
}

describe('тема «день/ночь»', () => {
  test('тёмная тема по системе и выбранная кнопкой — одни и те же токены', () => {
    const system = declarations('@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {');
    const chosen = declarations(":root[data-theme='dark'] {");
    expect(system.length).toBeGreaterThan(20);
    expect(chosen).toEqual(system);
  });

  test('у каждого токена тёмной темы есть значение в светлой', () => {
    const light = new Set(declarations(':root {').map((line) => line.split(':')[0]));
    for (const line of declarations(":root[data-theme='dark'] {")) expect(light, line).toContain(line.split(':')[0]);
  });
});
