// @ts-check
// Тема «день/ночь». Обычный (не module) скрипт в <head>: тема ставится до первой отрисовки, без вспышки другой.
// data-theme на <html> — действующая тема: выбор пользователя (localStorage) или системная. Без JS тему выбирает
// @media (prefers-color-scheme) в global.css, а кнопка скрыта.
(() => {
  const KEY = 'theme';
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  // цвет панели браузера: meta theme-color для обеих тем — ставим обеим цвет действующей
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
  /** @type {Record<string, string>} */
  const colors = Object.fromEntries(metas.map((meta) => [(meta.getAttribute('media') ?? '').includes('dark') ? 'dark' : 'light', meta.getAttribute('content') ?? '']));

  const systemTheme = () => (system.matches ? 'dark' : 'light');

  const saved = () => {
    try {
      const value = localStorage.getItem(KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null; // хранилище недоступно — тема системная
    }
  };

  /** @param {string | null} value */
  const save = (value) => {
    try {
      if (value) localStorage.setItem(KEY, value);
      else localStorage.removeItem(KEY);
    } catch {
      // не запомним — тема сменится только на этой странице
    }
  };

  // подпись кнопки — действие: в светлой теме «Включить тёмную тему», в тёмной — «… светлую»
  const label = () => {
    const button = document.querySelector('[data-theme-toggle]');
    if (!(button instanceof HTMLElement)) return;
    const text = (root.dataset.theme === 'dark' ? button.dataset.labelLight : button.dataset.labelDark) ?? '';
    button.setAttribute('aria-label', text);
    button.title = text;
  };

  /** @param {string} theme */
  const apply = (theme) => {
    root.dataset.theme = theme;
    for (const meta of metas) meta.setAttribute('content', colors[theme] ?? '');
    label();
  };

  const toggle = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    // совпала с системной — выбор не храним: дальше тема снова следует за системой
    save(next === systemTheme() ? null : next);
    // переходы на время смены выключены: иначе часть элементов меняет цвет плавно, а фон — сразу
    root.setAttribute('data-theme-switching', '');
    apply(next);
    void getComputedStyle(root).color; // новые цвета применяются сейчас, пока переходы выключены
    setTimeout(() => root.removeAttribute('data-theme-switching'));
  };

  apply(saved() ?? systemTheme());
  system.addEventListener('change', () => {
    if (!saved()) apply(systemTheme());
  });
  // выбор в другой вкладке
  addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) apply(saved() ?? systemTheme());
  });
  // страница из кэша «назад/вперёд»: пока она там лежала, тему могли сменить на другой странице
  addEventListener('pageshow', (event) => {
    if (event.persisted) apply(saved() ?? systemTheme());
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-theme-toggle]')?.addEventListener('click', toggle);
    label();
  });
})();
