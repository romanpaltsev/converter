// Сторонние компоненты, которые загружаются в браузер (страница «Лицензии»).
// При обновлении зависимостей обновите версии и ссылки на исходники.

import type { Locale } from '../../config/site';

export type LicenseTextId = 'lgpl-3.0' | 'gpl-3.0' | 'apache-2.0' | 'libjpeg-turbo' | 'squoosh-bsd' | 'png-mit' | 'client-zip-mit';

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
    name: 'MozJPEG (libjpeg-turbo)',
    version: '3.3.1',
    purpose: { ru: 'кодирование JPEG', en: 'JPEG encoding' },
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
    purpose: { ru: 'кодирование PNG', en: 'PNG encoding' },
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
    name: 'client-zip',
    version: '2.5.1',
    purpose: { ru: 'сборка ZIP-архива', en: 'creating ZIP archives' },
    license: 'MIT',
    texts: ['client-zip-mit'],
    source: 'https://github.com/Touffy/client-zip',
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
  'client-zip-mit': 'client-zip (MIT)',
};

/** Обязательная фраза лицензии IJG для бинарных дистрибутивов libjpeg. */
export const IJG_NOTICE = 'This software is based in part on the work of the Independent JPEG Group.';
