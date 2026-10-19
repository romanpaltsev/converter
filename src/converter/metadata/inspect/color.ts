// Название цветового пространства: из ICC-профиля (тег desc) или по параметрам nclx (HEIF, AVIF, cICP в PNG).

import type { Nclx } from '../../color/nclx';

const ascii = (bytes: Uint8Array, at: number, length: number) => String.fromCharCode(...bytes.subarray(at, at + length));

/** Компактные профили (их встраивают и наши конвертеры) подписаны коротко — показываем понятное имя. */
const COMPACT_NAMES: Record<string, string> = { sP3C: 'Display P3', '202C': 'Rec. 2020' };

/** Описание профиля: тег desc — textDescriptionType (ICC v2) или multiLocalizedUnicode (v4, берём английский). */
export function iccDescription(icc: Uint8Array): string | null {
  const name = rawDescription(icc);
  return name ? (COMPACT_NAMES[name] ?? name) : null;
}

function rawDescription(icc: Uint8Array): string | null {
  if (icc.length < 132 || ascii(icc, 36, 4) !== 'acsp') return null;
  const view = new DataView(icc.buffer, icc.byteOffset, icc.byteLength);
  const count = Math.min(view.getUint32(128), Math.floor((icc.length - 132) / 12));
  for (let i = 0; i < count; i++) {
    const at = 132 + i * 12;
    if (ascii(icc, at, 4) !== 'desc') continue;
    const offset = view.getUint32(at + 4);
    const size = view.getUint32(at + 8);
    if (offset + size > icc.length || size < 12) return null;
    const type = ascii(icc, offset, 4);
    if (type === 'desc') {
      const length = view.getUint32(offset + 8);
      if (offset + 12 + length > icc.length) return null;
      return new TextDecoder('latin1').decode(icc.subarray(offset + 12, offset + 12 + length)).replace(/\0[\s\S]*$/, '').trim() || null;
    }
    if (type === 'mluc') {
      const records = view.getUint32(offset + 8);
      const recordSize = view.getUint32(offset + 12);
      let chosen: string | null = null;
      for (let r = 0; r < records && offset + 16 + (r + 1) * recordSize <= icc.length; r++) {
        const record = offset + 16 + r * recordSize;
        const length = view.getUint32(record + 4);
        const start = offset + view.getUint32(record + 8);
        if (start + length > icc.length) continue;
        const value = new TextDecoder('utf-16be').decode(icc.subarray(start, start + length)).replace(/\0[\s\S]*$/, '').trim();
        if (ascii(icc, record, 2) === 'en' || chosen === null) chosen = value;
      }
      return chosen || null;
    }
    return null;
  }
  return null;
}

const PRIMARIES: Record<number, string> = { 1: 'sRGB', 9: 'BT.2020', 11: 'DCI-P3', 12: 'Display P3' };
const TRANSFER: Record<number, string> = { 16: 'PQ', 18: 'HLG' };

/** «Display P3», «BT.2020 PQ (HDR)»; неизвестные основные цвета — номером по ITU-T H.273. */
export function nclxDescription(nclx: Nclx): string {
  const primaries = PRIMARIES[nclx.colorPrimaries] ?? `nclx ${nclx.colorPrimaries}/${nclx.transferCharacteristics}/${nclx.matrixCoefficients}`;
  const hdr = TRANSFER[nclx.transferCharacteristics];
  return hdr ? `${primaries} ${hdr} (HDR)` : primaries;
}
