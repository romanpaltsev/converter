import { describe, expect, test } from 'vitest';
import { chooseProfile, type Nclx } from '../../src/converter/color/nclx';

const nclx = (colorPrimaries: number, transferCharacteristics = 13): Nclx => ({
  colorPrimaries,
  transferCharacteristics,
  matrixCoefficients: 6,
  fullRange: true,
});

describe('chooseProfile', () => {
  test('цвет не задан → sRGB', () => expect(chooseProfile(null)).toEqual({ profile: 'srgb', hdr: false }));
  test('BT.709 → sRGB', () => expect(chooseProfile(nclx(1))).toEqual({ profile: 'srgb', hdr: false }));
  test('не указано (2) → sRGB', () => expect(chooseProfile(nclx(2))).toEqual({ profile: 'srgb', hdr: false }));
  test('Display P3 (12) → Display P3', () => expect(chooseProfile(nclx(12))).toEqual({ profile: 'display-p3', hdr: false }));
  test('DCI-P3 (11) → Display P3', () => expect(chooseProfile(nclx(11)).profile).toBe('display-p3'));
  test('BT.2020 (9) → Rec.2020', () => expect(chooseProfile(nclx(9, 14))).toEqual({ profile: 'rec2020', hdr: false }));
  test('PQ → предупреждение HDR', () => expect(chooseProfile(nclx(9, 16))).toEqual({ profile: 'rec2020', hdr: true }));
  test('HLG → предупреждение HDR', () => expect(chooseProfile(nclx(9, 18)).hdr).toBe(true));
});
