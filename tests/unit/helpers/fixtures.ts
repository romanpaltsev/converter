import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FIXTURES = fileURLToPath(new URL('../../fixtures/', import.meta.url));

export function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(FIXTURES + name));
}

const ICC = fileURLToPath(new URL('../../../src/converter/color/icc/', import.meta.url));

/** Встраиваемый ICC-профиль из src/converter/color/icc. */
export function iccFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(ICC + name));
}
