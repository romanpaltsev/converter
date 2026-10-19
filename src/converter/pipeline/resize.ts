// Изменение размера («Изменить размер»): только уменьшение, без canvas — в worker'е, на JS.
// Фильтр — Lanczos3 (как «Lanczos» в Squoosh и большинстве редакторов), разделимый: сначала по горизонтали, потом
// по вертикали. Строки после горизонтального прохода хранятся в кольцевом буфере на несколько строк, поэтому память
// не зависит от размера исходника. При сильном уменьшении (в 4 раза и больше) снимок сначала усредняется блоками
// целого размера: Lanczos на 48 Мп → 1920 точек иначе брал бы по 25+ точек на каждый выходной пиксель.
// Прозрачность: цвета смешиваются с весом альфы (предумножение), поэтому у краёв нет тёмной каймы.

import type { Pixels } from './preview';

/** Как уменьшить: по длинной стороне, в процентах или вписать в ширину × высоту (или растянуть точно до них). */
export type ResizeSpec =
  | { mode: 'long-side'; size: number }
  | { mode: 'percent'; percent: number }
  | { mode: 'box'; width: number | null; height: number | null; keepAspect: boolean };

const LANCZOS_A = 3;

/**
 * Размер результата. Только уменьшение: если задано больше исходника, сторона остаётся прежней.
 * box без сохранения пропорций — каждая сторона по своему масштабу; пустая сторона — без ограничения.
 */
export function targetSize(width: number, height: number, spec: ResizeSpec): { width: number; height: number } {
  const fit = (scaleX: number, scaleY: number) => ({
    width: Math.max(1, Math.round(width * Math.min(1, scaleX))),
    height: Math.max(1, Math.round(height * Math.min(1, scaleY))),
  });
  if (spec.mode === 'long-side') {
    const scale = spec.size / Math.max(width, height);
    return fit(scale, scale);
  }
  if (spec.mode === 'percent') return fit(spec.percent / 100, spec.percent / 100);
  const scaleX = spec.width ? spec.width / width : Number.POSITIVE_INFINITY;
  const scaleY = spec.height ? spec.height / height : Number.POSITIVE_INFINITY;
  if (spec.keepAspect) {
    const scale = Math.min(scaleX, scaleY);
    return fit(scale, scale);
  }
  return fit(scaleX, scaleY);
}

function lanczos(x: number): number {
  if (x === 0) return 1;
  if (x <= -LANCZOS_A || x >= LANCZOS_A) return 0;
  const px = Math.PI * x;
  return (LANCZOS_A * Math.sin(px) * Math.sin(px / LANCZOS_A)) / (px * px);
}

/** Веса фильтра: для каждой выходной точки — первая входная точка, число весов и сами веса (по taps на точку). */
interface Kernel {
  taps: number;
  starts: Int32Array;
  counts: Int32Array;
  weights: Float32Array;
}

function kernel(srcSize: number, dstSize: number): Kernel {
  const scale = srcSize / dstSize;
  const stretch = Math.max(1, scale); // при уменьшении фильтр растягивается — это и есть сглаживание
  const support = LANCZOS_A * stretch;
  const taps = Math.ceil(support) * 2 + 1;
  const starts = new Int32Array(dstSize);
  const counts = new Int32Array(dstSize);
  const weights = new Float32Array(dstSize * taps);
  for (let i = 0; i < dstSize; i++) {
    const center = (i + 0.5) * scale;
    const left = Math.max(0, Math.floor(center - support));
    const right = Math.min(srcSize, Math.ceil(center + support));
    const count = Math.min(right - left, taps);
    starts[i] = left;
    counts[i] = count;
    let sum = 0;
    for (let k = 0; k < count; k++) {
      const w = lanczos((left + k + 0.5 - center) / stretch);
      weights[i * taps + k] = w;
      sum += w;
    }
    // у краёв часть фильтра «за кадром»: нормируем оставшиеся веса
    for (let k = 0; k < count; k++) weights[i * taps + k]! /= sum;
  }
  return { taps, starts, counts, weights };
}

/** Усреднение блоками kx × ky (с весом альфы): быстрое грубое уменьшение перед Lanczos. */
function boxReduce(src: Pixels, kx: number, ky: number, hasAlpha: boolean): Pixels {
  const width = Math.ceil(src.width / kx);
  const height = Math.ceil(src.height / ky);
  const out = new Uint8Array(width * height * 4);
  const column = new Int32Array(src.width);
  for (let x = 0; x < src.width; x++) column[x] = Math.floor(x / kx);
  const acc = new Float64Array(width * 4);
  const counts = new Uint32Array(width);
  const data = src.data;
  for (let by = 0; by < height; by++) {
    acc.fill(0);
    counts.fill(0);
    const yEnd = Math.min(src.height, (by + 1) * ky);
    for (let y = by * ky; y < yEnd; y++) {
      let i = y * src.width * 4;
      for (let x = 0; x < src.width; x++, i += 4) {
        const o = column[x]! * 4;
        const a = hasAlpha ? data[i + 3]! : 255;
        acc[o] += data[i]! * a;
        acc[o + 1] += data[i + 1]! * a;
        acc[o + 2] += data[i + 2]! * a;
        acc[o + 3] += a;
        counts[column[x]!]!++;
      }
    }
    let o = by * width * 4;
    for (let bx = 0; bx < width; bx++, o += 4) {
      const a = acc[bx * 4 + 3]!;
      if (a > 0) {
        out[o] = Math.round(acc[bx * 4]! / a);
        out[o + 1] = Math.round(acc[bx * 4 + 1]! / a);
        out[o + 2] = Math.round(acc[bx * 4 + 2]! / a);
      }
      out[o + 3] = Math.round(a / counts[bx]!);
    }
  }
  return { data: out, width, height };
}

/** Целый коэффициент предварительного усреднения: только при уменьшении в 4 раза и больше, Lanczos доделает ×2–4. */
const boxFactor = (scale: number) => (scale >= 4 ? Math.floor(scale / 2) : 1);

/** Уменьшенная копия RGBA (8 бит, без выравнивания строк). Исходный буфер не меняется. */
export function resizeRgba(input: Pixels, width: number, height: number, hasAlpha: boolean): Pixels {
  if (width === input.width && height === input.height) return input;
  const kx = boxFactor(input.width / width);
  const ky = boxFactor(input.height / height);
  const src = kx > 1 || ky > 1 ? boxReduce(input, kx, ky, hasAlpha) : input;

  const kh = kernel(src.width, width);
  const kv = kernel(src.height, height);
  const data = src.data;
  const rowLength = width * 4;
  // кольцевой буфер строк после горизонтального прохода (предумноженные цвета, float)
  const ringRows = kv.taps;
  const ring = new Float32Array(ringRows * rowLength);
  let nextRow = 0;

  // горизонтальный проход одной строки; без прозрачности — без умножения на альфу (так заметно быстрее)
  const filterRow = (y: number) => {
    const row = (y % ringRows) * rowLength;
    const base = y * src.width * 4;
    const { starts, counts, weights, taps } = kh;
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let i = base + starts[x]! * 4;
      const w0 = x * taps;
      const w1 = w0 + counts[x]!;
      if (hasAlpha) {
        for (let k = w0; k < w1; k++, i += 4) {
          const wa = weights[k]! * data[i + 3]!;
          r += data[i]! * wa;
          g += data[i + 1]! * wa;
          b += data[i + 2]! * wa;
          a += wa;
        }
        // хранится предумноженный цвет в масштабе 0–255 и альфа 0–255
        r /= 255;
        g /= 255;
        b /= 255;
      } else {
        for (let k = w0; k < w1; k++, i += 4) {
          const w = weights[k]!;
          r += data[i]! * w;
          g += data[i + 1]! * w;
          b += data[i + 2]! * w;
        }
        a = 255;
      }
      const o = row + x * 4;
      ring[o] = r;
      ring[o + 1] = g;
      ring[o + 2] = b;
      ring[o + 3] = a;
    }
  };

  const out = new Uint8Array(width * height * 4);
  const clamp = (v: number) => (v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v));
  const acc = new Float32Array(rowLength);
  for (let y = 0; y < height; y++) {
    const start = kv.starts[y]!;
    const end = start + kv.counts[y]!;
    if (nextRow < start) nextRow = start; // строки выше окна фильтра больше не понадобятся
    for (; nextRow < end; nextRow++) filterRow(nextRow);
    // вертикальный проход: строки окна складываются целиком, с весом строки
    acc.fill(0);
    for (let row = start; row < end; row++) {
      const w = kv.weights[y * kv.taps + row - start]!;
      const base = (row % ringRows) * rowLength;
      for (let i = 0; i < rowLength; i++) acc[i] += ring[base + i]! * w;
    }
    let o = y * rowLength;
    for (let i = 0; i < rowLength; i += 4, o += 4) {
      const a = acc[i + 3]!;
      out[o + 3] = hasAlpha ? clamp(a) : 255;
      if (a > 0.5) {
        // обратно из предумноженных: цвет = сумма / (альфа / 255); без прозрачности a ≈ 255 и k ≈ 1
        const k = hasAlpha ? 255 / a : 1;
        out[o] = clamp(acc[i]! * k);
        out[o + 1] = clamp(acc[i + 1]! * k);
        out[o + 2] = clamp(acc[i + 2]! * k);
      }
    }
  }
  return { data: out, width, height };
}
