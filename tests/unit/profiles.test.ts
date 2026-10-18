import { describe, expect, test } from 'vitest';
import { isPlausibleIcc } from '../../src/converter/color/profiles';
import { iccFixture } from './helpers/fixtures';

describe('isPlausibleIcc', () => {
  test('настоящие профили', () => {
    expect(isPlausibleIcc(iccFixture('sRGB-v2-magic.icc'))).toBe(true);
    expect(isPlausibleIcc(iccFixture('DisplayP3Compat-v2-magic.icc'))).toBe(true);
  });

  test('обрезанный профиль и мусор', () => {
    expect(isPlausibleIcc(iccFixture('sRGB-v2-magic.icc').subarray(0, 300))).toBe(false);
    expect(isPlausibleIcc(new Uint8Array(500))).toBe(false);
  });
});
