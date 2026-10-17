import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FIXTURES = fileURLToPath(new URL('../../fixtures/', import.meta.url));

export function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(FIXTURES + name));
}
