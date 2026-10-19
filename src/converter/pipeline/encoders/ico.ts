// Кодирование ICO (иконки и фавиконы): несколько размеров в одном файле, каждый — PNG внутри ICO
// (так хранят иконки Windows Vista+ и все браузеры; 32 бита с прозрачностью). Прямоугольная картинка вписывается
// в квадрат с прозрачными полями. Размеры — 16…256, но не больше исходника (иконка из маленькой картинки не
// раздувается); из совсем маленькой — один размер 16. Уменьшение — тем же Lanczos, что «Изменить размер».

import { encode as encodePng } from '@jsquash/png/codec/pkg/squoosh_png.js';
import { loadSquooshPng } from '../codecs/squoosh-png';
import { resizeRgba } from '../resize';
import { ENCODER_EXTENSIONS, type Encoder, type RawImage } from '../types';

/** Стандартный набор размеров фавикона и иконки Windows. */
export const ICO_SIZES = [16, 32, 48, 64, 128, 256];

export function icoSizes(width: number, height: number): number[] {
  const side = Math.max(width, height);
  const sizes = ICO_SIZES.filter((size) => size <= side);
  return sizes.length > 0 ? sizes : [ICO_SIZES[0]!];
}

/** Квадрат size × size: изображение вписано по центру, поля прозрачные. */
export function fitSquare(image: RawImage, size: number): Uint8Array {
  const scale = size / Math.max(image.width, image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const resized = resizeRgba({ data: image.rgba, width: image.width, height: image.height }, width, height, image.hasAlpha);
  if (width === size && height === size) return resized.data === image.rgba ? image.rgba.slice() : resized.data;
  const out = new Uint8Array(size * size * 4);
  const left = Math.floor((size - width) / 2);
  const top = Math.floor((size - height) / 2);
  for (let y = 0; y < height; y++) out.set(resized.data.subarray(y * width * 4, (y + 1) * width * 4), ((top + y) * size + left) * 4);
  return out;
}

/** Контейнер ICO: ICONDIR (6 байт), записи ICONDIRENTRY по 16 байт, затем данные PNG. */
export function buildIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const headerSize = 6 + images.length * 16;
  const total = headerSize + images.reduce((sum, image) => sum + image.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true); // тип 1 — иконка
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + i * 16;
    out[entry] = size >= 256 ? 0 : size; // 0 означает 256
    out[entry + 1] = size >= 256 ? 0 : size;
    view.setUint16(entry + 4, 1, true); // плоскости
    view.setUint16(entry + 6, 32, true); // бит на пиксель
    view.setUint32(entry + 8, png.length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(png, offset);
    offset += png.length;
  });
  return out;
}

export async function loadIcoEncoder(): Promise<Encoder> {
  const memory = await loadSquooshPng();
  return {
    module: 'squoosh-png',
    mime: 'image/x-icon',
    extension: ENCODER_EXTENSIONS.ico,
    // в ICO нет места для EXIF и ICC: embed их просто не пишет (без предупреждений «не поместилось»)
    maxExifBytes: Number.POSITIVE_INFINITY,
    maxIccBytes: Number.POSITIVE_INFINITY,
    async encode(image) {
      const images = icoSizes(image.width, image.height).map((size) => ({
        size,
        png: encodePng(fitSquare(image, size), size, size, 8),
      }));
      return buildIco(images);
    },
    embed: (file) => file,
    heapBytes: () => memory.buffer.byteLength,
  };
}
