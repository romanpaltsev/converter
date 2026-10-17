// Общие настройки сайта. Название — плейсхолдер, финальное задаётся здесь (одно место на весь сайт).

export const LOCALES = ['ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

export const SITE_NAME: Record<Locale, string> = {
  ru: 'Конвертер',
  en: 'Converter',
};

/** Язык страницы для атрибута lang и Open Graph. */
export const LOCALE_META: Record<Locale, { htmlLang: string; ogLocale: string; label: string }> = {
  ru: { htmlLang: 'ru', ogLocale: 'ru_RU', label: 'Русский' },
  en: { htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
};

/** Сколько файлов берём из одного выбора. */
export const MAX_FILES_PER_BATCH = 100;
