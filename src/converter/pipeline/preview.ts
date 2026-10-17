// Маленькое превью для строки файла. Делается в worker'е из тех же пикселей, что и результат:
// браузеру не приходится декодировать снимок на 24+ Мп ради картинки 48×48 (решение владельца, см. CLAUDE.md).
// Масштабирование — усреднение в JS, без canvas.

export interface Pixels {
  /** RGBA, 8 бит на канал, без выравнивания строк. */
  data: Uint8Array;
  width: number;
  height: number;
}

/** Сколько точек по каждой оси усредняется в пределах одного пикселя превью. */
const SAMPLES = 8;

/** Уменьшенная копия: короткая сторона — не больше minSide (и не больше исходника). */
export function downscale(src: Pixels, minSide = 96): Pixels {
  const scale = Math.min(1, minSide / Math.min(src.width, src.height));
  const width = Math.max(1, Math.round(src.width * scale));
  const height = Math.max(1, Math.round(src.height * scale));
  const out = new Uint8Array(width * height * 4);
  const data = src.data;
  for (let y = 0; y < height; y++) {
    const y0 = Math.floor((y * src.height) / height);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * src.height) / height));
    const stepY = Math.max(1, Math.floor((y1 - y0) / SAMPLES));
    for (let x = 0; x < width; x++) {
      const x0 = Math.floor((x * src.width) / width);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * src.width) / width));
      const stepX = Math.max(1, Math.floor((x1 - x0) / SAMPLES));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = y0; sy < y1; sy += stepY) {
        for (let sx = x0; sx < x1; sx += stepX) {
          const i = (sy * src.width + sx) * 4;
          const alpha = data[i + 3]!;
          // усреднение с весом прозрачности: прозрачные пиксели не «пачкают» цвет
          r += data[i]! * alpha;
          g += data[i + 1]! * alpha;
          b += data[i + 2]! * alpha;
          a += alpha;
          n++;
        }
      }
      const o = (y * width + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
      }
      out[o + 3] = Math.round(a / n);
    }
  }
  return { data: out, width, height };
}
