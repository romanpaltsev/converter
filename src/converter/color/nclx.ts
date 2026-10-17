// Выбор встраиваемого ICC-профиля, когда цвет исходника задан параметрами nclx (ITU-T H.273).
// Пиксели не пересчитываются: libheif отдаёт RGB в исходных основных цветах,
// поэтому достаточно описать их эквивалентным профилем.

export interface Nclx {
  colorPrimaries: number;
  transferCharacteristics: number;
  matrixCoefficients: number;
  fullRange: boolean;
}

export type ProfileId = 'srgb' | 'display-p3' | 'rec2020';

export interface ColorChoice {
  profile: ProfileId;
  /** PQ или HLG: понижаем до 8 бит без тон-маппинга, цвета могут отличаться — показываем предупреждение. */
  hdr: boolean;
}

const PRIMARIES_BT2020 = 9;
const PRIMARIES_DCI_P3 = 11; // театральная точка белого; встраиваем Display P3 как ближайший вариант
const PRIMARIES_DISPLAY_P3 = 12;
const TRANSFER_PQ = 16;
const TRANSFER_HLG = 18;

/** nclx = null — цвет не задан вовсе: по умолчанию считаем изображение sRGB. */
export function chooseProfile(nclx: Nclx | null): ColorChoice {
  if (!nclx) return { profile: 'srgb', hdr: false };
  const hdr = nclx.transferCharacteristics === TRANSFER_PQ || nclx.transferCharacteristics === TRANSFER_HLG;
  switch (nclx.colorPrimaries) {
    case PRIMARIES_DISPLAY_P3:
    case PRIMARIES_DCI_P3:
      return { profile: 'display-p3', hdr };
    case PRIMARIES_BT2020:
      return { profile: 'rec2020', hdr };
    default:
      // BT.709 (1), «не указано» (2) и всё остальное
      return { profile: 'srgb', hdr };
  }
}
