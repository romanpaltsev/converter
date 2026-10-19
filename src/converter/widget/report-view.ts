// «Посмотреть EXIF»: карточка с метаданными файла — сводка на языке страницы и таблица всех тегов.
// Значения приходят из worker'а без перевода (даты как в EXIF, числа как есть) и форматируются здесь.

import type { MetadataReport, TagRow } from '../metadata/inspect/types';
import type { RemovedKind } from '../metadata/strip/types';
import type { Locale } from '../../config/site';
import type { WidgetConfig } from './config';
import { formatBytes } from './sizes';

type Strings = WidgetConfig['strings'];

/** То, что сводка показывает своими строками: в «Ещё в файле» это не повторяем. */
const SUMMARIZED = new Set<RemovedKind>(['location', 'camera', 'serial', 'author', 'dates', 'settings', 'software', 'makernote', 'exif']);

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** «2024:07:15 14:23:05» → «15 июля 2024 г., 14:23:05» (время как записано, без пересчёта поясов). */
function formatDate(value: string, offset: string | null, locale: Locale): string {
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [year, month, day, hours, minutes, seconds] = match.slice(1).map(Number);
  const time = Date.UTC(year!, month! - 1, day, hours, minutes, seconds);
  if (Number.isNaN(time) || year === 0) return value;
  const text = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'medium', timeZone: 'UTC' }).format(time);
  return offset ? `${text} (UTC${offset})` : text;
}

export class ReportView {
  private readonly number: Intl.NumberFormat;

  constructor(
    private readonly t: Strings,
    private readonly locale: Locale,
  ) {
    this.number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  }

  /** Карточка отчёта; onDownload — «Скачать без метаданных» (кнопки нет, если удалять нечего). */
  render(report: MetadataReport, name: string, onDownload: () => void): HTMLElement {
    const r = this.t.report;
    const root = el('div', 'report');
    const list = el('dl', 'report__summary');
    const add = (label: string, value: string | Node[], className?: string) => {
      const row = el('div', className);
      const dd = el('dd');
      if (typeof value === 'string') dd.textContent = value;
      else dd.append(...value);
      row.append(el('dt', undefined, label), dd);
      list.append(row);
    };
    const s = report.summary;
    if (s.taken) add(r.taken, formatDate(s.taken.date, s.taken.offset, this.locale));
    if (s.camera) add(r.camera, s.camera);
    if (s.lens) add(r.lens, s.lens);
    const exposure = this.exposure(report);
    if (exposure) add(r.exposure, exposure);
    if (s.location) add(r.location, this.location(report), 'report__location');
    if (s.software) add(r.software, s.software);
    if (s.author) add(r.author, s.author);
    if (s.copyright) add(r.copyright, s.copyright);
    if (s.serial) add(r.serial, s.serial);
    if (report.colorProfile) add(r.colorProfile, report.colorProfile);
    const more = report.contents.filter((kind) => !SUMMARIZED.has(kind)).map((kind) => this.t.removedKinds[kind]);
    if (more.length > 0) add(r.more, more.join(', '));
    if (list.childElementCount > 0) root.append(list);

    if (report.exifCompressed) root.append(el('p', 'report__note', r.compressed));
    else if (report.contents.length === 0 && report.tags.length === 0) root.append(el('p', 'report__note', r.nothing));
    if (report.tags.length > 0) root.append(this.table(report.tags));
    if (report.contents.length > 0) {
      const button = el('button', 'button button--small report__download', r.download);
      button.type = 'button';
      button.setAttribute('aria-label', fill(r.downloadLabel, { name }));
      button.addEventListener('click', onDownload);
      root.append(button);
    }
    return root;
  }

  private exposure(report: MetadataReport): string | null {
    const e = report.summary.exposure;
    if (!e) return null;
    const r = this.t.report;
    const parts: string[] = [];
    if (e.fNumber) parts.push(`f/${this.number.format(e.fNumber)}`);
    if (e.exposureTime) {
      const [num, den] = e.exposureTime;
      const value = num / den;
      parts.push(fill(r.seconds, { value: value < 1 && num > 0 ? `1/${Math.round(den / num)}` : this.number.format(value) }));
    }
    if (e.iso) parts.push(`ISO ${e.iso}`);
    if (e.focalLength) {
      let focal = fill(r.millimeters, { value: this.number.format(e.focalLength) });
      if (e.focalLength35) focal += ` (${fill(r.equivalent, { value: e.focalLength35 })})`;
      parts.push(focal);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  }

  private location(report: MetadataReport): Node[] {
    const { latitude, longitude, altitude } = report.summary.location!;
    const r = this.t.report;
    const degrees = new Intl.NumberFormat(this.locale, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    let text = `${degrees.format(Math.abs(latitude))}° ${latitude >= 0 ? r.north : r.south}, ${degrees.format(Math.abs(longitude))}° ${longitude >= 0 ? r.east : r.west}`;
    if (altitude !== null) text += `, ${fill(r.altitude, { value: Math.round(altitude) })}`;
    const maps = el('span', 'report__maps', `${r.maps} `);
    r.mapLinks.forEach((map, i) => {
      if (i > 0) maps.append(' · ');
      const link = el('a', undefined, map.name);
      link.href = fill(map.url, { lat: latitude.toFixed(6), lon: longitude.toFixed(6) });
      link.target = '_blank';
      // сайт карт не узнаёт, откуда пришли: только координаты из ссылки
      link.rel = 'noopener noreferrer';
      link.title = r.mapsHint;
      maps.append(link);
    });
    return [document.createTextNode(text), el('br'), maps];
  }

  private table(tags: TagRow[]): HTMLElement {
    const r = this.t.report;
    const details = el('details', 'report__tags');
    details.append(el('summary', undefined, fill(r.allTags, { count: tags.length })));
    const table = el('table');
    const head = el('tr');
    head.append(el('th', undefined, r.tag), el('th', undefined, r.value));
    table.append(el('thead'));
    table.tHead!.append(head);
    const body = el('tbody');
    let group: string | null = null;
    for (const tag of tags) {
      if (tag.ifd !== group) {
        group = tag.ifd;
        const row = el('tr', 'report__group');
        const cell = el('th', undefined, r.groups[tag.ifd]);
        cell.colSpan = 2;
        cell.scope = 'colgroup';
        row.append(cell);
        body.append(row);
      }
      const row = el('tr');
      const name = el('th', undefined, tag.name);
      name.scope = 'row';
      const value = tag.value ?? fill(r.binary, { size: formatBytes(tag.size, this.locale, this.t.units) });
      row.append(name, el('td', tag.value === null ? 'report__binary' : undefined, value));
      body.append(row);
    }
    table.append(body);
    details.append(table);
    return details;
  }
}
