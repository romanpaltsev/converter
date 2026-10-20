// Меню выбора формата — у строки файла и у «Все файлы в …». Одно на виджет: строки перерисовываются целиком,
// поэтому меню живёт в разметке виджета, а к кнопке строки только привязывается.
// Без <select> (в WebKit он ставит инлайн-стили — нарушение CSP): role="menu" с пунктами menuitemradio.
// Клавиатура — как у кнопки-меню из APG: стрелки, Home/End, первая буква, Enter или пробел — выбор, Esc и Tab —
// закрыть с возвратом фокуса на кнопку. Позиция задаётся из JS через CSSOM (el.style) — это CSP не запрещает.

import type { TargetId } from './targets';

export interface PickerRequest {
  /** Кнопка, которая открыла меню: к ней привязана позиция, на неё вернётся фокус. */
  anchor: HTMLButtonElement;
  /** Какие форматы показать. */
  available: readonly TargetId[];
  /** Отмеченный формат (или null — ещё не выбран). */
  checked: TargetId | null;
  onSelect(target: TargetId): void;
}

/** На узком экране меню — во всю ширину списка под кнопкой. */
const NARROW = '(max-width: 480px)';
const GAP = 6;

export class FormatPicker {
  private owner: object | null = null;
  private request: PickerRequest | null = null;
  private readonly items: HTMLButtonElement[];
  private readonly groups: HTMLElement[];

  /** container — ближайший предок меню с position: relative (относительно него считается позиция). */
  constructor(
    private readonly menu: HTMLElement,
    private readonly container: HTMLElement,
  ) {
    this.items = [...menu.querySelectorAll<HTMLButtonElement>('[data-target]')];
    this.groups = [...menu.querySelectorAll<HTMLElement>('[role="group"]')];
    menu.addEventListener('click', (event) => {
      const item = (event.target as Element).closest<HTMLButtonElement>('[data-target]');
      if (item) this.select(item.dataset.target as TargetId);
    });
    menu.addEventListener('keydown', (event) => this.onKey(event));
    // щелчок мимо меню закрывает его (щелчок по своей кнопке обработает сама кнопка — она переключает меню)
    document.addEventListener(
      'pointerdown',
      (event) => {
        const target = event.target as Node;
        if (this.request && !menu.contains(target) && !this.request.anchor.contains(target)) this.close(false);
      },
      true,
    );
    window.addEventListener('resize', () => this.close(false));
  }

  isOpenFor(owner: object): boolean {
    return this.owner === owner;
  }

  /** Открывает меню для owner (строка или «все»); focus — какой пункт получит фокус. */
  open(owner: object, request: PickerRequest, focus: 'checked' | 'first' | 'last' = 'checked'): void {
    if (this.request) this.close(false);
    this.owner = owner;
    this.request = request;
    for (const item of this.items) {
      const target = item.dataset.target as TargetId;
      item.hidden = !request.available.includes(target);
      item.setAttribute('aria-checked', String(target === request.checked));
    }
    for (const group of this.groups) group.hidden = !group.querySelector('[data-target]:not([hidden])');
    request.anchor.setAttribute('aria-expanded', 'true');
    this.menu.hidden = false;
    this.position();
    const visible = this.visibleItems();
    const checked = visible.find((item) => item.getAttribute('aria-checked') === 'true');
    (focus === 'last' ? visible.at(-1) : focus === 'first' ? visible[0] : (checked ?? visible[0]))?.focus();
  }

  /** Строку перерисовали, пока меню открыто: меню остаётся на месте, но привязано к новой кнопке. */
  reanchor(owner: object, anchor: HTMLButtonElement): void {
    if (this.owner !== owner || !this.request) return;
    this.request.anchor = anchor;
    anchor.setAttribute('aria-expanded', 'true');
    this.position();
  }

  close(returnFocus = true): void {
    const request = this.request;
    if (!request) return;
    this.owner = null;
    this.request = null;
    this.menu.hidden = true;
    request.anchor.setAttribute('aria-expanded', 'false');
    if (returnFocus && request.anchor.isConnected) request.anchor.focus();
  }

  private select(target: TargetId): void {
    const request = this.request;
    if (!request) return;
    // сначала выбор (строка перерисуется и через reanchor передаст новую кнопку), потом фокус — на неё
    request.onSelect(target);
    this.close(true);
  }

  private visibleItems(): HTMLButtonElement[] {
    return this.items.filter((item) => !item.hidden);
  }

  private onKey(event: KeyboardEvent): void {
    const visible = this.visibleItems();
    const index = visible.indexOf(document.activeElement as HTMLButtonElement);
    let next: HTMLButtonElement | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = visible[(index + 1) % visible.length];
        break;
      case 'ArrowUp':
        next = visible[(index - 1 + visible.length) % visible.length];
        break;
      case 'Home':
        next = visible[0];
        break;
      case 'End':
        next = visible.at(-1);
        break;
      case 'Escape':
      case 'Tab':
        event.preventDefault();
        this.close(true);
        return;
      default: {
        // первая буква: следующий пункт, который с неё начинается
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const letter = event.key.toLowerCase();
        const order = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        next = order.find((item) => item.textContent!.trim().toLowerCase().startsWith(letter));
        if (!next) return;
      }
    }
    event.preventDefault();
    next?.focus();
  }

  /** Под кнопкой (или над ней, если снизу не помещается), по правому краю кнопки; на узком экране — во всю ширину. */
  private position(): void {
    const anchor = this.request!.anchor.getBoundingClientRect();
    const box = this.container.getBoundingClientRect();
    const style = this.menu.style;
    if (window.matchMedia(NARROW).matches) {
      style.left = '0px';
      style.right = '0px';
    } else {
      style.left = 'auto';
      style.right = `${Math.max(0, box.right - anchor.right)}px`;
    }
    const height = this.menu.offsetHeight;
    const fitsBelow = anchor.bottom + GAP + height <= window.innerHeight || anchor.top - GAP - height < 0;
    style.top = `${(fitsBelow ? anchor.bottom + GAP : anchor.top - GAP - height) - box.top}px`;
  }
}
