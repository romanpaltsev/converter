// Пул worker'ов: несколько файлов одновременно, пока хватает памяти (решение владельца 19.10.2026, см. CLAUDE.md).
// Память WASM после роста не уменьшается, а вкладка с гигабайтами куч может упасть (особенно на телефоне), поэтому
// у пула общий бюджет. Worker до декодирования оценивает файл (pipeline/memory.ts) и начинает работу, только если
// оценка помещается в лимит; иначе файл возвращается в очередь с оценкой и ждёт. Не влезает и в весь бюджет —
// обрабатывается в одиночку на свежем worker'е, как до пула.

import type { PoolClient, WorkerClient } from './worker-client';

export interface PoolPolicy {
  /** Сколько файлов обрабатывается одновременно. */
  maxWorkers: number;
  /** Память на все worker'ы (байты): кучи WASM-модулей и буферы в JS. */
  memoryBudget: number;
  /** Пересоздавать worker после стольких файлов. */
  recycleEveryFiles: number;
  /** Когда очередь опустела, worker'ы с кучами больше этого завершаются: память не держится зря. */
  idleHeapBytes: number;
}

const MiB = 1024 * 1024;
const GiB = 1024 * MiB;
/** Меньше этого остатка бюджета новый файл без оценки не запускаем: почти наверняка не поместится. */
const MIN_START_BYTES = 64 * MiB;

export interface DeviceInfo {
  cores: number | undefined;
  /** navigator.deviceMemory (ГБ, есть только в Chromium, не больше 8). */
  deviceMemory: number | undefined;
  /** Основной указатель — палец: телефон или планшет, памяти на вкладку меньше. */
  coarsePointer: boolean;
}

export function currentDevice(): DeviceInfo {
  return {
    cores: navigator.hardwareConcurrency,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    coarsePointer: matchMedia('(pointer: coarse)').matches,
  };
}

/**
 * Параллельность и бюджет по устройству. Одно ядро оставляем интерфейсу; больше четырёх worker'ов не нужно —
 * упрёмся в память. Телефон: не больше двух и 768 МиБ на всё (iOS выгружает вкладку и раньше предела WASM).
 */
export function poolPolicy(device: DeviceInfo): PoolPolicy {
  const cores = device.cores && device.cores > 0 ? device.cores : 2;
  const mobile = device.coarsePointer;
  const memory = device.deviceMemory;
  const memoryBudget = mobile ? (memory !== undefined && memory <= 2 ? 512 * MiB : 768 * MiB) : memory !== undefined && memory < 8 ? 1.5 * GiB : 2.5 * GiB;
  return {
    maxWorkers: Math.max(1, Math.min(cores - 1, mobile ? 2 : 4)),
    memoryBudget,
    recycleEveryFiles: 20,
    idleHeapBytes: 256 * MiB,
  };
}

interface Job {
  /** Сколько памяти зарезервировано: до оценки — весь выданный лимит, после — оценка worker'а. */
  reserved: number;
  measured: boolean;
  /** Файл обрабатывается в одиночку: остальные ждут. */
  alone: boolean;
}

interface Slot<C extends PoolClient> {
  client: C;
  job: Job | null;
}

export interface Lease<C extends PoolClient = WorkerClient> {
  readonly client: C;
  /** Сколько памяти может занять этот worker вместе со своими кучами; Infinity — файл идёт в одиночку. */
  readonly memoryLimit: number;
  /**
   * Worker оценил файл и начал работу: резерв уменьшается до оценки, можно запускать следующие файлы.
   * fresh — оценка файла для свежего worker'а: по ней пул прикидывает следующие файлы пачки.
   */
  started(footprint: number, fresh: number): void;
  /** Работа закончена; recycle — завершить worker (ошибка внутри WASM, нехватка памяти, файл не поместился). */
  release(recycle?: boolean): void;
}

export class WorkerPool<C extends PoolClient = WorkerClient> {
  private readonly slots: Slot<C>[] = [];
  /**
   * Оценка последнего начатого файла: в пачке файлы обычно похожи, поэтому следующий без своей оценки не запускается,
   * пока под такой же не хватает памяти (иначе он откроется, не поместится и вернётся в очередь).
   */
  private typical = 0;

  constructor(
    readonly policy: PoolPolicy,
    private readonly createClient: () => C,
  ) {}

  /** Сколько файлов обрабатывается сейчас. */
  get running(): number {
    return this.slots.filter((slot) => slot.job).length;
  }

  /**
   * Место для следующего файла или null — подождать (все заняты, предыдущий файл ещё не оценён, кто-то работает
   * в одиночку или не хватает памяти). estimate — оценка файла, если он уже не поместился (иначе null);
   * alone — только в одиночку (повтор после нехватки памяти).
   */
  acquire(estimate: number | null, alone = false): Lease<C> | null {
    const busy = this.slots.filter((slot) => slot.job);
    // пока worker не оценил свой файл, он держит весь остаток бюджета — это миллисекунды после загрузки модулей
    if (busy.some((slot) => slot.job!.alone || !slot.job!.measured)) return null;
    if (busy.length >= this.policy.maxWorkers) return null;
    const known = alone ? Number.POSITIVE_INFINITY : estimate;
    const need = known ?? Math.max(MIN_START_BYTES, this.typical);
    // файл, который уже не поместился однажды, — на свежий worker без чужих куч
    let slot = this.fittingSlot(need, known !== null);
    if (!slot) {
      this.reclaimIdle(); // кучи простаивающих worker'ов — тоже память
      slot = this.fittingSlot(need, known !== null);
    }
    if (!slot) {
      if (busy.length > 0) return null;
      // ничего не выполняется, а файл (или, по прикидке, такой же, как прошлые) не помещается и в весь бюджет —
      // в одиночку на свежем worker'е без лимита, как до пула (так идут 48 Мп на телефоне)
      return this.start(this.anySlot(), Number.POSITIVE_INFINITY, true);
    }
    return this.start(slot, this.free(slot), false);
  }

  /** Очередь опустела: завершаем worker'ы с большими кучами, чтобы вкладка не держала память зря. */
  trim(): void {
    for (const slot of this.slots) if (!slot.job && slot.client.heapBytes > this.policy.idleHeapBytes) slot.client.recycle();
  }

  /** Прервать всё (кнопка «Очистить»): worker'ы завершаются, их задания заканчиваются ошибкой. */
  recycleAll(): void {
    for (const slot of this.slots) {
      slot.job = null;
      slot.client.recycle();
    }
  }

  /** Свободная память: бюджет минус резервы заданий и кучи простаивающих worker'ов (кроме except). */
  private free(except?: Slot<C>): number {
    let used = 0;
    for (const slot of this.slots) if (slot !== except) used += slot.job ? slot.job.reserved : slot.client.heapBytes;
    return this.policy.memoryBudget - used;
  }

  private reclaimIdle(): void {
    for (const slot of this.slots) if (!slot.job && slot.client.alive) slot.client.recycle();
  }

  /**
   * Worker, в котором поместится файл с такой потребностью: простаивающий с загруженными модулями (его кучи
   * переиспользуются — займёт max(куча, потребность)), иначе свежий. fresh — только свежий.
   */
  private fittingSlot(need: number, fresh: boolean): Slot<C> | null {
    const idle = this.slots.filter((slot) => !slot.job);
    if (!fresh) {
      const warm = idle.find((slot) => slot.client.alive && Math.max(slot.client.heapBytes, need) <= this.free(slot));
      if (warm) return warm;
    }
    if (need > this.free()) return null;
    const cold = idle.find((slot) => !slot.client.alive);
    if (cold) return cold;
    if (this.slots.length < this.policy.maxWorkers) return this.newSlot();
    // все простаивающие держат кучи (и памяти хватает даже с ними): самый «тяжёлый» перезапускаем
    const heaviest = idle.reduce((a, b) => (b.client.heapBytes > a.client.heapBytes ? b : a));
    heaviest.client.recycle();
    return heaviest;
  }

  /** Любой свободный worker (после reclaimIdle все простаивающие — свежие) или новый. */
  private anySlot(): Slot<C> {
    return this.slots.find((slot) => !slot.job) ?? this.newSlot();
  }

  private newSlot(): Slot<C> {
    const slot: Slot<C> = { client: this.createClient(), job: null };
    this.slots.push(slot);
    return slot;
  }

  private start(slot: Slot<C>, memoryLimit: number, alone: boolean): Lease<C> {
    const job: Job = { reserved: Number.isFinite(memoryLimit) ? memoryLimit : this.policy.memoryBudget, measured: false, alone };
    slot.job = job;
    return {
      client: slot.client,
      memoryLimit,
      started: (footprint, fresh) => {
        if (slot.job !== job) return;
        job.reserved = footprint;
        job.measured = true;
        this.typical = fresh;
      },
      release: (recycle = false) => {
        if (slot.job !== job) return; // пул уже очищен
        slot.job = null;
        if (recycle || slot.client.files >= this.policy.recycleEveryFiles) slot.client.recycle();
      },
    };
  }
}
