// Подбор качества под целевой размер файла («Сжать фото → до N КБ»).
// Размер файла почти монотонно растёт с качеством, поэтому ищем двоичным поиском наибольшее качество, при котором
// файл (вместе с метаданными) не больше цели. Каждая проба — полное кодирование, поэтому проб немного:
// первая — с высоким качеством (часто цель достигается сразу), поиск останавливается, когда файл уже близок к цели.

/** Диапазон качества: ниже 5 картинка разваливается, выше 92 файл растёт почти без выигрыша в качестве. */
export const TARGET_MIN_QUALITY = 5;
export const TARGET_MAX_QUALITY = 92;
/** Первая проба: для умеренных целей файл обычно укладывается сразу. */
const FIRST_QUALITY = 85;
/** Файл не меньше этой доли цели — достаточно близко, дальше не ищем. */
const CLOSE_ENOUGH = 0.9;
/** Больше проб не делаем: на 24 Мп каждая — несколько секунд. */
const MAX_ATTEMPTS = 7;

export interface TargetResult {
  bytes: Uint8Array;
  quality: number;
  /** Удалось ли уложиться в цель; если нет — это файл с минимальным качеством. */
  reached: boolean;
  attempts: number;
}

/** encodeAt — полное кодирование с метаданными при заданном качестве. */
export async function encodeToTarget(
  encodeAt: (quality: number) => Promise<Uint8Array>,
  targetBytes: number,
): Promise<TargetResult> {
  let low = TARGET_MIN_QUALITY;
  let high = TARGET_MAX_QUALITY;
  let best: { bytes: Uint8Array; quality: number } | null = null;
  let smallest: { bytes: Uint8Array; quality: number } | null = null;
  let attempts = 0;
  let quality = FIRST_QUALITY;
  while (low <= high && attempts < MAX_ATTEMPTS) {
    const bytes = await encodeAt(quality);
    attempts++;
    if (bytes.length <= targetBytes) {
      best = { bytes, quality };
      if (bytes.length >= targetBytes * CLOSE_ENOUGH) break;
      low = quality + 1;
    } else {
      if (!smallest || bytes.length < smallest.bytes.length) smallest = { bytes, quality };
      high = quality - 1;
    }
    quality = Math.floor((low + high) / 2);
  }
  if (best) return { ...best, reached: true, attempts };
  // даже минимальное качество проверено не было (кончились пробы) — проверяем его напоследок
  if (smallest && smallest.quality > TARGET_MIN_QUALITY) {
    const bytes = await encodeAt(TARGET_MIN_QUALITY);
    attempts++;
    if (bytes.length <= targetBytes) return { bytes, quality: TARGET_MIN_QUALITY, reached: true, attempts };
    if (bytes.length < smallest.bytes.length) smallest = { bytes, quality: TARGET_MIN_QUALITY };
  }
  return { ...smallest!, reached: false, attempts };
}
