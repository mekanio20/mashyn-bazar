import { openDB, type DBSchema } from 'idb';
import type { Brand, Car, Model, YearItem } from './types';

interface AppDB extends DBSchema {
  cars: { key: number; value: Car; indexes: { cellId: string } };
  brands: { key: number; value: Brand };
  models: { key: number; value: Model; indexes: { brandId: number } };
  years: { key: number; value: YearItem };
  kv: { key: string; value: unknown };
}

const dbPromise = openDB<AppDB>('crud-pwa', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
      const raw = db as any;
      if (raw.objectStoreNames.contains('items')) raw.deleteObjectStore('items');
      db.createObjectStore('cars', { keyPath: 'id', autoIncrement: true }).createIndex('cellId', 'cellId');
      db.createObjectStore('brands', { keyPath: 'id', autoIncrement: true });
      db.createObjectStore('models', { keyPath: 'id', autoIncrement: true }).createIndex('brandId', 'brandId');
      db.createObjectStore('years', { keyPath: 'value' });
      db.createObjectStore('kv');
    }
  },
});

export const getDb = () => dbPromise;

export async function kvGet<T>(key: string): Promise<T | undefined> {
  return (await dbPromise).get('kv', key) as Promise<T | undefined>;
}
export async function kvSet(key: string, value: unknown) {
  await (await dbPromise).put('kv', value, key);
}

export interface Backup {
  version: 1;
  cars: Car[];
  brands: Brand[];
  models: Model[];
  years: YearItem[];
  grid?: unknown;
}

export async function exportAll(): Promise<Backup> {
  const db = await dbPromise;
  return {
    version: 1,
    cars: await db.getAll('cars'),
    brands: await db.getAll('brands'),
    models: await db.getAll('models'),
    years: await db.getAll('years'),
    grid: await db.get('kv', 'grid'),
  };
}

const DATA_STORES = ['cars', 'brands', 'models', 'years'] as const;

export async function importAll(data: Backup) {
  if (data?.version !== 1 || !Array.isArray(data.cars) || !Array.isArray(data.brands) || !Array.isArray(data.models)) {
    throw new Error('invalid');
  }
  const db = await dbPromise;
  const tx = db.transaction([...DATA_STORES, 'kv'], 'readwrite');
  for (const s of DATA_STORES) await tx.objectStore(s).clear();
  for (const c of data.cars) await tx.objectStore('cars').put(c);
  for (const b of data.brands) await tx.objectStore('brands').put(b);
  for (const m of data.models) await tx.objectStore('models').put(m);
  for (const y of data.years ?? []) await tx.objectStore('years').put(y);
  if (data.grid) await tx.objectStore('kv').put(data.grid, 'grid');
  await tx.done;
}

/** Lisans/ayarlar (kv.settings) korunur; yalnızca iş verileri silinir. */
export async function clearAll() {
  const db = await dbPromise;
  const tx = db.transaction([...DATA_STORES, 'kv'], 'readwrite');
  for (const s of DATA_STORES) await tx.objectStore(s).clear();
  await tx.objectStore('kv').delete('grid');
  await tx.done;
}
