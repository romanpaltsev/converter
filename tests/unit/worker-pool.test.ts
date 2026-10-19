import { describe, expect, test } from 'vitest';
import { MIN_MODULE_HEAP, estimateNeeds, freshFootprint, projectFootprint } from '../../src/converter/pipeline/memory';
import type { PoolClient } from '../../src/converter/widget/worker-client';
import { type PoolPolicy, WorkerPool, poolPolicy } from '../../src/converter/widget/worker-pool';

const MiB = 1024 * 1024;
const GiB = 1024 * MiB;

/** Подделка worker'а: пул смотрит только на счётчик файлов, кучи и «жив ли». */
class FakeClient implements PoolClient {
  files = 0;
  heapBytes = 0;
  alive = false;
  recycled = 0;

  recycle(): void {
    this.recycled++;
    this.alive = false;
    this.heapBytes = 0;
    this.files = 0;
  }

  /** Файл обработан: worker запущен, кучи выросли до heap. */
  finish(heap: number): void {
    this.alive = true;
    this.files++;
    this.heapBytes = heap;
  }
}

const POLICY: PoolPolicy = { maxWorkers: 3, memoryBudget: 2 * GiB, recycleEveryFiles: 20, idleHeapBytes: 256 * MiB };

function makePool(policy: PoolPolicy = POLICY) {
  const clients: FakeClient[] = [];
  const pool = new WorkerPool(policy, () => {
    const client = new FakeClient();
    clients.push(client);
    return client;
  });
  return { pool, clients };
}

describe('poolPolicy: параллельность и бюджет по устройству', () => {
  test.each([
    ['десктоп, 8 ядер, 8+ ГБ', { cores: 8, deviceMemory: 8, coarsePointer: false }, 4, 2.5 * GiB],
    ['десктоп, 16 ядер — не больше 4 worker’ов', { cores: 16, deviceMemory: undefined, coarsePointer: false }, 4, 2.5 * GiB],
    ['десктоп, 4 ядра (раннер CI)', { cores: 4, deviceMemory: 8, coarsePointer: false }, 3, 2.5 * GiB],
    ['десктоп, 4 ГБ памяти', { cores: 8, deviceMemory: 4, coarsePointer: false }, 4, 1.5 * GiB],
    ['два ядра — один worker', { cores: 2, deviceMemory: undefined, coarsePointer: false }, 1, 2.5 * GiB],
    ['ядра неизвестны', { cores: undefined, deviceMemory: undefined, coarsePointer: false }, 1, 2.5 * GiB],
    ['телефон', { cores: 8, deviceMemory: 8, coarsePointer: true }, 2, 768 * MiB],
    ['iPhone (deviceMemory нет)', { cores: 6, deviceMemory: undefined, coarsePointer: true }, 2, 768 * MiB],
    ['слабый телефон', { cores: 4, deviceMemory: 2, coarsePointer: true }, 2, 512 * MiB],
  ])('%s', (_name, device, workers, budget) => {
    const policy = poolPolicy(device);
    expect(policy.maxWorkers).toBe(workers);
    expect(policy.memoryBudget).toBe(budget);
  });
});

describe('WorkerPool', () => {
  test('следующий файл ждёт, пока worker не оценит предыдущий; лимит — остаток бюджета', () => {
    const { pool } = makePool();
    const first = pool.acquire(null)!;
    expect(first.memoryLimit).toBe(2 * GiB);
    expect(pool.acquire(null)).toBeNull();
    first.started(500 * MiB, 500 * MiB);
    const second = pool.acquire(null)!;
    expect(second.memoryLimit).toBe(2 * GiB - 500 * MiB);
    expect(pool.running).toBe(2);
  });

  test('не больше maxWorkers одновременно; освободился — можно следующий', () => {
    const { pool } = makePool();
    const leases = [0, 1, 2].map(() => {
      const lease = pool.acquire(null)!;
      lease.started(100 * MiB, 100 * MiB);
      return lease;
    });
    expect(pool.acquire(null)).toBeNull();
    leases[1]!.release();
    expect(pool.acquire(null)).not.toBeNull();
  });

  test('файл без оценки ждёт, пока не освободится память под такой же, как предыдущий (в пачке файлы похожи)', () => {
    const { pool } = makePool();
    pool.acquire(null)!.started(900 * MiB, 900 * MiB);
    pool.acquire(null)!.started(900 * MiB, 900 * MiB);
    // третий такой же не поместится: не запускаем, чтобы он не открылся впустую и не вернулся в очередь
    expect(pool.acquire(null)).toBeNull();
  });

  test('прогретый worker берётся, если в нём хватит места под такой же файл, — без перезапуска', () => {
    const { pool, clients } = makePool();
    const a = pool.acquire(null)!;
    a.started(900 * MiB, 900 * MiB);
    pool.acquire(null)!.started(900 * MiB, 900 * MiB);
    clients[0]!.finish(700 * MiB);
    a.release();
    const next = pool.acquire(null)!;
    expect(next.client).toBe(clients[0]);
    expect(clients[0]!.recycled).toBe(0);
    expect(next.memoryLimit).toBe(2 * GiB - 900 * MiB);
  });

  test('почти весь бюджет занят — новый файл без оценки не запускается', () => {
    const { pool } = makePool();
    pool.acquire(null)!.started(1.97 * GiB, 1.97 * GiB);
    expect(pool.acquire(null)).toBeNull();
  });

  test('файл с оценкой ждёт, пока не поместится; простаивающие worker’ы освобождают память', () => {
    const { pool, clients } = makePool();
    const a = pool.acquire(null)!;
    a.started(900 * MiB, 900 * MiB);
    const b = pool.acquire(null)!;
    b.started(900 * MiB, 900 * MiB);
    // третий файл оценён в 800 МБ: 900 + 900 + 800 > 2 ГБ
    expect(pool.acquire(800 * MiB)).toBeNull();
    clients[0]!.finish(900 * MiB);
    a.release();
    // worker «a» простаивает, но держит 900 МБ куч — пул завершает его, и файл помещается
    const c = pool.acquire(800 * MiB)!;
    expect(c).not.toBeNull();
    expect(clients[0]!.recycled).toBe(1);
    expect(c.client).toBe(clients[0]);
    expect(c.memoryLimit).toBe(2 * GiB - 900 * MiB);
  });

  test('файл больше бюджета идёт в одиночку и без лимита — когда остальные закончили', () => {
    const { pool, clients } = makePool();
    const small = pool.acquire(null)!;
    small.started(100 * MiB, 100 * MiB);
    expect(pool.acquire(3 * GiB)).toBeNull();
    clients[0]!.finish(100 * MiB);
    small.release();
    const big = pool.acquire(3 * GiB)!;
    expect(big.memoryLimit).toBe(Number.POSITIVE_INFINITY);
    expect(clients[0]!.alive).toBe(false); // свежий worker
    big.started(3 * GiB, 3 * GiB);
    expect(pool.acquire(null)).toBeNull(); // в одиночку — остальные ждут
    big.release();
    expect(pool.acquire(null)).not.toBeNull();
  });

  test('телефон: прошлый файл не поместился в бюджет — следующий сразу идёт в одиночку, без открытия впустую', () => {
    const { pool, clients } = makePool({ ...POLICY, maxWorkers: 1, memoryBudget: 768 * MiB });
    const first = pool.acquire(null)!;
    expect(first.memoryLimit).toBe(768 * MiB);
    first.release(true); // worker ответил needs-memory: файл займёт 900 МБ
    const retry = pool.acquire(900 * MiB)!;
    expect(retry.memoryLimit).toBe(Number.POSITIVE_INFINITY);
    retry.started(900 * MiB, 900 * MiB);
    clients[0]!.finish(800 * MiB);
    retry.release();
    expect(pool.acquire(null)!.memoryLimit).toBe(Number.POSITIVE_INFINITY);
    expect(clients[0]!.alive).toBe(false);
  });

  test('повтор после сбоя — в одиночку на свежем worker’е', () => {
    const { pool, clients } = makePool();
    const other = pool.acquire(null)!;
    other.started(100 * MiB, 100 * MiB);
    expect(pool.acquire(null, true)).toBeNull();
    clients[0]!.finish(100 * MiB);
    other.release();
    const retry = pool.acquire(null, true)!;
    expect(retry.memoryLimit).toBe(Number.POSITIVE_INFINITY);
    expect(clients.every((client) => !client.alive)).toBe(true);
  });

  test('прогретый worker используется снова; после recycleEveryFiles — пересоздаётся', () => {
    const { pool, clients } = makePool({ ...POLICY, recycleEveryFiles: 2 });
    for (let i = 0; i < 2; i++) {
      const lease = pool.acquire(null)!;
      expect(lease.client).toBe(clients[0]);
      lease.started(100 * MiB, 100 * MiB);
      clients[0]!.finish(100 * MiB);
      lease.release();
    }
    expect(clients).toHaveLength(1);
    expect(clients[0]!.recycled).toBe(1);
  });

  test('release(true) завершает worker: после нехватки памяти его кучи больше не держатся', () => {
    const { pool, clients } = makePool();
    const lease = pool.acquire(null)!;
    clients[0]!.finish(1.5 * GiB);
    lease.release(true);
    expect(clients[0]!.alive).toBe(false);
    expect(pool.acquire(null)!.memoryLimit).toBe(2 * GiB);
  });

  test('оценённый файл получает свежий worker, а не прогретый с чужими кучами', () => {
    const { pool, clients } = makePool();
    const lease = pool.acquire(null)!;
    lease.started(300 * MiB, 300 * MiB);
    clients[0]!.finish(300 * MiB);
    lease.release();
    const next = pool.acquire(200 * MiB)!;
    expect(next.client).not.toBe(clients[0]);
    expect(next.memoryLimit).toBe(2 * GiB - 300 * MiB);
  });

  test('trim: когда очередь пуста, завершаются только worker’ы с большими кучами', () => {
    const { pool, clients } = makePool();
    const a = pool.acquire(null)!;
    a.started(100 * MiB, 100 * MiB);
    const b = pool.acquire(null)!;
    b.started(600 * MiB, 600 * MiB);
    clients[0]!.finish(100 * MiB);
    clients[1]!.finish(600 * MiB);
    a.release();
    b.release();
    pool.trim();
    expect(clients[0]!.alive).toBe(true);
    expect(clients[1]!.alive).toBe(false);
  });

  test('recycleAll: старые аренды больше ни на что не влияют', () => {
    const { pool, clients } = makePool();
    const stale = pool.acquire(null)!;
    stale.started(100 * MiB, 100 * MiB);
    pool.recycleAll();
    expect(pool.running).toBe(0);
    const fresh = pool.acquire(null)!;
    stale.started(1.9 * GiB, 1.9 * GiB);
    stale.release(true);
    expect(pool.running).toBe(1);
    expect(fresh.client).toBe(clients[0]);
    fresh.started(100 * MiB, 100 * MiB);
    expect(pool.acquire(null)!.memoryLimit).toBe(2 * GiB - 100 * MiB);
  });
});

describe('оценка памяти файла', () => {
  const heicToJpeg = (pixels: number, fileBytes = 5_000_000) =>
    estimateNeeds({
      decoder: 'heic',
      decoderModule: 'libheif',
      encoder: 'jpeg',
      encoderModule: 'mozjpeg-enc',
      lossless: false,
      pixels,
      outputPixels: pixels,
      fileBytes,
    });

  test('HEIC → JPG: не меньше замеренных куч (24 Мп — 133 + 547 МБ, 48 Мп — 269 + 1027 МБ) и без большого запаса', () => {
    const at24 = freshFootprint(heicToJpeg(24_000_000));
    expect(at24).toBeGreaterThan(680 * MiB);
    expect(at24).toBeLessThan(1 * GiB);
    const at48 = freshFootprint(heicToJpeg(48_000_000, 10_000_000));
    expect(at48).toBeGreaterThan(1296 * MiB);
    expect(at48).toBeLessThan(2 * GiB);
  });

  test('кучи не уменьшаются: worker после такого же файла не вырастет, после большего — только до потребности', () => {
    const needs = heicToJpeg(12_000_000);
    const fresh = freshFootprint(needs);
    const warm = new Map([
      ['libheif', needs.heaps.get('libheif')!],
      ['mozjpeg-enc', needs.heaps.get('mozjpeg-enc')!],
    ]);
    expect(projectFootprint(needs, warm)).toBe(fresh);
    const bloated = new Map([...warm, ['mozjpeg-enc', 1 * GiB]]);
    expect(projectFootprint(needs, bloated)).toBe(fresh - needs.heaps.get('mozjpeg-enc')! + 1 * GiB);
    // чужие модули тоже держат память
    expect(projectFootprint(needs, new Map([...warm, ['libwebp-enc', 300 * MiB]]))).toBe(fresh + 300 * MiB);
  });

  test('PNG → PNG: декодер и кодировщик в одном модуле — потребности складываются', () => {
    const needs = estimateNeeds({
      decoder: 'png',
      decoderModule: 'squoosh-png',
      encoder: 'png',
      encoderModule: 'squoosh-png',
      lossless: false,
      pixels: 1_000_000,
      outputPixels: 1_000_000,
      fileBytes: 1_000_000,
    });
    expect([...needs.heaps.keys()]).toEqual(['squoosh-png']);
    expect(needs.heaps.get('squoosh-png')).toBe(12 * 1_000_000 + 1_000_000 + 10 * 1_000_000);
  });

  test('уменьшение: кодировщику нужна память под результат, а не под исходник', () => {
    const base = { decoder: 'heic', decoderModule: 'libheif', encoder: 'jpeg', encoderModule: 'mozjpeg-enc', lossless: false, fileBytes: 5_000_000 } as const;
    const full = estimateNeeds({ ...base, pixels: 24_000_000, outputPixels: 24_000_000 });
    const small = estimateNeeds({ ...base, pixels: 24_000_000, outputPixels: 2_000_000 });
    expect(small.heaps.get('mozjpeg-enc')).toBe(23 * 2_000_000);
    expect(freshFootprint(small)).toBeLessThan(freshFootprint(full) / 2);
  });

  test('WebP без потерь занимает больше, чем с потерями; JS-декодеры кучи не имеют', () => {
    const base = { decoder: 'gif', decoderModule: 'gif', encoder: 'webp', encoderModule: 'libwebp-enc', pixels: 4_000_000, outputPixels: 4_000_000, fileBytes: 1_000_000 } as const;
    const lossy = estimateNeeds({ ...base, lossless: false });
    const lossless = estimateNeeds({ ...base, lossless: true });
    expect(lossless.heaps.get('libwebp-enc')!).toBeGreaterThan(lossy.heaps.get('libwebp-enc')!);
    expect(lossy.heaps.has('gif')).toBe(false);
  });

  test('модуль, которого ещё нет, займёт не меньше начальной кучи', () => {
    const needs = estimateNeeds({
      decoder: 'bmp',
      decoderModule: 'bmp',
      encoder: 'ico',
      encoderModule: 'squoosh-png',
      lossless: false,
      pixels: 10_000,
      outputPixels: 10_000,
      fileBytes: 40_000,
    });
    expect(freshFootprint(needs)).toBe(MIN_MODULE_HEAP + needs.js);
  });
});
