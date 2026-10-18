// Загрузка встраиваемых ICC-профилей (CC0, см. icc/README.md).
// Файлы отдаются как хешированные статические ресурсы и кэшируются в памяти worker'а.

import srgbUrl from './icc/sRGB-v2-magic.icc?url';
import displayP3Url from './icc/DisplayP3Compat-v2-magic.icc?url';
import rec2020Url from './icc/Rec2020Compat-v2-magic.icc?url';
import type { ProfileId } from './nclx';

const URLS: Record<ProfileId, string> = {
  srgb: srgbUrl,
  'display-p3': displayP3Url,
  rec2020: rec2020Url,
};

const cache = new Map<ProfileId, Promise<Uint8Array>>();

/** Похоже ли на ICC-профиль: размер в заголовке совпадает с длиной, на месте сигнатура «acsp». */
export function isPlausibleIcc(icc: Uint8Array): boolean {
  if (icc.length < 132) return false;
  const size = new DataView(icc.buffer, icc.byteOffset, 4).getUint32(0);
  return size === icc.length && String.fromCharCode(icc[36]!, icc[37]!, icc[38]!, icc[39]!) === 'acsp';
}

export function loadProfile(id: ProfileId): Promise<Uint8Array> {
  let promise = cache.get(id);
  if (!promise) {
    promise = fetch(URLS[id]).then(async (response) => {
      if (!response.ok) throw new Error(`ICC ${id}: HTTP ${response.status}`);
      return new Uint8Array(await response.arrayBuffer());
    });
    promise.catch(() => cache.delete(id));
    cache.set(id, promise);
  }
  return promise;
}
