// Поворот и отражение пикселей по EXIF Orientation (2–8): после этого в EXIF пишется Orientation = 1.
// HEIC сюда не попадает — libheif сам применяет irot/imir.

import type { Pixels } from './preview';

/**
 * Пиксель результата (x, y) берётся из исходного по индексу start + x·dx + y·dy.
 * Для значений 5–8 ширина и высота меняются местами.
 */
function walk(orientation: number, width: number, height: number): { start: number; dx: number; dy: number } {
  const last = width * height - 1;
  switch (orientation) {
    case 2: // отражение по горизонтали
      return { start: width - 1, dx: -1, dy: width };
    case 3: // поворот на 180°
      return { start: last, dx: -1, dy: -width };
    case 4: // отражение по вертикали
      return { start: (height - 1) * width, dx: 1, dy: -width };
    case 5: // транспонирование
      return { start: 0, dx: width, dy: 1 };
    case 6: // поворот на 90° по часовой
      return { start: (height - 1) * width, dx: -width, dy: 1 };
    case 7: // транспонирование по побочной диагонали
      return { start: last, dx: -width, dy: -1 };
    default: // 8: поворот на 90° против часовой
      return { start: width - 1, dx: width, dy: -1 };
  }
}

export function applyOrientation(image: Pixels, orientation: number): Pixels {
  if (!Number.isInteger(orientation) || orientation < 2 || orientation > 8) return image;
  const { width, height } = image;
  // пиксель RGBA — одно 32-битное слово; для этого буфер должен быть выровнен на 4 байта
  const aligned = image.data.byteOffset % 4 === 0 ? image.data : image.data.slice();
  const src = new Uint32Array(aligned.buffer, aligned.byteOffset, width * height);
  const swap = orientation >= 5;
  const outWidth = swap ? height : width;
  const outHeight = swap ? width : height;
  const out = new Uint32Array(outWidth * outHeight);
  const { start, dx, dy } = walk(orientation, width, height);
  let o = 0;
  for (let y = 0; y < outHeight; y++) {
    let i = start + y * dy;
    for (let x = 0; x < outWidth; x++, i += dx) out[o++] = src[i]!;
  }
  return { data: new Uint8Array(out.buffer), width: outWidth, height: outHeight };
}
