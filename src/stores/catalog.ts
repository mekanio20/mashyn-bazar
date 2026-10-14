import { computed, ref } from 'vue';
import { getDb, kvGet, kvSet } from '../db';
import type { Brand, Model } from '../types';

export const brands = ref<Brand[]>([]);
export const models = ref<Model[]>([]);
const customYears = ref<number[]>([]);

const SEED_BRANDS = ['Toyota', 'Lexus', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan', 'Volkswagen', 'Chevrolet', 'Ford', 'Lada'];

export const years = computed(() => {
  const cur = new Date().getFullYear();
  const set = new Set<number>(customYears.value);
  for (let y = cur + 1; y >= cur - 40; y--) set.add(y);
  return [...set].sort((a, b) => b - a);
});

export const brandName = (id: number | null | undefined) => brands.value.find((b) => b.id === id)?.name ?? '';
export const modelName = (id: number | null | undefined) => models.value.find((m) => m.id === id)?.name ?? '';

export async function loadCatalog() {
  const db = await getDb();
  if (!(await kvGet('seeded'))) {
    if (!(await db.count('brands'))) for (const name of SEED_BRANDS) await db.add('brands', { name });
    await kvSet('seeded', true);
  }
  brands.value = (await db.getAll('brands')).sort((a, b) => a.name.localeCompare(b.name));
  models.value = (await db.getAll('models')).sort((a, b) => a.name.localeCompare(b.name));
  customYears.value = (await db.getAll('years')).map((y) => y.value);
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export async function addBrand(name: string): Promise<number> {
  name = name.trim();
  const found = brands.value.find((b) => sameName(b.name, name));
  if (found) return found.id!;
  const id = (await (await getDb()).add('brands', { name })) as number;
  await loadCatalog();
  return id;
}

export async function addModel(brandId: number, name: string): Promise<number> {
  name = name.trim();
  const found = models.value.find((m) => m.brandId === brandId && sameName(m.name, name));
  if (found) return found.id!;
  const id = (await (await getDb()).add('models', { brandId, name })) as number;
  await loadCatalog();
  return id;
}

export async function addYear(text: string): Promise<number | null> {
  const y = Number(text.trim());
  if (!Number.isInteger(y) || y < 1900 || y > 2100) return null;
  if (!years.value.includes(y)) {
    await (await getDb()).put('years', { value: y });
    await loadCatalog();
  }
  return y;
}

export async function renameBrand(b: Brand, name: string) {
  await (await getDb()).put('brands', { ...b, name: name.trim() });
  await loadCatalog();
}
export async function renameModel(m: Model, name: string) {
  await (await getDb()).put('models', { ...m, name: name.trim() });
  await loadCatalog();
}

export async function removeYear(y: number) {
  await (await getDb()).delete('years', y);
  await loadCatalog();
}

/** Marka silinince modelleri de silinir. Çağıran taraf araba kullanımını önceden kontrol eder. */
export async function removeBrand(id: number) {
  const db = await getDb();
  for (const m of models.value.filter((m) => m.brandId === id)) await db.delete('models', m.id!);
  await db.delete('brands', id);
  await loadCatalog();
}
export async function removeModel(id: number) {
  await (await getDb()).delete('models', id);
  await loadCatalog();
}
