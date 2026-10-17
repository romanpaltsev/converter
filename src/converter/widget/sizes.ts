// Размер файла по-человечески: «3,4 МБ» / «3.4 MB».

export interface SizeUnits {
  b: string;
  kb: string;
  mb: string;
  gb: string;
}

export function formatBytes(bytes: number, locale: string, units: SizeUnits): string {
  const steps: [number, string][] = [
    [1024 ** 3, units.gb],
    [1024 ** 2, units.mb],
    [1024, units.kb],
  ];
  for (const [size, unit] of steps) {
    if (bytes >= size) {
      const value = bytes / size;
      const digits = value < 10 ? 1 : 0;
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)} ${unit}`;
    }
  }
  return `${bytes} ${units.b}`;
}
