import exifr from 'exifr';

export type ExifGroups = {
  ifd0?: Record<string, unknown>;
  exif?: Record<string, unknown>;
  gps?: Record<string, unknown>;
  interop?: Record<string, unknown>;
};

/** Независимое чтение EXIF (exifr) — сгруппированно по IFD, без преобразования значений. */
export async function readExif(tiffOrFile: Uint8Array): Promise<ExifGroups> {
  const out = await exifr.parse(tiffOrFile, {
    tiff: true,
    exif: true,
    gps: true,
    interop: true,
    ifd1: false,
    makerNote: false,
    xmp: false,
    icc: false,
    translateValues: false,
    reviveValues: false,
    mergeOutput: false,
    sanitize: true,
  });
  return (out ?? {}) as ExifGroups;
}
