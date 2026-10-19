// Словарь тегов EXIF: имя (как в спецификации EXIF 3.0 и у ExifTool) и группа данных. Нужен «Посмотреть EXIF»
// (таблица всех тегов) и «Удалить метаданные» (итог: что именно было в файле).

export type TagGroup =
  /** Устройство изображения: размеры, ориентация, цвет — не личные данные. */
  | 'image'
  | 'camera'
  | 'settings'
  | 'dates'
  | 'location'
  | 'author'
  | 'software'
  | 'serial'
  | 'makernote'
  | 'other';

export type IfdKind = 'ifd0' | 'exif' | 'gps' | 'interop' | 'ifd1';

type Table = Record<number, [name: string, group: TagGroup]>;

/** IFD0 (и IFD1): теги TIFF и EXIF, общие для файла. */
const IFD0: Table = {
  0x000b: ['ProcessingSoftware', 'software'],
  0x00fe: ['SubfileType', 'image'],
  0x0100: ['ImageWidth', 'image'],
  0x0101: ['ImageHeight', 'image'],
  0x0102: ['BitsPerSample', 'image'],
  0x0103: ['Compression', 'image'],
  0x0106: ['PhotometricInterpretation', 'image'],
  0x010d: ['DocumentName', 'author'],
  0x010e: ['ImageDescription', 'author'],
  0x010f: ['Make', 'camera'],
  0x0110: ['Model', 'camera'],
  0x0111: ['StripOffsets', 'image'],
  0x0112: ['Orientation', 'image'],
  0x0115: ['SamplesPerPixel', 'image'],
  0x0116: ['RowsPerStrip', 'image'],
  0x0117: ['StripByteCounts', 'image'],
  0x011a: ['XResolution', 'image'],
  0x011b: ['YResolution', 'image'],
  0x011c: ['PlanarConfiguration', 'image'],
  0x011d: ['PageName', 'author'],
  0x0128: ['ResolutionUnit', 'image'],
  0x012d: ['TransferFunction', 'image'],
  0x0131: ['Software', 'software'],
  0x0132: ['ModifyDate', 'dates'],
  0x013b: ['Artist', 'author'],
  0x013c: ['HostComputer', 'software'],
  0x013e: ['WhitePoint', 'image'],
  0x013f: ['PrimaryChromaticities', 'image'],
  0x0201: ['ThumbnailOffset', 'image'],
  0x0202: ['ThumbnailLength', 'image'],
  0x0211: ['YCbCrCoefficients', 'image'],
  0x0212: ['YCbCrSubSampling', 'image'],
  0x0213: ['YCbCrPositioning', 'image'],
  0x0214: ['ReferenceBlackWhite', 'image'],
  0x02bc: ['XMP', 'other'],
  0x4746: ['Rating', 'author'],
  0x4749: ['RatingPercent', 'author'],
  0x8298: ['Copyright', 'author'],
  // GeoTIFF: привязка снимка к местности (карты, аэро- и космоснимки)
  0x830e: ['ModelPixelScale', 'location'],
  0x8482: ['ModelTiePoint', 'location'],
  0x85d8: ['ModelTransform', 'location'],
  0x87af: ['GeoKeyDirectory', 'location'],
  0x87b0: ['GeoDoubleParams', 'location'],
  0x87b1: ['GeoAsciiParams', 'location'],
  0x83bb: ['IPTC-NAA', 'other'],
  0x8649: ['PhotoshopSettings', 'other'],
  0x8769: ['ExifOffset', 'image'],
  0x8773: ['ICC_Profile', 'image'],
  0x8825: ['GPSInfo', 'location'],
  0x9c9b: ['XPTitle', 'author'],
  0x9c9c: ['XPComment', 'author'],
  0x9c9d: ['XPAuthor', 'author'],
  0x9c9e: ['XPKeywords', 'author'],
  0x9c9f: ['XPSubject', 'author'],
  0xc4a5: ['PrintIM', 'other'],
  0xc612: ['DNGVersion', 'image'],
  0xc62f: ['CameraSerialNumber', 'serial'],
};

const EXIF: Table = {
  0x829a: ['ExposureTime', 'settings'],
  0x829d: ['FNumber', 'settings'],
  0x8822: ['ExposureProgram', 'settings'],
  0x8824: ['SpectralSensitivity', 'settings'],
  0x8827: ['ISO', 'settings'],
  0x8830: ['SensitivityType', 'settings'],
  0x8831: ['StandardOutputSensitivity', 'settings'],
  0x8832: ['RecommendedExposureIndex', 'settings'],
  0x8833: ['ISOSpeed', 'settings'],
  0x9000: ['ExifVersion', 'image'],
  0x9003: ['DateTimeOriginal', 'dates'],
  0x9004: ['CreateDate', 'dates'],
  0x9010: ['OffsetTime', 'dates'],
  0x9011: ['OffsetTimeOriginal', 'dates'],
  0x9012: ['OffsetTimeDigitized', 'dates'],
  0x9101: ['ComponentsConfiguration', 'image'],
  0x9102: ['CompressedBitsPerPixel', 'image'],
  0x9201: ['ShutterSpeedValue', 'settings'],
  0x9202: ['ApertureValue', 'settings'],
  0x9203: ['BrightnessValue', 'settings'],
  0x9204: ['ExposureCompensation', 'settings'],
  0x9205: ['MaxApertureValue', 'settings'],
  0x9206: ['SubjectDistance', 'settings'],
  0x9207: ['MeteringMode', 'settings'],
  0x9208: ['LightSource', 'settings'],
  0x9209: ['Flash', 'settings'],
  0x920a: ['FocalLength', 'settings'],
  0x9214: ['SubjectArea', 'settings'],
  0x927c: ['MakerNote', 'makernote'],
  0x9286: ['UserComment', 'author'],
  0x9290: ['SubSecTime', 'dates'],
  0x9291: ['SubSecTimeOriginal', 'dates'],
  0x9292: ['SubSecTimeDigitized', 'dates'],
  0x9400: ['AmbientTemperature', 'settings'],
  0x9401: ['Humidity', 'settings'],
  0x9402: ['Pressure', 'settings'],
  0x9403: ['WaterDepth', 'settings'],
  0x9404: ['Acceleration', 'settings'],
  0x9405: ['CameraElevationAngle', 'settings'],
  0xa000: ['FlashpixVersion', 'image'],
  0xa001: ['ColorSpace', 'image'],
  0xa002: ['ExifImageWidth', 'image'],
  0xa003: ['ExifImageHeight', 'image'],
  0xa004: ['RelatedSoundFile', 'other'],
  0xa005: ['InteropOffset', 'image'],
  0xa20b: ['FlashEnergy', 'settings'],
  0xa20e: ['FocalPlaneXResolution', 'settings'],
  0xa20f: ['FocalPlaneYResolution', 'settings'],
  0xa210: ['FocalPlaneResolutionUnit', 'settings'],
  0xa214: ['SubjectLocation', 'settings'],
  0xa215: ['ExposureIndex', 'settings'],
  0xa217: ['SensingMethod', 'settings'],
  0xa300: ['FileSource', 'settings'],
  0xa301: ['SceneType', 'settings'],
  0xa302: ['CFAPattern', 'settings'],
  0xa401: ['CustomRendered', 'settings'],
  0xa402: ['ExposureMode', 'settings'],
  0xa403: ['WhiteBalance', 'settings'],
  0xa404: ['DigitalZoomRatio', 'settings'],
  0xa405: ['FocalLengthIn35mmFormat', 'settings'],
  0xa406: ['SceneCaptureType', 'settings'],
  0xa407: ['GainControl', 'settings'],
  0xa408: ['Contrast', 'settings'],
  0xa409: ['Saturation', 'settings'],
  0xa40a: ['Sharpness', 'settings'],
  0xa40c: ['SubjectDistanceRange', 'settings'],
  0xa420: ['ImageUniqueID', 'serial'],
  0xa430: ['OwnerName', 'author'],
  0xa431: ['SerialNumber', 'serial'],
  0xa432: ['LensInfo', 'camera'],
  0xa433: ['LensMake', 'camera'],
  0xa434: ['LensModel', 'camera'],
  0xa435: ['LensSerialNumber', 'serial'],
  0xa436: ['ImageTitle', 'author'],
  0xa437: ['Photographer', 'author'],
  0xa438: ['ImageEditor', 'author'],
  0xa439: ['CameraFirmware', 'software'],
  0xa43a: ['RAWDevelopingSoftware', 'software'],
  0xa43b: ['ImageEditingSoftware', 'software'],
  0xa43c: ['MetadataEditingSoftware', 'software'],
  0xa460: ['CompositeImage', 'settings'],
  0xa461: ['CompositeImageCount', 'settings'],
  0xa462: ['CompositeImageExposureTimes', 'settings'],
  0xa500: ['Gamma', 'image'],
  0xea1c: ['Padding', 'other'],
  0xea1d: ['OffsetSchema', 'other'],
};

const GPS: Table = {
  0x00: ['GPSVersionID', 'location'],
  0x01: ['GPSLatitudeRef', 'location'],
  0x02: ['GPSLatitude', 'location'],
  0x03: ['GPSLongitudeRef', 'location'],
  0x04: ['GPSLongitude', 'location'],
  0x05: ['GPSAltitudeRef', 'location'],
  0x06: ['GPSAltitude', 'location'],
  0x07: ['GPSTimeStamp', 'location'],
  0x08: ['GPSSatellites', 'location'],
  0x09: ['GPSStatus', 'location'],
  0x0a: ['GPSMeasureMode', 'location'],
  0x0b: ['GPSDOP', 'location'],
  0x0c: ['GPSSpeedRef', 'location'],
  0x0d: ['GPSSpeed', 'location'],
  0x0e: ['GPSTrackRef', 'location'],
  0x0f: ['GPSTrack', 'location'],
  0x10: ['GPSImgDirectionRef', 'location'],
  0x11: ['GPSImgDirection', 'location'],
  0x12: ['GPSMapDatum', 'location'],
  0x13: ['GPSDestLatitudeRef', 'location'],
  0x14: ['GPSDestLatitude', 'location'],
  0x15: ['GPSDestLongitudeRef', 'location'],
  0x16: ['GPSDestLongitude', 'location'],
  0x17: ['GPSDestBearingRef', 'location'],
  0x18: ['GPSDestBearing', 'location'],
  0x19: ['GPSDestDistanceRef', 'location'],
  0x1a: ['GPSDestDistance', 'location'],
  0x1b: ['GPSProcessingMethod', 'location'],
  0x1c: ['GPSAreaInformation', 'location'],
  0x1d: ['GPSDateStamp', 'location'],
  0x1e: ['GPSDifferential', 'location'],
  0x1f: ['GPSHPositioningError', 'location'],
};

const INTEROP: Table = {
  0x0001: ['InteropIndex', 'image'],
  0x0002: ['InteropVersion', 'image'],
  0x1000: ['RelatedImageFileFormat', 'image'],
  0x1001: ['RelatedImageWidth', 'image'],
  0x1002: ['RelatedImageHeight', 'image'],
};

const TABLES: Record<IfdKind, Table> = { ifd0: IFD0, exif: EXIF, gps: GPS, interop: INTEROP, ifd1: IFD0 };

export interface TagInfo {
  name: string;
  group: TagGroup;
}

/** Имя и группа тега; неизвестный — «Tag 0x1234», группа other (в GPS IFD — всегда location). */
export function tagInfo(ifd: IfdKind, tag: number): TagInfo {
  const known = TABLES[ifd][tag];
  if (known) return { name: known[0], group: known[1] };
  return { name: `Tag 0x${tag.toString(16).padStart(4, '0')}`, group: ifd === 'gps' ? 'location' : 'other' };
}
