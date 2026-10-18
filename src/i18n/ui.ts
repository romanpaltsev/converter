// Словари интерфейса (короткие строки вёрстки и виджета). Тексты страниц — в src/content.
// Английский словарь типизирован по русскому: TypeScript не даст пропустить ключ.

import type { Locale } from '../config/site';
import type { ErrorCode, WarningCode } from '../converter/pipeline/types';

const ru = {
  nav: {
    home: 'Главная',
    siteLinks: 'Разделы сайта',
    licenses: 'Лицензии',
    contacts: 'Контакты',
    switchLanguage: 'Сменить язык',
    skipToContent: 'Перейти к содержимому',
    breadcrumbs: 'Навигационная цепочка',
  },
  footer: {
    privacy: 'Файлы обрабатываются прямо в браузере и никуда не загружаются.',
  },
  tool: {
    relatedTitle: 'Другие конвертеры',
  },
  widget: {
    dropTitle: 'Перетащите HEIC-файлы сюда',
    dropAction: 'или нажмите, чтобы выбрать',
    dropHint: 'Можно сразу много файлов — до 100 за раз',
    dropActive: 'Отпустите, чтобы добавить файлы',
    settings: 'Настройки',
    format: 'Формат',
    quality: 'Качество JPG',
    keepMetadata: 'Сохранить все метаданные (включая геолокацию)',
    keepMetadataHint: 'По умолчанию дата съёмки сохраняется, а геолокация удаляется',
    pngWarning: 'PNG сохраняет снимок без потерь, поэтому файлы получаются большими: фото на 24 Мп весит десятки мегабайт.',
    noscript: 'Для работы конвертера нужен включённый JavaScript.',
    loading: 'Загружаем конвертер…',
    progress: 'Конвертируем {current} из {total}…',
    summary: 'Готово: {done} из {total}.',
    summaryErrors: 'Не удалось: {failed}.',
    batchLimit: 'За один раз можно добавить до {max} файлов — взяли первые {max}.',
    unsupportedBrowser: 'Этот браузер не поддерживает технологии, нужные конвертеру (WebAssembly и модульные Web Worker). Обновите браузер или откройте сайт в другом.',
    loadFailed: 'Не удалось загрузить конвертер. Проверьте соединение и обновите страницу.',
    queued: 'В очереди',
    converting: 'Конвертируется…',
    done: 'Готово',
    failed: 'Ошибка',
    sizes: '{before} → {after}',
    download: 'Скачать',
    downloadLabel: 'Скачать {name}',
    downloadAll: 'Скачать всё (ZIP)',
    zipPreparing: 'Собираем ZIP…',
    zipFailed: 'Не удалось собрать ZIP. Скачайте файлы по одному.',
    clear: 'Очистить',
    reconvert: 'Конвертировать заново с новыми настройками',
    settingsChanged: 'Новые настройки применятся к следующим файлам.',
    units: { b: 'Б', kb: 'КБ', mb: 'МБ', gb: 'ГБ' },
    errors: {
      'not-image': 'Это не HEIC-файл. Поддерживаются фото в формате HEIC/HEIF.',
      'avif-unsupported': 'Формат AVIF пока не поддерживается.',
      'already-jpeg': 'Файл уже в формате JPEG — конвертировать не нужно. Если вы выбирали фото на iPhone, система могла сама преобразовать его в JPEG.',
      'already-png': 'Файл уже в формате PNG — конвертировать не нужно.',
      'unsupported-image': 'Это изображение другого формата, а не HEIC.',
      'decode-failed': 'Не удалось прочитать файл — возможно, он повреждён.',
      'unsupported-variant': 'Этот вариант HEIC не поддерживается.',
      'out-of-memory': 'Браузеру не хватило памяти для этого файла. Закройте другие вкладки и попробуйте снова.',
      internal: 'Что-то пошло не так. Попробуйте ещё раз.',
    } satisfies Record<ErrorCode, string>,
    warnings: {
      'hdr-tone': 'HDR-снимок: цвета могут немного отличаться от оригинала.',
      'exif-unreadable': 'Метаданные исходного файла повреждены и не сохранены.',
      'exif-makernote-dropped': 'Служебные данные камеры (MakerNote) не поместились и удалены.',
      'exif-reduced-to-dates': 'Метаданные не поместились — сохранены только даты.',
      'icc-too-large': 'Цветовой профиль слишком большой и не сохранён.',
    } satisfies Record<WarningCode, string>,
  },
  notFound: {
    title: 'Страница не найдена',
    text: 'Такой страницы нет. Возможно, адрес изменился или в нём опечатка.',
    toHome: 'На главную',
  },
};

type Dictionary<T> = { [K in keyof T]: T[K] extends string ? string : Dictionary<T[K]> };
export type UiStrings = Dictionary<typeof ru>;

const en: UiStrings = {
  nav: {
    home: 'Home',
    siteLinks: 'Site sections',
    licenses: 'Licenses',
    contacts: 'Contact',
    switchLanguage: 'Change language',
    skipToContent: 'Skip to content',
    breadcrumbs: 'Breadcrumbs',
  },
  footer: {
    privacy: 'Files are processed right in your browser and never uploaded anywhere.',
  },
  tool: {
    relatedTitle: 'More converters',
  },
  widget: {
    dropTitle: 'Drop HEIC files here',
    dropAction: 'or click to choose',
    dropHint: 'Add many files at once — up to 100',
    dropActive: 'Release to add files',
    settings: 'Settings',
    format: 'Format',
    quality: 'JPG quality',
    keepMetadata: 'Keep all metadata (including location)',
    keepMetadataHint: 'By default the capture date is kept and the location is removed',
    pngWarning: 'PNG is lossless, so files are large: a 24 MP photo takes tens of megabytes.',
    noscript: 'The converter needs JavaScript to be enabled.',
    loading: 'Loading the converter…',
    progress: 'Converting {current} of {total}…',
    summary: 'Done: {done} of {total}.',
    summaryErrors: 'Failed: {failed}.',
    batchLimit: 'You can add up to {max} files at a time — the first {max} were taken.',
    unsupportedBrowser: 'This browser lacks features the converter needs (WebAssembly and module Web Workers). Please update it or use another browser.',
    loadFailed: 'Could not load the converter. Check your connection and reload the page.',
    queued: 'Queued',
    converting: 'Converting…',
    done: 'Done',
    failed: 'Error',
    sizes: '{before} → {after}',
    download: 'Download',
    downloadLabel: 'Download {name}',
    downloadAll: 'Download all (ZIP)',
    zipPreparing: 'Preparing ZIP…',
    zipFailed: 'Could not create the ZIP. Please download the files one by one.',
    clear: 'Clear',
    reconvert: 'Convert again with the new settings',
    settingsChanged: 'New settings will apply to the next files.',
    units: { b: 'B', kb: 'KB', mb: 'MB', gb: 'GB' },
    errors: {
      'not-image': 'This is not a HEIC file. HEIC/HEIF photos are supported.',
      'avif-unsupported': 'AVIF is not supported yet.',
      'already-jpeg': 'This file is already a JPEG — no conversion needed. If you picked it on an iPhone, iOS may have converted it to JPEG for you.',
      'already-png': 'This file is already a PNG — no conversion needed.',
      'unsupported-image': 'This image is in another format, not HEIC.',
      'decode-failed': 'Could not read the file — it may be damaged.',
      'unsupported-variant': 'This kind of HEIC file is not supported.',
      'out-of-memory': 'The browser ran out of memory for this file. Close other tabs and try again.',
      internal: 'Something went wrong. Please try again.',
    },
    warnings: {
      'hdr-tone': 'HDR photo: colors may differ slightly from the original.',
      'exif-unreadable': 'The original metadata is damaged and was not kept.',
      'exif-makernote-dropped': 'Camera maker data (MakerNote) did not fit and was removed.',
      'exif-reduced-to-dates': 'Metadata did not fit — only the dates were kept.',
      'icc-too-large': 'The color profile is too large and was not kept.',
    },
  },
  notFound: {
    title: 'Page not found',
    text: 'This page does not exist. The address may have changed or contain a typo.',
    toHome: 'Go to the home page',
  },
};

export const UI: Record<Locale, UiStrings> = { ru, en };

/** Подстановка {name} в шаблон строки. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
