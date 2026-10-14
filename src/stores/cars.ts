import { computed, reactive, ref } from 'vue';
import { getDb } from '../db';
import type { Car } from '../types';
import { brandName, modelName } from './catalog';
import { cellName } from './grid';

export const cars = ref<Car[]>([]);
export const search = ref('');
const debounced = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;
export function setSearch(v: string) {
  search.value = v;
  clearTimeout(timer);
  timer = setTimeout(() => (debounced.value = v), 150);
}

export interface Filters {
  brandId: number | null;
  modelId: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  kmFrom: number | null;
  kmTo: number | null;
  transmission: string;
  bodyType: string;
  condition: string;
  status: string;
}
const emptyFilters = (): Filters => ({
  brandId: null, modelId: null, yearFrom: null, yearTo: null, kmFrom: null, kmTo: null,
  transmission: '', bodyType: '', condition: '', status: '',
});
export const filters = reactive<Filters>(emptyFilters());
export const resetFilters = () => Object.assign(filters, emptyFilters());
export const activeFilterCount = computed(
  () => Object.values(filters).filter((v) => v !== null && v !== '').length,
);

export type SortKey = 'new' | 'year' | 'km';
export const sort = ref<SortKey>('new');

export async function loadCars() {
  cars.value = await (await getDb()).getAll('cars');
}

export const carTitle = (c: Car) => `${brandName(c.brandId)} ${modelName(c.modelId)} ${c.year}`;

const haystack = (c: Car) =>
  [carTitle(c), c.plate, c.color, c.ownerName, c.ownerPhone, c.note, cellName(c.cellId)].join(' ').toLowerCase();

export const matchesSearch = (c: Car) => {
  const q = debounced.value.trim().toLowerCase();
  return !q || q.split(/\s+/).every((w) => haystack(c).includes(w));
};
export const searchActive = computed(() => !!debounced.value.trim());

function matchesFilters(c: Car) {
  const f = filters;
  if (f.brandId && c.brandId !== f.brandId) return false;
  if (f.modelId && c.modelId !== f.modelId) return false;
  if (f.yearFrom && c.year < f.yearFrom) return false;
  if (f.yearTo && c.year > f.yearTo) return false;
  if (f.kmFrom != null && (c.mileage ?? -1) < f.kmFrom) return false;
  if (f.kmTo != null && (c.mileage ?? Infinity) > f.kmTo) return false;
  if (f.transmission && c.transmission !== f.transmission) return false;
  if (f.bodyType && c.bodyType !== f.bodyType) return false;
  if (f.condition && c.condition !== f.condition) return false;
  if (f.status && c.status !== f.status) return false;
  return true;
}

export const visibleCars = computed(() => {
  const list = cars.value.filter((c) => matchesSearch(c) && matchesFilters(c));
  const s = sort.value;
  return list.sort((a, b) =>
    s === 'year' ? b.year - a.year : s === 'km' ? (a.mileage ?? Infinity) - (b.mileage ?? Infinity) : b.createdAt - a.createdAt,
  );
});

export const carsInCell = (id: string) => cars.value.filter((c) => c.cellId === id);

export const plateTaken = (plate: string, exceptId?: number) =>
  !!plate.trim() &&
  cars.value.some((c) => c.id !== exceptId && c.plate?.trim().toLowerCase() === plate.trim().toLowerCase());

export async function saveCar(data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>, existing?: Car | null) {
  const db = await getDb();
  const now = Date.now();
  const plain = JSON.parse(JSON.stringify(data));
  if (existing?.id != null) await db.put('cars', { ...plain, id: existing.id, createdAt: existing.createdAt, updatedAt: now });
  else await db.add('cars', { ...plain, createdAt: now, updatedAt: now });
  await loadCars();
}

export async function removeCar(id: number) {
  await (await getDb()).delete('cars', id);
  await loadCars();
}

/** Verilen koşula uyan arabaların yerini boşaltır (satır/sütun/hücre silinince). */
export async function unassign(pred: (cellId: string) => boolean) {
  const db = await getDb();
  for (const c of cars.value) {
    if (c.cellId && pred(c.cellId)) await db.put('cars', { ...JSON.parse(JSON.stringify(c)), cellId: null });
  }
  await loadCars();
}

export const countWhere = (pred: (cellId: string) => boolean) =>
  cars.value.filter((c) => c.cellId && pred(c.cellId)).length;

export const brandUsage = (id: number) => cars.value.filter((c) => c.brandId === id).length;
export const modelUsage = (id: number) => cars.value.filter((c) => c.modelId === id).length;
