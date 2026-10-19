// Сторонние компоненты, которые загружаются в браузер (страница «Лицензии»).
// При обновлении зависимостей обновите версии и ссылки на исходники.

import type { Locale } from '../../config/site';

export type LicenseTextId =
  | 'lgpl-3.0'
  | 'gpl-3.0'
  | 'apache-2.0'
  | 'libjpeg-turbo'
  | 'squoosh-bsd'
  | 'png-mit'
  | 'libwebp-bsd'
  | 'libwebp-patents'
  | 'dav1d-bsd'
  | 'emscripten'
  | 'client-zip-mit'
  | 'utif-mit'
  | 'pako-mit'
  | 'jxl-oxide-mit'
  | 'libaom-bsd'
  | 'libaom-patents'
  | 'inter-ofl'
  | 'pdfium-bsd'
  | 'openjpeg-bsd'
  | 'qcms-mit'
  | 'liberation-fonts'
  | 'adobe-cmaps-bsd';

export interface ThirdPartyComponent {
  name: string;
  version: string;
  purpose: Record<Locale, string>;
  license: string;
  /** Полные тексты лицензий, приведённые на странице. */
  texts: LicenseTextId[];
  source: string;
}

export const COMPONENTS: ThirdPartyComponent[] = [
  {
    name: 'libheif',
    version: '1.23.5',
    purpose: { ru: 'чтение файлов HEIC/HEIF', en: 'reading HEIC/HEIF files' },
    license: 'GNU LGPL 3.0',
    texts: ['lgpl-3.0', 'gpl-3.0'],
    source: 'https://github.com/strukturag/libheif/tree/v1.23.5',
  },
  {
    name: 'libde265',
    version: '1.0.15',
    purpose: { ru: 'декодирование HEVC (H.265)', en: 'HEVC (H.265) decoding' },
    license: 'GNU LGPL 3.0',
    texts: ['lgpl-3.0', 'gpl-3.0'],
    source: 'https://github.com/strukturag/libde265/tree/v1.0.15',
  },
  {
    name: 'libheif-js',
    version: '1.23.5',
    purpose: { ru: 'сборка libheif в WebAssembly', en: 'WebAssembly build of libheif' },
    license: 'GNU LGPL 3.0',
    texts: ['lgpl-3.0', 'gpl-3.0'],
    source: 'https://github.com/catdad-experiments/libheif-js/tree/1.23.5',
  },
  {
    name: 'libheif',
    version: '1.23.6',
    purpose: {
      ru: 'чтение и запись AVIF (свои сборки: с dav1d — декодер, с libaom — кодировщик)',
      en: 'reading and writing AVIF (own builds: with dav1d for decoding, with libaom for encoding)',
    },
    license: 'GNU LGPL 3.0',
    texts: ['lgpl-3.0', 'gpl-3.0'],
    source: 'https://github.com/strukturag/libheif/tree/v1.23.6',
  },
  {
    name: 'dav1d',
    version: '1.5.4',
    purpose: { ru: 'декодирование AV1 (AVIF)', en: 'AV1 (AVIF) decoding' },
    license: 'BSD-2-Clause',
    texts: ['dav1d-bsd'],
    source: 'https://code.videolan.org/videolan/dav1d/-/tree/1.5.4',
  },
  {
    name: 'libaom',
    version: '3.15.2',
    purpose: { ru: 'кодирование AV1 (AVIF на выходе)', en: 'AV1 encoding (AVIF output)' },
    license: 'BSD-2-Clause + AOM Patent License 1.0',
    texts: ['libaom-bsd', 'libaom-patents'],
    source: 'https://aomedia.googlesource.com/aom/+/refs/tags/v3.15.2',
  },
  {
    name: 'MozJPEG (libjpeg-turbo)',
    version: '3.3.1',
    purpose: { ru: 'кодирование и декодирование JPEG', en: 'JPEG encoding and decoding' },
    license: 'IJG, BSD-3-Clause, zlib',
    texts: ['libjpeg-turbo'],
    source: 'https://github.com/mozilla/mozjpeg/tree/v3.3.1',
  },
  {
    name: '@jsquash/jpeg',
    version: '1.6.0',
    purpose: { ru: 'WebAssembly-сборка MozJPEG', en: 'WebAssembly build of MozJPEG' },
    license: 'Apache 2.0',
    texts: ['apache-2.0', 'squoosh-bsd'],
    source: 'https://github.com/jamsinclair/jSquash',
  },
  {
    name: '@jsquash/png',
    version: '3.1.1',
    purpose: { ru: 'кодирование и декодирование PNG', en: 'PNG encoding and decoding' },
    license: 'Apache 2.0',
    texts: ['apache-2.0', 'squoosh-bsd'],
    source: 'https://github.com/jamsinclair/jSquash',
  },
  {
    name: 'png (Rust)',
    version: '0.17.10',
    purpose: {
      ru: 'кодек PNG внутри @jsquash/png (с flate2, miniz_oxide, fdeflate, crc32fast)',
      en: 'PNG codec inside @jsquash/png (with flate2, miniz_oxide, fdeflate, crc32fast)',
    },
    license: 'MIT / Apache 2.0',
    texts: ['png-mit', 'apache-2.0'],
    source: 'https://github.com/image-rs/image-png',
  },
  {
    name: 'libwebp',
    version: '1.6.0',
    purpose: { ru: 'декодирование и кодирование WebP', en: 'WebP decoding and encoding' },
    license: 'BSD-3-Clause + PATENTS',
    texts: ['libwebp-bsd', 'libwebp-patents'],
    source: 'https://github.com/webmproject/libwebp/tree/v1.6.0',
  },
  {
    name: 'Emscripten',
    version: '6.0.12',
    purpose: {
      ru: 'сборка libwebp, декодера и кодировщика AVIF в WebAssembly: среда выполнения и стандартные библиотеки C и C++',
      en: 'WebAssembly builds of libwebp and the AVIF decoder and encoder: runtime and C/C++ standard libraries',
    },
    license: 'MIT / NCSA',
    texts: ['emscripten'],
    source: 'https://github.com/emscripten-core/emscripten/tree/6.0.12',
  },
  {
    name: 'client-zip',
    version: '2.5.1',
    purpose: { ru: 'сборка ZIP-архива', en: 'creating ZIP archives' },
    license: 'MIT',
    texts: ['client-zip-mit'],
    source: 'https://github.com/Touffy/client-zip',
  },
  {
    name: 'UTIF.js (utif2)',
    version: '4.1.0',
    purpose: { ru: 'чтение файлов TIFF: разбор и распаковка (LZW, Deflate, PackBits, JPEG, CCITT)', en: 'reading TIFF files: parsing and decompression (LZW, Deflate, PackBits, JPEG, CCITT)' },
    license: 'MIT',
    texts: ['utif-mit'],
    source: 'https://github.com/photopea/UTIF.js',
  },
  {
    name: 'pako',
    version: '1.0.11',
    purpose: { ru: 'распаковка Deflate внутри UTIF.js', en: 'Deflate decompression inside UTIF.js' },
    license: 'MIT',
    texts: ['pako-mit'],
    source: 'https://github.com/nodeca/pako/tree/1.0.11',
  },
  {
    name: 'jxl-oxide (jxl-oxide-wasm)',
    version: '0.12.6',
    purpose: { ru: 'чтение файлов JPEG XL', en: 'reading JPEG XL files' },
    license: 'MIT / Apache 2.0',
    texts: ['jxl-oxide-mit', 'apache-2.0'],
    source: 'https://github.com/tirr-c/jxl-oxide',
  },
  {
    name: 'PDF.js (pdfjs-dist)',
    version: '6.4.299',
    purpose: { ru: 'чтение и отрисовка PDF («PDF в JPG/PNG»)', en: 'reading and rendering PDFs (“PDF to JPG/PNG”)' },
    license: 'Apache 2.0',
    texts: ['apache-2.0'],
    source: 'https://github.com/mozilla/pdf.js/tree/v6.4.299',
  },
  {
    name: 'OpenJPEG (сборка PDF.js)',
    version: '6.4.299',
    purpose: { ru: 'картинки JPEG 2000 внутри PDF', en: 'JPEG 2000 images inside PDFs' },
    license: 'BSD-2-Clause',
    texts: ['openjpeg-bsd'],
    source: 'https://github.com/uclouvain/openjpeg',
  },
  {
    name: 'JBIG2 из PDFium (сборка PDF.js)',
    version: '6.4.299',
    purpose: { ru: 'чёрно-белые сканы JBIG2 внутри PDF', en: 'black-and-white JBIG2 scans inside PDFs' },
    license: 'BSD-3-Clause / Apache 2.0',
    texts: ['pdfium-bsd', 'apache-2.0'],
    source: 'https://pdfium.googlesource.com/pdfium/',
  },
  {
    name: 'qcms (сборка PDF.js)',
    version: '6.4.299',
    purpose: { ru: 'цветовые профили ICC внутри PDF', en: 'ICC color profiles inside PDFs' },
    license: 'MIT',
    texts: ['qcms-mit'],
    source: 'https://github.com/FirefoxGraphics/qcms',
  },
  {
    name: 'Foxit (шрифты из PDFium)',
    version: '6.4.299',
    purpose: { ru: 'стандартные шрифты PDF (Times, Courier, Symbol)', en: 'standard PDF fonts (Times, Courier, Symbol)' },
    license: 'BSD-3-Clause',
    texts: ['pdfium-bsd'],
    source: 'https://pdfium.googlesource.com/pdfium/+/main/third_party/foxitfonts/',
  },
  {
    name: 'Liberation Sans',
    version: '6.4.299',
    purpose: { ru: 'стандартные шрифты PDF (Helvetica, Arial)', en: 'standard PDF fonts (Helvetica, Arial)' },
    license: 'GNU GPL 2 с исключением для шрифтов',
    texts: ['liberation-fonts'],
    source: 'https://github.com/liberationfonts/liberation-fonts',
  },
  {
    name: 'Adobe CMap',
    version: '6.4.299',
    purpose: { ru: 'кодировки китайских, японских и корейских шрифтов в PDF', en: 'Chinese, Japanese and Korean font encodings in PDFs' },
    license: 'BSD-3-Clause',
    texts: ['adobe-cmaps-bsd'],
    source: 'https://github.com/adobe-type-tools/cmap-resources',
  },
  {
    name: 'CGATS001Compat (профиль ICC из PDF.js)',
    version: '6.4.299',
    purpose: { ru: 'цвета CMYK внутри PDF', en: 'CMYK colors inside PDFs' },
    license: 'CC0 1.0',
    texts: [],
    source: 'https://github.com/saucecontrol/Compact-ICC-Profiles',
  },
  {
    name: 'Inter (@fontsource-variable/inter)',
    version: '5.3.0',
    purpose: { ru: 'шрифт интерфейса', en: 'interface font' },
    license: 'SIL OFL 1.1',
    texts: ['inter-ofl'],
    source: 'https://github.com/rsms/inter',
  },
  {
    name: 'Compact ICC Profiles',
    version: '—',
    purpose: { ru: 'цветовые профили sRGB, Display P3, Rec. 2020', en: 'sRGB, Display P3 and Rec. 2020 color profiles' },
    license: 'CC0 1.0',
    texts: [],
    source: 'https://github.com/saucecontrol/Compact-ICC-Profiles',
  },
];

export const LICENSE_TITLES: Record<LicenseTextId, string> = {
  'lgpl-3.0': 'GNU Lesser General Public License, version 3',
  'gpl-3.0': 'GNU General Public License, version 3',
  'apache-2.0': 'Apache License, version 2.0',
  'libjpeg-turbo': 'libjpeg-turbo / MozJPEG licenses (IJG, Modified BSD, zlib)',
  'squoosh-bsd': 'Squoosh codecs (BSD-3-Clause, Google)',
  'png-mit': 'png crate (MIT)',
  'libwebp-bsd': 'libwebp (BSD-3-Clause, Google)',
  'libwebp-patents': 'libwebp — Additional IP Rights Grant (Patents)',
  'dav1d-bsd': 'dav1d (BSD-2-Clause, VideoLAN)',
  emscripten: 'Emscripten (MIT / University of Illinois NCSA)',
  'client-zip-mit': 'client-zip (MIT)',
  'utif-mit': 'UTIF.js (MIT, Photopea)',
  'pako-mit': 'pako (MIT)',
  'jxl-oxide-mit': 'jxl-oxide (MIT, Wonwoo Choi)',
  'libaom-bsd': 'libaom (BSD-2-Clause, Alliance for Open Media)',
  'libaom-patents': 'libaom — Alliance for Open Media Patent License 1.0',
  'inter-ofl': 'Inter (SIL Open Font License 1.1)',
  'pdfium-bsd': 'PDFium (BSD-3-Clause): Foxit fonts, JBIG2',
  'openjpeg-bsd': 'OpenJPEG (BSD-2-Clause)',
  'qcms-mit': 'qcms (MIT, Mozilla)',
  'liberation-fonts': 'Liberation Fonts (GNU GPL 2 with font exception, Red Hat)',
  'adobe-cmaps-bsd': 'Adobe CMap resources (BSD-3-Clause)',
};

/** Обязательная фраза лицензии IJG для бинарных дистрибутивов libjpeg. */
export const IJG_NOTICE = 'This software is based in part on the work of the Independent JPEG Group.';
