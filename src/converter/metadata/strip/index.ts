// «Удалить метаданные»: выбор по формату файла (по сигнатуре). Всё — без перекодирования и без WASM.

import type { SniffKind } from '../../pipeline/sniff';
import { ConvertError } from '../../pipeline/types';
import { HeifError } from '../heif-items';
import { JpegError } from '../jpeg-segments';
import { PngError } from '../png-chunks';
import { TiffError } from '../tiff';
import { WebpError } from '../webp-chunks';
import { GifError, stripGif } from './gif';
import { stripHeif } from './heif';
import { stripJpeg } from './jpeg';
import { stripJxl } from './jxl';
import { stripPng } from './png';
import { stripTiff } from './tiff';
import { type StripMode, type StripResult, StripUnsupported } from './types';
import { stripWebp } from './webp';

const STRIPPERS: Record<Exclude<SniffKind, 'unknown'>, (bytes: Uint8Array, mode: StripMode) => StripResult> = {
  jpeg: stripJpeg,
  png: stripPng,
  webp: stripWebp,
  heic: stripHeif,
  avif: stripHeif,
  jxl: stripJxl,
  gif: stripGif,
  tiff: stripTiff,
  // в BMP метаданных не бывает (кроме цветового профиля, а его мы оставляем)
  bmp: (bytes) => ({ bytes, changed: false, removed: [], warnings: [] }),
};

const BROKEN = [JpegError, PngError, WebpError, HeifError, GifError, TiffError];

/** Ошибки разбора — коды для пользователя: битый файл или вариант, который без перекодирования не пересобрать. */
export function stripMetadata(bytes: Uint8Array, kind: Exclude<SniffKind, 'unknown'>, mode: StripMode): StripResult {
  try {
    return STRIPPERS[kind](bytes, mode);
  } catch (error) {
    if (error instanceof StripUnsupported) throw new ConvertError('unsupported-variant', error.message);
    if (BROKEN.some((type) => error instanceof type)) throw new ConvertError('decode-failed', (error as Error).message);
    throw error;
  }
}
