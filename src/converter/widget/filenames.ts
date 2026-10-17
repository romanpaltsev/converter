// Имена результатов: исходное имя с новым расширением в нижнем регистре (IMG_1234.HEIC → IMG_1234.jpg),
// при совпадении — суффиксы _2, _3… Сравнение без учёта регистра: архив распакуют и в Windows/macOS.

const FORBIDDEN = /[\\/:*?"<>|\u0000-\u001f]/g;

/** Имя результата без учёта конфликтов. */
export function outputName(inputName: string, extension: string): string {
  const clean = inputName.replace(FORBIDDEN, '_').trim();
  const dot = clean.lastIndexOf('.');
  let base = dot > 0 ? clean.slice(0, dot) : clean;
  base = base.replace(/[. ]+$/, ''); // Windows не любит точки и пробелы в конце имени
  if (base === '' || base === '.') base = 'image';
  return `${base}.${extension.toLowerCase()}`;
}

/** Выдаёт уникальные (без учёта регистра) имена в пределах одного списка результатов. */
export class NameAllocator {
  private readonly used = new Set<string>();

  allocate(name: string): string {
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let candidate = name;
    for (let n = 2; this.used.has(candidate.toLowerCase()); n++) candidate = `${base}_${n}${ext}`;
    this.used.add(candidate.toLowerCase());
    return candidate;
  }

  release(name: string): void {
    this.used.delete(name.toLowerCase());
  }

  clear(): void {
    this.used.clear();
  }
}
