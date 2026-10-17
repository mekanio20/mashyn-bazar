import { computed, ref } from 'vue';
import { getDb, kvGet, kvSet } from '../db';
import type { Brand, Model } from '../types';

export const brands = ref<Brand[]>([]);
export const models = ref<Model[]>([]);

const SEED_BRANDS = ['Toyota', 'Lexus', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Honda', 'Nissan', 'Volkswagen', 'Chevrolet', 'Ford', 'Lada'];

export const years = computed(() => {
  const cur = new Date().getFullYear();
  return Array.from({ length: 42 }, (_, i) => cur + 1 - i);
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

export async function renameBrand(b: Brand, name: string) {
  await (await getDb()).put('brands', { ...b, name: name.trim() });
  await loadCatalog();
}
export async function renameModel(m: Model, name: string) {
  await (await getDb()).put('models', { ...m, name: name.trim() });
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
